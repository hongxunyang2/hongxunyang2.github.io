/* Simple-cubic, white-beam back-reflection Laue geometry. No intensity model. */
(function (root, factory) {
  const model = factory();
  if (typeof module === 'object' && module.exports) module.exports = model;
  else root.LaueModel = model;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const radians = angle => angle * Math.PI / 180;
  const identity = [[1,0,0],[0,1,0],[0,0,1]];
  const multiply = (a,b) => a.map(row => b[0].map((_,j) => row.reduce((sum,v,k) => sum+v*b[k][j],0)));
  const transform = (m,v) => m.map(row => row.reduce((sum,x,i) => sum+x*v[i],0));
  const transpose = m => m[0].map((_,i) => m.map(row => row[i]));
  function axisRotation(axis, degrees) {
    const a=radians(degrees), c=Math.cos(a), s=Math.sin(a);
    if(axis==='x') return [[1,0,0],[0,c,-s],[0,s,c]];
    if(axis==='y') return [[c,0,s],[0,1,0],[-s,0,c]];
    return [[c,-s,0],[s,c,0],[0,0,1]];
  }
  const bases = {
    face:identity,
    edge:axisRotation('z',-45),
    corner:multiply(axisRotation('y',Math.atan(1/Math.sqrt(2))*180/Math.PI),axisRotation('z',-45))
  };
  function rotation(yaw=0,pitch=0,twist=0,preset='face') {
    // The incoming beam points along lab +x. Twist is around that fixed beam.
    return multiply(axisRotation('x',twist),multiply(axisRotation('z',yaw),multiply(axisRotation('y',pitch),bases[preset] || bases.face)));
  }
  const gcd = (a,b) => b ? gcd(b,a%b) : a;
  const indices=[];
  for(let h=-5;h<=5;h++) for(let k=-5;k<=5;k++) for(let l=-5;l<=5;l++) {
    if(h || k || l) indices.push([h,k,l]);
  }
  function reflections(orientation) {
    const spots=new Map();
    for(const hkl of indices) {
      const g=transform(orientation,hkl.map(v=>v/3.6)); // Reciprocal Å, without 2π.
      const g2=g.reduce((sum,v)=>sum+v*v,0);
      // |s_in / λ + g|² = 1 / λ², with s_in = (1,0,0).
      const wavelength=-2*g[0]/g2;
      if(wavelength<.35 || wavelength>2.5) continue;
      const outgoing=[1+wavelength*g[0],wavelength*g[1],wavelength*g[2]];
      if(outgoing[0]>=-.08) continue;
      const x=outgoing[1]/-outgoing[0], y=outgoing[2]/-outgoing[0];
      if(Math.abs(x)>1.45 || Math.abs(y)>1.45 || Math.hypot(x,y)<.105) continue;
      const divisor=gcd(gcd(Math.abs(hkl[0]),Math.abs(hkl[1])),Math.abs(hkl[2]));
      const family=hkl.map(v=>v/divisor), key=family.join(',');
      if(!spots.has(key)) spots.set(key,{x,y,hkl,family,wavelength,outgoing,g,
        // Brightness is decorative; this is deliberately not a structure-factor calculation.
        brightness:.45+.5/(1+.05*hkl.reduce((sum,v)=>sum+v*v,0))});
    }
    return [...spots.values()];
  }
  // The 24 proper rotations of a cube make equivalent cubic orientations count as aligned.
  const symmetries=[];
  const determinant=m=>m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1])-m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0])+m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]);
  for(const permutation of [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]])
    for(const a of [-1,1]) for(const b of [-1,1]) for(const c of [-1,1]) {
      const m=[[0,0,0],[0,0,0],[0,0,0]];
      [a,b,c].forEach((v,i)=>{m[i][permutation[i]]=v;});
      if(determinant(m)===1) symmetries.push(m);
    }
  function misorientation(current,target) {
    let smallest=180;
    for(const symmetry of symmetries) {
      const difference=multiply(multiply(current,symmetry),transpose(target));
      const cosine=Math.max(-1,Math.min(1,(difference[0][0]+difference[1][1]+difference[2][2]-1)/2));
      smallest=Math.min(smallest,Math.acos(cosine)*180/Math.PI);
    }
    return smallest;
  }
  return Object.freeze({rotation,reflections,transform,misorientation});
});
