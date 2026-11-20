import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultState, dayKey, weekDates, programWeek, targetSets, addMeal, proteinOn, totalXP, weeklyCount, totalVolume, validateBackup, loadState, nextWorkoutIndex, STORAGE_KEY } from '../core.mjs';

const session=(date,status='complete')=>({id:'test-session',date,workoutId:'homeA',status,startedAt:1000,endedAt:61000,sets:[{exerciseId:'floorpress',setNumber:1,reps:10,weight:20,time:1000}]});
test('Calendar weeks use local dates, including a Sunday and year boundary',()=>{
  assert.deepEqual(weekDates(new Date(2026,0,4,23)),['2025-12-29','2025-12-30','2025-12-31','2026-01-01','2026-01-02','2026-01-03','2026-01-04']);
  assert.equal(dayKey(new Date(2026,9,21,23,59)),'2026-10-21');
});
test('Default selection chooses the next strength day in the week, or Sunday recovery instead of a past Monday',()=>{
  assert.equal(nextWorkoutIndex(new Date(2026,9,21)),3);
  assert.equal(nextWorkoutIndex(new Date(2026,9,25)),6);
});
test('Program ramps volume after two calendar weeks',()=>{
  const s=defaultState();s.programStart='2026-10-21';
  assert.equal(programWeek(s,new Date(2026,9,25)),1);
  assert.equal(programWeek(s,new Date(2026,10,2)),3);
  assert.equal(targetSets('floorpress',2),2);assert.equal(targetSets('floorpress',3),3);assert.equal(targetSets('curl',3),2);
});
test('Protein bonus is awarded once per day, including after deleting and re-adding food',()=>{
  const s=defaultState(),date='2026-10-21';
  for(let i=0;i<3;i++)assert.equal(addMeal(s,{grams:30},date).rewarded,false);
  assert.equal(addMeal(s,{grams:30},date).rewarded,true);assert.equal(proteinOn(s,date),120);assert.equal(totalXP(s),25);
  s.meals.pop();assert.equal(addMeal(s,{grams:30},date).rewarded,false);assert.equal(totalXP(s),25);
  assert.throws(()=>addMeal(s,{grams:NaN},date));assert.throws(()=>addMeal(s,{grams:-1},date));
});
test('Completed and partial workouts earn accurate XP; a partial workout does not complete a weekly session',()=>{
  const s=defaultState();s.sessions=[session('2026-10-21'),{...session('2026-10-22','partial'),id:'partial'}];
  assert.equal(totalXP(s),80);assert.equal(weeklyCount(s,new Date(2026,9,21)),1);
});
test('Load volume includes both dumbbells and both sides where prescribed',()=>{
  assert.equal(totalVolume(session('2026-10-21')),400);
  const s=session('2026-10-21');s.sets=[{exerciseId:'split',reps:10,weight:15}];assert.equal(totalVolume(s),600);
  s.sets=[{exerciseId:'pushup',reps:10,weight:0}];assert.equal(totalVolume(s),0);
});
test('A rest day survives persistence and backup restore',()=>{
  const s=defaultState();s.activities=[{id:'recovery',date:'2026-10-21',type:'recovery',minutes:0,rest:true}];
  assert.equal(validateBackup(JSON.parse(JSON.stringify(s))).activities[0].minutes,0);
  assert.equal(loadState({getItem:key=>key===STORAGE_KEY?JSON.stringify(s):null}).activities.length,1);
});
test('A workout in progress, including its absolute rest deadline, resumes from a backup',()=>{
  const s=defaultState();s.activeSession={...session('2026-10-21'),week:1,exerciseIndex:0,skipped:[],restUntil:Date.now()+120000};
  const restored=validateBackup(JSON.parse(JSON.stringify(s)));assert.equal(restored.activeSession.restUntil,s.activeSession.restUntil);assert.equal(restored.activeSession.sets.length,1);
});
test('Backups reject invalid session IDs, unsafe loads, unknown movements, and missing arrays',()=>{
  const s=defaultState();s.sessions=[session('2026-10-21')];
  assert.doesNotThrow(()=>validateBackup(structuredClone(s)));
  let invalid=structuredClone(s);invalid.sessions[0].id='"><img src=x>';assert.throws(()=>validateBackup(invalid));
  invalid=structuredClone(s);invalid.sessions[0].sets[0].weight=-5;assert.throws(()=>validateBackup(invalid));
  invalid=structuredClone(s);invalid.sessions[0].sets[0].exerciseId='unknown';assert.throws(()=>validateBackup(invalid));
  invalid=structuredClone(s);delete invalid.meals;assert.throws(()=>validateBackup(invalid));
});

