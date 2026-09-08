import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { validatePath } from '../../../../mobile/RepMotion/analytics/delayed-context-path/validation/validatePath';
import { buildConditionalAlternatives } from '../../../../mobile/RepMotion/analytics/delayed-context-path/reconstruction/buildConditionalAlternatives';
import { createExecutionContext } from '../../../../mobile/RepMotion/analytics/delayed-context-path/execution/createExecutionContext';

// Intentional current-state characterizations are separate from lasting protocol/quality tests.
const root = fileURLToPath(new URL('../../../../', import.meta.url));
const expectedParameters = {rawDetectionStrategy:'local_extrema',minimumDistanceSamples:70,minimumProminenceRatio:0.08,peakWindowSize:8,smoothingWindowSize:2,prominenceWindowSize:8,selectionStrategy:'global_alternating_path'};
const baselines = {
 '007':{natural:46,options:11,pool:55,a:648,c:351,union:999,unique:200001,guardA:null,guardC:null,guardD:'MAX_UNIQUE_PATHS',winner:[169,199,243,291,346,383,438,467,511,555,611]},
 '009':{natural:35,options:19,pool:54,a:781,c:219,union:1000,unique:92738,guardA:'MAX_SEGMENTS',guardC:null,guardD:'MAX_COMPOSITIONS',winner:[199,219,291,318,365,390,436,463,532,554,599]},
 '010':{natural:35,options:46,pool:81,a:684,c:1677,union:2361,unique:60679,guardA:null,guardC:'MAX_SEGMENTS',guardD:'MAX_COMPOSITIONS',winner:[217,269,310,365,385,432,462,501,521,547,589]},
};
const clean=(v:number)=>Number(v.toFixed(10));
const identity=(c:any)=>`${c.type}:${c.index}`;
const chain=(indices:number[])=>indices.map((index,i)=>({type:(i%2?'TOP':'BOTTOM') as 'TOP'|'BOTTOM',index,value:0,candidateId:`test-${i}`}));

test('STRICT STRUCTURE - alternation, chronology, adjacent duration and rep duration',()=>{
 assert(validatePath(chain([0,8,45])));
 for(const invalid of [[0,7,45],[0,40,45],[0,8,44],[0,0,45],[0,-1,45]]) assert(!validatePath(chain(invalid)),JSON.stringify(invalid));
 const wrong=chain([0,8,45]);wrong[1].type='BOTTOM';assert(!validatePath(wrong));
});

test('EXPECTED TO IMPROVE UNIT - one-neighbor admission rejects a valid multi-neighbor context',()=>{
 const active=chain([199,219,272,340,348,431,461,507,532,554,599]);
 const tops=[527,528].map(index=>({...active[9],index,candidateId:`oracle-${index}`}));
 const bottoms=[501,502,578].map(index=>({...active[8],index,candidateId:`oracle-${index}`}));
 const pool=[...active,...tops,...bottoms];
 for(const top of tops){
  const buckets=new Map();
  buildConditionalAlternatives(active,pool,9,top,11,buckets,createExecutionContext());
  assert.equal(buckets.size,0);
  for(const bottom of bottoms){
   const right=[...active];right[9]=top;right[10]=bottom;assert(!validatePath(right));
  }
  for(const bottom of bottoms.slice(0,2)){
   const left=[...active];left[9]=top;left[8]=bottom;assert(!validatePath(left));
  }
  assert(validatePath(chain([190,218,270,278,348,373,423,449,501,top.index,578])));
 }
});

