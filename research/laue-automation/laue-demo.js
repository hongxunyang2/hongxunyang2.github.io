(function () {
  'use strict';
  const model=globalThis.LaueModel;
  const byId=id=>document.getElementById(id);
  const root=byId('laue-lab');
  if(!root || !model) return;
  const crystal=byId('laue-crystal'), detector=byId('laue-pattern'), drag=byId('laue-drag');
  const controls=[...root.querySelectorAll('[data-laue-angle]')];
  const preset=byId('laue-preset');
  const state={yaw:0,pitch:0,twist:0,preset:'face'};
  let challenge=null, pointer=null, frame=0, hint='', selectedPreset='face';
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const angleText=value=>(value>0?'+':'')+value+'°';
  const vertices=[];
  for(const x of [-1,1]) for(const y of [-1,1]) for(const z of [-1,1]) vertices.push([x,y,z]);
  const project=v=>[180+50*(.86*v[0]-.5*v[2]),113+50*(.19*v[0]-.9*v[1]+.35*v[2])];
  const coordinate=p=>p.map(v=>v.toFixed(2)).join(',');
  function drawCrystal(orientation) {
    const rotate=v=>model.transform(orientation,v), screen=v=>project(rotate(v));
    const corners=vertices.map(screen);
    let drawing='<defs><marker id="laue-beam-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#bb995c"/></marker></defs>';
    drawing+='<title id="laue-crystal-title">Rotatable cubic crystal lattice</title><desc id="laue-crystal-desc">Drag to rotate the crystal, or use the three rotation sliders. The X-ray beam stays fixed.</desc>';
    drawing+=`<path d="M${coordinate(project([-3,0,0]))}L${coordinate(project([-1.15,0,0]))}" stroke="#bb995c" stroke-width="4" marker-end="url(#laue-beam-arrow)"/><path d="M${coordinate(project([1.2,0,0]))}L${coordinate(project([3,0,0]))}" stroke="#bb995c" stroke-width="2" stroke-dasharray="5 5" opacity=".45"/>`;
    drawing+='<text x="20" y="63" fill="#866833" font-size="12">Fixed X-rays</text>';
    for(const face of [[0,1,3,2],[4,5,7,6],[0,1,5,4],[2,3,7,6],[0,2,6,4],[1,3,7,5]]) {
      drawing+=`<polygon points="${face.map(i=>coordinate(corners[i])).join(' ')}" fill="#c9b4dc" fill-opacity=".07" stroke="#9c83ad" stroke-opacity=".4" stroke-width="1.2"/>`;
    }
    const nodes=[];
    for(const x of [-.72,0,.72]) for(const y of [-.72,0,.72]) for(const z of [-.72,0,.72]) {
      const v=[x,y,z], p=screen(v), depth=rotate(v).reduce((sum,n,i)=>sum+n*[.45,.25,.8][i],0);
      nodes.push({v,p,depth});
      for(let axis=0;axis<3;axis++) if(v[axis]<.7) {
        const end=v.slice();end[axis]+=.72;
        drawing+=`<path d="M${coordinate(p)}L${coordinate(screen(end))}" stroke="#a6b5a6" stroke-opacity=".6" stroke-width="1.5"/>`;
      }
    }
    nodes.sort((a,b)=>a.depth-b.depth).forEach(({p,depth})=>{
      drawing+=`<circle cx="${p[0]}" cy="${p[1]}" r="${4.6+.5*depth}" fill="${depth<0?'#b6a3c4':'#8c6ca4'}" stroke="#fffdf8" stroke-width="1"/>`;
    });
    [['a',[1.6,0,0],'#52836b'],['b',[0,1.6,0],'#9b6b9f'],['c',[0,0,1.6],'#ac7a4c']].forEach(([label,v,color])=>{
      const end=screen(v),origin=project([0,0,0]);
      drawing+=`<path d="M${coordinate(origin)}L${coordinate(end)}" stroke="${color}" stroke-width="1.5"/><text x="${end[0]+4}" y="${end[1]-3}" font-size="13" fill="${color}" font-weight="650">${label}</text>`;
    });
    drawing+='<text x="180" y="208" text-anchor="middle" font-size="12" fill="#59696b">Drag the lattice ↔ ↕</text>';
    crystal.innerHTML=drawing;
  }
  function drawDetector(spots) {
    let drawing='<title id="laue-pattern-title">Calculated back-reflection Laue pattern</title><desc id="laue-pattern-desc">'+spots.length+' diffraction spots for the current cubic crystal orientation.'+(challenge?' Cyan rings show the target pattern.':'')+'</desc>';
    drawing+='<rect x="18" y="18" width="324" height="324" rx="12" fill="#102e2e" stroke="#49645d"/>';
    [90,180,270].forEach(p=>{drawing+=`<path d="M${p} 26V334 M26 ${p}H334" stroke="#bfd6cc" stroke-opacity=".12" stroke-width="1"/>`;});
    if(challenge) for(const spot of challenge.spots) {
      drawing+=`<circle cx="${180+spot.x*100}" cy="${180-spot.y*100}" r="6.3" fill="none" stroke="#9ed8dd" stroke-width="1.5" stroke-dasharray="3 2" opacity=".85"/>`;
    }
    for(const spot of spots) drawing+=`<circle cx="${180+spot.x*100}" cy="${180-spot.y*100}" r="${2.5+spot.brightness}" fill="#faedca" opacity="${spot.brightness}"/>`;
    drawing+='<circle cx="180" cy="180" r="10.5" fill="#081f20" stroke="#527068" stroke-width="1"/><path d="M177 180h6m-3-3v6" stroke="#8daba0" stroke-width="1"/>';
    detector.innerHTML=drawing;
    byId('laue-spot-count').textContent=spots.length+' spots';
  }
  function render() {
    frame=0;
    const orientation=model.rotation(state.yaw,state.pitch,state.twist,state.preset);
    drawCrystal(orientation);drawDetector(model.reflections(orientation));
    controls.forEach(input=>{
      const angle=state[input.dataset.laueAngle];input.value=String(angle);
      byId(input.id+'-value').textContent=angleText(angle);
      input.setAttribute('aria-valuetext',angle+' degrees');
    });
    const score=byId('laue-score'), feedback=byId('laue-feedback');
    if(challenge) {
      const error=model.misorientation(orientation,challenge.orientation), won=error<.8;
      score.hidden=false;score.textContent=won?'Aligned ✓':error.toFixed(1)+'° away';
      byId('laue-spot-count').textContent=score.textContent;
      feedback.textContent=won?'You found the orientation! The bright spots sit inside the target rings. This is the kind of pattern-matching an automated lab can do.':hint || 'Match the bright spots to the cyan rings. Small tilts and twists bring the crystal into alignment.';
      if(won && !challenge.won) byId('laue-announcement').textContent='Crystal aligned. You matched the target orientation.';
      challenge.won=won;
    } else {
      score.hidden=true;
      feedback.textContent='Same crystal, different orientation. Watch the spots move and the pattern’s symmetry change as you tilt it.';
    }
  }
  function schedule() { if(!frame) frame=requestAnimationFrame(render); }
  function exitChallenge() {
    challenge=null;hint='';byId('laue-challenge').textContent='Try an alignment challenge';
    byId('laue-challenge').setAttribute('aria-pressed','false');
    byId('laue-new').hidden=true;byId('laue-hint').hidden=true;byId('laue-target-key').hidden=true;
  }
  function startChallenge() {
    const random=limit=>Math.round((Math.random()*2-1)*limit);
    const target={yaw:random(6),pitch:random(6),twist:random(10)};
    const initial={yaw:target.yaw+(Math.random()<.5?-10:10),pitch:target.pitch+(Math.random()<.5?-9:9),twist:target.twist+(Math.random()<.5?-16:16)};
    state.preset='face';preset.value='face';Object.assign(state,initial);selectedPreset='face';
    const orientation=model.rotation(target.yaw,target.pitch,target.twist,'face');
    challenge={orientation,spots:model.reflections(orientation),target,initial,won:false};hint='';
    byId('laue-challenge').textContent='Back to free exploration';byId('laue-challenge').setAttribute('aria-pressed','true');
    byId('laue-new').hidden=false;byId('laue-hint').hidden=false;byId('laue-target-key').hidden=false;
    byId('laue-announcement').textContent='Alignment challenge started. Cyan rings mark the target pattern.';render();
    root.scrollIntoView({block:'start',behavior:'auto'});
  }
  controls.forEach(input=>input.addEventListener('input',()=>{state[input.dataset.laueAngle]=Number(input.value);hint='';schedule();}));
  preset.addEventListener('change',()=>{
    if(challenge) {exitChallenge();byId('laue-announcement').textContent='Free exploration. Selected a new crystal view.';}
    selectedPreset=preset.value;Object.assign(state,{yaw:0,pitch:0,twist:0,preset:selectedPreset});render();
    root.scrollIntoView({block:'start',behavior:'auto'});
  });
  byId('laue-reset').addEventListener('click',()=>{hint='';Object.assign(state,challenge?challenge.initial:{yaw:0,pitch:0,twist:0,preset:selectedPreset});render();});
  byId('laue-challenge').addEventListener('click',()=>{
    if(challenge){exitChallenge();byId('laue-announcement').textContent='Free exploration resumed.';render();}else startChallenge();
  });
  byId('laue-new').addEventListener('click',startChallenge);
  byId('laue-hint').addEventListener('click',()=>{
    const largest=['yaw','pitch','twist'].sort((a,b)=>Math.abs(challenge.target[b]-state[b])-Math.abs(challenge.target[a]-state[a]))[0];
    const names={yaw:'Left / right',pitch:'Up / down',twist:'Twist'};
    hint='Try moving “'+names[largest]+'” towards '+(challenge.target[largest]>state[largest]?'positive':'negative')+' angles.';
    byId('laue-announcement').textContent=hint;render();
  });
  drag.addEventListener('pointerdown',event=>{
    if(!event.isPrimary || (event.pointerType==='mouse' && event.button!==0)) return;
    pointer={id:event.pointerId,x:event.clientX,y:event.clientY,yaw:state.yaw,pitch:state.pitch};
    drag.setPointerCapture(event.pointerId);drag.classList.add('is-dragging');
  });
  drag.addEventListener('pointermove',event=>{
    if(!pointer || event.pointerId!==pointer.id) return;
    state.yaw=Math.round(clamp(pointer.yaw+(event.clientX-pointer.x)*.22,-25,25));
    state.pitch=Math.round(clamp(pointer.pitch+(event.clientY-pointer.y)*.22,-25,25));
    hint='';schedule();
  });
  function endDrag(event) {
    if(!pointer || event.pointerId!==pointer.id) return;
    pointer=null;drag.classList.remove('is-dragging');
  }
  drag.addEventListener('pointerup',endDrag);drag.addEventListener('pointercancel',endDrag);drag.addEventListener('lostpointercapture',endDrag);
  render();
})();
