'use strict';

// Elastic geometry: equal photon wavevector magnitudes, q = k_in - k_out.
const angleControl = document.getElementById('scattering-angle');
function drawScattering() {
  const angle = Number(angleControl.value), a = angle * Math.PI / 180;
  const x = 210, y = 215, length = 136;
  const end = [x + length * Math.cos(a), y - length * Math.sin(a)];
  const origin = [440, 228], incoming = [origin[0] + 95, origin[1]];
  const outgoing = [origin[0] + 95 * Math.cos(a), origin[1] - 95 * Math.sin(a)];
  const arrow = (from, to, color, marker, dashed = false) => `<path d="M${from} L${to}" fill="none" stroke="${color}" stroke-width="3" ${dashed ? 'stroke-dasharray="5 5"' : ''} marker-end="url(#${marker})"/>`;
  document.getElementById('scattering-art').innerHTML = `
    <title id="scattering-art-title">X-ray scattering and momentum transfer</title>
    <desc id="scattering-art-desc">Scattering angle ${angle} degrees. Momentum transfer magnitude divided by the incoming wavevector magnitude is ${(2 * Math.sin(a / 2)).toFixed(2)}.</desc>
    <defs>${[['in','#355888'],['out','#739f96'],['q','#853e58']].map(([id,color]) => `<marker id="arrow-${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="${color}"/></marker>`).join('')}</defs>
    <text x="30" y="32" fill="#59696b" font-size="14">At the crystal</text>
    <text x="405" y="32" fill="#59696b" font-size="14">Vector view</text>
    <path d="M210 215H365" stroke="#c8cece" stroke-dasharray="4 5"/>
    ${arrow([35,y],[196,y],'#355888','arrow-in')}
    ${arrow([x,y],end,'#739f96','arrow-out')}
    <path d="M${x+42} ${y} A42 42 0 0 0 ${x+42*Math.cos(a)} ${y-42*Math.sin(a)}" fill="none" stroke="#9daab0" stroke-width="1.5"/>
    <text x="${x+58*Math.cos(a/2)}" y="${y-58*Math.sin(a/2)}" fill="#355888" font-size="14">${angle}°</text>
    <path d="M198 207L213 198L226 211L211 229Z" fill="#cbb5de" stroke="#725c8c" stroke-width="2"/>
    <text x="48" y="244" fill="#355888" font-size="14">Incoming X-ray</text>
    <text x="172" y="273" fill="#59696b" font-size="13">Crystal</text>
    <text x="32" y="80" fill="#739f96" font-size="14">Outgoing X-ray ↗</text>
    ${arrow(origin,incoming,'#355888','arrow-in')}
    ${arrow(origin,outgoing,'#739f96','arrow-out')}
    ${arrow(outgoing,incoming,'#853e58','arrow-q')}
    <circle cx="${origin[0]}" cy="${origin[1]}" r="3" fill="#59696b"/>
    <text x="544" y="249" fill="#355888" font-size="14">kᵢₙ</text>
    <text x="${outgoing[0]-15}" y="${outgoing[1]-15}" fill="#51786f" font-size="14">kₒᵤₜ</text>
    <text x="${(incoming[0]+outgoing[0])/2+10}" y="${(incoming[1]+outgoing[1])/2-7}" fill="#853e58" font-size="16" font-weight="600">q</text>
    <text x="310" y="327" text-anchor="middle" fill="#59696b" font-size="13">Same X-ray wavelength · different momentum transfer</text>`;
  document.getElementById('scattering-angle-value').textContent = angle + '°';
  document.getElementById('scattering-q').textContent = '|q| / |k| = ' + (2 * Math.sin(a / 2)).toFixed(2);
  angleControl.setAttribute('aria-valuetext', angle + ' degrees');
}
angleControl.addEventListener('input', drawScattering);
drawScattering();

// A teaching model, deliberately independent of the measured figure above it.
const mixControls = [...document.querySelectorAll('[data-mix]')];
const componentColors = {elastic:'#d6d6d6',charge:'#f5dc91',bb:'#d63d91',bs:'#b444e5',background:'#a7a7a7'};
function components(energy) {
  const gaussian = (center,width,height) => height * Math.exp(-0.5 * ((energy-center)/width) ** 2);
  return {elastic:gaussian(0,11,2),charge:gaussian(19,16,.48),bb:gaussian(50,9,.78),bs:gaussian(73,10,.25),background:.025+.24/(1+Math.exp(-(energy-35)/17))};
}
function drawSpectrum() {
  const gains = Object.fromEntries(mixControls.map(input => [input.dataset.mix, Number(input.value) / 100]));
  const samples = Array.from({length:241}, (_,i) => -60+i*200/240);
  const px = e => 62+(e+60)/200*630, py = intensity => 306-intensity/4*265;
  const points = values => values.map(([e,v]) => `${px(e).toFixed(2)},${py(v).toFixed(2)}`).join(' L');
  const componentPaths = Object.keys(gains).map(key => {
    const curve = samples.map(e => [e,components(e)[key]*gains[key]]);
    return `<path d="M${px(-60)},306 L${points(curve)} L${px(140)},306Z" fill="${componentColors[key]}" fill-opacity="${key==='background'?.06:.6}" stroke="${componentColors[key]}" stroke-width="1.5" ${key==='background'?'stroke-dasharray="6 5"':''}/>`;
  }).join('');
  const total = samples.map(e => [e,Object.entries(components(e)).reduce((sum,[key,value]) => sum+value*gains[key],0)]);
  // Fixed, deterministic example dots let visitors compare their mix to a target.
  const dots = Array.from({length:41}, (_,i) => {
    const e=-60+i*5, intensity=Object.values(components(e)).reduce((a,b)=>a+b,0)*(1+.025*Math.sin(i*2.4));
    return `<circle cx="${px(e)}" cy="${py(intensity)}" r="3.5" fill="#7795a7"/>`;
  }).join('');
  document.getElementById('spectrum-art').innerHTML = `
    <title id="spectrum-art-title">Build a spectrum from five components</title>
    <desc id="spectrum-art-desc">${mixControls.map(i=>i.dataset.mix+' '+i.value+' percent').join(', ')}. The total curve is their sum. Blue dots stay at the original mix.</desc>
    ${[0,1,2,3,4].map(v=>`<path d="M62 ${py(v)}H692" stroke="#ecece7"/><text x="50" y="${py(v)+4}" text-anchor="end" font-size="12" fill="#59696b">${v}</text>`).join('')}
    <path d="M62 41V306H692" fill="none" stroke="#829092"/>
    ${[-50,0,50,100].map(e=>`<path d="M${px(e)} 306v5" stroke="#829092"/><text x="${px(e)}" y="329" text-anchor="middle" font-size="12" fill="#59696b">${e}</text>`).join('')}
    ${componentPaths}<path d="M${points(total)}" fill="none" stroke="#b5a064" stroke-width="3" stroke-linejoin="round"/>${dots}
    <text x="377" y="358" text-anchor="middle" font-size="14" fill="#59696b">Energy loss (meV)</text>
    <text transform="rotate(-90 17 174)" x="17" y="174" text-anchor="middle" font-size="13" fill="#59696b">Intensity (arbitrary units)</text>`;
  mixControls.forEach(input => {
    document.getElementById(input.id+'-value').textContent = input.value+'%';
    input.setAttribute('aria-valuetext',input.value+' percent of starting strength');
  });
  document.getElementById('spectrum-insight').textContent = gains.charge===0
    ? 'Charge motion is switched off. Compare the gold curve with the blue dots near 20 meV: what is missing?'
    : gains.elastic<.3
      ? 'With less elastic scattering, the yellow charge signal becomes easier to spot. Overlapping peaks can hide useful physics.'
      : 'The yellow charge signal overlaps the elastic tail and the pink phonon. Fitting helps separate them.';
}
mixControls.forEach(input=>input.addEventListener('input',drawSpectrum));
document.getElementById('spectrum-reset').addEventListener('click',()=>{mixControls.forEach(i=>{i.value=100;});drawSpectrum();});
drawSpectrum();
