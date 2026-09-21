import {dateKey,weekDays} from './model.js';
import {foodSummary,mealCalories,validDay} from './nutrition-model.js';
import {estimateMeal} from './openrouter.js';
import {readApiKey,writeApiKey} from './storage.js';
import './nutrition.css';

export function createNutrition({getState,persist,render,header,icon,esc,fmt,modal,closeModal,toast}) {
  let day=dateKey(new Date()),draft='',replyTo=null,key='',busyId=null;
  const currentMeals=()=>getState().meals;
  const find=id=>currentMeals().find(meal=>meal.id===id);
  async function init(){key=await readApiKey();}
  function settings(){return `<section class="panel food-settings"><span class="chip peach">DIÁRIO ALIMENTAR</span><h2>Seu assistente de alimentação</h2><p class="muted">Conecte sua conta OpenRouter para estimar as calorias das refeições pelo chat.</p><form id="food-key-form"><label>Chave OpenRouter<input type="password" name="apiKey" autocomplete="off" spellcheck="false" maxlength="300" placeholder="${key?'Chave já configurada · digite para substituir':'Cole sua chave aqui'}" required></label><p class="field-note">${key?'✓ Chave configurada neste navegador. ':''}Ela não vai para o GitHub nem para seus backups. Ao calcular, o relato é enviado ao OpenRouter e ao provedor do modelo; o histórico de treinos não é enviado. A API usa os créditos da sua conta.</p><div class="key-actions"><button class="primary compact" type="submit">${key?'Atualizar chave':'Salvar chave'}</button>${key?'<button type="button" class="text-button danger" data-food-action="remove-key">Remover chave</button>':''}</div></form></section>`;}
  function dashboard(offset=0,compact=false){
    const days=weekDays(offset).map(dateKey),s=foodSummary(currentMeals(),days);
    const today=foodSummary(currentMeals(),[dateKey(new Date())]);
    const max=Math.max(100,...s.values);
    return `<section class="panel nutrition-dashboard ${compact?'nutrition-compact':''}"><div class="section-heading"><div><h2>Alimentação na semana</h2><p>O que você registrou, dia após dia.</p></div><button class="icon-button" data-view="food" aria-label="Abrir diário alimentar">${icon('arrow')}</button></div><div class="food-metrics"><div><span>Consumidas na semana</span><strong data-food-week-total>${fmt(s.total)} <small>kcal est.</small></strong></div><div><span>${offset===0?'Consumidas hoje':'Dias registrados'}</span><strong>${offset===0?fmt(today.total):s.days} <small>${offset===0?'kcal est.':'de 7 dias'}</small></strong></div><div><span>Refeições registradas</span><strong>${s.count}</strong></div></div><div class="chart food-chart" role="img" aria-label="Calorias consumidas: ${days.map((d,i)=>`${d}: ${s.values[i]} kcal`).join(', ')}"><div class="gridlines"><span>${fmt(max)}</span><span>${fmt(Math.round(max/2))}</span><span>0</span></div><div class="bars">${days.map((d,i)=>`<div class="bar-col ${d===dateKey(new Date())?'today':''}"><div class="bar-area"><span class="bar-value">${s.values[i]||''}</span><div class="bar ${s.values[i]?'':'empty'}" style="height:${s.values[i]?Math.max(5,s.values[i]/max*100):3}%"></div></div><span>${['SEG','TER','QUA','QUI','SEX','SÁB','DOM'][i]}</span></div>`).join('')}</div></div><p class="field-note">${s.count?'Dias sem registro não significam consumo zero.':'Registre sua primeira refeição no diário para começar.'} Consumo alimentar e gasto do treino são estimativas separadas; o treino não representa seu gasto total diário.</p></section>`;
  }
  function message(meal){return `<article class="meal-thread" data-meal-id="${esc(meal.id)}"><div class="user-message"><span>Você <small>${new Date(meal.createdAt).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</small></span><p>${esc(meal.text)}</p></div><div class="assistant-message"><span class="assistant-label">${icon('leaf')} ritmo · alimentação</span>${meal.status==='pending'?'<p class="thinking" role="status">Estimando sua refeição…</p>':`<p>${esc(meal.message)}</p>${meal.status==='saved'?`<div class="food-items">${meal.items.map(item=>`<div><span><strong>${esc(item.name)}</strong><small>${esc(item.portion)}</small></span><b>${fmt(item.kcal)} <small>kcal</small></b></div>`).join('')}</div><div class="meal-total"><span>${meal.edited?'Ajustado por você':'Total estimado'} · salvo</span><strong>${fmt(mealCalories(meal))} kcal</strong></div>`:''}<div class="meal-actions">${meal.status==='error'?`<button class="text-button" data-food-retry="${esc(meal.id)}" ${busyId?'disabled':''}>Tentar novamente</button>`:''}<button class="text-button" data-food-reply="${esc(meal.id)}" ${busyId?'disabled':''}>${meal.status==='question'?'Responder':'Complementar relato'}</button>${meal.status==='saved'?`<button class="text-button" data-food-edit="${esc(meal.id)}" ${busyId?'disabled':''}>Corrigir valores</button>`:''}<button class="text-button danger" data-food-delete="${esc(meal.id)}" ${busyId?'disabled':''}>Excluir</button></div>`}</div></article>`;}
  function screen(){
    const meals=currentMeals().filter(meal=>meal.date===day),s=foodSummary(currentMeals(),[day]);
    const reply=replyTo?find(replyTo):null;
    return `${header('Alimente sua constância.','Conte o que comeu. O resto fica registrado.')}<div class="food-layout"><section class="panel chat-panel"><div class="section-heading food-chat-heading"><div><span class="chip peach">SEU DIÁRIO</span><h2>Uma conversa por dia</h2></div><div class="food-date"><label for="food-day">Dia do registro</label><input type="date" id="food-day" value="${day}" max="${dateKey(new Date())}"><button class="text-button" data-food-action="today">Hoje</button></div></div>${!key?`<div class="notice">Conecte sua chave uma vez para começar. <button class="text-button" data-view="profile">Configurar no perfil ${icon('arrow')}</button></div>`:''}<div class="chat-messages" aria-live="polite">${meals.length?meals.map(message).join(''):`<div class="chat-empty"><span class="food-orb">${icon('leaf')}</span><h3>O que teve no seu prato?</h3><p>Escreva como você falaria. Quantidades e modo de preparo ajudam a estimar melhor.</p><div class="food-examples"><button data-food-example="No café da manhã comi 2 ovos mexidos, 1 pão francês e café sem açúcar.">Café da manhã</button><button data-food-example="Almocei 4 colheres de arroz, 1 concha de feijão e 150 g de frango grelhado.">Almoço</button><button data-food-example="Comi 1 banana e 1 iogurte natural de 170 g.">Lanche</button></div></div>`}</div><form id="food-form" class="chat-composer">${reply?`<div class="reply-banner"><span>Complementando: ${esc(reply.text.slice(0,90))}${reply.text.length>90?'…':''}</span><button type="button" class="icon-button" data-food-action="cancel-reply" aria-label="Cancelar complemento">${icon('close')}</button></div>`:''}<label class="sr-only" for="food-text">O que você comeu?</label><textarea id="food-text" name="description" rows="3" maxlength="${reply?Math.max(0,4000-reply.text.length-15):4000}" placeholder="Ex.: almocei 4 colheres de arroz, feijão e 150 g de frango…" required ${busyId?'disabled':''}>${esc(draft)}</textarea><div class="composer-bottom"><small>Estimativas por IA · confira as porções</small><button class="primary compact" type="submit" ${busyId?'disabled':''}>${busyId?'Calculando…':reply?'Recalcular':'Calcular e registrar'} ${icon('arrow')}</button></div></form><p class="field-note chat-privacy">Seus relatos ficam salvos neste aparelho. O cálculo precisa de internet; o histórico funciona offline.</p></section><aside class="food-side"><section class="panel daily-food"><span class="stat-icon peach">${icon('leaf')}</span><span class="overline">${day===dateKey(new Date())?'HOJE':new Date(day+'T12:00:00').toLocaleDateString('pt-BR',{day:'numeric',month:'long'}).toUpperCase()}</span><h2>Seu dia em calorias</h2><div class="food-day-total" data-food-day-total>${fmt(s.total)} <span>kcal</span></div><p>${s.count} ${s.count===1?'refeição registrada':'refeições registradas'}</p><div class="food-tip">As porções fazem diferença. Se a estimativa não corresponder ao que comeu, complemente o relato ou corrija os valores.</div></section><section class="panel food-note"><span class="chip green">UM HÁBITO DE CADA VEZ</span><h3>Registrar já é um começo.</h3><p>Seu diário ajuda a enxergar sua rotina. Não precisa ser perfeito para ser útil.</p></section></aside></div>${dashboard()}`;
  }
  async function calculate(meal,description=meal.text){
    if(busyId)return;
    if(!key){toast('Configure sua chave OpenRouter no perfil.');return;}
    const owner=getState(),previous=structuredClone(meal);
    busyId=meal.id;
    // Keep an existing saved estimate intact until a correction succeeds.
    if(previous.status!=='saved'){meal.status='pending';meal.items=[];meal.message='';meal.text=description;}
    if(!await persist()){Object.assign(meal,previous);busyId=null;render();return;}
    render();
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),45000);
    try{
      const result=await estimateMeal(description,key,{signal:controller.signal});
      if(getState()!==owner || !owner.meals.includes(meal))return;
      if(previous.status==='saved'&&result.needsClarification){toast(result.message);return;}
      meal.text=description;meal.items=result.items;meal.message=result.message;meal.status=result.needsClarification?'question':'saved';meal.edited=false;
    }catch(error){
      if(getState()!==owner || !owner.meals.includes(meal))return;
      // Failed corrections preserve the previous estimate instead of losing a saved meal.
      if(previous.status==='saved'){Object.assign(meal,previous);toast(error.message);}
      else {meal.status='error';meal.message=error.message;meal.items=[];}
    }finally{
      clearTimeout(timer);busyId=null;
      if(getState()===owner){await persist();render();}
    }
  }
  document.addEventListener('input',ev=>{if(ev.target.id==='food-text')draft=ev.target.value;});
  document.addEventListener('change',ev=>{if(ev.target.id==='food-day'){const value=ev.target.value;if(validDay(value)&&value<=dateKey(new Date())){day=value;replyTo=null;render();}else{ev.target.value=day;toast('Escolha hoje ou uma data anterior.');}}});
  document.addEventListener('submit',async ev=>{
    if(ev.target.id==='food-key-form'){
      ev.preventDefault();const value=new FormData(ev.target).get('apiKey').trim();
      if(!value.startsWith('sk-or-')||value.length<20||/\s/.test(value)){toast('Confira a chave OpenRouter: ela começa com sk-or-.');return;}
      try{await writeApiKey(value);key=value;render();toast('Chave salva neste navegador. Seu diário está pronto.');}catch{toast('Não foi possível salvar a chave. Tente novamente.');}
    }
    if(ev.target.id==='food-form'){
      ev.preventDefault();if(busyId)return;if(!key){toast('Configure sua chave OpenRouter no perfil.');return;}
      const value=draft.trim();if(!value||value.length>4000)return;
      let meal=replyTo?find(replyTo):null,description=value;
      if(meal){description=meal.text+'\nComplemento: '+value;if(description.length>4000){toast('O relato completo deve ter até 4.000 caracteres.');return;}}
      else{meal={id:crypto.randomUUID(),date:day,text:value,createdAt:new Date().toISOString(),status:'error',items:[],message:''};currentMeals().push(meal);}
      draft='';replyTo=null;await calculate(meal,description);
    }
    if(ev.target.id==='food-edit-form'){
      ev.preventDefault();const meal=find(ev.target.dataset.id);if(!meal||busyId)return;
      const data=new FormData(ev.target),items=meal.items.map((item,i)=>({...item,kcal:Number(data.get(`kcal-${i}`))}));
      if(items.some(item=>!Number.isInteger(item.kcal)||item.kcal<0||item.kcal>20000)){toast('Use calorias entre 0 e 20.000 por alimento.');return;}
      meal.items=items;meal.edited=true;await persist();closeModal();render();toast('Valores atualizados no diário e no painel.');
    }
  });
  document.addEventListener('click',async ev=>{
    const b=ev.target.closest('button');if(!b)return;
    if(b.dataset.foodExample){draft=b.dataset.foodExample;render();document.querySelector('#food-text')?.focus();}
    if(b.dataset.foodReply){const meal=find(b.dataset.foodReply);if(!meal||busyId)return;day=meal.date;replyTo=meal.id;render();document.querySelector('#food-text')?.focus();}
    if(b.dataset.foodRetry){const meal=find(b.dataset.foodRetry);if(meal)await calculate(meal);}
    if(b.dataset.foodEdit){const meal=find(b.dataset.foodEdit);if(!meal||busyId)return;modal(`<h2 id="modal-title">Ajustar calorias</h2><p>Altere os valores conforme as porções ou o rótulo. Para mudar alimentos e quantidades, use “Complementar relato”.</p><form id="food-edit-form" data-id="${esc(meal.id)}">${meal.items.map((item,i)=>`<label>${esc(item.name)} · ${esc(item.portion)}<input type="number" name="kcal-${i}" value="${item.kcal}" min="0" max="20000" step="1" required aria-label="Calorias de ${esc(item.name)}"></label>`).join('')}<button type="submit" class="primary wide">Salvar correção</button></form>`);}
    if(b.dataset.foodDelete){if(busyId)return;modal(`<h2 id="modal-title">Excluir este registro?</h2><p>A refeição será removida do diário e dos totais do dia e da semana.</p><button class="primary wide" data-food-confirm-delete="${esc(b.dataset.foodDelete)}">Excluir refeição</button>`);}
    if(b.dataset.foodConfirmDelete){if(busyId)return;getState().meals=currentMeals().filter(meal=>meal.id!==b.dataset.foodConfirmDelete);if(replyTo===b.dataset.foodConfirmDelete)replyTo=null;await persist();closeModal();render();toast('Registro excluído.');}
    if(b.dataset.foodAction==='today'){day=dateKey(new Date());replyTo=null;render();}
    if(b.dataset.foodAction==='cancel-reply'){replyTo=null;render();}
    if(b.dataset.foodAction==='remove-key'){try{await writeApiKey('');key='';render();toast('Chave removida deste navegador.');}catch{toast('Não foi possível remover a chave.');}}
  });
  return {init,settings,dashboard,screen};
}
