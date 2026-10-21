import { PROFILE, EXERCISES, WORKOUTS, WEEK, SOURCES } from './data.mjs';
import { STORAGE_KEY, makeId, dayKey, parseDay, weekDates, defaultState, programWeek, targetSets, proteinOn, totalXP, xpForDate, levelFor, levelName, weeklyCount, activeDates, lastSet, nextWorkoutIndex, totalVolume, addMeal, validateBackup, loadState } from './core.mjs';
import { demo, startMotion } from './moves.mjs';

const paths={
  grid:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',
  dumbbell:'M6 7v10 M3 9v6 M18 7v10 M21 9v6 M6 12h12',
  chart:'M4 4v16h17 M8 15l4-5 4 2 5-7',
  fuel:'M13 2C7 8 17 8 9 15c-3-2-3-5-3-5-5 8 0 12 6 12s11-7 1-20z',
  arrow:'M5 12h14 M13 6l6 6-6 6',
  chevron:'M9 5l7 7-7 7',
  chevrondown:'M6 9l6 6 6-6',
  plus:'M12 5v14 M5 12h14',
  close:'M6 6l12 12 M18 6L6 18',
  check:'M5 12l4 4L19 6',
  bolt:'M13 2L4 14h7l-1 8 10-13h-7z',
  home:'M3 10l9-7 9 7 M5 9v12h14V9 M9 21v-8h6v8',
  rings:'M7 2v7 M17 2v7 M11 14a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M21 14a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  waves:'M2 6q3-4 6 0t6 0 6 0 M2 12q3-4 6 0t6 0 6 0 M2 18q3-4 6 0t6 0 6 0',
  leaf:'M20 3C7 1 1 8 5 16c7 7 17 0 15-13z M4 21L15 9',
  ball:'M22 12A10 10 0 1 1 2 12a10 10 0 0 1 20 0 M4 6c3 1 5 4 5 8 M12 2c-2 7 3 12 9 13 M5 19c6-1 9-4 9-8',
  clock:'M22 12A10 10 0 1 1 2 12a10 10 0 0 1 20 0 M12 6v6l4 2',
  trophy:'M8 3h8v7a4 4 0 0 1-8 0z M8 5H4v3a4 4 0 0 0 4 4 M16 5h4v3a4 4 0 0 1-4 4 M12 14v6 M7 21h10',
  target:'M22 12A10 10 0 1 1 2 12a10 10 0 0 1 20 0 M17 12a5 5 0 1 1-10 0 5 5 0 0 1 10 0 M12 12h.01',
  download:'M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5',
  upload:'M12 16V4 M7 9l5-5 5 5 M4 16v5h16v-5',
  settings:'M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8 M10 2h4l1 3 3 1 3 1v4l-2 2 1 3-3 3-3-1-2 3H9l-1-3-3-1-3-2v-4l2-2-1-3 3-2 3 1z',
  play:'M8 4l13 8-13 8z',
  pause:'M8 5v14 M16 5v14',
  sound:'M3 9h4l5-4v14l-5-4H3z M16 8q5 4 0 8 M19 4q9 8 0 16',
  mute:'M3 9h4l5-4v14l-5-4H3z M16 9l6 6 M22 9l-6 6',
  undo:'M8 4L3 9l5 5 M3 9h11a6 6 0 0 1 0 12',
  star:'M12 3l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z',
  calendar:'M4 5h16v16H4z M8 2v6 M16 2v6 M4 10h16',
  lock:'M7 10V7a5 5 0 0 1 10 0v3 M5 10h14v11H5z',
  heart:'M12 21C-6 10 5-4 12 5c7-9 18 5 0 16z',
  info:'M22 12A10 10 0 1 1 2 12a10 10 0 0 1 20 0 M12 11v6 M12 7h.01',
};
const icon=(name,cls='')=>`<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.bolt}"/></svg>`;
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const app=document.querySelector('#app'), overlay=document.querySelector('#overlay-root');
let state=loadState(localStorage), route=['today','train','progress','fuel'].includes(location.hash.slice(1))?location.hash.slice(1):'today';
let selectedDay=nextWorkoutIndex(), modal=null, toastTimeout, importedBackup=null, audioContext=null, celebrationTimer;
let lastToday=dayKey(),wakeLock=null;
async function keepAwake() {
  if(!navigator.wakeLock||document.visibilityState!=='visible'||modal?.type!=='player')return;
  try {wakeLock=await navigator.wakeLock.request('screen');wakeLock.addEventListener('release',()=>{wakeLock=null;});}catch{}
}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&modal?.type==='player')keepAwake();});
document.querySelector('.skip-link').addEventListener('click',event=>{event.preventDefault();document.getElementById('main')?.focus();document.getElementById('main')?.scrollIntoView();});
function save() {
  try {localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
  catch {toast('Storage is full or unavailable. Export a backup to keep this session.',true);}
}
save();
const fmt=n=>Math.round(n).toLocaleString();
const week=()=>programWeek(state);
const totalSets=w=>w.exerciseIds.reduce((n,id)=>n+targetSets(id,week()),0);
const repLabel=e=>`${e.min}–${e.max}${e.timed?' sec':' reps'}${e.each?' / side':''}`;
const todayLabel=()=>new Date().toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'});
const minutesFor=date=>state.sessions.filter(s=>s.date===date).reduce((n,s)=>n+Math.max(1,Math.round((s.endedAt-s.startedAt)/60000)),0)+state.activities.filter(a=>a.date===date).reduce((n,a)=>n+a.minutes,0);
function toast(message,error=false) {
  const el=document.querySelector('#toast');el.innerHTML=`${icon(error?'info':'check')}<span>${esc(message)}</span>`;el.classList.add('visible');clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>el.classList.remove('visible'),4000);
}
function celebrate() {
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colors=['#d8fa76','#ff966d','#c2b6f5','#ffffff'];
  document.querySelector('#celebration').innerHTML=Array.from({length:42},(_,i)=>`<i style="--x:${Math.random()*100}vw;--r:${Math.random()*720}deg;--d:${Math.random()*.4}s;--c:${colors[i%4]};--drift:${Math.random()*180-90}px"></i>`).join('');
  clearTimeout(celebrationTimer);celebrationTimer=setTimeout(()=>document.querySelector('#celebration').replaceChildren(),2500);
}
function beep() {
  if(!state.preferences.sound) return;
  try {audioContext??=new (window.AudioContext||window.webkitAudioContext)();audioContext.resume();const osc=audioContext.createOscillator(),gain=audioContext.createGain();osc.connect(gain);gain.connect(audioContext.destination);osc.frequency.value=660;gain.gain.setValueAtTime(.08,audioContext.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioContext.currentTime+.4);osc.start();osc.stop(audioContext.currentTime+.4);}catch{}
}
function nav() {
  const items=[['today','grid','Today'],['train','dumbbell','Train'],['progress','chart','Progress'],['fuel','fuel','Fuel']];
  return items.map(([id,i,label])=>`<a href="#${id}" class="nav-item ${route===id?'active':''}" ${route===id?'aria-current="page"':''}>${icon(i)}<span>${label}</span>${route===id?'<i></i>':''}</a>`).join('');
}
function render() {
  const xp=totalXP(state),level=levelFor(xp);
  app.innerHTML=`<aside class="sidebar"><a class="brand" href="#today" aria-label="MoReps home"><span class="brand-mark">m<span>•</span></span>MoReps</a><div class="sidebar-tag">ONE MO REP.</div><nav aria-label="Main navigation">${nav()}</nav><div class="season-card"><div class="season-top"><span>YOUR FIRST CHAPTER</span>${icon('star')}</div><h3>Built, not born.</h3><p>One session closer to<br>the next version of you.</p><div class="season-level">LEVEL ${String(level).padStart(2,'0')}<span>${levelName(level)}</span></div><div class="meter"><i style="width:${xp%500/5}%"></i></div><div class="season-xp">${xp%500} / 500 XP</div></div><button class="sidebar-settings" data-action="settings">${icon('settings')}<span>Your setup</span>${icon('chevron')}</button><div class="sidebar-footer"><span class="status-dot"></span>Made for your kind of life.</div></aside>
  <main id="main" class="main" tabindex="-1"><header class="topbar"><a class="mobile-brand" href="#today" aria-label="MoReps home">MoReps<span>•</span></a><div class="breadcrumb">YOUR PERSONAL TRAINING ADVENTURE</div><div class="topbar-right"><span class="date-label">${todayLabel()}</span><button class="level-pill" data-action="settings" aria-label="Your setup, level ${level}">${icon('bolt')}<span>LVL ${String(level).padStart(2,'0')}</span><span class="avatar">YOU</span></button></div></header><div class="page ${route}-page">${({today:todayView,train:trainView,progress:progressView,fuel:fuelView})[route]()}</div><footer class="page-footer"><span>PROGRESS OVER PERFECTION.</span><button data-action="settings">Your data stays with you ${icon('arrow')}</button></footer></main><nav class="mobile-nav" aria-label="Mobile navigation">${nav()}</nav>`;
  startMotion();
}
function pageTitle(kicker,title,sub,extra='') {
  return `<div class="page-heading"><div><div class="eyebrow">${kicker}</div><h1>${title}</h1><p>${sub}</p></div>${extra}</div>`;
}
function schedule() {
  const dates=weekDates(),active=activeDates(state),today=dayKey();
  return `<div class="week-strip" aria-label="Your weekly training plan">${WEEK.map((d,i)=>`<button class="day-tile ${selectedDay===i?'selected':''} ${dates[i]===today?'is-today':''} ${active.has(dates[i])?'done':''}" data-action="select-day" data-index="${i}" aria-label="${d.name}: ${d.title}${active.has(dates[i])?', activity logged':''}" aria-pressed="${selectedDay===i}"><span>${d.day}<i></i></span><strong>${parseDay(dates[i]).getDate()}</strong><div class="day-icon">${icon(active.has(dates[i])?'check':d.icon)}</div><small>${d.type==='strength'?'STRENGTH':d.type==='volleyball'?'VOLLEYBALL':d.type==='swim'?'POOL':'RECOVERY'}</small></button>`).join('')}</div>`;
}
function workoutHero() {
  const d=WEEK[selectedDay],w=WORKOUTS[d.workout],date=weekDates()[selectedDay],isToday=date===dayKey();
  if(!w) return activityHero(d,isToday);
  return `<section class="quest-hero ${w.color==='orange'?'quest-orange':''}"><div class="hero-grid" aria-hidden="true"></div><div class="hero-copy"><div class="hero-kicker"><span class="live-dot"></span>${isToday?'TODAY’S QUEST':d.name.toUpperCase()+'’S QUEST'}<span class="hero-tag">+${totalSets(w)*15+50} XP</span></div><h2>${w.headline.join('<br>')}</h2><p>${w.description}</p><div class="hero-meta"><span>${icon('clock')}${w.duration} min</span><span>${icon(w.icon)}${w.place}</span><span>${icon('dumbbell')}6 moves</span></div><button class="button button-lime hero-start" data-action="start" data-workout="${w.id}">${state.activeSession?'Resume workout':'Let’s get stronger'}${icon('arrow')}</button><div class="hero-footnote">WEEK ${String(Math.min(week(),8)).padStart(2,'0')} / 08 <span>•</span> ${week()<=2?'FOUNDATION PHASE':'BUILD PHASE'}</div></div><div class="hero-demo"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="demo-spark spark-one">✳</div><div class="demo-spark spark-two">+</div>${demo(w.demo,{label:`Animated preview: ${EXERCISES[w.exerciseIds[0]].name}`})}<div class="demo-caption"><span class="status-dot"></span>${EXERCISES[w.exerciseIds[0]].short}<button class="icon-button" data-action="preview" data-id="${w.exerciseIds[0]}" aria-label="View ${EXERCISES[w.exerciseIds[0]].name} guide">${icon('play')}</button></div><span class="demo-label">YOUR BODY. YOUR NEXT LEVEL.</span></div></section>`;
}
function activityHero(d,isToday) {
  const content={volleyball:['PLAY IS','PROGRESS.','Your Tuesday tradition counts. Enjoy the game; log the minutes you’re actively playing.','Court time, your way.'],swim:['MAKE','WAVES.','A change of scenery. A stronger engine. Keep today’s pool session comfortable to moderate.','5 min easy → 15–25 min steady → 5 min easy'],recovery:['RECOVER.','COME BACK.','Muscle grows between hard sessions, too. Make room for an easy walk, gentle swim, or a proper rest.','Easy movement. No score to chase.']}[d.type];
  return `<section class="quest-hero activity-hero"><div class="hero-grid"></div><div class="hero-copy"><div class="hero-kicker"><span class="live-dot"></span>${isToday?'TODAY’S QUEST':d.name.toUpperCase()+'’S QUEST'}<span class="hero-tag">+30 XP</span></div><h2>${content[0]}<br>${content[1]}</h2><p>${content[2]}</p><div class="hero-meta"><span>${icon('clock')}${d.type==='volleyball'?'2-hour session':d.minutes+' min'}</span><span>${icon(d.icon)}${d.title}</span></div><button class="button button-lime" data-action="activity" data-type="${d.type}">Log ${d.type==='volleyball'?'volleyball':d.type==='swim'?'pool session':'recovery'}${icon('arrow')}</button><div class="hero-footnote">${content[3]}</div></div><div class="activity-art"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div>${icon(d.icon)}<span>KEEP SHOWING UP.</span></div></section>`;
}
function minutesChart() {
  const dates=weekDates(),values=dates.map(minutesFor),total=values.reduce((n,v)=>n+v,0),max=Math.max(120,...values);
  return `<div class="chart-top"><div><div class="eyebrow">TIME WELL SPENT</div><div class="metric-number">${fmt(total)}<span>min this week</span></div></div><span class="chart-legend"><i></i>logged <i class="planned"></i>planned</span></div><div class="week-chart" role="img" aria-label="Logged activity minutes: ${WEEK.map((d,i)=>`${d.day} ${values[i]}`).join(', ')}">${WEEK.map((d,i)=>{const planned=d.type==='strength'?50:d.minutes;return `<div class="bar-col"><div class="bar-track"><div class="bar-plan" style="height:${planned/max*100}%"></div><div class="bar-fill" style="height:${values[i]/max*100}%" title="${values[i]} minutes"></div>${values[i]?`<b style="bottom:${values[i]/max*100}%">${values[i]}</b>`:''}</div><span class="${dates[i]===dayKey()?'current':''}">${d.day.charAt(0)}</span></div>`;}).join('')}</div>`;
}
function fuelRing(size='') {
  const grams=proteinOn(state),target=state.profile.proteinTarget,pct=Math.min(grams/target,1);
  return `<div class="fuel-ring ${size}"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="50" class="ring-track"/><circle cx="60" cy="60" r="50" class="ring-progress" stroke-dasharray="${pct*314.16} 314.16" transform="rotate(-90 60 60)"/></svg><div><strong>${grams}<span>g</span></strong><small>OF ${target} G</small></div></div>`;
}
function todayView() {
  const count=weeklyCount(state),xp=weekDates().reduce((n,d)=>n+xpForDate(state,d),0),currentWeight=state.weights.at(-1)?.value??state.profile.startingWeight;
  return `${pageTitle('LET’S MAKE TODAY COUNT.','A little stronger.<br><span>Every day.</span>','Your plan. Your playground. Your next personal best.',`<div class="week-badge">${icon('calendar')}<span>WEEK <strong>${String(Math.min(week(),8)).padStart(2,'0')}</strong><small>/ 08</small></span></div>`)}
    <div class="stat-row"><div class="mini-stat"><span class="stat-icon mint">${icon('dumbbell')}</span><div><span>STRENGTH THIS WEEK</span><strong>${count}<small> / 3 sessions</small></strong></div><div class="tiny-dots">${[0,1,2].map(i=>`<i class="${count>i?'on':''}"></i>`).join('')}</div></div><div class="mini-stat"><span class="stat-icon peach">${icon('bolt')}</span><div><span>XP THIS WEEK</span><strong>${fmt(xp)}<small> XP earned</small></strong></div></div><button class="mini-stat weight-stat" data-action="weight"><span class="stat-icon lavender">${icon('target')}</span><div><span>${state.weights.length?'LATEST WEIGH-IN':'YOUR STARTING POINT'}</span><strong>${currentWeight??'—'}<small> lb</small></strong></div>${icon('plus')}</button></div>
    <div class="section-line"><h2>Your week, in motion</h2><span>${icon('calendar')}A plan that fits your life</span></div>${schedule()}
    <div class="dashboard-grid"><div class="dashboard-main">${workoutHero()}${mobileOverview()}${exercisePreview()}</div><div class="dashboard-side"><section class="card weekly-card">${minutesChart()}<div class="card-bottom"><span>Every active minute adds up.</span>${icon('chart')}</div></section><section class="card fuel-card"><div class="card-heading"><h2>Fuel the gains</h2><a href="#fuel" aria-label="Go to protein tracker">${icon('arrow')}</a></div><div class="fuel-card-body">${fuelRing()}<div><span class="small-label">TODAY’S PROTEIN</span><h3>${proteinOn(state)>=120?'Target, met.':'Feed your<br>next level.'}</h3><button class="text-button" data-action="protein">Log protein ${icon('plus')}</button></div></div><div class="fuel-note">Recovery days need protein, too.</div></section><section class="coach-card"><span class="coach-icon">✳</span><div><div class="eyebrow">A NOTE FROM YOUR COACH</div><p>${coachNote()}</p></div></section></div></div>`;
}
function mobileOverview() {
  return `<div class="stat-row mobile-overview"><div class="mini-stat"><span class="stat-icon mint">${icon('dumbbell')}</span><div><span>STRENGTH THIS WEEK</span><strong>${weeklyCount(state)}<small> / 3 sessions</small></strong></div></div><div class="mini-stat"><span class="stat-icon peach">${icon('bolt')}</span><div><span>XP THIS WEEK</span><strong>${fmt(weekDates().reduce((n,d)=>n+xpForDate(state,d),0))}<small> XP earned</small></strong></div></div><button class="mini-stat weight-stat" data-action="weight"><span class="stat-icon lavender">${icon('target')}</span><div><span>${state.weights.length?'LATEST WEIGH-IN':'STARTING POINT'}</span><strong>${state.weights.at(-1)?.value??state.profile.startingWeight??'—'}<small> lb</small></strong></div>${icon('plus')}</button></div>`;
}
function coachNote() {
  const count=weeklyCount(state);
  if(proteinOn(state)<60) return 'Your first power-up? Protein. Aim for 30 g at each meal and one easy snack.';
  if(count>=3) return 'Three strength sessions, done. Let recovery do its part. You’ve earned an easier day.';
  if(week()<=2) return 'Leave about 3 good reps in the tank. These first two weeks are for finding your rhythm.';
  return 'At the top of your rep range on every set? Try the next balanced weight increment.';
}
function exercisePreview() {
  const w=WORKOUTS[WEEK[selectedDay].workout];
  if(!w) return `<section class="activity-note card"><span class="stat-icon mint">${icon('heart')}</span><div><h3>Training includes recovery.</h3><p>Tuesday volleyball is already a demanding session. Keep the easier days easy and come back ready to lift.</p></div></section>`;
  return `<section class="exercise-preview"><div class="section-line"><h2>The lineup <span class="count-badge">06</span></h2><span>Tap a move to see it</span></div><div class="move-grid">${w.exerciseIds.map((id,i)=>{const e=EXERCISES[id];return `<button class="move-tile" data-action="preview" data-id="${id}"><span class="move-number">${String(i+1).padStart(2,'0')}</span><div class="move-thumb">${demo(e.move,{animated:false,compact:true,dark:false,label:e.name})}</div><div class="move-info"><strong>${e.short}</strong><span>${targetSets(id,week())} sets · ${repLabel(e)}</span></div>${icon('chevron')}</button>`;}).join('')}</div></section>`;
}
function trainView() {
  return `${pageTitle('LESS GUESSING. MORE GROWING.','Find your<br><span>strong.</span>','Three strength sessions. Three places to make progress.')}
  ${state.activeSession?`<div class="resume-banner">${icon('play')}<div><strong>You’ve got a session in progress.</strong><span>Your logged sets are saved.</span></div><button class="button button-dark" data-action="resume">Jump back in ${icon('arrow')}</button></div>`:''}
  <div class="training-cards">${Object.values(WORKOUTS).map((w,i)=>`<article class="training-card ${i===1?'training-peach':i===2?'training-lavender':''}"><div class="training-top"><span class="pill">${icon(w.icon)}${w.place}</span><span>0${i+1}</span></div><div class="training-art">${demo(w.demo,{animated:false,dark:false,label:EXERCISES[w.exerciseIds[0]].name})}<span class="training-art-word">${['BUILD','GROW','PLAY'][i]}</span></div><div class="training-body"><div class="eyebrow">${['MONDAY','THURSDAY','SATURDAY'][i]} / STRENGTH</div><h2>${w.title}</h2><p>${w.duration} min · ${w.exerciseIds.length} moves · ${totalSets(w)} sets</p><button class="button button-dark" data-action="start" data-workout="${w.id}">Start session ${icon('arrow')}</button></div></article>`).join('')}</div>
  <div class="training-info"><section class="card"><div class="card-heading"><h2>Your progression, simplified.</h2>${icon('chart')}</div><ol class="numbered-list"><li><span>01</span><div><strong>Find your starting point</strong><p>Weeks 1–2: two sets each, finishing with about three good reps left.</p></div></li><li><span>02</span><div><strong>Build the reps</strong><p>Add a controlled rep when you can. In week 3, add the planned sets if recovery is good.</p></div></li><li><span>03</span><div><strong>Then build the resistance</strong><p>Reach the upper rep target on every set with 1–2 reps left? Add the smallest balanced weight increment. For bodyweight moves, use a harder angle.</p></div></li></ol></section><section class="card equipment-card"><div class="eyebrow">YOUR EVERYDAY TRAINING GROUNDS</div><h2>Everything you need<br>to get started.</h2><div>${icon('dumbbell')}<span><strong>FitRx 60 lb set</strong><small>Dumbbells, barbell, kettlebell & handles</small></span></div><div>${icon('rings')}<span><strong>Neighborhood playground</strong><small>Rings, bars & fresh air</small></span></div><div>${icon('waves')}<span><strong>Neighborhood pool</strong><small>Friday conditioning & easy recovery</small></span></div><p>60 lb is the total plate weight. Use balanced loads within the manufacturer’s limits. You may eventually need more resistance as you get stronger.</p></section></div>
  <div class="section-line"><h2>The rest of your week</h2><span>Movement that feels like living.</span></div><div class="activity-cards">${[['volleyball','ball','Tuesday volleyball','Your usual 2-hour session. Log active playing time.'],['swim','waves','Friday pool session','5 min easy, 15–25 min steady, 5 min easy.'],['recovery','leaf','Recover & reset','A comfortable walk, gentle swim, or a proper rest.']].map(([type,i,title,desc])=>`<button class="card activity-card" data-action="activity" data-type="${type}"><span class="stat-icon ${type==='swim'?'lavender':type==='recovery'?'mint':'peach'}">${icon(i)}</span><h3>${title}</h3><p>${desc}</p><span class="text-button">Log activity ${icon('arrow')}</span></button>`).join('')}</div>`;
}
function lineChart(values,{labels=[],color='#3c7150',unit='',baseline=false}={}) {
  const W=680,H=190,pad=28,raw=values.length?values:[0],min=baseline?Math.min(...raw)-2:0,max=baseline?Math.max(...raw)+2:Math.max(...raw,min+1),span=max-min||1;
  const points=raw.map((v,i)=>[pad+i*(W-pad*2)/Math.max(raw.length-1,1),H-pad-(v-min)/span*(H-pad*2)]);
  const coordinates=points.map(p=>p.join(',')).join(' '),last=points.at(-1);
  return `<svg class="line-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(unit)} chart: ${raw.map((v,i)=>`${labels[i]||i+1}: ${v}`).join(', ')}"><defs><linearGradient id="chart-shade-${baseline?'w':'x'}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity=".17"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>${[0,1,2,3].map(i=>`<path d="M${pad} ${pad+i*(H-2*pad)/3}H${W-pad}" stroke="#e4e8dd" stroke-dasharray="4 5"/>`).join('')}<polygon points="${pad},${H-pad} ${coordinates} ${last[0]},${H-pad}" fill="url(#chart-shade-${baseline?'w':'x'})"/><polyline points="${coordinates}" fill="none" stroke="${color}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>${points.map(([x,y],i)=>`<circle cx="${x}" cy="${y}" r="${i===points.length-1?5:3}" fill="${color}"><title>${esc(labels[i]||'Starting point')}: ${raw[i]} ${unit}</title></circle>`).join('')}${labels.length>1?[0,Math.floor((labels.length-1)/2),labels.length-1].map(i=>`<text x="${points[i][0]}" y="${H-5}" fill="#7b8373" font-size="10" text-anchor="${i===0?'start':i===labels.length-1?'end':'middle'}">${esc(labels[i])}</text>`).join(''):''}</svg>`;
}
function achievements() {
  const complete=state.sessions.filter(s=>s.status==='complete'),volume=state.sessions.reduce((n,s)=>n+totalVolume(s),0);
  return [
    {name:'First rep, first step',desc:'Finish your first strength session',icon:'dumbbell',done:complete.length>=1,progress:`${Math.min(complete.length,1)} / 1`},
    {name:'Finding your rhythm',desc:'Finish 6 strength sessions',icon:'bolt',done:complete.length>=6,progress:`${Math.min(complete.length,6)} / 6`},
    {name:'Well fueled',desc:'Reach your protein target on 7 days',icon:'fuel',done:state.proteinRewards.length>=7,progress:`${Math.min(state.proteinRewards.length,7)} / 7`},
    {name:'Home, park, repeat',desc:'Complete all 3 strength workouts',icon:'rings',done:new Set(complete.map(s=>s.workoutId)).size>=3,progress:`${new Set(complete.map(s=>s.workoutId)).size} / 3`},
    {name:'Heavy lifting',desc:'Move 10,000 lb of total training load',icon:'trophy',done:volume>=10000,progress:`${fmt(Math.min(volume,10000))} / 10k`},
    {name:'A stronger chapter',desc:'Finish 24 strength sessions',icon:'star',done:complete.length>=24,progress:`${Math.min(complete.length,24)} / 24`},
  ];
}
function progressView() {
  const xp=totalXP(state),level=levelFor(xp),sets=state.sessions.reduce((n,s)=>n+s.sets.length,0),completed=state.sessions.filter(s=>s.status==='complete').length;
  const dates=Array.from({length:14},(_,i)=>{let d=new Date();d.setDate(d.getDate()-13+i);return dayKey(d);});
  const xps=dates.map(d=>xpForDate(state,d));let cumulative=totalXP(state)-xps.reduce((n,v)=>n+v,0);const xpValues=xps.map(x=>cumulative+=x);
  const weights=[...(state.profile.startingWeight?[{date:state.programStart,value:state.profile.startingWeight}]:[]),...state.weights].slice(-14);
  return `${pageTitle('THE SMALL WINS ADD UP.','Look how far<br><span>you’re going.</span>','Your effort, made visible. Every number here comes from your logs.')}
  <section class="level-banner"><div class="level-emblem">${icon('bolt')}<span>${String(level).padStart(2,'0')}</span></div><div><div class="eyebrow">YOUR CURRENT LEVEL</div><h2>${levelName(level)}</h2><p>${fmt(xp)} XP earned. ${500-xp%500} XP to your next level.</p></div><div class="level-banner-meter"><div><span>LEVEL ${level}</span><span>LEVEL ${level+1}</span></div><div class="meter"><i style="width:${xp%500/5}%"></i></div></div></section>
  <div class="progress-stats">${[[completed,'SESSIONS FINISHED','dumbbell'],[sets,'SETS LOGGED','check'],[state.proteinRewards.length,'FUEL MILESTONES','fuel'],[fmt(state.sessions.reduce((n,s)=>n+totalVolume(s),0)),'LB OF TRAINING LOAD','chart']].map(([n,label,i])=>`<div class="card">${icon(i)}<strong>${n}</strong><span>${label}</span></div>`).join('')}</div>
  <div class="progress-charts"><section class="card"><div class="card-heading"><div><div class="eyebrow">YOUR MOMENTUM</div><h2>XP, earned over time.</h2></div><span class="pill">Last 14 days</span></div>${lineChart(xpValues,{labels:dates.map(d=>parseDay(d).toLocaleDateString('en-US',{month:'short',day:'numeric'})),unit:'XP'})}<p class="chart-caption">${xp?'Built from completed sets, finished sessions, activity, and protein targets.':'A clean slate. Log your first session to start the climb.'}</p></section><section class="card"><div class="card-heading"><div><div class="eyebrow">GROW AT YOUR OWN PACE</div><h2>Body weight</h2></div><button class="icon-button outlined" data-action="weight" aria-label="Log body weight">${icon('plus')}</button></div><div class="weight-number">${weights.at(-1)?.value??'—'}<span> lb</span><small>${state.weights.length?'Latest entry':state.profile.startingWeight?'Your provided starting weight':'Log your first weigh-in'}</small></div>${weights.length?lineChart(weights.map(w=>w.value),{labels:weights.map(w=>parseDay(w.date).toLocaleDateString('en-US',{month:'short',day:'numeric'})),color:'#c47756',unit:'lb',baseline:true}):'<p class="chart-caption">Your weight chart starts with your first entry. Only you can see the logs saved on this device.</p>'}<p class="chart-caption">Aim initially for about 0.25–0.5 lb gained per week. Compare weekly averages; scale gain includes more than muscle.</p></section></div>
  <div class="section-line"><h2>Milestones worth chasing</h2><span>${achievements().filter(a=>a.done).length} / 6 unlocked</span></div><div class="achievement-grid">${achievements().map(a=>`<article class="achievement ${a.done?'unlocked':''}"><div class="achievement-icon">${icon(a.icon)}<span>${icon(a.done?'check':'lock')}</span></div><div><h3>${a.name}</h3><p>${a.desc}</p><small>${a.done?'UNLOCKED':a.progress}</small></div></article>`).join('')}</div>
  <div class="section-line"><h2>Your training journal</h2><button class="text-button" data-action="export">Export backup ${icon('download')}</button></div>${journal()}`;
}
function journal() {
  const entries=[...state.sessions.map(s=>({...s,kind:'session'})),...state.activities.map(a=>({...a,kind:'activity'}))].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,20);
  if(!entries.length) return `<div class="empty-state card">${icon('calendar')}<h3>Your story starts with one session.</h3><p>Your real workouts will show up here, with sets, reps, and weights.</p><a class="button button-dark" href="#train">Find your first workout ${icon('arrow')}</a></div>`;
  return `<div class="journal-list">${entries.map(e=>`<button class="journal-entry" data-action="${e.kind==='session'?'session-detail':'activity'}" ${e.kind==='session'?`data-id="${e.id}"`:`data-type="${e.type}" data-date="${e.date}"`}><span class="stat-icon ${e.kind==='session'?'mint':'peach'}">${icon(e.kind==='session'?'dumbbell':e.type==='volleyball'?'ball':e.type==='swim'?'waves':'leaf')}</span><div><strong>${esc(e.kind==='session'?WORKOUTS[e.workoutId]?.title||'Strength session':e.type==='volleyball'?'Volleyball':e.type==='swim'?'Pool session':'Recovery')}</strong><span>${parseDay(e.date).toLocaleDateString('en-US',{month:'short',day:'numeric'})} · ${e.kind==='session'?`${e.sets.length} sets · ${e.status==='complete'?'Finished':'Partial session'}`:`${e.minutes} active minutes`}</span></div><b>+${e.kind==='session'?e.sets.length*15+(e.status==='complete'?50:0):30} XP</b>${icon('chevron')}</button>`).join('')}</div>`;
}
function fuelView() {
  const protein=proteinOn(state),remaining=Math.max(0,120-protein),meals=state.meals.filter(m=>m.date===dayKey());
  return `${pageTitle('GROWTH NEEDS FUEL.','Feed your<br><span>next level.</span>','One daily target. A few easy choices. No complicated food diary.')}
  <div class="fuel-layout"><section class="card fuel-main"><div class="card-heading"><h2>Your daily power-up</h2><span class="pill">${todayLabel()}</span></div>${fuelRing('large')}<h2>${remaining?`${remaining} g to go. You’ve got this.`:'Target reached. Growth, fueled.'}</h2><p>${remaining?'Aim for about 30 g at three meals, plus a 30 g snack.':'You’ve given your recovery something to work with.'}</p><button class="button button-dark" data-action="protein">${icon('plus')}Log protein</button><div class="quick-add-label">ALREADY KNOW THE AMOUNT? QUICK ADD.</div><div class="quick-adds">${[15,25,30,40].map(n=>`<button data-action="quick-protein" data-grams="${n}">+${n}<span>g</span></button>`).join('')}</div><div class="reward-note">${icon(protein>=120?'check':'bolt')}${state.proteinRewards.includes(dayKey())?'Daily fuel bonus earned':'Reach 120 g to earn +25 XP once today'}</div></section><div class="fuel-side"><section class="card"><div class="card-heading"><h2>On the menu today</h2><span class="count-badge">${meals.length}</span></div>${meals.length?`<div class="meal-list">${meals.map(m=>`<div class="meal-entry"><span class="meal-dot">${icon('fuel')}</span><div><strong>${esc(m.name)}</strong><span>Protein logged</span></div><b>${m.grams} g</b><button class="icon-button" data-action="remove-meal" data-id="${m.id}" aria-label="Remove ${esc(m.name)}">${icon('close')}</button></div>`).join('')}</div>`:`<div class="meal-empty">${icon('fuel')}<h3>Breakfast? Shake? Dinner?</h3><p>Log the protein you actually eat.<br>Every meal moves the ring.</p></div>`}</section><section class="food-ideas"><span class="eyebrow">MAKE IT EASY ON YOURSELF</span><h2>Pick your protein.<br>Keep it simple.</h2><div><span>01</span><p><strong>Build around a protein source.</strong>Chicken, fish, eggs, Greek yogurt, tofu, tempeh, beans—whatever suits you.</p></div><div><span>02</span><p><strong>Use the label.</strong>Amounts vary by product and portion. Log grams of protein, not the weight of the food.</p></div><div><span>03</span><p><strong>Keep a convenient backup.</strong>A shake or ready-to-eat option can help. Supplements are optional.</p></div><p class="food-footnote">Your daily protein target is 120 g. Keep eating enough overall; protein alone can’t do all the work.</p></section></div></div>`;
}

