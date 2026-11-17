/* Gentle slider previews. Manual interaction hands control to the visitor. */
(function () {
  'use strict';
  globalThis.DemoAutoplay = function ({root, input, min, max, render, period=12, fps=24}) {
    if(!root || !input) return;
    const button=root.querySelector('[data-demo-animation]');
    if(!button) return;
    const statuses=[...root.querySelectorAll('[role="status"]')];
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    let playing=!reduced.matches, visible=false, frame=0, previous=null, lastPaint=0;
    const phaseForValue=()=>Math.acos(1-2*Math.max(0,Math.min(1,(Number(input.value)-min)/(max-min))));
    let phase=phaseForValue();
    function sync() {
      button.textContent=playing?'Pause animation':'Auto-play';
      button.setAttribute('aria-pressed',String(playing));
      statuses.forEach(status=>status.setAttribute('aria-live',playing?'off':'polite'));
      if(frame) cancelAnimationFrame(frame);
      frame=0;previous=null;lastPaint=0;
      if(playing && visible && !document.hidden) frame=requestAnimationFrame(tick);
    }
    function stop() {
      if(!playing) return;
      playing=false;sync();
    }
    function tick(now) {
      frame=0;
      if(previous!==null) phase+=Math.min(now-previous,100)/1000*2*Math.PI/period;
      previous=now;
      if(now-lastPaint>=1000/fps) {
        lastPaint=now;
        const value=String(Math.round(min+(max-min)*(1-Math.cos(phase))/2));
        // Integer sliders need a redraw only when their displayed value changes.
        if(input.value!==value) {input.value=value;render();}
      }
      frame=requestAnimationFrame(tick);
    }
    root.addEventListener('pointerdown',event=>{
      if(event.isPrimary && (event.pointerType!=='mouse' || event.button===0) &&
        event.target!==button && event.target.closest('input,select,button,label')) stop();
    });
    root.addEventListener('focusin',event=>{
      if(event.target!==button && event.target.matches('input,select,button')) stop();
    });
    root.addEventListener('input',stop);
    root.addEventListener('change',stop);
    root.addEventListener('click',event=>{
      if(event.target!==button && event.target.closest('button')) stop();
    });
    button.addEventListener('click',()=>{
      playing=!playing;
      if(playing) {
        phase=phaseForValue();
        const value=String(Math.round(Math.max(min,Math.min(max,Number(input.value)))));
        if(input.value!==value) {input.value=value;render();}
      }
      sync();
    });
    document.addEventListener('visibilitychange',sync);
    reduced.addEventListener('change',()=>{if(reduced.matches) stop();});
    if('IntersectionObserver' in globalThis) {
      new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();}).observe(root);
    } else visible=true;
    sync();
  };
})();
