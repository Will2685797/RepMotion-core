import test from 'node:test';
import assert from 'node:assert/strict';
import { candidates, convert, estimateBias, integrate, angle, hashes, run } from './benchmark.mjs';
const close=(a,b,tol=1e-10)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
const sample=(timestampMs,gx=0,gy=0,gz=0,sampleIndex=10)=>({timestampMs,sampleIndex,ax:0,ay:0,az:16384,gx,gy,gz});
test('Four sensitivities: magnitude, sign and zero',()=>{
  for(const k of candidates) {
    const v=convert(sample(0,k,-k,0),[0,0,0],k);
    close(v[0],Math.PI/180); close(v[1],-Math.PI/180); close(v[2],0);
  }
});
test('Baseline bias mean and subtraction',()=>{
  const bias=estimateBias([sample(0,10,-20,30),sample(50,14,-16,34)]);
  assert.deepEqual(bias,[12,-18,32]);
  assert.deepEqual(convert(sample(0,...bias),bias,131),[0,0,0]);
});
test('Body-frame sign and nonuniform actual dt (90 degrees around x)',()=>{
  const s=[sample(100,131*90),sample(350,131*90),sample(1100,131*90)];
  const out=integrate(s,0,[0,0,1],[0,0,0],131);
  close(out[1].gravityDirection[1],Math.sin(Math.PI/8));
  close(out[2].gravityDirection[1],1); close(out[2].gravityDirection[2],0);
});
test('Trapezoidal changing rate uses both endpoints',()=>{
  const out=integrate([sample(0),sample(1000,180*131)],0,[0,0,1],[0,0,0],131);
  close(out[1].gravityDirection[1],1);close(out[1].gravityDirection[2],0);
});
test('Angle: parallel, antiparallel, orthogonal, normalized',()=>{
  close(angle([0,0,1],[0,0,5]),0);close(angle([0,0,1],[0,0,-1]),180);close(angle([0,1,0],[1,0,0]),90);
  assert.throws(()=>angle([0,0,0],[1,0,0]));
});
test('Integration preserves identity/time, inputs, and ignores dynamic accel',()=>{
  const s=[sample(77,0,100,0,1001),sample(129,0,100,0,1002),sample(230,0,100,0,1004)];
  const original=structuredClone(s), out=integrate(s,0,[0,0,1],[0,0,0],131);
  assert.deepEqual(out.map(({timestampMs,sampleIndex})=>({timestampMs,sampleIndex})),s.map(({timestampMs,sampleIndex})=>({timestampMs,sampleIndex})));
  assert.deepEqual(s,original);
  const changed=s.map(v=>({...v,ax:999,ay:-222,az:3}));
  assert.deepEqual(integrate(changed,0,[0,0,1],[0,0,0],131),out);
  assert.throws(()=>integrate([sample(1),sample(1)],0,[0,0,1],[0,0,0],131));
});
test('Rotation about gravity leaves gravity unchanged',()=>{
  const out=integrate([sample(0,0,0,131*180),sample(1000,0,0,131*180)],0,[0,0,1],[0,0,0],131);
  assert.deepEqual(out[1].gravityDirection,[0,0,1]);
});
test('Full benchmark does not modify datasets/GT; identical windows for all scales',()=>{
  const before=hashes(),r=run();assert.deepEqual(hashes(),before);assert.equal(r.inputsUnchanged,true);assert.equal(r.datasets.length,10);
  for(const d of r.datasets) for(const p of Object.values(d.profiles)) {
    const expected=p.accepted.map(w=>[w.start,w.end]);
    for(const v of p.results) assert.deepEqual(v.comparisons.map(w=>[w.start,w.end]),expected);
  }
});