let previousFocus=null;
function openModal(type,data={}) {
  previousFocus=document.activeElement;modal={type,...data};app.inert=true;renderModal();document.body.classList.add('modal-open');
  if(type==='player')keepAwake();
  requestAnimationFrame(()=>overlay.querySelector('[data-initial-focus],input,button')?.focus());
}
function closeModal() {
  modal=null;app.inert=false;wakeLock?.release().catch(()=>{});overlay.replaceChildren();document.body.classList.remove('modal-open');previousFocus?.isConnected&&previousFocus.focus();
}
function modalShell(content,{large=false,player=false,title='Dialog'}={}) {
  return `<div class="modal-backdrop" data-action="backdrop"><section class="modal ${large?'modal-large':''} ${player?'workout-player':''}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><button class="modal-close icon-button" data-action="close" aria-label="Close dialog">${icon('close')}</button>${content}</section></div>`;
}
function renderModal() {
  if(!modal) return;
  const type=modal.type;
  if(type==='player') {renderPlayer();return;}
  if(type==='preview') {
    const e=EXERCISES[modal.id];
    overlay.innerHTML=modalShell(`<div class="preview-art"><span class="pill">MOVEMENT LAB</span>${demo(e.move,{label:`Animated guide: ${e.name}`})}<button class="demo-control" data-action="toggle-demo">${icon('pause')}<span>Pause demo</span></button></div><div class="preview-content"><div class="eyebrow">${e.muscle.toUpperCase()}</div><h2>${e.name}</h2><p class="preview-prescription">${targetSets(modal.id,week())} sets · ${repLabel(e)}</p><ol class="cue-list">${e.cues.map((c,i)=>`<li><span>0${i+1}</span>${c}</li>`).join('')}</ol><div class="movement-tip">${icon('info')}<span>${e.tip} This diagram illustrates the movement; it is not a form assessment.</span></div></div>`,{title:e.name});
  }
  if(type==='protein') overlay.innerHTML=modalShell(`<div class="modal-intro"><span class="stat-icon peach">${icon('fuel')}</span><div class="eyebrow">FUEL THE GAINS</div><h2>A little protein.<br>A little progress.</h2><p>Log what you ate. Check the label for the amount.</p></div><form id="protein-form"><label>What did you have?<input name="name" placeholder="e.g. Lunch, yogurt, protein shake" maxlength="80" autocomplete="off"></label><label>Protein, in grams<div class="input-unit"><input data-initial-focus name="grams" type="number" inputmode="decimal" min="1" max="250" step="1" value="30" required><span>g</span></div></label><button class="button button-dark full-width" type="submit">Log protein ${icon('plus')}</button></form>`,{title:'Log protein'});
  if(type==='weight') overlay.innerHTML=modalShell(`<div class="modal-intro"><span class="stat-icon lavender">${icon('target')}</span><div class="eyebrow">CHECK IN WITH YOURSELF</div><h2>Small changes.<br>Long game.</h2><p>Morning weigh-ins under similar conditions are easiest to compare. We’ll keep one entry per day.</p></div><form id="weight-form"><label>Today’s body weight<div class="input-unit"><input data-initial-focus name="weight" type="number" inputmode="decimal" min="50" max="600" step="0.1" value="${state.weights.find(w=>w.date===dayKey())?.value??state.weights.at(-1)?.value??state.profile.startingWeight??''}" required><span>lb</span></div></label><button class="button button-dark full-width" type="submit">Save weigh-in ${icon('check')}</button></form>`,{title:'Log body weight'});
  if(type==='activity') {
    const names={volleyball:'Volleyball',swim:'Pool session',recovery:'Recovery'},i={volleyball:'ball',swim:'waves',recovery:'leaf'}[modal.activityType],existing=state.activities.find(a=>a.type===modal.activityType&&a.date===(modal.date||dayKey()));
    overlay.innerHTML=modalShell(`<div class="modal-intro"><span class="stat-icon mint">${icon(i)}</span><div class="eyebrow">${existing?'UPDATE YOUR ACTIVITY':'MOVEMENT COUNTS'}</div><h2>${names[modal.activityType]}</h2><p>${modal.activityType==='volleyball'?'Your usual booking is two hours. Log the minutes spent actively playing.':modal.activityType==='swim'?'5 minutes easy, 15–25 minutes comfortable to moderate, then 5 easy. Use water walking if you’re not a confident lap swimmer.':'An easy walk, gentle swim, or a rest day. Recovery supports your next hard session.'}</p></div><form id="activity-form"><label>Active minutes<div class="input-unit"><input data-initial-focus name="minutes" type="number" inputmode="numeric" min="1" max="300" value="${existing?.minutes??(modal.activityType==='volleyball'?60:modal.activityType==='swim'?30:25)}" required><span>min</span></div></label><button class="button button-dark full-width" type="submit">${existing?'Update activity':'Save activity · +30 XP'}${icon('check')}</button></form>${modal.activityType==='recovery'?'<button class="rest-day-button" data-action="rest-day">I took a full rest day instead</button>':''}`,{title:names[modal.activityType]});
  }
  if(type==='settings') overlay.innerHTML=modalShell(`<div class="modal-intro"><div class="eyebrow">MADE AROUND YOUR LIFE</div><h2>Your setup.</h2><p>A personal plan for muscle, movement, and momentum.</p></div><div class="profile-facts"><div><span>STRENGTH</span><strong>3 / week</strong></div><div><span>TIME</span><strong>~1 hour</strong></div><div><span>START</span><strong>${state.profile.startingWeight??state.weights[0]?.value??'—'} lb</strong></div><div><span>PROTEIN</span><strong>120 g/day</strong></div></div><div class="setting-row"><div><strong>Rest timer sound</strong><p>A gentle chime when your rest ends.</p></div><button class="toggle ${state.preferences.sound?'on':''}" data-action="sound" role="switch" aria-checked="${state.preferences.sound}" aria-label="Rest timer sound"><i></i></button></div><div class="data-box"><h3>Your progress, in your pocket.</h3><p>Saved in this browser on this device. Export a backup before clearing browser data or switching phones. Import restores a backup; it doesn’t sync devices.</p><div><button class="button button-dark" data-action="export">${icon('download')}Export</button><button class="button button-outline" data-action="import">${icon('upload')}Import</button></div><input id="backup-file" type="file" accept="application/json,.json" hidden></div><details class="sources"><summary>Program notes & sources ${icon('chevrondown')}</summary><p>Original program tailored to your equipment and schedule. Weeks 1–2 ease into lifting; add planned volume from week 3 when recovering well. Reduce sets if soreness affects volleyball. Your first 8-week block is a starting plan, not a guarantee of muscle gain.</p><p>Keep lifting sets controlled and allow 90–180 seconds of rest. Stop movements that cause sharp or joint pain. The movement diagrams are schematic guides and do not assess technique.</p>${SOURCES.map(([label,url])=>`<a href="${url}" target="_blank" rel="noopener noreferrer">${label}${icon('arrow')}</a>`).join('')}</details><div class="install-note">${icon('plus')}<p>On iPhone: open the published app in Safari → Share → Add to Home Screen.</p></div>`,{title:'Your setup'});
  if(type==='import-review') overlay.innerHTML=modalShell(`<div class="modal-intro"><span class="stat-icon lavender">${icon('upload')}</span><h2>Restore your progress?</h2><p>This backup contains ${importedBackup.sessions.length} training sessions, ${importedBackup.meals.length} protein entries, and ${importedBackup.weights.length} weigh-ins. It will replace the data currently saved on this device.</p></div><button class="button button-outline full-width" data-action="export">Export current data first ${icon('download')}</button><button class="button button-dark full-width spaced" data-action="confirm-import">Replace with this backup ${icon('check')}</button>`,{title:'Review backup import'});
  if(type==='summary') {
    const s=state.sessions.find(s=>s.id===modal.id),full=s.status==='complete',earned=s.sets.length*15+(full?50:0);
    overlay.innerHTML=modalShell(`<div class="session-summary"><div class="summary-emblem">${icon(full?'trophy':'check')}</div><div class="eyebrow">${full?'QUEST COMPLETE':'PROGRESS, SAVED'}</div><h2>${full?'That’s how<br>you build.':'Every set<br>counts.'}</h2><p>${WORKOUTS[s.workoutId].title} · ${full?'Session finished':'Partial session'}</p><div class="summary-stats"><div><strong>${s.sets.length}</strong><span>SETS LOGGED</span></div><div><strong>+${earned}</strong><span>XP EARNED</span></div><div><strong>${Math.max(1,Math.round((s.endedAt-s.startedAt)/60000))}</strong><span>MINUTES</span></div></div><div class="summary-message">${icon('leaf')}<span>Recover, eat well, and come back stronger. You don’t need another hard session today.</span></div><button class="button button-dark full-width" data-action="summary-done">Keep the momentum ${icon('arrow')}</button></div>`,{title:'Session saved'});
  }
  if(type==='session-detail') {
    const s=state.sessions.find(s=>s.id===modal.id);if(!s)return closeModal();
    overlay.innerHTML=modalShell(`<div class="modal-intro"><div class="eyebrow">YOUR TRAINING JOURNAL</div><h2>${WORKOUTS[s.workoutId]?.title||'Strength session'}</h2><p>${parseDay(s.date).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'})} · ${s.status==='complete'?'Finished':'Partial session'}</p></div><div class="logged-set-list">${s.sets.map(v=>{const e=EXERCISES[v.exerciseId];return `<div><span><strong>${e.short}</strong><small>Set ${v.setNumber}${e.each?' · each side':''}</small></span><b>${v.reps} ${e.timed?'sec':'reps'}${e.weight?` × ${v.weight} lb`:''}</b></div>`;}).join('')}</div>`,{title:'Session details'});
  }
  document.body.classList.add('modal-open');
}

