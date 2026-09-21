export const DEFAULT_MODEL = 'openai/gpt-4o-mini';
export const validDay = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T12:00:00Z`)) && new Date(`${value}T12:00:00Z`).toISOString().slice(0,10) === value;
const text = (value, max) => typeof value === 'string' && value.length <= max;
export function validateEstimate(result) {
  if (!result || !text(result.message, 2000) || typeof result.needsClarification !== 'boolean' || !Array.isArray(result.items) || result.items.length > 40) throw Error('A IA retornou uma resposta inválida. Tente novamente.');
  const items = result.items.map(item => {
    if (!item || !text(item.name, 200) || !item.name.trim() || !text(item.portion, 200) || !item.portion.trim() || !Number.isFinite(item.kcal) || item.kcal < 0 || item.kcal > 20000) throw Error('A IA retornou um alimento inválido. Tente novamente.');
    return {name:item.name.trim(), portion:item.portion.trim(), kcal:Math.round(item.kcal)};
  });
  if (result.needsClarification && items.length || !result.needsClarification && !items.length) throw Error('A resposta não contém uma estimativa completa. Tente novamente.');
  return {message:result.message, needsClarification:result.needsClarification, items};
}
export const mealCalories = meal => meal.status === 'saved' ? meal.items.reduce((sum,item)=>sum+item.kcal,0) : 0;
export function foodSummary(meals, days) {
  const saved = meals.filter(meal=>meal.status === 'saved' && days.includes(meal.date));
  return {total:saved.reduce((sum,meal)=>sum+mealCalories(meal),0), count:saved.length, days:new Set(saved.map(meal=>meal.date)).size,
    values:days.map(day=>saved.filter(meal=>meal.date===day).reduce((sum,meal)=>sum+mealCalories(meal),0))};
}
export function validateMeals(meals = []) {
  if (!Array.isArray(meals) || meals.length > 50000) throw Error('Diário alimentar inválido no backup.');
  const ids = new Set();
  return meals.map(meal=>{
    if (!meal || !text(meal.id,100) || !meal.id || ids.has(meal.id) || !validDay(meal.date) || !text(meal.text,4000) || !meal.text.trim() || !['saved','pending','error','question'].includes(meal.status) || !Number.isFinite(Date.parse(meal.createdAt)) || !text(meal.message,2000)) throw Error('Registro alimentar inválido no backup.');
    ids.add(meal.id);
    const result = meal.status==='saved' ? validateEstimate({message:meal.message,needsClarification:false,items:meal.items}) : {items:[],message:meal.message};
    return {id:meal.id,date:meal.date,text:meal.text,createdAt:meal.createdAt,status:meal.status==='pending'?'error':meal.status,items:result.items,message:meal.status==='pending'?'A análise foi interrompida. Tente novamente.':result.message,edited:meal.edited===true};
  });
}
export function migrateState(state) {
  return {...state,version:2,meals:validateMeals(state.meals||[])};
}
// Explicitly allowlisted: provider credentials are never part of a backup.
export function backupData(state) {
  return {version:2,profile:state.profile,history:state.history,active:null,loads:state.loads,meals:state.meals||[]};
}
