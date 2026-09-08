const fs=require('fs'), path=require('path'), assert=require('node:assert/strict');
require('../calibration-runner/node_modules/tsx/dist/cjs/index.cjs');
const ts=require('../calibration-runner/node_modules/typescript');
const id=process.argv[2];assert(['007','009','010'].includes(id));
const regression=process.argv.includes('--regression');
const start=id==='007'?0:id==='009'?174:177;
const wanted=id==='007'?[]:id==='009'?[[9,527],[9,528]]:[[9,517],[10,563]];
const events=[]; let system=null;
const clone=o=>JSON.parse(JSON.stringify(o,(_,v)=>v instanceof Map?[...v]:v));
global.__oracleTrace={
 system(s){system=s?'C':'A'; events.push({kind:'systemStart',system});},
 emit(kind,data){events.push({system,kind,...clone(data)});},
 relevant(position,c){return wanted.some(([p,i])=>p===position&&i===c.index+start);},
 pathRelevant(chain){return wanted.some(([p,i])=>chain[p]?.index+start===i);}
};
const hook=require.extensions['.ts'];
const replace=(s,a,b)=>{assert(s.includes(a),'Missing instrumentation anchor '+a);return s.replace(a,b);};
// Instrument source in memory only. All branches, constants and ordering remain original.
require.extensions['.ts']=(m,filename)=>{
 const name=filename.replaceAll('\\','/');
 if(!name.includes('/delayed-context-path/')&&!name.endsWith('/analytics/calibration.ts'))return hook(m,filename);
 let s=fs.readFileSync(filename,'utf8').replaceAll('\r\n','\n'),changed=true;
 if(name.endsWith('/analytics/calibration.ts')){
 s=replace(s,'): CalibrationResult {','): CalibrationResult {\n globalThis.__oracleTrace.emit("calibrationCall",{parameters,expectedReps});');
 s=replace(s,'const pooledCandidates = [','globalThis.__oracleTrace.emit("dpCall",{bottoms,tops,expectedReps});\n  const pooledCandidates = [');
 } else if(name.endsWith('/composition/composeGlobalPaths.ts')){
 s=replace(s,'): DCompositionResult {','): DCompositionResult {\n globalThis.__oracleTrace.emit("compositionStart",{});');
 } else if(name.endsWith('/delayedContextPath.ts')){
 s=replace(s,'): DelayedContextPathResult {','): DelayedContextPathResult {\n globalThis.__oracleTrace.emit("delayedInput",{input});');
 s=replace(s,'const context = createExecutionContext();','globalThis.__oracleTrace.system(progressiveScoredMixed);\n  const context = createExecutionContext();');
 } else if(name.endsWith('/promotion/promoteCandidates.ts')){
 s=replace(s,'const prefix = candidatePath.slice(0, prefixLength);','const prefix = candidatePath.slice(0, prefixLength);\n      if(globalThis.__oracleTrace.relevant(position,candidate)) globalThis.__oracleTrace.emit("promotionVisit",{cycle,position,candidate,activePath,prefixValid:validatePath(prefix),context});');
 s=replace(s,'scored.forEach((entry, rankIndex) => {','if(position>=9) globalThis.__oracleTrace.emit("ranking",{cycle,position,activePath,activeFeatures,criteria,weights,confidence,scored,dynamicTopN});\n    scored.forEach((entry, rankIndex) => {');
 } else if(name.endsWith('/reconstruction/buildConditionalAlternatives.ts')){
 s=replace(s,'if (validatePath(repaired.slice(0, prefixLength))) {','if(globalThis.__oracleTrace.relevant(position,candidate)||globalThis.__oracleTrace.relevant(neighborPosition,neighbor)) globalThis.__oracleTrace.emit("repairTrial",{position,candidate,neighborPosition,neighbor,prefixLength,repaired,valid:validatePath(repaired.slice(0,prefixLength))});\n      if (validatePath(repaired.slice(0, prefixLength))) {');
 } else if(name.endsWith('/reconstruction/reconstructLocalPaths.ts')){
 s=replace(s,'const segmentRows: LocalReconstructionCandidate[] = [];','const segmentRows: LocalReconstructionCandidate[] = [];\n  globalThis.__oracleTrace.emit("reconstructionStart",{cycle,active,promising,conditional,context});');
 s=replace(s,'context.limit = "MAX_SEGMENTS";','globalThis.__oracleTrace.emit("segmentGuard",{cycle,start,length,chosen,context});\n            context.limit = "MAX_SEGMENTS";');
 s=replace(s,'const fullValid = validatePath(chain);','const fullValid = validatePath(chain);\n          if(globalThis.__oracleTrace.pathRelevant(chain)) globalThis.__oracleTrace.emit("regularTrial",{cycle,start,length,chosen,chain,prefixValid,fullValid,order:context.segmentsReconstructed});');
 s=replace(s,'if (valid) {','if(globalThis.__oracleTrace.pathRelevant(chain)) globalThis.__oracleTrace.emit("coupledTrial",{cycle,position,repair,chain,valid});\n          if (valid) {');
 s=replace(s,'context.progressiveStates += 1;\n          context.progressiveGenerated += 1;','if(globalThis.__oracleTrace.pathRelevant(seedPath)) globalThis.__oracleTrace.emit("progressiveSeed",{cycle,conditionalPosition,repair,seedPath,valid:validatePath(seedPath)});\n          context.progressiveStates += 1;\n          context.progressiveGenerated += 1;');
 s=replace(s,'const pathValue = [...survivor.path];\n                pathValue[position] = option;','const pathValue = [...survivor.path];\n                pathValue[position] = option;\n                if(globalThis.__oracleTrace.pathRelevant(pathValue)) globalThis.__oracleTrace.emit("progressiveExtension",{cycle,position,pathValue,valid:validatePath(pathValue)});');
 }else changed=false;
 if(!changed)return hook(m,filename);
 const js=ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText;
 m._compile(js,filename);
};
const {historical007Input}=require('./historical007Input.ts');
const {windowOracle}=require('./windowOracle.ts');
const {delayedContextPath}=require('../../mobile/RepMotion/analytics/delayed-context-path/delayedContextPath.ts');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
const root=path.resolve(__dirname,'../..');
const ds=read(path.join(root,'datasets/calibration/rowing/rowing_5reps_'+id+'.json'));
const {input,calibration}=historical007Input(ds.samples.slice(start));
const naturalBootstrap=clone(input.selectedDpV1Chain), naturalValues=clone(input.values);
events.push({kind:'naturalDpReady'});
const natural=clone(input.candidatePool);
events.push({kind:'gtRead'});
const gt=read(path.join(root,'datasets/ground-truth/rowing_5reps_'+id+(id==='007'?'.annotations.json':'.v2.json')));
const historical=id==='007'?require('./historical007Injection.ts').buildInjectedCandidatePool(ds,gt,calibration.axis,input.candidatePool):null;
const oracle=historical?{groups:historical.groundTruthChain.map(c=>({candidates:[c]})),existence:{exists:true}}:windowOracle(gt.events,start,input.values);
const pool=historical?[...historical.pool]:[...input.candidatePool];
for(const g of oracle.groups)for(const c of g.candidates)if(!pool.some(n=>n.type===c.type&&n.index===c.index))pool.push(c);
pool.sort((a,b)=>a.index-b.index||a.type.localeCompare(b.type)||a.candidateId.localeCompare(b.candidateId));
const executionPool=pool.map(c=>({...c,candidateId:'EXPERIMENTAL_'+c.type+'_'+c.index}));
events.push({kind:'injectionCompleted'});
const result=delayedContextPath({...input,candidatePool:executionPool});
assert.deepEqual(input.selectedDpV1Chain,naturalBootstrap,'STRICT bootstrap changed during injection/execution');
assert.deepEqual(input.values,naturalValues,'STRICT IMU values changed');
assert.deepEqual(input.candidatePool,natural,'STRICT natural pool mutated');
if(regression){
 const {validatePath}=require('../../mobile/RepMotion/analytics/delayed-context-path/validation/validatePath.ts');
 const {traceWindowOracle}=require('./windowOracle.ts');
 const compatible=(chain)=>chain.length===11&&chain.every((c,i)=>oracle.groups[i].candidates.some(o=>o.type===c.type&&o.index===c.index));
 let bestRecovery=0;for(const row of result.composition.uniquePaths.values()){
 assert(validatePath(row.state.path),'STRICT invalid D path');
 bestRecovery=Math.max(bestRecovery,row.state.path.reduce((n,c,i)=>n+Number(oracle.groups[i].candidates.some(o=>o.type===c.type&&o.index===c.index)),0));
 }
 for(const sys of [result.systemA,result.systemC])for(const row of sys.generatedAudit)assert(validatePath(row.chain),'STRICT invalid reconstruction');
 const summary={id,start,natural,bootstrap:naturalBootstrap,values:naturalValues,pool:executionPool,gt,oracle,events,finalPath:result.finalPath,
 bestRecovery,completeA:result.systemA.generatedAudit.filter(r=>compatible(r.chain)).length,completeC:result.systemC.generatedAudit.filter(r=>compatible(r.chain)).length,
 trace:id==='007'?null:traceWindowOracle(oracle,result,start),
 diagnostics:{A:result.systemA.context,C:result.systemC.context,D:result.composition.context,a:result.extractedSegments.aSegments.length,c:result.extractedSegments.cOnlySegments.length,union:result.extractedSegments.segments.length,unique:result.composition.uniquePaths.size}};
 console.log(JSON.stringify(summary));process.exit(0);
}
const prior=read(path.join(__dirname,'output/delayed-v2/rowing_5reps_'+id+'.segmented_007_style_window_oracle_diagnostic.json'));
assert.deepEqual(result.finalPath,prior.localPaths.delayed);
assert.deepEqual(input.selectedDpV1Chain,prior.localPaths.bootstrap);
for(const [actual,expected] of [[result.systemA.context,prior.diagnostics.systemA],[result.systemC.context,prior.diagnostics.systemC],[result.composition.context,prior.diagnostics.compositionD]]){
const stable=o=>Object.fromEntries(Object.entries(o).filter(([k])=>!['started','progressiveStarted'].includes(k)));
assert.deepEqual(stable(actual),stable(expected));
}
const output={id,start,wanted,pool:wanted.map(([position,index])=>{const order=executionPool.findIndex(c=>c.index+start===index&&c.type===(position%2?'TOP':'BOTTOM'));return {position,originalIndex:index,orderZeroBased:order,...executionPool[order],natural:natural.some(c=>c.index+start===index&&c.type===(position%2?'TOP':'BOTTOM'))};}),oracleWitness:oracle.existence,parity:'PASS bootstrap, finalPath, all A/C/D counters and guards (timestamps excluded)',events,cycles:{A:result.systemA.cycles,C:result.systemC.cycles}};
const out=path.join(__dirname,'output/oracle-loss');fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(path.join(out,id+'.json'),JSON.stringify(output,null,2)+'\n',{flag:'wx'});
console.log(output.pool,output.parity);
for(const e of events)if(['promotionVisit','ranking','segmentGuard'].includes(e.kind))console.log(e.system,e.kind,e.cycle,e.position??'',e.kind==='ranking'?e.scored.map((c,i)=>[i+1,c.candidate.index+start,c.score]):e.kind==='promotionVisit'?{valid:e.prefixValid,active:e.activePath.map(c=>c.index+start)}:{start:e.start,length:e.length,chosen:e.chosen.map(c=>c.index+start)});