function startWorkout(id) {
  if(!WORKOUTS[id]) return;
  if(!state.activeSession) state.activeSession={id:makeId(),workoutId:id,date:dayKey(),week:week(),exerciseIndex:0,sets:[],skipped:[],startedAt:Date.now(),restUntil:null};
  save();openModal('player');render();
}
function renderPlayer() {
  const s=state.activeSession;if(!s)return closeModal();
  const w=WORKOUTS[s.workoutId];
  if(s.exerciseIndex>=w.exerciseIds.length) return finishSession();
  const id=w.exerciseIds[s.exerciseIndex],e=EXERCISES[id],target=targetSets(id,s.week),done=s.sets.filter(v=>v.exerciseId===id).length,last=lastSet(state,id),resting=s.restUntil&&s.restUntil>Date.now(),total=w.exerciseIds.reduce((n,id)=>n+targetSets(id,s.week),0),progress=s.sets.length/total*100;
  overlay.innerHTML=modalShell(`<div class="player-top"><span class="player-brand">MoReps<span>•</span></span><span>${w.title}</span><button class="icon-button" data-action="sound" aria-label="${state.preferences.sound?'Mute':'Enable'} rest timer sound">${icon(state.preferences.sound?'sound':'mute')}</button></div><div class="player-progress"><i style="width:${progress}%"></i></div><div class="player-layout"><div class="player-visual"><div class="player-visual-label"><span>MOVEMENT LAB</span><span>${String(s.exerciseIndex+1).padStart(2,'0')} / 06</span></div>${demo(e.move,{label:`Animated guide: ${e.name}`})}<div class="player-muscle">${icon('target')}${e.muscle}</div><button class="demo-control" data-action="toggle-demo">${icon('pause')}<span>Pause demo</span></button></div><div class="player-panel"><div class="eyebrow">${resting?'BREATHE. RECOVER. REPEAT.':`MOVE ${String(s.exerciseIndex+1).padStart(2,'0')} · SET ${done+1} OF ${target}`}</div><h2>${e.name}</h2><div class="prescription"><span>${repLabel(e)}</span><span>${s.week<=2?'~3 reps left':'1–2 reps left'}</span></div><div class="set-dots">${Array.from({length:target},(_,i)=>`<span class="${i<done?'set-done':i===done?'set-current':''}">${i<done?icon('check'):i+1}</span>`).join('')}<small>${s.sets.length} / ${total} sets logged</small></div>${resting?restPanel(s):`<form id="set-form"><div class="set-inputs"><label>${e.timed?'Seconds held':'Reps completed'}${e.each?' / side':''}<div class="stepper"><button type="button" data-action="step" data-input="reps" data-delta="-${e.timed?5:1}" aria-label="Decrease ${e.timed?'seconds':'repetitions'}">−</button><input name="reps" id="reps" aria-label="${e.timed?'Seconds held':'Reps completed'}${e.each?' / side':''}" type="number" inputmode="numeric" min="1" max="600" required value="${last?.reps??e.min}"><button type="button" data-action="step" data-input="reps" data-delta="${e.timed?5:1}" aria-label="Increase ${e.timed?'seconds':'repetitions'}">+</button></div></label>${e.weighted?`<label>${e.unit}<div class="stepper"><button type="button" data-action="step" data-input="load" data-delta="-2" aria-label="Decrease weight">−</button><input name="weight" id="load" aria-label="${e.unit}" type="number" inputmode="decimal" min="0" max="500" step="0.1" value="${last?.weight??0}" required><button type="button" data-action="step" data-input="load" data-delta="2" aria-label="Increase weight">+</button></div></label>`:'<div class="bodyweight-label">'+icon('dumbbell')+'<strong>Bodyweight</strong><span>Adjust the variation to your level.</span></div>'}</div>${e.weighted&&!last?'<p class="input-hint">Choose a comfortable starting load; 0 means bodyweight or unloaded. Use balanced plates within your equipment’s limits.</p>':''}${e.each?'<p class="input-hint">Complete both sides before logging this set.</p>':''}<button class="button button-lime log-set-button full-width" type="submit">${icon('check')}Log set <span>+15 XP</span></button></form>`}<details class="player-cues" ${resting?'':'open'}><summary>Make every rep count ${icon('chevrondown')}</summary><ol>${e.cues.map(c=>`<li>${c}</li>`).join('')}</ol><p>${e.tip}</p><small>Illustrated movement guide; not a form assessment.</small></details><div class="player-bottom"><button data-action="skip-exercise">Skip this move</button><button data-action="finish-early">Save & finish early ${icon('arrow')}</button></div></div></div>`,{large:true,player:true,title:'Guided workout'});
  document.body.classList.add('modal-open');
}
function restPanel(s) {
  const seconds=Math.max(0,Math.ceil((s.restUntil-Date.now())/1000));
  return `<div class="rest-panel"><div class="rest-clock"><svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44" fill="none" stroke="#e0e6d7" stroke-width="5"/><circle data-rest-ring cx="50" cy="50" r="44" fill="none" stroke="#3c7150" stroke-width="5" stroke-linecap="round" stroke-dasharray="276.46" stroke-dashoffset="${276.46*(1-seconds/120)}" transform="rotate(-90 50 50)"/></svg><strong data-countdown>${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}</strong></div><h3>Good work. Take your rest.</h3><p>Two minutes by default. Take longer if you need it.</p><div class="rest-actions"><button class="button button-outline" data-action="extend-rest">+30 sec</button><button class="button button-dark" data-action="skip-rest">I’m ready ${icon('arrow')}</button></div><button class="undo-set" data-action="undo-set">${icon('undo')}Undo last set</button></div>`;
}
function finishSession() {
  const s=state.activeSession;if(!s)return;
  if(!s.sets.length){state.activeSession=null;save();closeModal();render();toast('No sets logged. Your next session is waiting.');return;}
  const w=WORKOUTS[s.workoutId],full=s.skipped.length===0&&w.exerciseIds.every(id=>s.sets.filter(v=>v.exerciseId===id).length>=targetSets(id,s.week));
  const oldLevel=levelFor(totalXP(state));s.status=full?'complete':'partial';s.endedAt=Date.now();s.restUntil=null;
  state.sessions.push(s);state.activeSession=null;save();render();openModal('summary',{id:s.id});if(full)celebrate();beep();
  if(levelFor(totalXP(state))>oldLevel)toast(`Level up! Welcome to ${levelName(levelFor(totalXP(state)))}.`);
}
function exportData() {
  const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`moreps-backup-${dayKey()}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Backup exported. Keep it somewhere you can find it.');
}

document.addEventListener('click',event=>{
  const b=event.target.closest('[data-action]');if(!b)return;
  const action=b.dataset.action;
  if(action==='backdrop'){if(event.target===b)closeModal();return;}
  if(action==='close'){closeModal();return;}
  if(action==='select-day'){selectedDay=Number(b.dataset.index);render();return;}
  if(action==='preview'){openModal('preview',{id:b.dataset.id});return;}
  if(action==='start'){startWorkout(b.dataset.workout);return;}
  if(action==='resume'){openModal('player');return;}
  if(action==='settings'){openModal('settings');return;}
  if(action==='protein'){openModal('protein');return;}
  if(action==='weight'){openModal('weight');return;}
  if(action==='activity'){openModal('activity',{activityType:b.dataset.type,date:b.dataset.date});return;}
  if(action==='session-detail'){openModal('session-detail',{id:b.dataset.id});return;}
  if(action==='quick-protein') {try{const {rewarded}=addMeal(state,{grams:Number(b.dataset.grams),name:'Quick protein entry'});save();render();toast(rewarded?'Daily protein target reached. +25 XP!':`${b.dataset.grams} g logged. Keep fueling.`);if(rewarded)celebrate();}catch(e){toast(e.message,true);}return;}
  if(action==='remove-meal'){state.meals=state.meals.filter(m=>m.id!==b.dataset.id);save();render();toast('Protein entry removed.');return;}
  if(action==='step'){const input=document.getElementById(b.dataset.input);input.value=String(Math.max(Number(input.min),Math.min(Number(input.max),Number(input.value)+Number(b.dataset.delta))));return;}
  if(action==='toggle-demo') {
    const el=b.closest('.modal').querySelector('[data-movement]');const paused=el.dataset.paused==='true'||(matchMedia('(prefers-reduced-motion: reduce)').matches&&el.dataset.forceMotion!=='true');el.dataset.paused=String(!paused);el.dataset.forceMotion='true';b.innerHTML=`${icon(paused?'pause':'play')}<span>${paused?'Pause':'Play'} demo</span>`;return;
  }
  if(action==='sound'){state.preferences.sound=!state.preferences.sound;save();if(state.preferences.sound)beep();renderModal();return;}
  if(action==='skip-rest'){if(!state.activeSession)return;state.activeSession.restUntil=null;save();renderPlayer();return;}
  if(action==='extend-rest'){if(!state.activeSession)return;state.activeSession.restUntil=Math.max(Date.now(),state.activeSession.restUntil||Date.now())+30000;save();renderPlayer();return;}
  if(action==='undo-set'){const s=state.activeSession;if(!s)return;const removed=s.sets.pop();if(removed)s.exerciseIndex=WORKOUTS[s.workoutId].exerciseIds.indexOf(removed.exerciseId);s.restUntil=null;save();renderPlayer();toast('Last set removed.');return;}
  if(action==='skip-exercise'){const s=state.activeSession;if(!s)return;s.skipped.push(WORKOUTS[s.workoutId].exerciseIds[s.exerciseIndex]);s.exerciseIndex++;s.restUntil=null;save();renderPlayer();return;}
  if(action==='finish-early'){finishSession();return;}
  if(action==='summary-done'){closeModal();location.hash='progress';if(route==='progress')render();return;}
  if(action==='rest-day'){const date=modal.date||dayKey(),existing=state.activities.find(a=>a.type==='recovery'&&a.date===date);if(!existing)state.activities.push({id:makeId(),date,type:'recovery',minutes:0,rest:true});save();closeModal();render();toast(existing?'Recovery is already logged for this day.':'Rest day honored. +30 XP for recovery.');return;}
  if(action==='export'){exportData();return;}
  if(action==='import'){document.getElementById('backup-file')?.click();return;}
  if(action==='confirm-import'){if(!importedBackup)return;state=importedBackup;importedBackup=null;save();closeModal();render();toast('Your backup is restored. Welcome back.');return;}
});
document.addEventListener('submit',event=>{
  if(!['protein-form','weight-form','activity-form','set-form'].includes(event.target.id))return;
  event.preventDefault();const f=new FormData(event.target);
  try {
    if(event.target.id==='protein-form') {
      const {rewarded}=addMeal(state,{grams:Number(f.get('grams')),name:f.get('name')||'Protein entry'});save();closeModal();render();toast(rewarded?'120 g reached. Daily fuel bonus: +25 XP!':'Protein logged. One step closer.');if(rewarded)celebrate();
    }
    if(event.target.id==='weight-form') {
      const value=Number(f.get('weight'));if(!Number.isFinite(value)||value<50||value>600)throw new Error('Enter a weight between 50 and 600 lb.');
      const entry={date:dayKey(),value:Math.round(value*10)/10};state.weights=state.weights.filter(w=>w.date!==entry.date);state.weights.push(entry);save();closeModal();render();toast('Weigh-in saved. Watch the trend, not a single day.');
    }
    if(event.target.id==='activity-form') {
      const minutes=Number(f.get('minutes'));if(!Number.isFinite(minutes)||minutes<1||minutes>300)throw new Error('Enter active minutes between 1 and 300.');
      const date=modal.date||dayKey(),existing=state.activities.find(a=>a.type===modal.activityType&&a.date===date);if(existing){existing.minutes=minutes;delete existing.rest;}else state.activities.push({id:makeId(),date,type:modal.activityType,minutes});save();closeModal();render();toast(existing?'Activity updated.':'Activity logged. +30 XP!');
    }
    if(event.target.id==='set-form') {
      const s=state.activeSession;if(!s||s.restUntil>Date.now())return;const w=WORKOUTS[s.workoutId],id=w.exerciseIds[s.exerciseIndex],e=EXERCISES[id];
      const reps=Number(f.get('reps')),weight=e.weighted?Number(f.get('weight')):0;if(!Number.isFinite(reps)||reps<1||reps>600||!Number.isInteger(reps)||!Number.isFinite(weight)||weight<0||weight>500)throw new Error('Check the reps and weight before logging.');
      const setNumber=s.sets.filter(v=>v.exerciseId===id).length+1;s.sets.push({exerciseId:id,setNumber,reps,weight,time:Date.now()});
      if(setNumber>=targetSets(id,s.week))s.exerciseIndex++;
      s.restUntil=Date.now()+120000;save();renderPlayer();if(state.activeSession)toast('Set logged. Nice work.');
    }
  }catch(error){toast(error.message,true);}
});
document.addEventListener('change',async event=>{
  if(event.target.id!=='backup-file'||!event.target.files[0])return;
  try {const file=event.target.files[0];if(file.size>10*1024*1024)throw new Error('Choose a backup smaller than 10 MB.');importedBackup=validateBackup(JSON.parse(await file.text()));openModal('import-review');}catch(e){toast(e.message||'Could not read that backup.',true);}
});
document.addEventListener('keydown',event=>{
  if(!modal)return;
  if(event.key==='Escape'){closeModal();return;}
  if(event.key==='Tab') {
    const focusable=[...overlay.querySelectorAll('button,a,input,summary,[tabindex="0"]')].filter(el=>!el.hidden&&el.getClientRects().length&&!el.disabled),first=focusable[0],last=focusable.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
  }
});
window.addEventListener('hashchange',()=>{
  route=['today','train','progress','fuel'].includes(location.hash.slice(1))?location.hash.slice(1):'today';closeModal();render();window.scrollTo({top:0,behavior:'instant'});
});
window.addEventListener('storage',e=>{if(e.key===STORAGE_KEY&&!modal){state=loadState(localStorage);render();}});
setInterval(()=>{
  const today=dayKey();if(today!==lastToday){lastToday=today;if(!modal)render();}
  const s=state.activeSession;
  if(!s?.restUntil)return;
  const seconds=Math.max(0,Math.ceil((s.restUntil-Date.now())/1000));
  if(seconds===0){s.restUntil=null;save();beep();if(modal?.type==='player')renderPlayer();return;}
  const counter=document.querySelector('[data-countdown]');if(counter)counter.textContent=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
  const ring=document.querySelector('[data-rest-ring]');if(ring)ring.setAttribute('stroke-dashoffset',String(276.46*(1-Math.min(seconds/120,1))));
},500);
render();
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
