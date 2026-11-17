'use strict';
document.documentElement.classList.add('js-enabled');

// Explore an idealised superconducting transition.
const temperature = document.getElementById('temperature');
function resistance(t){return t<90 ? 0 : .42+(t-90)/100;}
function point(t){return [48+(t-20)/120*312,176-resistance(t)*130];}
if(temperature){
  const curve=document.getElementById('resistance-curve');
  const p1=point(20), p2=point(89.99), p3=point(90), p4=point(140);
  curve.setAttribute('d',`M${p1} L${p2} L${p3} L${p4}`);
  const updateTemperature=()=>{
    const t=Number(temperature.value), cold=t<90, pos=point(t);
    document.getElementById('temperature-value').textContent=t+' K';
    temperature.setAttribute('aria-valuetext',t+' kelvin, '+(cold?'superconducting':'normal state'));
    document.getElementById('resistance-marker').setAttribute('cx',pos[0]);
    document.getElementById('resistance-marker').setAttribute('cy',pos[1]);
    document.getElementById('temperature-status').textContent=cold?'Superconducting':'Normal state';
    temperature.closest('.temperature-stage').dataset.state=cold?'cold':'warm';
    document.getElementById('temperature-description').textContent=cold?'Zero DC resistance. The material is now superconducting. What are its electrons doing together?':'Above 90 K, this example has electrical resistance. Slide left to cool it down.';
  };
  temperature.addEventListener('input',updateTemperature); updateTemperature();
}
