/* X-ray student projects: collective motion, a fitting puzzle and calculated diffraction. */
(function () {
    'use strict';
    const $=id=>document.getElementById(id);
    const $$=selector=>[...document.querySelectorAll(selector)];
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
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
    function pressGroup(selector,button){$$(selector).forEach(b=>b.setAttribute('aria-pressed',String(b===button)))}
    // 01. Collective motions linked to representative energy-loss peaks.
    const motionInfo={
      phonon:{energy:50,color:'#588675',kind:'A collective vibration',legend:'Atomic vibration',text:'The atoms move together in a wave. Creating one quantum of this vibration—a phonon—costs energy, which an X-ray photon can lose.'},
      magnon:{energy:120,color:'#3d668c',kind:'A wave of magnetic moments',legend:'Spin wave',text:'Each arrow represents a tiny magnetic moment. Their directions move together. An X-ray can transfer energy to this collective magnetic motion.'},
      charge:{energy:20,color:'#b38b3b',kind:'A fluctuating density pattern',legend:'Charge fluctuation',text:'Electron density can become uneven and fluctuate collectively. Darker dots represent higher density; X-rays can probe some of these low-energy fluctuations.'}
    };
    const motion={mode:'phonon',paused:reduced.matches,inView:true};
    function drawMotion(t=0){
      const {mode}=motion,info=motionInfo[mode];let art='';
      for(let row=0;row<4;row++)for(let col=0;col<8;col++){
        const px=52+col*53,py=62+row*54,phase=col*.85-t*2.8;
        if(mode==='phonon'){
          const dx=10*Math.sin(phase);
          if(col<7){const next=52+(col+1)*53+10*Math.sin(phase+.85);art+=`<path d="M${px+dx} ${py}H${next}" stroke="#b4c6c0" stroke-width="2"/>`}
          if(row<3)art+=`<path d="M${px+dx} ${py}v54" stroke="#cbd5cb" stroke-width="1.2"/>`;
          art+=`<circle cx="${px+dx}" cy="${py}" r="12" fill="${row%2?'#a7c2b5':'#588675'}" stroke="#fffdf9" stroke-width="2"/><circle cx="${px+dx-3}" cy="${py-4}" r="3" fill="#ffffff70"/>`;
        }else if(mode==='magnon'){
          const angle=(row+col)%2?180+27*Math.sin(phase):27*Math.sin(phase);
          art+=`<circle cx="${px}" cy="${py+12}" r="5" fill="#c6b0cf"/><g transform="rotate(${angle} ${px} ${py})"><path d="M${px} ${py+16}V${py-17}m-7 8 7-8 7 8" fill="none" stroke="${(row+col)%2?'#a45e79':'#3d668c'}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></g>`;
        }else{
          const density=.5+.45*Math.cos(col*2*Math.PI/3)*Math.cos(t*2);
          art+=`<circle cx="${px}" cy="${py}" r="${8+7*density}" fill="#b38b3b" opacity="${.2+.75*density}"/><circle cx="${px}" cy="${py}" r="3" fill="#785a22" opacity=".35"/>`;
        }
      }
      art+=`<text x="240" y="273" text-anchor="middle" font-size="14" fill="#607074">${mode==='phonon'?'A wave in atomic positions':mode==='magnon'?'A wave in spin directions':'A wave in electron density'}</text>`;
      $('motion-art').innerHTML=art;
    }
    function drawMotionSpectrum(){
      const info=motionInfo[motion.mode],a=axis();
      const samples=Array.from({length:241},(_,i)=>-10+i*190/240);
      const elastic=samples.map(e=>[e,gaussian(e,0,5,.7)]);
      const mode=samples.map(e=>[e,gaussian(e,info.energy,motion.mode==='charge'?11:8,1.02)]);
      $('motion-spectrum').innerHTML='<title>Illustrative elastic and '+info.legend+' peaks</title>'+a.svg+`<path d="${linePath(elastic,a.x,a.y)}" fill="none" stroke="#b4bfc3" stroke-width="2"/><path d="${linePath(mode,a.x,a.y)} L${a.x(180)} 222H${a.x(-10)}Z" fill="${info.color}" fill-opacity=".16"/><path d="${linePath(mode,a.x,a.y)}" fill="none" stroke="${info.color}" stroke-width="3"/><path d="M${a.x(info.energy)} ${a.y(1.1)}V222" stroke="${info.color}" stroke-dasharray="4 5" opacity=".5"/><text x="${a.x(info.energy)}" y="${a.y(1.15)}" text-anchor="middle" font-size="14" fill="${info.color}">${info.energy} meV</text>`;
      $('motion-kind').textContent=info.kind;$('motion-legend').textContent=info.legend;$('motion-legend').style.setProperty('--color',info.color);
      $('motion-energy').textContent='Example energy loss · '+info.energy+' meV';$('motion-insight').textContent=info.text;
    }
    $$('[data-motion]').forEach(button=>button.addEventListener('click',()=>{motion.mode=button.dataset.motion;pressGroup('[data-motion]',button);drawMotion(clock);drawMotionSpectrum();wake()}));

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

    // Compute the complex structure factor, rather than drawing preset spots.
    let densityPending=false;
    const densityCanvas=$('density-detector'),densityCtx=densityCanvas.getContext('2d');
    let densityReady=false;
    function noise(n){const v=Math.sin(n*127.1+31.7)*43758.5453;return (v-Math.floor(v))*2-1}
    function drawDensity(){
      densityPending=false;
      if(!densityCtx)return;
      densityReady=true;
      const disorder=Number($('density-disorder').value)/100,spacing=Number($('density-spacing').value)/100,strength=Number($('density-stripes').value)/100,atoms=[];let svg='';
      for(let row=0;row<9;row++)for(let col=0;col<9;col++){
        const n=row*9+col,x=(col-4)*spacing+disorder*.42*noise(n+1),y=(row-4)*spacing+disorder*.42*noise(n+102),w=1+.75*strength*Math.cos(2*Math.PI*col/3);atoms.push({x,y,w});
        svg+=`<circle cx="${180+x*31}" cy="${180+y*31}" r="${5.7+3*w}" fill="${strength?'#a45e79':'#588675'}" opacity="${.3+.6*w/1.75}" stroke="#fffdf9" stroke-width="1"/>`;
      }
      $('density-art').innerHTML='<title>Finite lattice with adjustable positions and density weights</title>'+svg;
      const n=densityCanvas.width,img=densityCtx.createImageData(n,n),normal=81**2;
      // Factor the phase into x/y terms: reuse trig values across detector pixels.
      const count=atoms.length,cosX=new Float64Array(n*count),sinX=new Float64Array(n*count),cosY=new Float64Array(n*count),sinY=new Float64Array(n*count);
      for(let i=0;i<n;i++) for(let j=0;j<count;j++) {
        const q=-2+i*4/(n-1),atom=atoms[j],offset=i*count+j;
        cosX[offset]=atom.w*Math.cos(2*Math.PI*q*atom.x);sinX[offset]=atom.w*Math.sin(2*Math.PI*q*atom.x);
        cosY[offset]=Math.cos(-2*Math.PI*q*atom.y);sinY[offset]=Math.sin(-2*Math.PI*q*atom.y);
      }
      const stops=[[0,[13,35,49]],[.18,[27,63,81]],[.45,[65,116,134]],[.72,[173,193,158]],[1,[255,235,169]]];
      for(let iy=0;iy<n;iy++)for(let ix=0;ix<n;ix++){
        const qx=-2+ix*4/(n-1),qy=2-iy*4/(n-1);let re=0,im=0;
        for(let j=0;j<count;j++) {
          const x=ix*count+j,y=iy*count+j;
          re+=cosX[x]*cosY[y]-sinX[x]*sinY[y];im+=sinX[x]*cosY[y]+cosX[x]*sinY[y];
        }
        let intensity=(re*re+im*im)/normal;if(qx*qx+qy*qy<.009)intensity=0;
        const t=clamp(Math.log1p(220*intensity)/Math.log(221),0,1);let j=0;while(j<stops.length-2&&t>stops[j+1][0])j++;const a=stops[j],b=stops[j+1],f=clamp((t-a[0])/(b[0]-a[0]),0,1),off=(iy*n+ix)*4;
        for(let k=0;k<3;k++)img.data[off+k]=a[1][k]+(b[1][k]-a[1][k])*f;img.data[off+3]=255;
      }
      densityCtx.putImageData(img,0,0);
      densityCanvas.setAttribute('aria-label',`Calculated diffraction pattern: ${Math.round(disorder*100)} percent positional disorder, ${spacing.toFixed(2)} times lattice spacing, ${Math.round(strength*100)} percent density-stripe strength.`);
      $('density-disorder-value').textContent=Math.round(disorder*100)+'%';$('density-spacing-value').textContent=spacing.toFixed(2)+' ×';$('density-stripes-value').textContent=Math.round(strength*100)+'%';
      const parts=[];if(disorder>.05)parts.push('Random atomic shifts weaken the regular peaks and add diffuse intensity.');if(strength>.05)parts.push('A three-site density pattern adds satellite peaks between the main lattice peaks.');if(Math.abs(spacing-1)>.01)parts.push(spacing>1?'Larger real-space spacing brings the peaks closer together.':'Smaller real-space spacing pushes the peaks farther apart.');
      $('density-insight').textContent=parts.join(' ')||'An evenly spaced lattice produces regularly spaced bright peaks. Increase the real-space spacing: the peaks move closer together.';
      $$('[data-order]').forEach(b=>b.setAttribute('aria-pressed',String(spacing===1&&((b.dataset.order==='perfect'&&!disorder&&!strength)||(b.dataset.order==='disorder'&&disorder===.65&&!strength)||(b.dataset.order==='stripes'&&!disorder&&strength===1)))));
    }
    function scheduleDensity(){if(!densityPending){densityPending=true;requestAnimationFrame(drawDensity)}}
    ['density-disorder','density-spacing','density-stripes'].forEach(id=>$(id).addEventListener('input',scheduleDensity));
    $$('[data-order]').forEach(b=>b.addEventListener('click',()=>{$('density-disorder').value=b.dataset.order==='disorder'?65:0;$('density-stripes').value=b.dataset.order==='stripes'?100:0;$('density-spacing').value=100;drawDensity()}));

    // Animate only the visible opening, at up to 30 frames per second.
    let clock=0,raf=0,previous=0,lastPaint=0;
    function wake(){if(!raf&&!document.hidden)raf=requestAnimationFrame(tick)}
    function tick(now){
      raf=0;
      if(document.hidden){previous=0;return;}
      const dt=previous?Math.min((now-previous)/1000,.06):0;previous=now;
      if(!motion.paused&&motion.inView){clock+=dt;if(now-lastPaint>32){drawMotion(clock);lastPaint=now;}wake();}
      else previous=0;
    }
    if('IntersectionObserver' in window){
      new IntersectionObserver(entries=>{motion.inView=entries[0].isIntersecting;if(motion.inView)wake()},{rootMargin:'80px'}).observe($('scattering-playground'));
      const densityObserver=new IntersectionObserver(entries=>{if(entries[0].isIntersecting){if(!densityReady)scheduleDensity();densityObserver.disconnect();}},{rootMargin:'240px'});
      densityObserver.observe($('order'));
    }else scheduleDensity();
    document.addEventListener('visibilitychange',()=>{previous=0;if(!document.hidden)wake()});
    reduced.addEventListener('change',()=>{motion.paused=reduced.matches;wake()});
    drawMotion();drawMotionSpectrum();drawFit();wake();
    DemoAutoplay({root:$('spectrum-demo'),input:$('fit-elastic'),min:50,max:130,period:12/1.3,render:drawFit});
    DemoAutoplay({root:$('order'),input:$('density-disorder'),min:0,max:75,period:12/1.5,render:scheduleDensity,fps:12});
})();
