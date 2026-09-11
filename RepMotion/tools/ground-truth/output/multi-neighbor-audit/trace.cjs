// Diagnostic replay only. Production source is read and instrumented in memory.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),crypto=require('crypto');
const root=process.cwd(),id=process.argv[2],mode=process.argv[3];assert(['007','009','010'].includes(id));assert(['baseline','trace'].includes(mode));
assert(!Object.keys(process.env).some(k=>k.startsWith('DELAYED_CONTEXT_')));
const old=JSON.parse(fs.readFileSync(path.join(root,`tools/ground-truth/output/candidate-lifecycle-audit/${id}.trace2.json`),'utf8'));
const hash=x=>crypto.createHash('sha256').update(typeof x==='string'?x:JSON.stringify(x)).digest('hex');
const cp=x=>JSON.parse(JSON.stringify(x,(_,v)=>v instanceof Map?[...v]:v instanceof Set?[...v]:v));
function verify(){for(const [f,h]of Object.entries(old.sourceManifest))assert.equal(hash(fs.readFileSync(path.join(root,f),'utf8')),h,f);}
verify();require(path.join(root,'tools/calibration-runner/node_modules/tsx/dist/cjs/index.cjs'));
const ts=require(path.join(root,'tools/calibration-runner/node_modules/typescript'));
const key=c=>`${c.type}:${c.index}`,stable=o=>Object.fromEntries(Object.entries(o).filter(([k])=>!['started','progressiveStarted'].includes(k)));
const events=[];let current=null;
global.__multiAudit={
 begin(active,pool,cycle,values,position,target,search){current={order:events.length+1,cycle,position,target:key(target),originalIndex:target.index+old.start,active:active.map(key),before:cp(search.stats),windows:[],expansions:0,beamSurvivorsSum:0,beamMax:0,completeValid:0,seeds:0};events.push(current);},
 end(search){current.after=cp(search.stats);current.delta=Object.fromEntries(Object.keys(search.stats).filter(k=>typeof search.stats[k]==='number').map(k=>[k,search.stats[k]-(current.before[k]??0)]));assert.equal(current.expansions,current.delta.states);current.seeds=current.delta.retained;current=null;},
 window(start,end,targetStates,stats){current.windows.push({start,end,beforeTarget:targetStates,beforeCycle:stats.states,positions:[]});},
 options(p,beam,options,targetStates,stats){current.windows.at(-1).positions.push({position:p,beamInput:beam.length,options:options.map(key),beforeTarget:targetStates,beforeCycle:stats.states,expansions:0});},
 expansion(){current.expansions++;current.windows.at(-1).positions.at(-1).expansions++;},
 beam(ordered,beam,next){const p=current.windows.at(-1).positions.at(-1);p.validUniquePartials=next.size;p.beamSurvivors=beam.length;p.beamPruned=Math.max(0,ordered.length-beam.length);current.beamSurvivorsSum+=beam.length;current.beamMax=Math.max(current.beamMax,beam.length);},
 complete(complete){current.completeValid=complete.size;},
};
if(mode==='trace'){
 const previous=require.extensions['.ts'];
 require.extensions['.ts']=(m,f)=>{
  if(!f.replaceAll('\\','/').endsWith('/system-c/buildMultiNeighborAlternatives.ts'))return previous(m,f);
  let s=fs.readFileSync(f,'utf8').replaceAll('\r\n','\n');const replace=(a,b)=>{assert(s.includes(a),'anchor missing '+a);assert.equal(s.indexOf(a),s.lastIndexOf(a));s=s.replace(a,b);};
  replace('const end = start + length - 1;','const end = start + length - 1;\n global.__multiAudit.window(start,end,targetStates,stats);');
  replace('const options = p === position ? [target] : pool.filter(c => c.type === active[p].type);','const options = p === position ? [target] : pool.filter(c => c.type === active[p].type);\n global.__multiAudit.options(p,beam,options,targetStates,stats);');
  replace('targetStates++; stats.states++;','targetStates++; stats.states++; global.__multiAudit.expansion();');
  replace('beam = ordered.slice(0, limits.beamWidth);','beam = ordered.slice(0, limits.beamWidth);\n global.__multiAudit.beam(ordered,beam,next);');
  replace('const ordered = rank([...complete.values()].map(r => r.path), active, cycle, values);','global.__multiAudit.complete(complete);\n const ordered = rank([...complete.values()].map(r => r.path), active, cycle, values);');
  m._compile(ts.transpileModule(s,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020,esModuleInterop:true}}).outputText,f);
  const original=m.exports.buildMultiNeighborAlternatives;m.exports.buildMultiNeighborAlternatives=function(...args){global.__multiAudit.begin(...args);const out=original(...args);global.__multiAudit.end(args[6]);return out;};
 };
}
const dsFile=path.join(root,`datasets/calibration/rowing/rowing_5reps_${id}.json`),dsText=fs.readFileSync(dsFile,'utf8');assert.equal(hash(dsText),old.inputHashes.dataset);
const ds=JSON.parse(dsText.replace(/^\uFEFF/,'')),input={candidatePool:old.pool,selectedDpV1Chain:old.bootstrap,values:ds.samples.slice(old.start).map(s=>s[old.axis])},inputHash=hash(input);
const {delayedContextPath}=require(path.join(root,'mobile/RepMotion/analytics/delayed-context-path/delayedContextPath.ts'));
const begin=performance.now(),r=delayedContextPath(input,{cStrategy:'multi_neighbor'}),elapsedMs=performance.now()-begin;
assert.equal(hash(input),inputHash);verify();
const fingerprint={};for(const s of ['A','C']){const run=r['system'+s];fingerprint[s]={context:stable(run.context),cycles:hash(run.cycles),audit:hash(run.generatedAudit),promising:hash(cp(run.promisingAlternatives)),conditional:hash(cp(run.conditionalAlternatives))};}
for(const k of ['rows','temporalRanking','shapeRanking','combinedRanking'])fingerprint[k]=hash(r.composition[k]);
const h=crypto.createHash('sha256');for(const [k,v]of r.composition.uniquePaths)h.update(JSON.stringify([k,cp(v)]));fingerprint.uniquePaths=h.digest('hex');fingerprint.segments=hash(cp(r.extractedSegments));fingerprint.D=stable(r.composition.context);fingerprint.finalPath=cp(r.finalPath);fingerprint.multiNeighbor=cp(r.multiNeighbor);
assert.deepEqual(fingerprint.A,old.fingerprint.A,'A changed vs legacy');for(const k of ['context','cycles','promising','conditional'])assert.deepEqual(fingerprint.C[k],old.fingerprint.C[k],'Legacy C decisions changed '+k);
if(mode==='trace'){const baseline=JSON.parse(fs.readFileSync(path.join(__dirname,id+'.baseline.json')));assert.deepEqual(fingerprint,baseline.fingerprint,'Instrumentation changed execution');
 for(const row of r.multiNeighbor){const es=events.filter(e=>e.cycle===row.cycle);assert.equal(es.reduce((n,e)=>n+e.expansions,0),row.stats.states);assert.equal(es.length,row.stats.targets);}
}
const out={id,mode,offset:old.start,inputHash,sourceManifest:old.sourceManifest,elapsedMs,fingerprint,multiNeighbor:cp(r.multiNeighbor),events,contexts:{A:cp(r.systemA.context),C:cp(r.systemC.context),D:cp(r.composition.context)},cycles:{A:cp(r.systemA.cycles),C:cp(r.systemC.cycles)},parity:mode==='trace'?'PASS exact uninstrumented V2 fingerprint and unchanged legacy decisions':'PASS unchanged legacy A/C decisions'};
fs.writeFileSync(path.join(__dirname,`${id}.${mode}.json`),JSON.stringify(out)+'\n',{flag:'wx'});
console.log(JSON.stringify({id,mode,elapsedMs,parity:out.parity,multiNeighbor:r.multiNeighbor,targets:events.length}));