for(const id of ['007','009','010'] as const) test(`DELAYED REGRESSION HARNESS ${id}`,{timeout:120000},async t=>{
 assert(!Object.keys(process.env).some(k=>k.startsWith('DELAYED_CONTEXT_')),'STRICT no experimental environment override allowed');
 // Fresh process: real live trace, not a stored report. No report is overwritten.
 const run=spawnSync(process.execPath,['tools/ground-truth/traceOracleLoss.cjs',id,'--regression'],{cwd:root,encoding:'utf8',maxBuffer:30*1024*1024,timeout:110000});
 assert.equal(run.status,0,run.stderr);const r=JSON.parse(run.stdout);const b=baselines[id];
 const events=r.events as any[];
 await t.test('STRICT PROTOCOL - actual Calibration call, natural DP before injection, bootstrap and pool-only handoff',()=>{
  const calls=events.filter(e=>e.kind==='calibrationCall');assert.equal(calls.length,1,'Calibration must run once only');
  assert.deepEqual(calls[0].parameters,expectedParameters);assert.equal(calls[0].expectedReps,5);
  assert.deepEqual(events.filter(e=>['calibrationCall','dpCall','naturalDpReady','gtRead','injectionCompleted','delayedInput','systemStart','compositionStart'].includes(e.kind)).map(e=>e.kind==='systemStart'?e.system:e.kind),['calibrationCall','dpCall','naturalDpReady','gtRead','injectionCompleted','delayedInput','A','C','compositionStart']);
  const dp=events.find(e=>e.kind==='dpCall');assert.equal(dp.expectedReps,5);
  assert.deepEqual(new Set([...dp.bottoms.map((c:any)=>'BOTTOM:'+c.index),...dp.tops.map((c:any)=>'TOP:'+c.index)]),new Set(r.natural.map(identity)),'DP sees exactly natural admissible pool');
  const handoffs=events.filter(e=>e.kind==='delayedInput');assert.equal(handoffs.length,1);
  assert.deepEqual(handoffs[0].input.selectedDpV1Chain,r.bootstrap,'natural bootstrap at real Delayed entry');
  assert.deepEqual(handoffs[0].input.values,r.values);assert.deepEqual(handoffs[0].input.candidatePool,r.pool);
  const targets=r.oracle.groups.flatMap((g:any)=>g.candidates);
  const expectedPool=[...r.natural,...targets.filter((c:any)=>!r.natural.some((n:any)=>identity(n)===identity(c)))].sort((a:any,b:any)=>a.index-b.index||a.type.localeCompare(b.type)||a.candidateId.localeCompare(b.candidateId)).map((c:any)=>({...c,candidateId:'EXPERIMENTAL_'+c.type+'_'+c.index}));
  assert.deepEqual(r.pool,expectedPool,'exact pool ordering, values, identities and neutral IDs');
  const wanted=new Set([...r.natural,...targets].map(identity));
  assert.equal(new Set(r.pool.map(identity)).size,r.pool.length,'no duplicate identities');
  assert.deepEqual(new Set(r.pool.map(identity)),wanted,'pool is exactly natural + oracle, no extra candidates');
  for(const c of r.bootstrap)assert(r.natural.some((n:any)=>identity(n)===identity(c)),'bootstrap member must be natural');
  for(const c of targets){assert(c.index>=0);assert.equal(c.value,r.values[c.index]);assert(r.pool.some((n:any)=>identity(n)===identity(c)));}
  assert(validatePath(r.finalPath));assert.equal(r.finalPath.length,11);
  assert.equal(r.natural.length,b.natural);assert.equal(targets.length,b.options);assert.equal(r.pool.length,b.pool);
  if(id==='007')assert.deepEqual(r.bootstrap.map((c:any)=>c.index),[169,195,228,291,299,333,391,467,500,509,564]);
 });
 await t.test('CHARACTERIZATION - current counters, guards and winner (deliberately revisable with C V2)',()=>{
  assert.deepEqual([r.diagnostics.a,r.diagnostics.c,r.diagnostics.union,r.diagnostics.unique],[b.a,b.c,b.union,b.unique]);
  assert.deepEqual([r.diagnostics.A.limit,r.diagnostics.C.limit,r.diagnostics.D.guard],[b.guardA,b.guardC,b.guardD]);
  assert.deepEqual(r.finalPath.map((c:any)=>c.index+r.start),b.winner);
  if(id==='007')assert.deepEqual(['examined','structurallyRejected','incompatibleOverlaps','duplicates'].map(k=>r.diagnostics.D[k]),[865082,2093,585322,68082]);
 });
 if(id==='007')await t.test('HISTORICAL QUALITY REGRESSION - best generated exact recovery >= 10/11, distinct from winner',()=>{
  const gt=[169,199,262,291,353,383,445,474,529,558,611];
  assert.deepEqual(r.oracle.groups.map((g:any)=>g.candidates[0].index),gt);
  assert(r.bestRecovery>=10,`best generated recovery ${r.bestRecovery}/11 < 10/11`);
  const winnerRecovery=r.finalPath.filter((c:any,i:number)=>c.index===gt[i]).length;
  assert.equal(winnerRecovery,5);t.diagnostic(`best generated ${r.bestRecovery}/11; winner ${winnerRecovery}/11`);
 });
 else {
  await t.test('STRICT ORACLE V2 - all window integers, resolution ties, retained samples and valid witness',()=>{
   assert.equal(r.start,id==='009'?174:177);
   for(const [i,g]of r.oracle.groups.entries()){
    const e=r.gt.events[i], lo=e.arrivalSampleFloat,hi=e.departureSampleFloat;
    const inside=Array.from({length:r.values.length},(_,n)=>n+r.start).filter(n=>hi!==null&&lo<=n&&n<=hi);
    const dist=(n:number)=>clean(hi===null?Math.abs(n-lo):Math.max(lo-n,0,n-hi));
    const all=Array.from({length:r.values.length},(_,n)=>n+r.start),min=Math.min(...all.map(dist));
    assert.deepEqual(g.indices,inside.length?inside:all.filter(n=>dist(n)===min));
    assert.equal(g.approximatedBecauseSamplingResolution,hi!==null&&Math.ceil(lo)>Math.floor(hi));
   }
   assert(r.oracle.existence.exists);
   const witness=id==='009'?[190,218,270,278,348,373,423,449,501,527,578]:[177,221,269,301,348,377,418,445,487,517,563];
   assert(validatePath(chain(witness)));for(const [i,n]of witness.entries())assert(r.oracle.groups[i].indices.includes(n));
  });
  await t.test('EXPECTED TO IMPROVE - current range quality and missing oracle reconstructions',()=>{
   const errors=r.finalPath.slice(0,10).map((c:any,i:number)=>{const e=r.gt.events[i],n=c.index+r.start;return clean(Math.max(e.arrivalSampleFloat-n,0,n-e.departureSampleFloat));}).sort((a:number,b:number)=>a-b);
   const quality=[errors.filter((e:number)=>e===0).length,clean(errors.reduce((a:number,b:number)=>a+b,0)/10),clean((errors[4]+errors[5])/2),errors[9],clean(r.finalPath[10].index+r.start-r.gt.events[10].arrivalSampleFloat)];
   assert.deepEqual(quality,id==='009'?[0,18.02,16.2,40,21.4]:[0,41.04,38.8,63.2,25.8]);
   assert.equal(r.completeA,0);assert.equal(r.completeC,0);assert.equal(r.trace.completeCompatibleD,0);
   for(const position of id==='009'?[9]:[9,10])assert.equal(r.trace.coverage[position].segments,false);
   t.diagnostic(`BASELINE insideZone 0/10; mean ${quality[1]}; oracle loss before D - expected to improve`);
  });
  await t.test('EXPECTED TO IMPROVE - live conditional admission and guard characterization',()=>{
   if(id==='009')for(const system of ['A','C'])for(const original of [527,528]){
    const local=original-r.start;const es=events.filter(e=>e.system===system);
    const visits=es.filter(e=>e.kind==='promotionVisit'&&e.position===9&&e.candidate.index===local);
    assert.equal(visits.length,1);assert.equal(visits[0].cycle,5);assert.equal(visits[0].prefixValid,false);
    const active=visits[0].activePath;assert.deepEqual(active.slice(7,11).map((c:any)=>c.index+r.start),[507,532,554,599]);
    assert(original-532<0);
    const repairs=es.filter(e=>e.kind==='repairTrial'&&e.position===9&&e.candidate.index===local);assert.equal(repairs.length,50);assert(repairs.every(e=>!e.valid));
    for(const bottom of [501,502])assert(repairs.some(e=>e.neighborPosition===8&&e.neighbor.index+r.start===bottom&&!e.valid));
    assert(es.filter(e=>e.kind==='ranking'&&e.position===9).every(e=>e.scored.every((c:any)=>c.candidate.index!==local)));
    const snap=es.find(e=>e.kind==='reconstructionStart'&&e.cycle===5);
    assert(!snap.conditional.some(([p,rows]:any)=>p===9&&rows.some(([,v]:any)=>v.candidate.index===local)));
    assert(!es.some(e=>['regularTrial','coupledTrial','progressiveSeed','progressiveExtension'].includes(e.kind)));
   }
   else {const c=events.filter(e=>e.system==='C');assert(!c.some(e=>e.kind==='promotionVisit'&&e.position>=9));const guard=c.find(e=>e.kind==='segmentGuard');assert.equal(guard.cycle,4);assert.equal(guard.context.segmentsReconstructed,20001);}
  });
 }
});

