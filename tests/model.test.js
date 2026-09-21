import {test} from 'node:test';
import assert from 'node:assert/strict';
import {elapsed,calories,weekDays,dateKey,defaults,validateBackup} from '../src/model.js';
import {workouts} from '../src/data.js';
test('cronômetro exclui pausas e conserva tempo ao recarregar',()=>{assert.equal(elapsed({elapsed:30000,running:true,since:1000},61000),90000);assert.equal(elapsed({elapsed:30000,running:false,since:1000},61000),30000);});
test('estimativa usa peso, duração e MET; zero tempo não gera calorias',()=>{assert.equal(calories(3600000,98,3.5),360);assert.equal(calories(0,98,3.5),0);});
test('semana começa segunda e inclui domingo, com navegação entre anos',()=>{assert.equal(dateKey(weekDays(0,new Date(2026,0,4))[0]),'2025-12-29');assert.equal(dateKey(weekDays(-1,new Date(2026,0,4))[6]),'2025-12-28');});
test('backup valida limites e rejeita dados incorretos',()=>{assert.equal(validateBackup(defaults()).active,null);assert.throws(()=>validateBackup({...defaults(),profile:{...defaults().profile,weight:-1}}));assert.throws(()=>validateBackup({...defaults(),history:[{workout:'D'}]}));});
test('fichas preservam contagem de exercícios e vídeos dos PDFs',()=>{assert.deepEqual(workouts.map(w=>w.exercises.length),[9,10,10]);assert.deepEqual(workouts.map(w=>w.exercises.reduce((a,e)=>a+e.videos.length,0)),[12,13,10]);assert.ok(workouts[2].exercises[8].search);});