test('Public defaults omit measurements while private baseline backups remain compatible',()=>{
  const s=defaultState();assert.equal(s.profile.startingWeight,null);assert.equal(s.profile.age,undefined);assert.equal(s.profile.heightInches,undefined);
  s.profile.startingWeight=160;assert.equal(validateBackup(structuredClone(s)).profile.startingWeight,160);
  s.profile.startingWeight='<unsafe>';assert.equal(validateBackup(structuredClone(s)).profile.startingWeight,null);
});

test('Build increases work without changing a saved or legacy active plan',async()=>{
  const {createSession,sessionWorkout,sessionTarget}=await import('../core.mjs');
  const s=defaultState();s.activeSession=createSession('homeA',1,'build');
  assert.equal(sessionTarget(s.activeSession,'squat'),3);
  assert.equal(targetSets('overhead',5,'build'),3);assert.equal(targetSets('overhead',5,'foundation'),2);
  const plan=[...sessionWorkout(s.activeSession).exerciseIds];s.preferences.intensity='foundation';
  assert.deepEqual(sessionWorkout(validateBackup(structuredClone(s)).activeSession).exerciseIds,plan);
  assert.equal(sessionTarget(s.activeSession,'squat'),3);
  s.activeSession={...session('2026-10-21'),week:1,exerciseIndex:0,skipped:[],restUntil:null};
  const legacy=validateBackup(s).activeSession;
  assert.equal(sessionTarget(legacy,'squat'),2);assert.ok(legacy.exerciseIds.includes('curl'));assert.ok(!legacy.exerciseIds.includes('farmer'));
});
test('Timed unilateral work pauses, resumes, and requires an explicit second side',async()=>{
  const {createWorkTimer,toggleWorkTimer,settleWorkTimer,timerRemaining}=await import('../core.mjs');
  const t=createWorkTimer('sideplank',30);toggleWorkTimer(t,1000);assert.equal(timerRemaining(t,6000),25000);
  toggleWorkTimer(t,6000);assert.equal(timerRemaining(t,100000),25000);
  toggleWorkTimer(t,100000);assert.equal(t.until,125000);assert.equal(settleWorkTimer(t,125000),true);
  assert.equal(t.done,false);assert.equal(t.awaitingSide,true);assert.equal(settleWorkTimer(t,500000),false);
  toggleWorkTimer(t,500000);assert.equal(t.side,2);assert.equal(t.until,530000);
  settleWorkTimer(t,530001);assert.equal(t.done,true);assert.equal(t.awaitingSide,false);
});
test('Running work timers survive backup and completion never awards XP',async()=>{
  const {createSession,createWorkTimer,toggleWorkTimer,settleWorkTimer}=await import('../core.mjs');
  const s=defaultState();s.activeSession=createSession('homeA',2);s.activeSession.exerciseIndex=5;
  s.activeSession.workTimer={...createWorkTimer('farmer',30),weight:10};toggleWorkTimer(s.activeSession.workTimer,1000);
  const restored=validateBackup(JSON.parse(JSON.stringify(s)));
  assert.equal(restored.activeSession.workTimer.until,31000);assert.equal(restored.activeSession.workTimer.weight,10);
  settleWorkTimer(restored.activeSession.workTimer,32000);assert.equal(totalXP(restored),0);assert.equal(restored.activeSession.sets.length,0);
  const invalid=structuredClone(s);invalid.activeSession.workTimer.seconds=-1;assert.throws(()=>validateBackup(invalid));
  assert.throws(()=>createWorkTimer('squat',30));assert.throws(()=>createWorkTimer('farmer',0));
});
test('Every movement has an original demo, plans have unique known moves, and carry time is not rep volume',async()=>{
  const {EXERCISES,WORKOUTS}=await import('../data.mjs');const {MOVEMENT_IDS}=await import('../moves.mjs');
  for(const e of Object.values(EXERCISES))assert.ok(MOVEMENT_IDS.includes(e.move),e.name);
  for(const w of Object.values(WORKOUTS)){assert.equal(new Set(w.exerciseIds).size,w.exerciseIds.length);assert.ok(w.exerciseIds.every(id=>Object.hasOwn(EXERCISES,id)));}
  const s=session('2026-11-19');s.sets=[{exerciseId:'farmer',reps:45,weight:20}];assert.equal(totalVolume(s),0);
});
