import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildMultiNeighborAlternatives, createMultiNeighborSearch } from '../../../../mobile/RepMotion/analytics/delayed-context-path/reconstruction/system-c/buildMultiNeighborAlternatives';
import { buildConditionalAlternatives } from '../../../../mobile/RepMotion/analytics/delayed-context-path/reconstruction/system-c/buildConditionalAlternatives';
import { createExecutionContext } from '../../../../mobile/RepMotion/analytics/delayed-context-path/execution/createExecutionContext';
import { multiNeighborConfig } from '../../../../mobile/RepMotion/analytics/delayed-context-path/config';
import { validatePath } from '../../../../mobile/RepMotion/analytics/delayed-context-path/validation/validatePath';

test('MULTI NEIGHBOR - admits coordinated replacements without changing pool or active path',()=>{
 // Synthetic positional fixture, not a recording or GT used by production.
 const active=[10,30,70,90,130,150,190,250,280,310,350].map((index,i)=>({type:(i%2?'TOP':'BOTTOM') as 'TOP'|'BOTTOM',index,value:1,candidateId:`natural-${i}`}));
 const extra=[{...active[7],index:220},{...active[8],index:245},{...active[9],index:270},{...active[10],index:325}];
 const pool=[...active,...extra].map((c,i)=>({...c,candidateId:`candidate-${i}`}));
 const before=JSON.stringify({active,pool});
 const result=buildMultiNeighborAlternatives(active,pool,5,Array.from({length:400},(_,i)=>Math.sin(i/10)),9,pool.find(c=>c.type==='TOP'&&c.index===270)!);
 assert(result.rows.some(r=>r.chain[9].index===270),'target requiring coordinated left repair is reconstructed');
 assert(result.rows.every(r=>validatePath(r.chain)));
 assert.equal(new Set(result.rows.map(r=>r.chain.map(c=>c.index).join('|'))).size,result.rows.length);
 assert(result.rows.every(r=>r.candidates.length<=multiNeighborConfig.maxWindowPositions));
 assert(result.stats.states<=multiNeighborConfig.maxStatesPerCycle);
 assert(result.rows.length<=multiNeighborConfig.maxSeedsPerCycle);
 assert.equal(JSON.stringify({active,pool}),before);
});

test('IMMEDIATE FALLBACK - synchronous zero-repair callback pins the failed target',()=>{
 const active=[10,30,70,90,130,150,190,250,280,310,350].map((index,i)=>({type:(i%2?'TOP':'BOTTOM') as 'TOP'|'BOTTOM',index,value:1,candidateId:`active-${i}`}));
 const target={...active[9],index:270,candidateId:'target'};
 const pool=[...active,target,{...active[7],index:220},{...active[8],index:245},{...active[10],index:325}];
 const search=createMultiNeighborSearch();let calls=0,returned=false;
 buildConditionalAlternatives(active,pool,9,target,11,new Map(),createExecutionContext(),(candidate,position)=>{
  assert(!returned);assert.equal(candidate,target);assert.equal(position,9);calls++;
  buildMultiNeighborAlternatives(active,pool,5,Array.from({length:400},(_,i)=>Math.sin(i/10)),position,candidate,search);
 });
 returned=true;assert.equal(calls,1);assert(search.rows.length>0);
 assert(search.rows.every(r=>r.chain[9].index===270&&validatePath(r.chain)));
 // A valid substitution never enters this callback.
 buildConditionalAlternatives(active,pool,9,active[9],11,new Map(),createExecutionContext(),()=>assert.fail('valid target triggered fallback'));
 const repaired=new Map();
 buildConditionalAlternatives(active,[...pool,{...active[8],index:260}],9,target,11,repaired,createExecutionContext(),()=>assert.fail('single-neighbor repair triggered fallback'));
 assert(repaired.get(9)?.size);
});

test('IMMEDIATE FALLBACK - a new target cannot reset the shared cycle budget',()=>{
 const active=[0,20,60].map((index,i)=>({type:(i%2?'TOP':'BOTTOM') as 'TOP'|'BOTTOM',index,value:1,candidateId:`active-${i}`}));
 const target={...active[1],index:1,candidateId:'target'};const search=createMultiNeighborSearch();
 search.stats.states=multiNeighborConfig.maxStatesPerCycle;search.stats.guard='MULTI_MAX_STATES';
 buildMultiNeighborAlternatives(active,[...active,target],1,Array(100).fill(1),1,target,search);
 assert.equal(search.stats.states,multiNeighborConfig.maxStatesPerCycle);assert.equal(search.rows.length,0);
});
