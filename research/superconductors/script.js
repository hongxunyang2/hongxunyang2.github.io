'use strict';
document.documentElement.classList.add('js-enabled');

// Both defining properties respond to one temperature in this teaching model.
function fieldY(x,level,radius){
  let lo=Math.max(level,Math.sqrt(Math.max(0,radius*radius-x*x))),hi=level+2*radius;
  for(let n=0;n<32;n++){
    const mid=(lo+hi)/2,flux=mid*(1-radius*radius/(x*x+mid*mid));
    if(flux>level)hi=mid;else lo=mid;
  }
  return (lo+hi)/2;
}

function fieldDrawing(cold) {
  let svg='<title>'+(cold?'Magnetic field expelled below 90 kelvin':'Magnetic field penetrates at or above 90 kelvin')+'</title><defs><marker id="field-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 1L9 5L0 9" fill="none" stroke="#b4d7d6" stroke-width="1.5"/></marker></defs>';
  svg+=`<circle cx="240" cy="145" r="60" fill="${cold?'#8d5073':'#627d85'}" fill-opacity=".4" stroke="${cold?'#e0b5cb':'#a5c2c7'}" stroke-width="2"/>`;
  for(let n=0;n<8;n++)for(const sign of [-1,1]){
    const level=9+(n+.5)/8*109,points=[];
    for(let i=0;i<=120;i++){
      const x=-220+i*440/120,y=sign*(cold?fieldY(x,level,60):level);
      points.push((i?'L':'M')+(240+x).toFixed(2)+','+(145-y).toFixed(2));
    }
    svg+=`<path d="${points.join(' ')}" fill="none" stroke="#b4d7d6" stroke-width="1.5" opacity=".78" marker-end="url(#field-arrow)"/>`;
  }
  if(cold)svg+='<text x="240" y="151" text-anchor="middle" fill="#ffe5f2" font-size="16">B ≈ 0 inside</text>';
  return svg;
}
const temperature=document.getElementById('temperature');
const fieldPictures={warm:fieldDrawing(false),cold:fieldDrawing(true)};
function resistance(t){return t<90?0:.42+(t-90)/100;}
function point(t){return [48+(t-20)/120*312,176-resistance(t)*130];}
if(temperature){
  const curve=document.getElementById('resistance-curve');
  curve.setAttribute('d',`M${point(20)} L${point(89.99)} L${point(90)} L${point(140)}`);
  let previousCold=null;
  const updateTemperature=()=>{
    const t=Number(temperature.value),cold=t<90,pos=point(t);
    document.getElementById('temperature-value').textContent=t+' K';
    temperature.setAttribute('aria-valuetext',t+' kelvin; '+(cold?'superconducting, zero resistance, field expelled':'normal state, finite resistance, field penetrates'));
    document.getElementById('resistance-marker').setAttribute('cx',pos[0]);
    document.getElementById('resistance-marker').setAttribute('cy',pos[1]);
    document.getElementById('temperature-status').textContent=cold?'Superconducting':'Normal state';
    temperature.closest('.temperature-stage').dataset.state=cold?'cold':'warm';
    document.getElementById('field-caption').textContent=cold?'Below 90 K, the weak field is expelled from the bulk.':'At or above 90 K, the field passes through the sample.';
    const field=document.getElementById('field-art');
    if(cold!==previousCold){field.innerHTML=fieldPictures[cold?'cold':'warm'];previousCold=cold;}
    field.setAttribute('aria-label',cold?'Meissner state: magnetic field lines bend around the sample.':'Normal state: magnetic field lines pass through the sample.');
    document.getElementById('temperature-description').textContent=cold?'At '+t+' K: zero DC resistance, and the weak magnetic field bends around the sample. One temperature change reveals both properties.':'At '+t+' K: finite electrical resistance, and the magnetic field passes through the sample. Slide below 90 K to change both views.';
  };
  temperature.addEventListener('input',updateTemperature);updateTemperature();
}
