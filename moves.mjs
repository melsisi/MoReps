// Original joint diagrams. Coordinates are visual cues, not motion capture.
const stand = {head:[160,64],s:[160,104],h:[160,174],el:[127,139],er:[193,139],wl:[125,181],wr:[195,181],kl:[139,225],kr:[181,225],fl:[132,278],fr:[190,278]};
const pose = overrides => ({...stand,...overrides});
const POSES = {
  squat:[pose({el:[129,127],er:[191,127],wl:[153,128],wr:[167,128]}),pose({head:[160,112],s:[160,152],h:[165,209],el:[128,169],er:[192,169],wl:[153,173],wr:[167,173],kl:[113,233],kr:[214,233],fl:[132,278],fr:[190,278]})],
  split:[pose({kl:[119,222],kr:[207,220],fl:[99,278],fr:[231,278]}),pose({head:[151,109],s:[151,149],h:[158,211],el:[122,184],er:[181,184],wl:[119,224],wr:[184,224],kl:[101,228],kr:[217,263],fl:[99,278],fr:[231,278]})],
  hinge:[pose({wl:[140,183],wr:[182,183]}),pose({head:[93,127],s:[123,150],h:[195,180],el:[118,191],er:[139,195],wl:[115,231],wr:[138,236],kl:[166,228],kr:[200,227],fl:[143,278],fr:[208,278]})],
  row:[pose({head:[99,128],s:[128,152],h:[197,179],el:[129,193],wl:[127,237],er:[167,179],wr:[168,218],kl:[151,228],kr:[210,225],fl:[128,278],fr:[228,278]}),pose({head:[99,128],s:[128,152],h:[197,179],el:[175,158],wl:[173,197],er:[167,179],wr:[168,218],kl:[151,228],kr:[210,225],fl:[128,278],fr:[228,278]})],
  floorpress:[pose({head:[61,246],s:[102,246],h:[190,246],el:[91,248],er:[120,249],wl:[89,198],wr:[118,202],kl:[225,207],kr:[236,214],fl:[254,277],fr:[268,277]}),pose({head:[61,246],s:[102,246],h:[190,246],el:[100,203],er:[120,207],wl:[100,157],wr:[122,164],kl:[225,207],kr:[236,214],fl:[254,277],fr:[268,277]})],
  overhead:[pose({el:[115,126],er:[205,126],wl:[115,87],wr:[205,87]}),pose({el:[134,68],er:[186,68],wl:[143,27],wr:[177,27]})],
  curl:[stand,pose({el:[127,139],er:[193,139],wl:[138,100],wr:[182,100]})],
  lateral:[stand,pose({el:[101,110],er:[219,110],wl:[63,121],wr:[257,121]})],
  ringrow:[pose({head:[107,142],s:[129,170],h:[187,219],el:[131,128],er:[146,136],wl:[135,86],wr:[155,94],kl:[226,247],kr:[238,250],fl:[264,278],fr:[277,278]}),pose({head:[122,92],s:[144,120],h:[194,189],el:[172,102],er:[178,124],wl:[135,86],wr:[155,94],kl:[231,238],kr:[241,241],fl:[264,278],fr:[277,278]})],
  pushup:[pose({head:[73,162],s:[103,183],h:[182,219],el:[95,227],er:[110,230],wl:[91,277],wr:[110,277],kl:[225,248],kr:[235,249],fl:[270,277],fr:[282,277]}),pose({head:[73,229],s:[106,244],h:[185,259],el:[133,261],er:[145,266],wl:[91,277],wr:[110,277],kl:[230,268],kr:[240,268],fl:[270,277],fr:[282,277]})],
  lunge:[stand,pose({head:[151,109],s:[151,149],h:[158,211],el:[122,184],er:[181,184],wl:[119,224],wr:[184,224],kl:[101,228],kr:[217,263],fl:[99,278],fr:[231,278]})],
  sideplank:[pose({head:[78,162],s:[103,190],h:[181,223],el:[87,229],er:[150,169],wl:[109,278],wr:[192,172],kl:[226,250],kr:[226,250],fl:[269,277],fr:[277,277]}),pose({head:[78,162],s:[103,190],h:[181,223],el:[87,229],er:[149,171],wl:[109,278],wr:[191,174],kl:[226,250],kr:[226,250],fl:[269,277],fr:[277,277]})],
  walkout:[pose({head:[55,255],s:[92,255],h:[172,216],el:[129,267],er:[134,266],wl:[162,277],wr:[170,276],kl:[214,206],kr:[225,212],fl:[239,277],fr:[250,277]}),pose({head:[55,255],s:[92,255],h:[170,235],el:[129,267],er:[134,266],wl:[162,277],wr:[170,276],kl:[223,249],kr:[231,251],fl:[278,277],fr:[290,277]})],
  calf:[pose({el:[130,128],wl:[106,106],er:[192,140],wr:[194,184],kr:[200,225],fr:[214,241]}),pose({head:[160,48],s:[160,88],h:[160,158],el:[130,115],wl:[106,106],er:[192,124],wr:[194,168],kl:[139,209],fl:[143,263],kr:[200,209],fr:[214,225]})],
  deadbug:[pose({head:[58,256],s:[98,256],h:[184,256],el:[106,212],er:[126,215],wl:[112,170],wr:[136,176],kl:[201,205],kr:[218,214],fl:[247,205],fr:[261,214]}),pose({head:[58,256],s:[98,256],h:[184,256],el:[62,235],er:[126,215],wl:[26,226],wr:[136,176],kl:[233,255],kr:[218,214],fl:[282,264],fr:[261,214]})],
  altcurl:[pose({wl:[138,100]}),pose({wr:[182,100]})],
  stepup:[pose({head:[146,92],s:[146,132],h:[146,196],kl:[191,205],fl:[204,237],kr:[125,239],fr:[119,278]}),pose({head:[184,22],s:[184,62],h:[184,130],kl:[191,181],fl:[204,237],kr:[146,161],fr:[150,199],el:[153,103],er:[214,103],wl:[150,147],wr:[217,147]})],
  rotationlunge:[pose({wl:[149,133],wr:[172,133]}),pose({head:[143,109],s:[144,149],h:[158,211],el:[106,170],er:[159,170],wl:[117,177],wr:[139,177],kl:[101,228],kr:[217,263],fl:[99,278],fr:[231,278]})],
  bounds:[pose({head:[107,91],s:[107,131],h:[110,191],kl:[85,232],fl:[76,278],kr:[160,218],fr:[179,247],wl:[67,199],wr:[151,191]}),pose({head:[213,91],s:[213,131],h:[210,191],kr:[235,232],fr:[244,278],kl:[160,218],fl:[141,247],wl:[171,191],wr:[253,199]})],
  sidestep:[pose({head:[120,64],s:[120,104],h:[120,174],kl:[99,225],fl:[92,278],kr:[152,225],fr:[162,278]}),pose({head:[195,64],s:[195,104],h:[195,174],kl:[160,220],fl:[148,255],kr:[215,225],fr:[225,278]})],
  farmer:[pose({kl:[119,180],fl:[123,222]}),pose({kr:[202,180],fr:[205,222]})],
  suitcase:[pose({wl:[124,181],wr:[194,181],kl:[119,180],fl:[123,222]}),pose({wl:[124,181],wr:[194,181],kr:[202,180],fr:[205,222]})],
  bstance:[pose({kr:[210,230],fr:[239,278]}),pose({head:[93,127],s:[123,150],h:[195,180],el:[118,191],er:[139,195],wl:[115,231],wr:[138,236],kl:[166,228],kr:[226,232],fl:[143,278],fr:[247,278]})],
  bear:[pose({head:[76,168],s:[107,193],h:[188,205],el:[100,230],er:[135,222],wl:[96,278],wr:[117,196],kl:[203,249],kr:[227,250],fl:[241,278],fr:[263,278]}),pose({head:[76,168],s:[107,193],h:[188,205],el:[123,218],er:[116,238],wl:[133,195],wr:[123,278],kl:[203,249],kr:[227,250],fl:[241,278],fr:[263,278]})],
  pulluptuck:[pose({head:[160,103],s:[160,138],h:[160,205],el:[119,100],er:[201,100],wl:[112,38],wr:[208,38],kl:[141,247],kr:[181,247],fl:[135,282],fr:[187,282]}),pose({head:[160,29],s:[160,65],h:[160,132],el:[115,94],er:[205,94],wl:[112,38],wr:[208,38],kl:[141,190],kr:[181,190],fl:[135,235],fr:[187,235]}),pose({head:[160,103],s:[160,138],h:[160,205],el:[119,100],er:[201,100],wl:[112,38],wr:[208,38],kl:[141,247],kr:[181,247],fl:[135,282],fr:[187,282]}),pose({head:[160,103],s:[160,138],h:[160,205],el:[119,100],er:[201,100],wl:[112,38],wr:[208,38],kl:[119,179],kr:[187,179],fl:[114,221],fr:[199,221]})],
  assistpull:[pose({head:[155,130],s:[155,164],h:[164,218],el:[116,146],er:[205,146],wl:[112,108],wr:[208,108],kl:[115,239],kr:[219,239],fl:[100,278],fr:[233,278]}),pose({head:[155,91],s:[155,125],h:[164,192],el:[117,158],er:[204,158],wl:[112,108],wr:[208,108],kl:[115,224],kr:[219,224],fl:[100,278],fr:[233,278]})],

};
export const MOVEMENT_IDS=Object.keys(POSES);
const weighted = new Set(['squat','split','hinge','row','floorpress','overhead','curl','lateral','altcurl','stepup','farmer','suitcase','bstance']);
const pt = p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`;
const path = (points,stroke,width) => `<polyline points="${points.map(pt).join(' ')}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
function skeleton(move,t,dark) {
  const frames=POSES[move]||POSES.squat,phase=t*(frames.length-1),index=Math.min(frames.length-2,Math.floor(phase)),a=frames[index],b=frames[index+1];t=phase-index;
  const p=Object.fromEntries(Object.keys(a).map(k=>[k,[a[k][0]+(b[k][0]-a[k][0])*t,a[k][1]+(b[k][1]-a[k][1])*t]]));
  const skin=dark?'#f3f4d7':'#245242',rear=dark?'#97b494':'#7d9b80',shirt=dark?'#d8fa76':'#436b41',shoe=dark?'#ff966d':'#e58254';
  let html='';
  if(move==='ringrow') html+=path([[130,5],p.wl],rear,3)+path([[164,5],p.wr],rear,3)+`<circle cx="${p.wl[0]}" cy="${p.wl[1]}" r="10" fill="none" stroke="#ff966d" stroke-width="4"/><circle cx="${p.wr[0]}" cy="${p.wr[1]}" r="10" fill="none" stroke="#ff966d" stroke-width="4"/>`;
  if(move==='stepup') html+=`<path d="M176 278V238H249V278" fill="none" stroke="${rear}" stroke-width="8"/>`;
  if(move==='pulluptuck'||move==='assistpull') html+=path([[83,move==='assistpull'?108:38],[237,move==='assistpull'?108:38]],rear,7);
  if(move==='rotationlunge'){const x=(p.wl[0]+p.wr[0])/2,y=(p.wl[1]+p.wr[1])/2;html+=`<circle cx="${x}" cy="${y}" r="18" fill="none" stroke="${shoe}" stroke-width="7"/>`;}
  if(move==='calf') html+=path([[96,70],[96,283]],rear,4);
  html+=path([p.h,p.kr,p.fr],rear,15)+path([p.s,p.er,p.wr],rear,12);
  html+=path([p.h,p.kl,p.fl],skin,17)+path([p.s,p.h],shirt,33)+path([p.s,p.el,p.wl],skin,13);
  html+=`<circle cx="${p.h[0]}" cy="${p.h[1]}" r="15" fill="${shirt}"/><circle cx="${p.head[0]}" cy="${p.head[1]}" r="19" fill="${skin}"/><path d="M${p.head[0]-17},${p.head[1]-6} Q${p.head[0]},${p.head[1]-29} ${p.head[0]+18},${p.head[1]-5}" stroke="${shirt}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  html+=`<circle cx="${p.head[0]+8}" cy="${p.head[1]}" r="2" fill="${dark?'#173d32':'#e8efd7'}"/>`;
  for(const [k,v] of Object.entries(p)) if(['el','kl','er','kr'].includes(k)) html+=`<circle cx="${v[0]}" cy="${v[1]}" r="3" fill="${shirt}" opacity=".65"/>`;
  html+=path([[p.fl[0]-8,p.fl[1]],[p.fl[0]+10,p.fl[1]]],shoe,9)+path([[p.fr[0]-7,p.fr[1]],[p.fr[0]+11,p.fr[1]]],shoe,8);
  if(weighted.has(move)) {
    const hands=move==='squat'?[[(p.wl[0]+p.wr[0])/2,(p.wl[1]+p.wr[1])/2]]:(move==='row'||move==='suitcase')?[p.wl]:[p.wr,p.wl];
    for(const v of hands) html+=`<g transform="translate(${v[0]},${v[1]})"><path d="M-15 0H15" stroke="${shoe}" stroke-width="5"/><rect x="-19" y="-10" width="8" height="20" rx="3" fill="${shoe}"/><rect x="11" y="-10" width="8" height="20" rx="3" fill="${shoe}"/></g>`;
  }
  return html;
}
export function demo(move,{animated=true,compact=false,dark=true,label='Exercise movement preview'}={}) {
  return `<div class="movement ${compact?'compact':''} ${dark?'movement-dark':'movement-light'}" data-movement="${move}" data-animate="${animated}" data-paused="false">
    <svg viewBox="0 0 320 320" role="img" aria-label="${label}"><ellipse cx="170" cy="289" rx="108" ry="12" fill="${dark?'#051e18':'#183d32'}" opacity=".16"/><path d="M30 288H298" stroke="${dark?'#8dae8b':'#91a48c'}" opacity=".3"/><g data-skeleton>${skeleton(move,.15,dark)}</g></svg>
  </div>`;
}
let loopStarted=false,lastFrame=0;
export function startMotion() {
  if(loopStarted) return; loopStarted=true;
  function frame(time) {
    if(time-lastFrame>38&&!document.hidden) {
      lastFrame=time;
      const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.querySelectorAll('[data-movement][data-animate="true"]').forEach(el=>{
        if(el.dataset.paused==='true'||(reduce&&el.dataset.forceMotion!=='true')) return;
        const t=(1-Math.cos(time/3400*Math.PI*2))/2;
        el.querySelector('[data-skeleton]').innerHTML=skeleton(el.dataset.movement,t,el.classList.contains('movement-dark'));
      });
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
