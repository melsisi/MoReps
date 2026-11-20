import { EXERCISES, PROFILE, WEEK, WORKOUTS, LEGACY_PLANS } from './data.mjs';
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
  return { version:1, createdAt:new Date().toISOString(), programStart:dayKey(), profile:{...PROFILE}, sessions:[], meals:[], weights:[], activities:[], proteinRewards:[], activeSession:null, preferences:{ sound:false, intensity:'build' }, lastSeenLevel:1 };
}
export function programWeek(state, date = new Date()) {
  const start=monday(parseDay(state.programStart)); const now=monday(date);
  return Math.max(1, Math.floor((now-start)/604800000)+1);
}
export function targetSets(id, week, intensity='foundation') { return intensity==='build' ? (EXERCISES[id].buildSets??EXERCISES[id].sets) : week<=2 ? Math.min(2,EXERCISES[id].sets) : EXERCISES[id].sets; }
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
  return session.sets.reduce((n,s)=>n+(EXERCISES[s.exerciseId]?.weighted&&!EXERCISES[s.exerciseId].timed?s.weight*s.reps*EXERCISES[s.exerciseId].factor:0),0);
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
  const checkSession=s=>s&&validDate(s.date)&&validId(s.id)&&['homeA','homeB','park'].includes(s.workoutId)&&Array.isArray(s.sets)&&s.sets.every(v=>Object.hasOwn(EXERCISES,v.exerciseId)&&number(v.reps,1,600)&&Number.isInteger(v.reps)&&number(v.weight,0,500)&&number(v.setNumber,1,10));
  for(const s of data.sessions) if(!checkSession(s)||!['complete','partial'].includes(s.status)||!number(s.startedAt,0,1e15)||!number(s.endedAt,s.startedAt,1e15)) throw new Error('Invalid training log.');
  if(data.activeSession) {
    const s=data.activeSession;
    if(!checkSession(s)||!['homeA','homeB','park'].includes(s.workoutId)||!number(s.exerciseIndex,0,6)||!number(s.week,1,1000)||!Array.isArray(s.skipped)||!s.skipped.every(id=>Object.hasOwn(EXERCISES,id))||!Number.isFinite(s.startedAt)||(s.restUntil!==null&&!number(s.restUntil,0,1e15))) throw new Error('Invalid workout in progress.');
  }
  for(const m of data.meals) if(!validId(m.id)) throw new Error('Invalid protein entry ID.');
  for(const a of data.activities) if(!validDate(a.date)||!validId(a.id)||!['swim','recovery','volleyball'].includes(a.type)||!number(a.minutes,a.type==='recovery'&&a.rest===true?0:1,300)) throw new Error('Invalid activity log.');
  if(!data.proteinRewards.every(validDate)) throw new Error('Invalid rewards.');
  if(data.activeSession) {
    const s=data.activeSession;
    if(s.exerciseIds!==undefined&&(!Array.isArray(s.exerciseIds)||s.exerciseIds.length<1||s.exerciseIds.length>20||new Set(s.exerciseIds).size!==s.exerciseIds.length||!s.exerciseIds.every(id=>Object.hasOwn(EXERCISES,id))))throw new Error('Invalid workout plan.');
    if(s.targets!==undefined&&(!s.exerciseIds||s.exerciseIds.some(id=>!Number.isInteger(s.targets[id])||!number(s.targets[id],1,5))))throw new Error('Invalid set targets.');
    s.exerciseIds??=[...LEGACY_PLANS[s.workoutId]];s.intensity=s.intensity==='build'?'build':'foundation';s.targets??=Object.fromEntries(s.exerciseIds.map(id=>[id,targetSets(id,s.week,s.intensity)]));
    const t=s.workTimer;if(t&&(!s.exerciseIds.includes(t.exerciseId)||!EXERCISES[t.exerciseId]?.timed||!number(t.seconds,1,600)||!Number.isInteger(t.seconds)||!number(t.remainingMs,0,t.seconds*1000)||![1,2].includes(t.side)||t.sides!==(EXERCISES[t.exerciseId].each?2:1)||(t.until!==null&&!number(t.until,0,1e15))||(t.weight!==undefined&&!number(t.weight,0,500))||t.exerciseId!==s.exerciseIds[s.exerciseIndex]||typeof t.done!=='boolean'||typeof t.awaitingSide!=='boolean'))throw new Error('Invalid exercise timer.');
  }
  return {...defaultState(),...data,profile:{...PROFILE,startingWeight:number(data.profile.startingWeight,50,600)?data.profile.startingWeight:null},preferences:{sound:!!data.preferences?.sound,intensity:data.preferences?.intensity==='foundation'?'foundation':'build'},proteinRewards:[...new Set(data.proteinRewards)]};
}
export function loadState(storage) {
  try { const raw=storage.getItem(STORAGE_KEY); return raw?validateBackup(JSON.parse(raw)):defaultState(); } catch { return defaultState(); }
}

export function createSession(workoutId,week,intensity='build',now=Date.now()) {
  const exerciseIds=[...WORKOUTS[workoutId].exerciseIds];
  return {id:makeId(),workoutId,date:dayKey(new Date(now)),week,intensity,exerciseIds,targets:Object.fromEntries(exerciseIds.map(id=>[id,targetSets(id,week,intensity)])),exerciseIndex:0,sets:[],skipped:[],startedAt:now,restUntil:null,workTimer:null};
}
export function sessionWorkout(s) { return {...WORKOUTS[s.workoutId],exerciseIds:s.exerciseIds||LEGACY_PLANS[s.workoutId]}; }
export function sessionTarget(s,id) { return s.targets?.[id]??targetSets(id,s.week,s.intensity||'foundation'); }
export function createWorkTimer(exerciseId,seconds) {
  if(!EXERCISES[exerciseId]?.timed||!Number.isInteger(seconds)||seconds<1||seconds>600)throw new Error('Choose a whole duration between 1 and 600 seconds.');
  return {exerciseId,seconds,remainingMs:seconds*1000,until:null,side:1,sides:EXERCISES[exerciseId].each?2:1,done:false,awaitingSide:false};
}
export function timerRemaining(t,now=Date.now()) { return t.until===null?t.remainingMs:Math.max(0,t.until-now); }
export function settleWorkTimer(t,now=Date.now()) {
  if(!t||t.until===null||t.until>now)return false;
  t.until=null;t.remainingMs=0;t.awaitingSide=t.side<t.sides;t.done=!t.awaitingSide;return true;
}
export function toggleWorkTimer(t,now=Date.now()) {
  settleWorkTimer(t,now);
  if(t.done)return;
  if(t.until!==null){t.remainingMs=timerRemaining(t,now);t.until=null;return;}
  if(t.awaitingSide){t.side++;t.remainingMs=t.seconds*1000;t.awaitingSide=false;}
  t.until=now+t.remainingMs;
}
