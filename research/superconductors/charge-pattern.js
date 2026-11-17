'use strict';
const chargeStrength = document.getElementById('charge-strength');
const chargePeriod = document.getElementById('charge-period');
function drawChargePattern() {
  const strength = Number(chargeStrength.value)/100, period = Number(chargePeriod.value);
  let dots = '';
  for(let row=0;row<7;row++) for(let col=0;col<15;col++) {
    const density = .5 + .5*strength*Math.cos(2*Math.PI*col/period);
    dots += `<circle cx="${24+col*28}" cy="${26+row*30}" r="${4+5*density}" fill="#853e78" opacity="${.18+.75*density}"/>`;
  }
  const caption = strength===0 ? 'Uniform density: the charge pattern has disappeared.' : 'Repeating stripes of higher and lower electron density.';
  document.getElementById('charge-art').innerHTML = `<title id="charge-art-title">Charge density: from uniform to striped</title><desc id="charge-art-desc">Pattern strength ${chargeStrength.value} percent, repeating every ${period} lattice spacings. ${caption}</desc>${dots}<text x="220" y="248" text-anchor="middle" fill="#59696b" font-size="12">Lighter = less charge density · darker = more</text>`;
  document.getElementById('charge-caption').textContent = caption;
  document.getElementById('charge-strength-value').textContent = chargeStrength.value+'%';
  document.getElementById('charge-period-value').textContent = period+' lattice spacings';
  chargeStrength.setAttribute('aria-valuetext',chargeStrength.value+' percent');
  chargePeriod.setAttribute('aria-valuetext',period+' lattice spacings');
}
chargeStrength.addEventListener('input',drawChargePattern);
chargePeriod.addEventListener('input',drawChargePattern);
drawChargePattern();
DemoAutoplay({root:document.getElementById('charge-demo'),input:chargeStrength,min:20,max:80,period:12/1.4,render:drawChargePattern});
