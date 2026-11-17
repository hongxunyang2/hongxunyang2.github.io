/* Superconductor research puzzle: synthetic components, not measured data. */
(function () {
  'use strict';
    const $=id=>document.getElementById(id);
    const $$=selector=>[...document.querySelectorAll(selector)];
    const gaussian=(x,center,width,height=1)=>height*Math.exp(-.5*((x-center)/width)**2);
    const clamp=(x,min,max)=>Math.max(min,Math.min(max,x));
    const plot={left:48,right:500,top:25,bottom:222};
    function axis({xmin=-10,xmax=180,ymax=1.5,xticks=[0,50,100,150],xlabel='Energy loss (meV)',ylabel='Intensity (arb.)'}={}){
      const x=v=>plot.left+(v-xmin)/(xmax-xmin)*(plot.right-plot.left);
      const y=v=>plot.bottom-v/ymax*(plot.bottom-plot.top);
      let svg='<path d="M48 25V222H500" fill="none" stroke="#a1afb0" stroke-width="1.3"/>';
      for(const f of [.25,.5,.75,1])svg+=`<path d="M48 ${y(ymax*f)}H500" stroke="#e7e9e4"/>`;
      for(const v of xticks)svg+=`<path d="M${x(v)} 222v5" stroke="#a1afb0"/><text x="${x(v)}" y="243" text-anchor="middle" fill="#607074" font-size="13">${v}</text>`;
      svg+=`<text x="274" y="270" text-anchor="middle" fill="#607074" font-size="14">${xlabel}</text><text x="16" y="125" text-anchor="middle" transform="rotate(-90 16 125)" fill="#607074" font-size="12">${ylabel}</text>`;
      return {svg,x,y};
    }
    function linePath(points,x,y){return points.map(([px,py],i)=>(i?'L':'M')+x(px).toFixed(2)+','+y(py).toFixed(2)).join(' ')}
    // Fixed-width components form a reproducible synthetic fitting puzzle.
    const fit={round:0,targets:[{elastic:90,charge:65,phonon:70},{elastic:110,charge:45,phonon:95},{elastic:70,charge:90,phonon:55}]};
    const fitColors={elastic:'#a6a8a5',charge:'#ba8834',phonon:'#bd719c'};
    const fitSamples=Array.from({length:181},(_,i)=>-30+i*140/180);
    const fitComponents=e=>({elastic:gaussian(e,0,10,1.8),charge:gaussian(e,22,13,.62),phonon:gaussian(e,52,9,.9)});
    const fitIntensity=(e,gains)=>Object.entries(fitComponents(e)).reduce((sum,[key,v])=>sum+v*gains[key]/100,.04);
    function drawFit(){
      const target=fit.targets[fit.round%fit.targets.length],gains=Object.fromEntries($$('[data-fit]').map(i=>[i.dataset.fit,Number(i.value)])),a=axis({xmin:-30,xmax:110,ymax:2.45,xticks:[0,25,50,75,100]});let svg=a.svg;
      for(const [key,color]of Object.entries(fitColors)){const pts=fitSamples.map(e=>[e,fitComponents(e)[key]*gains[key]/100]);svg+=`<path d="${linePath(pts,a.x,a.y)} L500 222H48Z" fill="${color}" fill-opacity=".23"/><path d="${linePath(pts,a.x,a.y)}" stroke="${color}" fill="none" stroke-width="1.6"/>`;}
      svg+=`<path d="${linePath(fitSamples.map(e=>[e,fitIntensity(e,gains)]),a.x,a.y)}" fill="none" stroke="#355d81" stroke-width="3"/>`;
      let error=0,norm=0;for(let i=0;i<48;i++){const e=-27+i*134/47,targetY=fitIntensity(e,target)*(1+.012*Math.sin(i*2.4)),actual=fitIntensity(e,gains);error+=(actual-targetY)**2;norm+=targetY**2;svg+=`<circle cx="${a.x(e)}" cy="${a.y(targetY)}" r="2.7" fill="#7c8a91" stroke="#fffdf9" stroke-width=".7"/>`;}
      const relative=Math.sqrt(error/norm),won=relative<.03;
      $('fit-spectrum').innerHTML='<title>Match the total curve to the synthetic data dots</title>'+svg;
      $$('[data-fit]').forEach(i=>{$(i.id+'-value').textContent=i.value+'%';i.setAttribute('aria-valuetext',i.value+' percent of component scale')});
      $('fit-error').textContent=(100*relative).toFixed(1)+'%';$('fit-progress').style.width=(100*clamp(1-relative/.35,0,1))+'%';$('fit-result').textContent=won?'Close match ✓':'Keep exploring';$('fit-result').classList.toggle('success',won);
      $('fit-insight').textContent=won?'You found a close match. The weak charge component fills in the intensity between the elastic tail and the phonon. This is the sort of overlap researchers work to disentangle.':gains.charge<10?'Start with the gold slider. Can a weak charge signal explain the missing intensity between the large elastic peak and the phonon?':'Watch the dots near 20 meV. Adjust the elastic tail and the charge signal together, then check the phonon peak near 50 meV.';
    }
    $$('[data-fit]').forEach(i=>i.addEventListener('input',drawFit));
    $('fit-new').addEventListener('click',()=>{fit.round++;$('fit-elastic').value=90;$('fit-charge').value=0;$('fit-phonon').value=85;drawFit()});
    $('fit-reveal').addEventListener('click',()=>{const target=fit.targets[fit.round%fit.targets.length];$$('[data-fit]').forEach(i=>i.value=target[i.dataset.fit]);drawFit();$('fit-insight').textContent=`This mystery used elastic ${target.elastic}%, charge ${target.charge}% and phonon ${target.phonon}%. Small offsets in the dots imitate measurement noise. Try a new mystery without revealing the mix.`});

    drawFit();
    DemoAutoplay({root:$('spectrum-demo'),input:$('fit-elastic'),min:50,max:130,period:12/1.3,render:drawFit});
})();
