import { EXERCISES, PROFILE, WEEK } from './data.mjs';
export const STORAGE_KEY = 'kinetic.v1';
export function makeId() { return globalThis.crypto?.randomUUID?.() || `k-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,12)}`; }
export function dayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
export function parseDay(key) { return new Date(`${key}T12:00:00`); }
export function monday(date = new Date()) {
  const d = new Date(date); d.setHours(12,0,0,0); d.setDate(d.getDate() - (d.getDay()+6)%7); return d;
}
export function weekDates(date = new Date()) {
  const start = monday(date);
  return Array.from({length:7},(_,i)=>{ const d=new Date(start); d.setDate(d.getDate()+i); return dayKey(d); });
}
export function defaultState() {
  return { version:1, createdAt:new Date().toISOString(), programStart:dayKey(), profile:{...PROFILE}, sessions:[], meals:[], weights:[], activities:[], proteinRewards:[], activeSession:null, preferences:{ sound:false }, lastSeenLevel:1 };
}
export function programWeek(state, date = new Date()) {
  const start=monday(parseDay(state.programStart)); const now=monday(date);
  return Math.max(1, Math.floor((now-start)/604800000)+1);
}
export function targetSets(id, week) { return week<=2 ? 2 : EXERCISES[id].sets; }
export function proteinOn(state,date=dayKey()) { return state.meals.filter(m=>m.date===date).reduce((n,m)=>n+m.grams,0); }
export function workoutFull(s) { return s.status==='complete'; }
export function totalXP(state) {
  return state.sessions.reduce((n,s)=>n+s.sets.length*15+(workoutFull(s)?50:0),0)
    + state.activities.length*30 + state.proteinRewards.length*25;
}
export function xpForDate(state,date) {
  return state.sessions.filter(s=>s.date===date).reduce((n,s)=>n+s.sets.length*15+(workoutFull(s)?50:0),0)
    +state.activities.filter(a=>a.date===date).length*30+(state.proteinRewards.includes(date)?25:0);
}
export function levelFor(xp) { return Math.floor(xp/500)+1; }
export function levelName(level) { return ['Rookie','Momentum','Builder','Challenger','Trailblazer','Powerhouse','Unstoppable'][Math.min(level-1,6)]; }
export function activeDates(state) { return new Set([...state.sessions.filter(s=>s.sets.length).map(s=>s.date),...state.activities.map(a=>a.date)]); }
export function weeklyCount(state,date=new Date()) {
  const dates=new Set(weekDates(date)); return new Set(state.sessions.filter(s=>dates.has(s.date)&&workoutFull(s)).map(s=>s.date)).size;
}
export function lastSet(state,id) {
  const sets=[...state.sessions,...(state.activeSession?[state.activeSession]:[])].flatMap(s=>s.sets).filter(s=>s.exerciseId===id);
  return sets.at(-1);
}
export function nextWorkoutIndex(date=new Date()) {
  const idx=(date.getDay()+6)%7;
  for(let i=idx;i<7;i++) if(WEEK[i].type==='strength') return i;
  return idx;
}
export function totalVolume(session) {
  return session.sets.reduce((n,s)=>n+(EXERCISES[s.exerciseId]?.weighted?s.weight*s.reps*EXERCISES[s.exerciseId].factor:0),0);
}
export function addMeal(state, {grams,name},date=dayKey()) {
  if(!Number.isInteger(grams)||grams<=0||grams>250) throw new Error('Enter whole grams of protein between 1 and 250 g.');
  const meal={id:makeId(),date,name:String(name||'Protein').slice(0,80),grams};
  state.meals.push(meal);
  let rewarded=false;
  if(proteinOn(state,date)>=state.profile.proteinTarget&&!state.proteinRewards.includes(date)) { state.proteinRewards.push(date); rewarded=true; }
  return {meal,rewarded};
}
export function validateBackup(data) {
  if(!data||data.version!==1||!data.profile||typeof data.programStart!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(data.programStart)) throw new Error('This is not a MoReps backup.');
  for(const key of ['sessions','meals','weights','activities','proteinRewards']) if(!Array.isArray(data[key])||data[key].length>100000) throw new Error('The backup is incomplete or too large.');
  const validDate=d=>typeof d==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&!Number.isNaN(parseDay(d).getTime());
  const number=(n,min,max)=>typeof n==='number'&&Number.isFinite(n)&&n>=min&&n<=max;
  for(const m of data.meals) if(!validDate(m.date)||!number(m.grams,1,250)||typeof m.id!=='string'||typeof m.name!=='string') throw new Error('Invalid protein log.');
  for(const w of data.weights) if(!validDate(w.date)||!number(w.value,50,600)) throw new Error('Invalid weight log.');
  const validId=id=>typeof id==='string'&&/^[a-z0-9-]{1,80}$/i.test(id);
  const checkSession=s=>s&&validDate(s.date)&&validId(s.id)&&['homeA','homeB','park'].includes(s.workoutId)&&Array.isArray(s.sets)&&s.sets.every(v=>EXERCISES[v.exerciseId]&&number(v.reps,1,600)&&Number.isInteger(v.reps)&&number(v.weight,0,500)&&number(v.setNumber,1,10));
  for(const s of data.sessions) if(!checkSession(s)||!['complete','partial'].includes(s.status)||!number(s.startedAt,0,1e15)||!number(s.endedAt,s.startedAt,1e15)) throw new Error('Invalid training log.');
  if(data.activeSession) {
    const s=data.activeSession;
    if(!checkSession(s)||!['homeA','homeB','park'].includes(s.workoutId)||!number(s.exerciseIndex,0,6)||!number(s.week,1,1000)||!Array.isArray(s.skipped)||!s.skipped.every(id=>EXERCISES[id])||!Number.isFinite(s.startedAt)||(s.restUntil!==null&&!number(s.restUntil,0,1e15))) throw new Error('Invalid workout in progress.');
  }
  for(const m of data.meals) if(!validId(m.id)) throw new Error('Invalid protein entry ID.');
  for(const a of data.activities) if(!validDate(a.date)||!validId(a.id)||!['swim','recovery','volleyball'].includes(a.type)||!number(a.minutes,a.type==='recovery'&&a.rest===true?0:1,300)) throw new Error('Invalid activity log.');
  if(!data.proteinRewards.every(validDate)) throw new Error('Invalid rewards.');
  return {...defaultState(),...data,profile:{...PROFILE,startingWeight:number(data.profile.startingWeight,50,600)?data.profile.startingWeight:null},preferences:{sound:!!data.preferences?.sound},proteinRewards:[...new Set(data.proteinRewards)]};
}
export function loadState(storage) {
  try { const raw=storage.getItem(STORAGE_KEY); return raw?validateBackup(JSON.parse(raw)):defaultState(); } catch { return defaultState(); }
}
