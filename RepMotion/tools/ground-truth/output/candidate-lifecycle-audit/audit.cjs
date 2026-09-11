// Diagnostic only: source instrumentation is in memory; production files are never written.
const fs = require('fs'), path = require('path'), assert = require('node:assert/strict'), crypto = require('crypto');
const root = process.cwd(), id = process.argv[2], mode = process.argv[3];
assert(['007','009','010'].includes(id)); assert(['baseline','trace'].includes(mode));
assert(!Object.keys(process.env).some(k=>k.startsWith('DELAYED_CONTEXT_')), 'Budget overrides forbidden');
const base = path.join(root,'tools/ground-truth');
require(path.join(root,'tools/calibration-runner/node_modules/tsx/dist/cjs/index.cjs'));
const ts = require(path.join(root,'tools/calibration-runner/node_modules/typescript'));
const start = id==='007'?0:id==='009'?174:177;
const key = c=>`${c.type}:${c.index}`, pk=(p,c)=>`${p}/${key(c)}`;
const copy = o=>JSON.parse(JSON.stringify(o,(_,v)=>v instanceof Map?[...v]:v instanceof Set?[...v]:v));
const hash = x=>crypto.createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex');
const files=[]; function walk(p){for(const e of fs.readdirSync(p,{withFileTypes:true})){const f=path.join(p,e.name);if(e.isDirectory())walk(f);else if(f.endsWith('.ts'))files.push(f);}}
walk(path.join(root,'mobile/RepMotion/analytics'));
for(const f of ['historical007Input.ts','historical007Injection.ts','windowOracle.ts'])files.push(path.join(base,f));
const manifest=()=>Object.fromEntries(files.map(f=>[path.relative(root,f),hash(fs.readFileSync(f,'utf8'))]));
const before=manifest(), trace={promotions:[],snapshots:[],repairs:[],guards:[],counts:{},progressiveRanks:[],calls:[]};
let system=null,cycle=0,serial=0;
const inc=(kind,p,c,valid)=>{const k=`${system}/${cycle}/${kind}/${pk(p,c)}`;const r=trace.counts[k]??=( {system,cycle,kind,position:p,candidate:key(c),n:0,valid:0});r.n++;if(valid)r.valid++;};
const each=(kind,s,cs,valid)=>cs.forEach((c,i)=>inc(kind,s+i,c,valid));
const H=global.__lifecycle={
 system(s){system=s?'C':'A';},
 promotion(active,c){cycle=c;trace.promotions.push({system,cycle,active:active.map(key),visits:[],ranks:[]});},
 visit(p,c,valid){trace.promotions.at(-1).visits.push({position:p,candidate:key(c),valid,order:++serial});},
 rank(p,scored){trace.promotions.at(-1).ranks.push({position:p,rows:scored.map((e,i)=>({candidate:key(e.candidate),score:e.score,rank:i+1,features:e.features,normalized:e.normalized,contributions:e.contributions,promoted:i<3}))});},
 repair(p,c,repairs,limit){trace.repairs.push({system,cycle,position:p,candidate:key(c),order:++serial,count:repairs.length,limit,repairs:repairs.map(r=>({position:r.position,candidate:key(r.candidate)}))});},
 repairTrial(p,c,np,n,valid){inc('repairTargetTrial',p,c,valid);inc('repairNeighborTrial',np,n,valid);
  if(oracleKeys.has(pk(p,c))||oracleKeys.has(pk(np,n)))(trace.oracleRepairTrials??=[]).push({system,cycle,order:++serial,position:p,candidate:key(c),neighborPosition:np,neighbor:key(n),valid});
 },
 snapshot(active,promising,conditional,context){trace.snapshots.push({system,cycle,order:++serial,active:active.map(key),promising:[...promising].map(([p,b])=>[p,[...b.values()].map(key)]),conditional:[...conditional].map(([p,b])=>[p,[...b.values()].map(r=>({candidate:key(r.candidate),repairs:[...r.repairs.values()].map(v=>({position:v.position,candidate:key(v.candidate)}))}))]),context:copy(context)});},
 option(p,c){inc('regularOption',p,c);},
 regular(s,cs,valid){each('regularLeaf',s,cs,valid);},
 coupled(p,c,r,valid){inc('coupled',p,c,valid);inc('coupled',r.position,r.candidate,valid);},
 seed(p,c,r,valid){inc('seed',p,c,valid);inc('seed',r.position,r.candidate,valid);},
 extension(p,c,path,valid){inc('extensionOption',p,c,valid);each('extensionPath',0,path,valid);},
 top(ordered){trace.progressiveRanks.push({system,cycle,rows:ordered.map(h=>({path:h.path.map(key),start:h.start,end:h.end,depth:h.depth,score:h.score,rank:h.rank,survived:h.survived}))});},
 guard(context,s,cs){trace.guards.push({system,cycle,order:++serial,start:s,candidates:cs.map(key),context:copy(context)});},
 d(kind,segment){each('D_'+kind,segment.start,segment.replacements);},
 dEnd(queue,segments,uniquePaths,context){
  // Search has ended. Observe pending legal one-step continuations; never insert one.
  const proofs=[];
  for(const [position,g]of oracle.groups.entries())for(const target of g.candidates){
   let discovered=false;for(const v of uniquePaths.values())if(key(v.state.path[position])===key(target)){discovered=true;break;}if(discovered)continue;
   const options=segments.map((s,i)=>({s,i})).filter(({s})=>s.start<=position&&s.end>=position&&key(s.replacements[position-s.start])===key(target));let witness=null;
   outer:for(const [cursor,st]of queue.entries())for(const {s,i}of options){if(i<=st.nextIndex)continue;
    if(s.replacements.some((c,j)=>st.assignments[s.start+j]!==undefined&&st.assignments[s.start+j]!==key(c)))continue;
    const next=[...st.path];s.replacements.forEach((c,j)=>next[s.start+j]=c);if(!validatePath(next))continue;
    assert(!uniquePaths.has(next.map(key).join('|')));witness={cursor,predecessor:st.path.map(key),predecessorSegments:st.segmentIds,nextIndex:st.nextIndex,segment:s.id,segmentIndex:i,path:next.map(key)};break outer;
   }
   proofs.push({position,candidate:key(target),matchingSegments:options.length,pendingLegalContinuation:witness});
  }
  trace.dContinuation={queueLength:queue.length,guard:context.guard,proofs};
 },
};
if(mode==='trace'){
 const hook=require.extensions['.ts'];
 const rep=(s,a,b)=>{assert(s.includes(a),'Missing anchor '+a);assert(s.indexOf(a)===s.lastIndexOf(a),'Nonunique anchor '+a);return s.replace(a,b);};
 require.extensions['.ts']=(m,filename)=>{
  const name=filename.replaceAll('\\','/');let s=fs.readFileSync(filename,'utf8').replaceAll('\r\n','\n'),changed=true;
  if(name.endsWith('/analytics/calibration.ts')){
   s=rep(s,'): CalibrationResult {','): CalibrationResult {\n global.__lifecycleCall("calibration",{parameters,expectedReps});');
   s=rep(s,'const pooledCandidates = [','global.__lifecycleCall("dp",{bottoms,tops,expectedReps});\n const pooledCandidates = [');
  }else if(name.endsWith('/delayed-context-path/delayedContextPath.ts')){
   s=rep(s,'const context = createExecutionContext();','global.__lifecycle.system(progressiveScoredMixed);\n const context = createExecutionContext();');
  }else if(name.endsWith('/promotion/promoteCandidates.ts')){
   s=rep(s,'const prefixLength = cycle * 2 + 1;','global.__lifecycle.promotion(activePath,cycle);\n const prefixLength = cycle * 2 + 1;');
   s=rep(s,'const prefix = candidatePath.slice(0, prefixLength);','const prefix = candidatePath.slice(0, prefixLength);\n global.__lifecycle.visit(position,candidate,validatePath(prefix));');
   s=rep(s,'scored.forEach((entry, rankIndex) => {','global.__lifecycle.rank(position,scored);\n scored.forEach((entry, rankIndex) => {');
  }else if(name.endsWith('/system-c/buildConditionalAlternatives.ts')){
   s=rep(s,'if (validatePath(repaired.slice(0, prefixLength))) {','global.__lifecycle.repairTrial(position,candidate,neighborPosition,neighbor,validatePath(repaired.slice(0,prefixLength)));\n if (validatePath(repaired.slice(0, prefixLength))) {');
   s=rep(s,'  if (repairs.length === 0 && !context.limit) {','global.__lifecycle.repair(position,candidate,repairs,context.limit);\n  if (repairs.length === 0 && !context.limit) {');
  }else if(name.endsWith('/shared/reconstructLocalPaths.ts')){
   s=rep(s,'const segmentRows: LocalReconstructionCandidate[] = [];','const segmentRows: LocalReconstructionCandidate[] = [];\n global.__lifecycle.snapshot(active,promising,conditional,context);');
   s=rep(s,'chosen.push(option);','global.__lifecycle.option(start+offset,option);\n chosen.push(option);');
   s=rep(s,'context.limit = "MAX_SEGMENTS";','context.limit = "MAX_SEGMENTS";\n global.__lifecycle.guard(context,start,chosen);');
   s=rep(s,'const fullValid = validatePath(chain);','const fullValid = validatePath(chain);\n global.__lifecycle.regular(start,chosen,prefixValid&&fullValid);');
   s=rep(s,'if (valid) {','global.__lifecycle.coupled(position,record.candidate,repair,valid);\n if (valid) {');
   s=rep(s,'          if (\n            !validatePath(seedPath.slice(0, prefixLength)) ||','          global.__lifecycle.seed(conditionalPosition,record.candidate,repair,validatePath(seedPath.slice(0,prefixLength))&&validatePath(seedPath));\n          if (\n            !validatePath(seedPath.slice(0, prefixLength)) ||');
   s=rep(s,'pathValue[position] = option;','pathValue[position] = option;\n global.__lifecycle.extension(position,option,pathValue,validatePath(pathValue.slice(0,prefixLength))&&validatePath(pathValue));');
   s=rep(s,'return ordered.slice(0, 3);','global.__lifecycle.top(ordered);\n return ordered.slice(0, 3);');
  }else if(name.endsWith('/system-d/composeGlobalPaths.ts')){
   s=rep(s,'context.examined += 1;','global.__lifecycle.d("attempt",segment);\n context.examined += 1;');
   s=rep(s,'context.incompatibleOverlaps += 1;','global.__lifecycle.d("incompatible",segment);\n context.incompatibleOverlaps += 1;');
   s=rep(s,'context.structurallyRejected += 1;','global.__lifecycle.d("structural",segment);\n context.structurallyRejected += 1;');
   s=rep(s,'context.duplicates += 1;','global.__lifecycle.d("duplicate",segment);\n context.duplicates += 1;');
   s=rep(s,'queue.push(next);','global.__lifecycle.d("insert",segment);\n queue.push(next);');
   s=rep(s,'  const composed = [...uniquePaths.entries()].map(','  global.__lifecycle.dEnd(queue,segments,uniquePaths,context);\n  const composed = [...uniquePaths.entries()].map(');
  }else changed=false;
  if(!changed)return hook(m,filename);
  m._compile(ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,filename);
 };
}
global.__lifecycleCall=(kind,data)=>trace.calls.push({kind,...copy(data)});
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const {historical007Input}=require(path.join(base,'historical007Input.ts'));
const {windowOracle}=require(path.join(base,'windowOracle.ts'));
const {delayedContextPath}=require(path.join(root,'mobile/RepMotion/analytics/delayed-context-path/delayedContextPath.ts'));
const {validatePath}=require(path.join(root,'mobile/RepMotion/analytics/delayed-context-path/validation/validatePath.ts'));
const {extractSegments}=require(path.join(root,'mobile/RepMotion/analytics/delayed-context-path/composition/system-d/extractSegments.ts'));
const datasetFile=path.join(root,`datasets/calibration/rowing/rowing_5reps_${id}.json`);
const ds=read(datasetFile), {input,calibration}=historical007Input(ds.samples.slice(start));
const preserved=copy(input), natural=input.candidatePool;
const gtFile=path.join(root,`datasets/ground-truth/rowing_5reps_${id}${id==='007'?'.annotations.json':'.v2.json'}`),gt=read(gtFile);
const hist=id==='007'?require(path.join(base,'historical007Injection.ts')).buildInjectedCandidatePool(ds,gt,calibration.axis,natural):null;
const oracle=hist?{groups:hist.groundTruthChain.map(c=>({candidates:[c]}))}:windowOracle(gt.events,start,input.values);
const pool=hist?[...hist.pool]:[...natural];for(const g of oracle.groups)for(const c of g.candidates)if(!pool.some(n=>key(n)===key(c)))pool.push(c);
pool.sort((a,b)=>a.index-b.index||a.type.localeCompare(b.type)||a.candidateId.localeCompare(b.candidateId));
const executionPool=pool.map(c=>({...c,candidateId:`EXPERIMENTAL_${c.type}_${c.index}`}));
const oracleKeys=new Set(oracle.groups.flatMap((g,p)=>g.candidates.map(c=>pk(p,c))));
const t=performance.now(); const result=delayedContextPath({...input,candidatePool:executionPool},{cStrategy:'legacy'}); const elapsed=performance.now()-t;
assert.deepEqual(copy(input),preserved,'Natural input mutated');assert.deepEqual(manifest(),before,'Source mutation');
const witness=id==='007'?oracle.groups.map(g=>g.candidates[0].index): (id==='009'?[190,218,270,278,348,373,423,449,501,527,578]:[177,221,269,301,348,377,418,445,487,517,563]).map(n=>n-start);
const wp=witness.map((index,p)=>executionPool.find(c=>c.index===index&&c.type===(p%2?'TOP':'BOTTOM')));assert(wp.every(Boolean));assert(validatePath(wp));
const stable=c=>Object.fromEntries(Object.entries(c).filter(([k])=>!['started','progressiveStarted'].includes(k)));
const fingerprint={};
for(const s of ['A','C']){const r=result['system'+s];fingerprint[s]={context:stable(r.context),cycles:hash(r.cycles),audit:hash(r.generatedAudit),promising:hash(copy(r.promisingAlternatives)),conditional:hash(copy(r.conditionalAlternatives))};}
fingerprint.segments=hash(copy(result.extractedSegments));fingerprint.D=stable(result.composition.context);delete fingerprint.D.started;
for(const f of ['rows','temporalRanking','shapeRanking','combinedRanking'])fingerprint[f]=hash(result.composition[f]);
const dh=crypto.createHash('sha256');for(const [k,v]of result.composition.uniquePaths)dh.update(JSON.stringify([k,copy(v)]));fingerprint.uniquePaths=dh.digest('hex');fingerprint.finalPath=copy(result.finalPath);
const expected={ '007':[648,351,999,200001], '009':[781,219,1000,92738], '010':[684,1677,2361,60679] };
assert.deepEqual([result.extractedSegments.aSegments.length,result.extractedSegments.cOnlySegments.length,result.extractedSegments.segments.length,result.composition.uniquePaths.size],expected[id],'Historical populations');
if(mode==='trace'){const baseline=read(path.join(__dirname,`${id}.baseline.json`));assert.deepEqual(fingerprint,baseline.fingerprint,'Instrumentation changed a decision/output');}
const match=(p,c)=>oracle.groups[p].candidates.some(o=>key(o)===key(c));const recovery=chain=>chain.reduce((n,c,p)=>n+Number(match(p,c)),0);
const pathCounts={},segmentCounts={},best={A:{recovery:-1},C:{recovery:-1},D:{recovery:-1}},histograms={A:{},C:{},D:{}};
function recordPath(stage,chain,detail){assert(validatePath(chain));let rec=recovery(chain);histograms[stage][rec]=(histograms[stage][rec]??0)+1;for(const [p,c]of chain.entries()){const k=stage+'/'+pk(p,c);pathCounts[k]=(pathCounts[k]??0)+1;}if(rec>best[stage].recovery)best[stage]={recovery:rec,path:chain.map(c=>({type:c.type,index:c.index+start})),...detail};}
for(const s of ['A','C'])for(const r of result['system'+s].generatedAudit)recordPath(s,r.chain,{cycle:r.cycle,chosen:r.chosen});
let dr=0;for(const row of result.composition.combinedRanking){dr++;const e=result.composition.uniquePaths.get(row.path);recordPath('D',e.state.path,{combinedRank:dr,score:row.combined,segmentIds:e.state.segmentIds});}
const aSeg=extractSegments(result.systemA.generatedAudit,[]).segments,cSeg=extractSegments([],result.systemC.generatedAudit).segments;
for(const [stage,segs]of [['A',aSeg],['C',cSeg],['union',result.extractedSegments.segments]])for(const s of segs)for(const [i,c]of s.replacements.entries()){const k=stage+'/'+pk(s.start+i,c);segmentCounts[k]=(segmentCounts[k]??0)+1;}
const allTargets=oracle.groups.flatMap((g,p)=>g.candidates.map(c=>({position:p,candidate:key(c),originalIndex:c.index+start,witness:c.index===witness[p],source:natural.some(n=>key(n)===key(c))?'BOTH':'ORACLE_INJECTED'})));
const cycles=Object.fromEntries(['A','C'].map(s=>[s,copy(result['system'+s].cycles)]));
const resultSummary={id,mode,start,elapsedMs:elapsed,axis:calibration.axis,sourceManifest:before,inputHashes:{dataset:hash(fs.readFileSync(datasetFile,'utf8')),gt:hash(fs.readFileSync(gtFile,'utf8'))},fingerprint,
 natural:copy(natural),raw:copy(calibration.debug.rawCandidateDebugEvents),pool:copy(executionPool),bootstrap:copy(input.selectedDpV1Chain),witness:wp.map(c=>({type:c.type,index:c.index+start})),oracle:copy(oracle),targets:allTargets,
 cycles,pathCounts,segmentCounts,best,histograms,finalRecovery:recovery(result.finalPath),finalPath:result.finalPath.map(c=>({type:c.type,index:c.index+start})),
 segmentTotals:{A:aSeg.length,C:cSeg.length,COnly:result.extractedSegments.cOnlySegments.length,union:result.extractedSegments.segments.length},segments:copy(result.extractedSegments.segments),
 contexts:{A:copy(result.systemA.context),C:copy(result.systemC.context),D:copy(result.composition.context)},
 finalMaps:Object.fromEntries(['A','C'].map(s=>[s,{promising:copy(result['system'+s].promisingAlternatives),conditional:copy(result['system'+s].conditionalAlternatives)}])),
 trace:mode==='trace'?trace:undefined,parity:mode==='trace'?'PASS: exact baseline fingerprints, counters, all ordered outputs and D states/provenances':'unmodified execution'};
fs.writeFileSync(path.join(__dirname,`${id}.${process.argv[4]??mode}.json`),JSON.stringify(resultSummary)+'\n',{flag:'wx'});
console.log(JSON.stringify({id,mode,elapsedMs:elapsed,parity:resultSummary.parity,pool:pool.length,best,finalRecovery:resultSummary.finalRecovery,contexts:resultSummary.contexts}));
