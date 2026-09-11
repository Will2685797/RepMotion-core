const fs=require('fs'),path=require('path'),assert=require('node:assert/strict'),{spawnSync}=require('child_process');
const root=path.resolve(__dirname,'../..');
const label=process.argv[2]??'c-strategy-comparison';assert(/^[a-z0-9-]+$/.test(label),'invalid report label');
const output=path.join(__dirname,'output',label);fs.mkdirSync(output,{recursive:true});
const report=[];
const clean=n=>Number(n.toFixed(10));
for(const id of ['007','009','010']){
 let legacy;
 for(const strategy of ['legacy','multi_neighbor']){
  console.log('RUN',id,strategy);
  const run=spawnSync(process.execPath,[path.join(__dirname,'traceOracleLoss.cjs'),id,'--regression','--strategy',strategy],{cwd:root,encoding:'utf8',maxBuffer:80*1024*1024,timeout:240000});
  assert.equal(run.status,0,run.stderr);const r=JSON.parse(run.stdout);
  if(strategy==='legacy')legacy=r;
  else {
   assert.deepEqual(r.bootstrap,legacy.bootstrap);assert.deepEqual(r.pool,legacy.pool);
   assert.deepEqual(r.aAuditKeys,legacy.aAuditKeys,'A changed');
   const all=new Set(r.cAuditKeys);assert(legacy.cAuditKeys.every(k=>all.has(k)),'legacy C reconstructions lost');
   const stable=c=>Object.fromEntries(Object.entries(c).filter(([k])=>!['started','progressiveStarted'].includes(k)));
   assert.deepEqual(stable(r.diagnostics.C),stable(legacy.diagnostics.C),'legacy C budget/trajectory changed');
  }
  const indices=r.finalPath.map(c=>c.index+r.start);
  const errors=id==='007'?null:indices.slice(0,10).map((n,i)=>clean(Math.max(r.gt.events[i].arrivalSampleFloat-n,0,n-r.gt.events[i].departureSampleFloat))).sort((a,b)=>a-b);
  const total={};for(const c of r.multiNeighbor)for(const [k,v]of Object.entries(c.stats))if(typeof v==='number')total[k]=(total[k]??0)+v;
  const row={id,strategy,bestGeneratedOracleRecovery:r.bestRecovery,finalWinnerOracleRecovery:r.finalPath.filter((c,i)=>r.oracle.groups[i].candidates.some(o=>o.type===c.type&&o.index===c.index)).length,
   quality:errors?{insideZone:errors.filter(n=>n===0).length,mean:clean(errors.reduce((a,b)=>a+b,0)/10),median:clean((errors[4]+errors[5])/2),max:errors[9],b6Signed:clean(indices[10]-r.gt.events[10].arrivalSampleFloat)}:null,
   finalPath:indices,diagnostics:r.diagnostics,multiNeighbor:total,multiNeighborCycles:r.multiNeighbor,
   completeA:r.completeA,completeC:r.completeC,trace:r.trace,
   legacySubsetPreserved:strategy==='multi_neighbor'?true:null,
   historicalQualityAccepted:id==='007'?r.bestRecovery>=10:null};
  report.push(row);
  fs.writeFileSync(path.join(output,`${id}.${strategy}.json`),JSON.stringify(row,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify(row));
 }
}
fs.writeFileSync(path.join(output,'comparison.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
if(report.some(r=>r.historicalQualityAccepted===false)){console.error('EXPERIMENT REJECTED: 007 generated recovery below 10/11. No tuning applied.');process.exitCode=1;}
