// Post-decision frequency/feasibility analysis of unchanged legacy runtime traces.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const root=process.cwd();require(path.join(root,'tools/calibration-runner/node_modules/tsx/dist/cjs/index.cjs'));
const {validatePath}=require(path.join(root,'mobile/RepMotion/analytics/delayed-context-path/validation/validatePath.ts'));
const dir=__dirname,key=c=>`${c.type}:${c.index}`,logical=p=>(p%2?'T':'B')+(Math.floor(p/2)+1),csvRows=[],summary=[];
const unique=(a,f)=>new Set(a.map(f)).size;
function violations(a){const out=[];for(let p=0;p<a.length;p++){if(a[p].type!==(p%2?'TOP':'BOTTOM'))out.push({rule:'ALTERNATION',position:p});if(p){const gap=a[p].index-a[p-1].index;if(gap<=0)out.push({rule:'ORDER',positions:[p-1,p],gap});if(gap<8)out.push({rule:'MIN_PHASE_8',positions:[p-1,p],gap});}if(p>=2&&p%2===0){const gap=a[p].index-a[p-2].index;if(gap<45)out.push({rule:'MIN_REP_45',positions:[p-2,p],gap});}}return out;}
function solve(pool,active,length,pos,target,window=null){
 let states=[{last:null,bottom:null,cost:0,chain:[]}];
 for(let p=0;p<length;p++){
  let opts=p===pos?[target]:window&&(p<window.start||p>window.end)?[active[p]]:pool.filter(c=>c.type===(p%2?'TOP':'BOTTOM'));
  if(p<pos)opts=opts.filter(c=>c.index+8*(pos-p)<=target.index);
  const next=new Map();for(const s of states)for(const c of opts){if(s.last!==null&&c.index-s.last<8)continue;if(c.type==='BOTTOM'&&s.bottom!==null&&c.index-s.bottom<45)continue;
   const bottom=c.type==='BOTTOM'?c.index:s.bottom,cost=s.cost+Number(key(c)!==key(active[p])),k=`${c.index}/${bottom}/${window?Math.min(3,cost):0}`;
   if(!next.has(k)||cost<next.get(k).cost)next.set(k,{last:c.index,bottom,cost,chain:[...s.chain,c]});}
  states=[...next.values()];if(!states.length)return null;
 }
 if(window)states=states.filter(s=>s.cost>=3);if(!states.length)return null;states.sort((a,b)=>a.cost-b.cost);const s=states[0];assert(validatePath(s.chain));assert.equal(key(s.chain[pos]),key(target));return {additional:s.cost-1,chain:s.chain.map(key)};
}
for(const id of ['007','009','010']){
 const r=JSON.parse(fs.readFileSync(path.join(root,`tools/ground-truth/output/candidate-lifecycle-audit/${id}.trace2.json`))),pool=r.pool,byKey=new Map(pool.map(c=>[key(c),c])),pr=r.trace.promotions.filter(x=>x.system==='C'),visits=pr.flatMap(x=>x.visits),reps=r.trace.repairs.filter(x=>x.system==='C');
 const zero=reps.filter(x=>x.count===0),rows=[],cache=new Map();
 for(const z of zero){const run=pr.find(x=>x.cycle===z.cycle),active=run.active.map(k=>byKey.get(k)),target=byKey.get(z.candidate),n=2*z.cycle+1,direct=[...active];direct[z.position]=target;assert(!validatePath(direct.slice(0,n)));
  const cacheKey=run.active.join('|')+'/'+z.position+'/'+z.candidate+'/'+n;let feasible=cache.get(cacheKey);
  if(!feasible){const prefix=solve(pool,active,n,z.position,target);let windowProof=null;
   if(prefix)outer:for(let length=3;length<=4;length++)for(let start=Math.max(0,z.position-length+1);start<=z.position&&start+length<=n;start++){
    const end=start+length-1,proof=solve(pool,active,11,z.position,target,{start,end});if(proof){windowProof={start,end,...proof};break outer;}}
   feasible={prefix,windowProof};cache.set(cacheKey,feasible);
  }
  const oracle=r.targets.some(t=>t.position===z.position&&t.candidate===z.candidate);
  const row={dataset:id,cycle:z.cycle,position:z.position,logical:logical(z.position),candidate:z.candidate,originalIndex:target.index+r.start,type:target.type,oracleCorrectPosition:oracle,
   neighbors:active.map((c,p)=>({position:p,logical:logical(p),type:c.type,index:c.index+r.start})).filter(x=>Math.abs(x.position-z.position)<=2&&x.position!==z.position),
   structuralReasons:violations(direct.slice(0,n)),prefixFeasible:!!feasible.prefix,minAdditionalInPrefix:feasible.prefix?.additional??null,feasibleV2WindowIgnoringBeamBudget:!!feasible.windowProof,windowProof:feasible.windowProof,
   interpretation:!feasible.prefix?'NO_VALID_PREFIX_AT_THIS_POSITION':feasible.prefix.additional===1?'REQUIRES_NONADJACENT_SINGLE_CHANGE':'REQUIRES_AT_LEAST_TWO_OTHER_CHANGES'};
  rows.push(row);csvRows.push(row);
 }
 const oraVisits=pr.flatMap(x=>x.visits.filter(v=>r.targets.some(t=>t.position===v.position&&t.candidate===v.candidate))),oz=rows.filter(x=>x.oracleCorrectPosition),exposedOracle=r.targets.filter(t=>t.position<=2*pr.at(-1).cycle);
 const groups=Array.from({length:11},(_,p)=>{const rs=rows.filter(x=>x.position===p),all=pr.flatMap(x=>x.visits.filter(v=>v.position===p));return {position:p,logical:logical(p),examined:all.length,zero:rs.length,uniqueCandidates:unique(rs,x=>x.candidate),oracleZero:rs.filter(x=>x.oracleCorrectPosition).length,repairableMulti:rs.filter(x=>x.minAdditionalInPrefix>=2).length,feasibleV2Window:rs.filter(x=>x.feasibleV2WindowIgnoringBeamBudget).length};});
 const out={dataset:id,pool:pool.length,cycles:pr.length,examined:visits.length,uniqueExamined:unique(visits,x=>x.candidate),directValid:visits.filter(x=>x.valid).length,invalid:visits.filter(x=>!x.valid).length,oneNeighborSaved:reps.filter(x=>x.count>0&&!x.limit).length,zero:rows.length,zeroUniqueCandidates:unique(rows,x=>x.candidate),zeroCandidatePositionPairs:unique(rows,x=>x.candidate+'/'+x.position),zeroLogicalPositions:unique(rows,x=>x.position),observedLogicalPositions:2*pr.at(-1).cycle+1,zeroPositionCycles:unique(rows,x=>x.position+'/'+x.cycle),observedPositionCycles:pr.reduce((n,x)=>n+2*x.cycle+1,0),
  noValidPrefix:rows.filter(x=>!x.prefixFeasible).length,nonadjacentSingle:rows.filter(x=>x.minAdditionalInPrefix===1).length,atLeastTwoChanges:rows.filter(x=>x.minAdditionalInPrefix>=2).length,feasibleV2Window:rows.filter(x=>x.feasibleV2WindowIgnoringBeamBudget).length,
  oracle:{options:r.targets.length,exposedOptions:exposedOracle.length,examined:oraVisits.length,zero:oz.length,zeroUniqueCandidates:unique(oz,x=>x.candidate),zeroLogicalPositions:unique(oz,x=>x.position),rows:oz},groups};
 assert.equal(out.directValid+out.invalid,out.examined);assert.equal(out.oneNeighborSaved+out.zero,out.invalid);assert.equal(out.noValidPrefix+out.nonadjacentSingle+out.atLeastTwoChanges,out.zero);
 fs.writeFileSync(path.join(dir,id+'.legacy-frequency.json'),JSON.stringify({summary:out,rows},null,2)+'\n');summary.push(out);console.log(JSON.stringify(out));
}
const cols=Object.keys(csvRows[0]),q=x=>'"'+String(x??'').replaceAll('"','""')+'"';fs.writeFileSync(path.join(dir,'zero-repairs.csv'),[cols.map(q).join(','),...csvRows.map(r=>cols.map(k=>q(typeof r[k]==='object'?JSON.stringify(r[k]):r[k])).join(','))].join('\n')+'\n');
fs.writeFileSync(path.join(dir,'frequency-summary.json'),JSON.stringify(summary,null,2)+'\n');
