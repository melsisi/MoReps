import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import * as core from '../core.mjs';
import * as data from '../data.mjs';
import * as moves from '../moves.mjs';

// Exercise the application's event wiring with an in-memory document and storage.
// Layout and native browser behavior still require a visual browser check.
async function harness(saved=core.defaultState()) {
  const elements=new Map(),listeners=new Map(),stored=new Map([[core.STORAGE_KEY,JSON.stringify(saved)]]);
  let now=Date.now(),tick;
  const element=id=>{
    if(!elements.has(id))elements.set(id,{innerHTML:'',value:'',min:'0',max:'600',classList:{add(){},remove(){}},addEventListener(){},querySelector(){return null;},querySelectorAll(){return [];},replaceChildren(){this.innerHTML='';}});
    return elements.get(id);
  };
  const context=vm.createContext({...core,...data,...moves,startMotion(){},
    createSession:(id,week,intensity)=>core.createSession(id,week,intensity,now),
    toggleWorkTimer:t=>core.toggleWorkTimer(t,now),settleWorkTimer:t=>core.settleWorkTimer(t,now),timerRemaining:t=>core.timerRemaining(t,now),
    Date:class extends Date {static now(){return now;}},
    document:{querySelector:element,getElementById:element,querySelectorAll:()=>[],body:element('body'),addEventListener:(name,fn)=>listeners.set(name,fn)},
    window:{addEventListener(){},scrollTo(){}},navigator:{},location:{hash:'#train'},
    localStorage:{getItem:key=>stored.get(key),setItem:(key,value)=>stored.set(key,value)},
    requestAnimationFrame(){},setInterval(fn){tick=fn;},setTimeout(){},clearTimeout(){},
    matchMedia:()=>({matches:true}),FormData:class {constructor(form){this.values=form.values;}get(key){return this.values[key]??null;}}
  });
  const source=(await readFile(new URL('../app.mjs',import.meta.url),'utf8')).replace(/^import .*;\n/gm,'');
  vm.runInContext(source+'\nglobalThis.inspectState=()=>state;',context);
  const click=(action,extra={})=>listeners.get('click')({target:{closest:()=>({dataset:{action,...extra}})}});
  return {click,element,state:context.inspectState,persisted:()=>JSON.parse(stored.get(core.STORAGE_KEY)),
    advance(ms){now+=ms;tick();},
    change(id,value){element(id).value=value;listeners.get('change')({target:{id,value}});},
    log(reps,weight=0){listeners.get('submit')({preventDefault(){},target:{id:'set-form',values:{reps:String(reps),weight:String(weight)}}});}
  };
}

test('Timed workout flow keeps load through pause/reload, awards no automatic sets, and logs once',async()=>{
  let app=await harness();
  assert.match(app.element('#app').innerHTML,/26 moves/);
  app.click('start',{workout:'homeA'});
  for(let i=0;i<5;i++)app.click('skip-exercise');
  app.element('reps').value='30';app.element('load').value='12';app.click('work-toggle');
  app.advance(5000);app.click('work-toggle');
  assert.equal(app.state().activeSession.workTimer.remainingMs,25000);
  app.change('load','-5');assert.equal(app.persisted().activeSession.workTimer.weight,12);
  app.element('load').value='12';app.click('step',{input:'load',delta:'2'});
  assert.equal(app.persisted().activeSession.workTimer.weight,14);
  app=await harness(app.persisted());app.click('resume');
  assert.match(app.element('#overlay-root').innerHTML,/value="14"/);
  app.element('load').value='14';app.click('work-toggle');
  app.log(30,14);assert.equal(app.state().activeSession.sets.length,0);
  app.advance(25001);assert.equal(app.state().activeSession.workTimer.done,true);
  assert.equal(app.state().activeSession.sets.length,0);assert.equal(core.totalXP(app.state()),0);
  app.log(30,14);assert.equal(app.state().activeSession.sets.length,1);
  app.log(30,14);assert.equal(app.state().activeSession.sets.length,1);
  assert.equal(app.state().activeSession.workTimer,null);
  assert.ok(app.state().activeSession.restUntil>Date.now());
});

test('Unilateral timer blocks logging until side two; swaps persist in the saved plan',async()=>{
  const app=await harness();app.click('start',{workout:'homeA'});
  app.click('swap',{id:'stepup'});assert.equal(app.persisted().activeSession.exerciseIds[0],'stepup');
  app.click('intensity',{mode:'foundation'});assert.equal(app.state().activeSession.targets.stepup,3);
  for(let i=0;i<5;i++)app.click('skip-exercise');
  app.click('swap',{id:'suitcase'});app.element('reps').value='1';app.element('load').value='10';app.click('work-toggle');
  app.advance(1001);assert.equal(app.state().activeSession.workTimer.awaitingSide,true);
  assert.match(app.element('#overlay-root').innerHTML,/Start side 2/);
  app.log(1,10);assert.equal(app.state().activeSession.sets.length,0);
  app.click('work-toggle');assert.equal(app.state().activeSession.workTimer.side,2);
  app.advance(1001);app.log(1,10);assert.equal(app.state().activeSession.sets.length,1);
});
