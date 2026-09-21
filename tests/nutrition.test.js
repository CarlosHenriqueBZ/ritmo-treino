import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateEstimate,foodSummary,mealCalories,validateMeals,migrateState,backupData,validDay} from '../src/nutrition-model.js';
import {estimateMeal} from '../src/openrouter.js';
import {defaults,validateBackup} from '../src/model.js';
const estimate={message:'Porções informadas.',needsClarification:false,items:[{name:'Arroz',portion:'100 g',kcal:128},{name:'Feijão',portion:'100 g',kcal:76}]};
const meal={id:'meal-1',date:'2026-09-21',text:'Arroz e feijão',status:'saved',items:estimate.items,message:'Estimativa',createdAt:'2026-09-21T15:00:00Z'};
test('soma alimentos por data local, excluindo falhas e perguntas',()=>{
  const meals=[meal,{...meal,id:'2',date:'2026-09-22'},{...meal,id:'3',status:'error'},{...meal,id:'4',status:'pending'},{...meal,id:'5',status:'question'}];
  assert.deepEqual(foodSummary(meals,['2026-09-21']),{total:204,count:1,days:1,values:[204]});
  assert.equal(foodSummary(meals,['2026-09-21','2026-09-22']).total,408);
  assert.equal(mealCalories({...meal,status:'error'}),0);
});
test('valida resposta e rejeita valores inválidos ou clarificação com calorias',()=>{
  assert.deepEqual(validateEstimate(estimate),estimate);
  for(const kcal of [-1,Infinity,NaN,'120',20001])assert.throws(()=>validateEstimate({...estimate,items:[{...estimate.items[0],kcal}]}));
  assert.throws(()=>validateEstimate({...estimate,needsClarification:true}));
  assert.throws(()=>validateEstimate({...estimate,items:[]}));
  assert.equal(validateEstimate({message:'O que comeu?',needsClarification:true,items:[]}).items.length,0);
});
test('migração preserva treinos e recupera análise interrompida sem contar calorias',()=>{
  const old={...defaults(),version:1};delete old.meals;
  assert.deepEqual(migrateState(old).history,old.history);
  assert.deepEqual(validateBackup(old).meals,[]);
  const migrated=migrateState({...old,meals:[{...meal,status:'pending'}]});
  assert.equal(migrated.meals[0].status,'error');assert.equal(mealCalories(migrated.meals[0]),0);
});
test('backup valida diário e nunca exporta chave',()=>{
  const state={...defaults(),meals:[meal],apiKey:'secret',credentials:{key:'secret'}};
  const backup=backupData(state);
  assert.ok(!JSON.stringify(backup).includes('secret'));
  assert.equal(validateBackup(backup).meals[0].items.length,2);
  assert.throws(()=>validateMeals([meal,meal]));
  assert.throws(()=>validateMeals([{...meal,date:'2026-02-31'}]));
  assert.equal(validDay('2026-02-31'),false);
});
test('OpenRouter usa schema, autenticação e só o relato necessário',async()=>{
  let request;
  const fetcher=async(url,options)=>{request={url,...options};return {ok:true,json:async()=>({choices:[{message:{content:JSON.stringify(estimate)},finish_reason:'stop'}]})};};
  assert.deepEqual(await estimateMeal('100 g arroz e feijão','test-key',{fetcher}),estimate);
  const body=JSON.parse(request.body);
  assert.equal(request.url,'https://openrouter.ai/api/v1/chat/completions');
  assert.equal(request.headers.Authorization,'Bearer test-key');
  assert.equal(body.response_format.type,'json_schema');assert.equal(body.provider.require_parameters,true);
  assert.equal(body.messages[1].content,'100 g arroz e feijão');assert.equal(body.messages.length,2);
});
test('erros de API são tratados sem vazar corpo nem chave',async()=>{
  for(const status of [401,402,403,429,500])await assert.rejects(estimateMeal('comida','secret',{fetcher:async()=>({ok:false,status})}),/Chave|Saldo|autorizou|solicitações|conseguiu/);
  await assert.rejects(estimateMeal('comida','secret',{fetcher:async()=>({ok:true,json:async()=>({choices:[{message:{content:'<script>alert(1)</script>'}}]})})}),/estimativa válida/);
  await assert.rejects(estimateMeal('comida','secret',{fetcher:async()=>{throw Error('network secret');}}),/conectar/);
});
