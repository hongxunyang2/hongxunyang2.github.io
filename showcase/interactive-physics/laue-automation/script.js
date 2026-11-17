'use strict';
document.documentElement.classList.add('js-enabled');

// The pages work as plain HTML; JavaScript adds only these small teaching demos.
const workflowButtons = document.querySelectorAll('[data-workflow]');
const workflow = {
  move: {image:'assets/startup.webp', alt:'Laue control interface beside the Meca500 robot view.', title:'01 / Move the sample', text:'The robot brings the sample holder to a known position. A useful next step is to make a whole sequence repeatable.', caption:'Existing setup: robot positioning and instrument controls.'},
  find: {image:'assets/camera-alignment.webp', alt:'Two camera views used to locate the sample in the Laue control interface.', title:'02 / Find the crystal', text:'Two cameras help locate the crystal and its centre of rotation. The current interface lets the operator position it using both views.', caption:'Existing setup: camera-guided alignment. Automatic recognition is a future direction.'},
  record: {image:'assets/image-acquisition.webp', alt:'Laue image acquisition interface for capturing and saving a diffraction pattern.', title:'03 / Record the pattern', text:'Collect an X-ray image and save it with the sample position. The pattern of spots tells us how the crystal is oriented.', caption:'Existing setup: diffraction image acquisition and saving.'}
};
workflowButtons.forEach(button => button.addEventListener('click', () => {
  const step = workflow[button.dataset.workflow];
  workflowButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  const img = document.getElementById('workflow-image');
  img.src = step.image; img.alt = step.alt;
  document.getElementById('workflow-full-image').href = step.image;
  document.getElementById('workflow-title').textContent = step.title;
  document.getElementById('workflow-text').textContent = step.text;
  document.getElementById('workflow-caption').textContent = step.caption;
}));

const excitationButtons = document.querySelectorAll('[data-excitation]');
const svg = document.getElementById('excitation-art');
const excitations = {
  phonon:{title:'Phonon / Atoms moving together',text:'Atoms are always moving. When their motion forms a wave through a crystal, we call one quantum of that vibration a phonon.',caption:'Schematic: displaced atoms joined by bonds. The displacement is exaggerated.'},
  magnon:{title:'Magnon / A wave of tiny magnets',text:'Electrons have a magnetic property called spin. A wave in how the spins point is a spin wave; one quantum is called a magnon.',caption:'Schematic: a snapshot of tilted spins, shown as arrows. No measured data.'},
  charge:{title:'Charge motion / Electrons acting together',text:'Electron density can form a repeating pattern. We study how those patterns change and fluctuate, and how they relate to superconductivity.',caption:'Schematic: darker regions represent higher electron density. No measured data.'}
};
function excitationDrawing(type) {
  const heading = '<title id="excitation-svg-title">'+excitations[type].title+'</title>';
  if(type==='phonon'){
    let drawing='';
    const xs=[48,116,200,268,352]; const ys=[115,92,115,138,115];
    for(let i=0;i<4;i++) drawing += `<path d="M${xs[i]+18} ${ys[i]} L${xs[i]+27} ${ys[i]-8} L${xs[i]+35} ${ys[i]+8} L${xs[i+1]-27} ${ys[i+1]-8} L${xs[i+1]-18} ${ys[i+1]}" fill="none" stroke="#8e9d9d" stroke-width="2"/>`;
    xs.forEach((x,i)=>drawing+=`<circle cx="${x}" cy="${ys[i]}" r="18" fill="${i%2?'#d8a4b3':'#739f96'}" stroke="#243d45" stroke-width="2"/><path d="M${x-6} ${ys[i]+1}q6 6 12 0" fill="none" stroke="#243d45" stroke-width="1.5"/>`);
    return heading+drawing+'<text x="200" y="202" text-anchor="middle" fill="#59696b" font-size="13">A wave in the positions of atoms</text>';
  }
  if(type==='magnon'){
    let drawing='<path d="M30 130Q110 60 200 130T370 130" stroke="#b6c9db" stroke-width="2" stroke-dasharray="5 5" fill="none"/>';
    [48,124,200,276,352].forEach((x,i)=>drawing+=`<g transform="rotate(${[-25,0,25,0,-25][i]} ${x} 126)"><circle cx="${x}" cy="153" r="8" fill="#d8a4b3"/><path d="M${x} 145V83m-11 13 11-13 11 13" stroke="#355888" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" fill="none"/></g>`);
    return heading+drawing+'<text x="200" y="202" text-anchor="middle" fill="#59696b" font-size="13">A wave in the directions of spins</text>';
  }
  let drawing='';
  for(let row=0;row<4;row++)for(let col=0;col<9;col++)drawing+=`<circle cx="${40+col*40}" cy="${65+row*30}" r="${[6,9,12,9,6,9,12,9,6][col]}" fill="#853e58" opacity="${[.25,.5,.9,.5,.25,.5,.9,.5,.25][col]}"/>`;
  return heading+drawing+'<text x="200" y="202" text-anchor="middle" fill="#59696b" font-size="13">A repeating pattern of electron density</text>';
}
excitationButtons.forEach(button => button.addEventListener('click', () => {
  const type=button.dataset.excitation, item=excitations[type];
  excitationButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  svg.innerHTML=excitationDrawing(type);
  document.getElementById('excitation-title').textContent=item.title;
  document.getElementById('excitation-text').textContent=item.text;
  document.getElementById('excitation-caption').textContent=item.caption;
}));
if(svg) svg.innerHTML=excitationDrawing('phonon');

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
    document.getElementById('temperature-description').textContent=cold?'Below the example transition temperature, the DC resistance is zero. How does a whole material enter this state? That is where the interesting questions begin.':'Above the example transition temperature, the material has electrical resistance. Move the slider below 90 K to see the idealised change.';
  };
  temperature.addEventListener('input',updateTemperature); updateTemperature();
}
