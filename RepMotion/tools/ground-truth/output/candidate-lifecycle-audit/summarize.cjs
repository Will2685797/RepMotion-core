// Post-decision analysis only. Never imported by Delayed.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const dir=__dirname,key=c=>`${c.type}:${c.index}`,same=(a,b)=>a&&key(a)===key(b);
const original=(k,start)=>{const [t,n]=k.split(':');return t[0]+(Number(n)+start);};
const read=id=>JSON.parse(fs.readFileSync(path.join(dir,id+'.trace2.json'),'utf8'));
const count=(r,stage,p,c)=>r.pathCounts[`${stage}/${p}/${c}`]??0;
const scount=(r,stage,p,c)=>r.segmentCounts[`${stage}/${p}/${c}`]??0;
function roles(s,p,c){const roles=[];if(s.active[p]===c)roles.push('Active');if(s.promising.some(([q,b])=>q===p&&b.includes(c)))roles.push('Promising');
 for(const [q,b]of s.conditional)for(const rec of b){if(q===p&&rec.candidate===c)roles.push('Conditional');if(rec.repairs.some(x=>x.position===p&&x.candidate===c))roles.push('Repair');}return [...new Set(roles)];}
function minChanges(pool,active,targetPos,targetKey){
 // Exhaustive dynamic programming over full valid chains; cost = changed slots.
 // Diagnostic AFTER the production run. No scoring or algorithms are patched.
 let states=[{last:null,bottom:null,cost:0,path:[]}];
 for(let p=0;p<11;p++){
  const opts=pool.filter(c=>c.type===(p%2?'TOP':'BOTTOM')&&(p!==targetPos||key(c)===targetKey));const next=new Map();
  for(const st of states)for(const c of opts){if(st.last!==null&&c.index-st.last<8)continue;if(c.type==='BOTTOM'&&st.bottom!==null&&c.index-st.bottom<45)continue;
   const bottom=c.type==='BOTTOM'?c.index:st.bottom,cost=st.cost+Number(active[p]!==key(c)),k=c.index+'/'+bottom;
   if(!next.has(k)||cost<next.get(k).cost)next.set(k,{last:c.index,bottom,cost,path:[...st.path,key(c)]});}
  states=[...next.values()];if(!states.length)return null;
 }
 states.sort((a,b)=>a.cost-b.cost);return {totalChanges:states[0].cost,additionalChanges:states[0].cost-Number(active[targetPos]!==targetKey),path:states[0].path};
}
const datasets=[];
for(const id of process.argv.slice(2)){
 const r=read(id),counts=Object.values(r.trace.counts),natural=new Set(r.natural.map(key)),raw=new Set(r.raw.map(key));
 const targets=r.targets.map(t=>{
  const p=t.position,c=t.candidate,systems={};
  for(const sys of ['A','C']){
   const snaps=r.trace.snapshots.filter(s=>s.system===sys),proms=r.trace.promotions.filter(s=>s.system===sys);
   const observations=proms.map(pr=>{const snap=snaps.find(s=>s.cycle===pr.cycle),rank=pr.ranks.find(x=>x.position===p)?.rows.find(x=>x.candidate===c),visit=pr.visits.find(x=>x.position===p&&x.candidate===c),repair=r.trace.repairs.find(x=>x.system===sys&&x.cycle===pr.cycle&&x.position===p&&x.candidate===c);
    return {cycle:pr.cycle,active:pr.active.map(k=>original(k,r.start)),evaluated:!!visit,directValid:visit?.valid??null,score:rank?.score??null,rank:rank?.rank??null,promoted:rank?.promoted??false,repairs:repair?.count??null,repairPartners:repair?.repairs??[],roles:snap&&p<2*pr.cycle+1?roles(snap,p,c):[],prefixOpen:p<2*pr.cycle+1,limit:snap?.context.limit??null};});
   const cs=counts.filter(x=>x.system===sys&&x.position===p&&x.candidate===c&&!x.kind.startsWith('D_'));
   const considered=cs.filter(x=>['regularOption','coupled','seed','extensionOption'].includes(x.kind)).reduce((n,x)=>n+x.n,0);
   const kinds=Object.fromEntries([...new Set(cs.map(x=>x.kind))].map(k=>[k,{n:cs.filter(x=>x.kind===k).reduce((n,x)=>n+x.n,0),valid:cs.filter(x=>x.kind===k).reduce((n,x)=>n+x.valid,0)}]));
   systems[sys]={observations,available:observations.some(x=>x.roles.length),considered,consideration:kinds,reconstructions:count(r,sys,p,c),segments:scount(r,sys,p,c)};
  }
  const d=counts.filter(x=>x.position===p&&x.candidate===c&&x.kind.startsWith('D_'));
  const D={unionSegments:scount(r,'union',p,c),paths:count(r,'D',p,c),attempts:Object.fromEntries([...new Set(d.map(x=>x.kind))].map(k=>[k,d.filter(x=>x.kind===k).reduce((n,x)=>n+x.n,0)]))};
  const inBest=r.best.D.path[p].type+':'+(r.best.D.path[p].index-r.start)===c,inFinal=r.finalPath[p].type+':'+(r.finalPath[p].index-r.start)===c;
  let firstLoss=D.paths?(inFinal?'NONE':'FINAL_WINNER_SELECTION'):'UNKNOWN',reason=D.paths?(inFinal?'Present in final winner.':'Present in generated D paths until final ranking; not selected in the final winner. No irreversible search loss.'):'Earliest irreversible decision not yet proven; inspect final accessible maps and all alternative roles.',category=D.paths?(inFinal?null:'OTHER'):null;
  const finalC=r.trace.snapshots.filter(s=>s.system==='C').at(-1),boot=key(r.bootstrap[p])===c;
  if(!D.paths&&!D.unionSegments&&!boot){
   if(finalC.cycle===5&&!roles(finalC,p,c).length){firstLoss='UNKNOWN';reason='No route remains at end of final C promotion; earliest instruction requires all candidate/repair roles to be checked.';
    const last=(r.trace.oracleRepairTrials??[]).filter(x=>x.system==='C'&&x.cycle===5&&(x.position===p&&x.candidate===c||x.neighborPosition===p&&x.neighbor===c)).at(-1);
    if(id==='009'&&p===9&&last&&!last.valid&&last.position===10&&last.neighbor===c){
     firstLoss='C_PROMOTION_C5_LAST_REPAIR_NEIGHBOR_TRIAL';category='ZERO_ONE_NEIGHBOR_REPAIRS';
     reason=`Last possible admission: invalid repair trial for ${original(last.candidate,r.start)} at slot 10 using ${original(c,r.start)} at slot 9 (trace order ${last.order}). Subsequent B578 substitution is valid and does not search repairs; active B599 is skipped. No stored role, no A/earlier C segment, no bootstrap occurrence at this slot, no later cycle. Direct target rejection alone was NOT irreversible.`;
    }
   }
   const guard=r.trace.guards.find(g=>g.system==='C');
   if(guard&&p>=2*guard.cycle+1){firstLoss=`C_RECONSTRUCTION_C${guard.cycle}_MAX_SEGMENTS`;category='MAX_SEGMENTS';reason='A exported no matching segment; candidate absent from bootstrap; C guard prevents remaining cycles. Remaining progressive block is restricted to current prefix and cannot assign this position.';}
  }
  const continuation=r.trace.dContinuation?.proofs.find(x=>x.position===p&&x.candidate===c);
  if(!D.paths&&continuation?.pendingLegalContinuation){firstLoss='D_GUARD';category='D_GUARD';reason='At D guard, an actual queued state has a legal, compatible, structurally valid one-step continuation introducing this candidate with a new path signature. See continuationProof. It is never inserted because exploration stops.';}
  if(id==='007'&&p===2&&!D.paths){category='NOT_COMPOSED_BY_D';reason='12 exported B262 segments stop at slot 3. Bootstrap slot 4=B299 gives 299-262=37<45. No earlier compatible segment can change slot 4. Ordered composition + intermediate validity excludes B262 even without the guard. Earliest irreversible instruction between final reconstruction/extraction/D admission is not established; FIRST_LOSS remains UNKNOWN, not LOW_RANK or D_GUARD.';}
  return {...t,label:original(c,r.start),inNaturalPool:natural.has(c),inCalibrationRAW:raw.has(c),inOraclePool:r.pool.some(x=>key(x)===c),bootstrap:boot,systems,D,inBest,inFinal,firstLoss,category,reason,continuationProof:continuation?.pendingLegalContinuation??null};
 });
 // Global counts use distinct type:index across all slots, not visits; classes overlap.
 const global={pool:r.pool.length,naturalPool:r.natural.length,raw:r.raw.length,oracleOptions:targets.length,injected:r.pool.length-r.natural.length,overlap:targets.filter(t=>t.inNaturalPool).length};
 const ids=x=>new Set(x).size;
 for(const sys of ['A','C']){
  const snaps=r.trace.snapshots.filter(x=>x.system===sys),active=new Set(r.cycles[sys].flatMap(x=>[...x.activeBefore,...x.activeAfter]).map(key));
  const promising=new Set(snaps.flatMap(s=>s.promising.flatMap(([,b])=>b))),conditional=new Set(snaps.flatMap(s=>s.conditional.flatMap(([,b])=>b.map(x=>x.candidate)))),repairs=new Set(snaps.flatMap(s=>s.conditional.flatMap(([,b])=>b.flatMap(x=>x.repairs.map(y=>y.candidate)))));
  const considered=new Set(counts.filter(x=>x.system===sys&&['regularOption','coupled','seed','extensionOption'].includes(x.kind)).map(x=>x.candidate));
  const seenPaths=Object.entries(r.pathCounts).filter(([k,n])=>k.startsWith(sys+'/')&&n).map(([k])=>k.split('/')[2]),seenSegments=Object.entries(r.segmentCounts).filter(([k,n])=>k.startsWith(sys+'/')&&n).map(([k])=>k.split('/')[2]);
  const accepted=new Set([...active,...promising,...conditional,...repairs]);
  global[sys]={promotionEvaluatedDistinct:ids(r.trace.promotions.filter(x=>x.system===sys).flatMap(x=>x.visits.map(v=>v.candidate))),promotionVisits:r.contexts[sys].rawEvaluated,activeEver:active.size,activeFinal:r.cycles[sys].at(-1).activeAfter.length,promising:promising.size,conditional:conditional.size,repair:repairs.size,notRetainedAnyRole:r.pool.filter(c=>!accepted.has(key(c))).length,considered:considered.size,reconstructionCandidates:ids(seenPaths),segmentCandidates:ids(seenSegments),oracleAvailable:targets.filter(t=>t.systems[sys].available).length,witnessAvailable:targets.filter(t=>t.witness&&t.systems[sys].available).length};
 }
 global.promotionEvaluatedUnion=ids(r.trace.promotions.flatMap(x=>x.visits.map(v=>v.candidate)));global.D=ids(Object.keys(r.pathCounts).filter(k=>k.startsWith('D/')).map(k=>k.split('/')[2]));
 global.DInputUnion=ids(Object.keys(r.segmentCounts).filter(k=>k.startsWith('union/')).map(k=>k.split('/')[2]));
 const bootstrap={exactWitness:r.bootstrap.filter((c,p)=>c.index+r.start===r.witness[p].index).length,compatible:r.bootstrap.filter((c,p)=>r.oracle.groups[p].candidates.some(o=>same(o,c))).length,meanAbsWitness:r.bootstrap.reduce((n,c,p)=>n+Math.abs(c.index+r.start-r.witness[p].index),0)/11,perPosition:r.bootstrap.map((c,p)=>({position:p,bootstrap:c.index+r.start,witness:r.witness[p].index,delta:c.index+r.start-r.witness[p].index}))};
 const minRepair=[];
 for(const t of targets.filter(t=>t.witness)){
  minRepair.push({system:'BOOTSTRAP',cycle:0,position:t.position,candidate:t.candidate,...minChanges(r.pool,r.bootstrap.map(key),t.position,t.candidate)});
  for(const sys of ['A','C'])for(const o of t.systems[sys].observations.filter(x=>x.evaluated)){
   const pr=r.trace.promotions.find(x=>x.system===sys&&x.cycle===o.cycle);
   const min=minChanges(r.pool,pr.active,t.position,t.candidate);minRepair.push({system:sys,cycle:o.cycle,position:t.position,candidate:t.candidate,...min});
  }
 }
 const out={id,global,bootstrap,targets,minRepair,best:r.best,histograms:r.histograms,finalRecovery:r.finalRecovery,finalPath:r.finalPath,contexts:r.contexts,segments:r.segmentTotals,parity:r.parity,cycles:r.cycles,dContinuation:r.trace.dContinuation};datasets.push(out);
 fs.writeFileSync(path.join(dir,id+'.lifecycle.json'),JSON.stringify(out,null,2)+'\n');
 console.log(JSON.stringify({id,global,bootstrap,best:r.best,targets:targets.filter(t=>t.witness).map(t=>({c:t.label,source:t.source,boot:t.bootstrap,A:t.systems.A.observations.map(o=>`${o.cycle}:${o.roles.join('+')||'-'}:${o.score===null?'NA':o.score.toFixed(4)+'/'+o.rank}:r${o.repairs}`),C:t.systems.C.observations.map(o=>`${o.cycle}:${o.roles.join('+')||'-'}:${o.score===null?'NA':o.score.toFixed(4)+'/'+o.rank}:r${o.repairs}`),Ac:t.systems.A.considered,Ar:t.systems.A.reconstructions,As:t.systems.A.segments,Cc:t.systems.C.considered,Cr:t.systems.C.reconstructions,Cs:t.systems.C.segments,D:t.D.paths,best:t.inBest,final:t.inFinal,loss:t.firstLoss}))}));
}
