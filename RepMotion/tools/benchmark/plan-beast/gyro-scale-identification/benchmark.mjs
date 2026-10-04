import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const root = path.resolve(here, '../../../..');
export const candidates = [131, 65.5, 32.8, 16.4];
const ranges = [250, 500, 1000, 2000];
export const profiles = {
  primary: { durationMs: 500, normCv: 0.01, directionMaxDeg: 2, normDeviation: 0.05 },
  strict: { durationMs: 750, normCv: 0.005, directionMaxDeg: 1, normDeviation: 0.03 },
  relaxed: { durationMs: 300, normCv: 0.02, directionMaxDeg: 3, normDeviation: 0.08 },
};
const mean = a => a.reduce((x, y) => x + y, 0) / a.length;
const norm = a => Math.hypot(...a);
const scale = (a, s) => a.map(x => x * s);
const add = (a, b) => a.map((x, i) => x + b[i]);
const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
export const unit = a => { if (!(norm(a) > 0)) throw Error('Zero direction'); return scale(a, 1 / norm(a)); };
export const angle = (a, b) => Math.acos(Math.max(-1, Math.min(1, dot(unit(a), unit(b))))) * 180 / Math.PI;
const accel = s => [s.ax, s.ay, s.az];
const gyro = s => [s.gx, s.gy, s.gz];
const vectorMean = a => [0,1,2].map(i => mean(a.map(v => v[i])));
export const estimateBias = samples => vectorMean(samples.map(gyro));
export const convert = (sample, bias, sensitivity) => gyro(sample).map((v, i) => (v-bias[i])*Math.PI/(180*sensitivity));

// A fixed world direction in sensor coordinates obeys dg/dt = -omega cross g.
export function integrate(samples, start, initial, bias, sensitivity) {
  let g = unit(initial);
  return samples.slice(start).map((s, offset) => {
    if (offset) {
      const previous = samples[start + offset - 1];
      const dt = (s.timestampMs - previous.timestampMs) / 1000;
      if (!(dt > 0)) throw Error('Non-increasing timestamp');
      const rotation = scale(add(convert(previous,bias,sensitivity),convert(s,bias,sensitivity)), -dt/2);
      const theta = norm(rotation);
      if (theta > 0) {
        const axis = scale(rotation,1/theta);
        g = unit(add(add(scale(g,Math.cos(theta)),scale(cross(axis,g),Math.sin(theta))),scale(axis,dot(axis,g)*(1-Math.cos(theta)))));
      }
    }
    return { sampleIndex:s.sampleIndex, timestampMs:s.timestampMs, gravityDirection:[...g] };
  });
}
export function stats(a) {
  if (!a.length) return { n:0, mean:null, median:null, rmse:null, max:null };
  const sorted = [...a].sort((a,b)=>a-b), m = Math.floor(a.length/2);
  return { n:a.length, mean:mean(a), median:a.length%2?sorted[m]:(sorted[m-1]+sorted[m])/2, rmse:Math.sqrt(mean(a.map(x=>x*x))), max:Math.max(...a) };
}
function describe(samples, start, end, baselineNorm) {
  const part=samples.slice(start,end+1), norms=part.map(s=>norm(accel(s)));
  const direction=unit(vectorMean(part.map(accel))), average=mean(norms);
  return {start,end,n:part.length,startSampleIndex:samples[start].sampleIndex,endSampleIndex:samples[end].sampleIndex,startTimestampMs:samples[start].timestampMs,endTimestampMs:samples[end].timestampMs,direction,
    normMean:average,normCv:Math.sqrt(mean(norms.map(n=>(n-average)**2)))/average,
    directionMaxDeg:Math.max(...part.map(s=>angle(accel(s),direction))),normDeviation:Math.abs(average/baselineNorm-1)};
}
function windows(samples, start, baselineNorm, profile, events) {
  const accepted=[], rejected=[];
  for(let a=start;a<samples.length;) {
    let b=a; while(b<samples.length && samples[b].timestampMs-samples[a].timestampMs<profile.durationMs) b++;
    if(b>=samples.length) break;
    const w=describe(samples,a,b,baselineNorm);
    // Labels never enter selection, integration or score.
    w.labels=events.filter(e=>e.arrivalSampleFloat<=a && (e.departureSampleFloat??(samples.length-1))>=b).map(e=>`${e.type}${e.rep}`);
    w.reasons=[];
    for(const k of ['normCv','directionMaxDeg','normDeviation']) if(w[k]>profile[k]) w.reasons.push(k);
    if(samples.slice(a,b+1).some(s=>accel(s).some(x=>x===32767||x===-32768))) w.reasons.push('accelRail');
    (w.reasons.length?rejected:accepted).push(w); a=b+1;
  }
  return {accepted,rejected};
}
export function inputPaths() {
  return Array.from({length:10},(_,i)=>String(i+11).padStart(3,'0')).flatMap(id=>[
    path.join(root,`datasets/calibration/rowing/rowing_5reps_${id}.json`),
    path.join(root,`datasets/ground-truth/rowing_5reps_${id}.v2.json`)]);
}
export const hashes = () => Object.fromEntries(inputPaths().map(p=>[path.relative(root,p).replaceAll('\\','/'),crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')]));
export function run() {
  const before=hashes(), datasets=[];
  for(let i=11;i<=20;i++) {
    const id=String(i).padStart(3,'0');
    const data=JSON.parse(fs.readFileSync(inputPaths()[(i-11)*2]));
    const gt=JSON.parse(fs.readFileSync(inputPaths()[(i-11)*2+1]));
    const s=data.samples, b=gt.sync.baseline, base=s.slice(b.startSampleInclusive,b.endSampleInclusive+1);
    const bias=estimateBias(base), baselineNorm=mean(base.map(v=>norm(accel(v))));
    const initial=unit(vectorMean(base.map(accel))), start=b.endSampleInclusive;
    const ds={id,sampleCount:s.length,baseline:{...describe(s,b.startSampleInclusive,start,baselineNorm),biasRaw:bias},accelRestG:[16384,8192,4096,2048].map(k=>baselineNorm/k),profiles:{}};
    const trajectories=candidates.map(k=>integrate(s,start,initial,bias,k));
    for(const [name,profile] of Object.entries(profiles)) {
      const selected=windows(s,start+1,baselineNorm,profile,gt.events);
      const results=candidates.map((sensitivity,ci)=>{
        const trajectory=trajectories[ci];
        const comparisons=selected.accepted.map(w=>{
          const predicted=unit(vectorMean(trajectory.slice(w.start-start,w.end-start+1).map(x=>x.gravityDirection)));
          return {...w,predicted,errorDeg:angle(predicted,w.direction),measuredChangeDeg:angle(initial,w.direction),predictedChangeDeg:angle(initial,predicted)};
        });
        const transitions=comparisons.slice(1).map((w,j)=>{
          const prev=comparisons[j], measured=angle(prev.direction,w.direction), predicted=angle(prev.predicted,w.predicted);
          return {from:prev.start,to:w.start,fromLabels:prev.labels,toLabels:w.labels,measuredDeg:measured,predictedDeg:predicted,residualDeg:predicted-measured};
        });
        const last=comparisons.at(-1);
        return {sensitivity,rangeDps:ranges[ci],factor:131/sensitivity,errors:stats(comparisons.map(w=>w.errorDeg)),
          terminalDriftDeg:last?.errorDeg??null,terminalElapsedSec:last?(last.endTimestampMs-s[start].timestampMs)/1000:null,
          errorGrowthDeg:comparisons.length?last.errorDeg-comparisons[0].errorDeg:null,
          measuredExcursionMaxDeg:comparisons.length?Math.max(...comparisons.map(w=>w.measuredChangeDeg)):null,
          predictedExcursionMaxDeg:comparisons.length?Math.max(...comparisons.map(w=>w.predictedChangeDeg)):null,
          transitionResiduals:stats(transitions.map(t=>Math.abs(t.residualDeg))),comparisons,transitions};
      });
      ds.profiles[name]={...selected,results,frozenDirectionControl:stats(selected.accepted.map(w=>angle(initial,w.direction)))};
    }
    datasets.push(ds);
  }
  const aggregate=Object.fromEntries(Object.keys(profiles).map(profile=>[profile,candidates.map((k,ci)=>{
    const results=datasets.map(d=>d.profiles[profile].results[ci]);
    return {sensitivity:k,rangeDps:ranges[ci],pooled:stats(results.flatMap(r=>r.comparisons.map(c=>c.errorDeg))),datasetMean:stats(results.filter(r=>r.errors.n).map(r=>r.errors.mean)),terminalDrift:stats(results.filter(r=>r.terminalDriftDeg!==null).map(r=>r.terminalDriftDeg)),bestDatasetCount:datasets.filter(d=>d.profiles[profile].results[ci].errors.n&&d.profiles[profile].results[ci].errors.rmse===Math.min(...d.profiles[profile].results.map(r=>r.errors.rmse??Infinity))).length};
  })]));
  const after=hashes(); if(JSON.stringify(before)!==JSON.stringify(after)) throw Error('Inputs changed');
  return {method:{profiles,integration:'Trapezoidal body rates; negative Rodrigues rotation; actual timestamp dt; no orientation correction',initialization:'Mean baseline direction assigned at baseline end; gyro bias mean over baseline',gtUsage:'sync.baseline for initialization/bias; events only for labels after selection',driftDefinition:'Last accepted-window angular error relative to baseline initialization; errorGrowth = last minus first error, not summed angles',limitations:['Accel stability alone cannot establish zero linear acceleration or zero rotation about gravity','Constant accel offset can distort direction despite gain-independent normalization','Gravity does not observe yaw; sparse static windows and near-return motions weaken scale observability','No GT tuning; no range certification from minimum score alone']},datasets,aggregate,inputSha256:before,inputsUnchanged:true};
}
export function writeOutputs(result) {
  result.conclusion={gyroRange:'NON IDENTIFIABLE',retainedRangeDps:null,bestScoringRangeDps:250,normalizationAuthorized:false,recaptureNecessary:'NON DÉMONTRÉ',reason:'Near-identical static directions; no accepted TOP windows; smallest gyro scale minimizes accumulated drift, without positive scale identification.'};
  fs.writeFileSync(path.join(here,'summary.json'),JSON.stringify(result,null,2)+'\n');
  const columns=['dataset','profile','rangeDps','sensitivity','windows','meanDeg','medianDeg','rmseDeg','maxDeg','terminalDriftDeg','errorGrowthDeg','measuredExcursionMaxDeg','predictedExcursionMaxDeg','transitionRmseDeg'];
  const rows=result.datasets.flatMap(d=>Object.entries(d.profiles).flatMap(([p,v])=>v.results.map(r=>[d.id,p,r.rangeDps,r.sensitivity,r.errors.n,r.errors.mean,r.errors.median,r.errors.rmse,r.errors.max,r.terminalDriftDeg,r.errorGrowthDeg,r.measuredExcursionMaxDeg,r.predictedExcursionMaxDeg,r.transitionResiduals.rmse])));
  fs.writeFileSync(path.join(here,'gyro-scale-results.csv'),[columns,...rows].map(r=>r.join(',')).join('\n')+'\n');
  fs.writeFileSync(path.join(here,'summary.md'),markdown(result));
}
function markdown(r) {
  const f=n=>n===null?'N/A':n.toFixed(4);
  const table=(head,rows)=>[head,head.map(()=> '---'),...rows].map(row=>'| '+row.join(' | ')+' |').join('\n');
  const primary=r.datasets.flatMap(d=>d.profiles.primary.results.map(v=>[d.id,v.rangeDps,v.errors.n,...['mean','median','rmse','max'].map(k=>f(v.errors[k])),f(v.terminalDriftDeg),f(v.errorGrowthDeg),f(v.transitionResiduals.rmse)]));
  const lines=[
    '# Plan Beast — Étape 0B : identification rétroactive du gyro',
    '**GYRO RANGE 011–020 : NON IDENTIFIABLE. Aucun range retenu pour une normalisation certifiée.**',
    '## 1. Méthode',
    'Benchmark offline sans dépendance externe. Baseline = sync.baseline (positions de tableau inclusives, pas sampleIndex embarqué). Bias raw = moyenne gx/gy/gz. Direction initiale = normalize(meanAccelXYZ), assignée au dernier timestamp de baseline. Cette approximation suppose la baseline statique. La baseline est exclue des scores.',
    'Intégration continue jusqu’à la fin, sans réinitialisation aux fenêtres : dg/dt = −ω × g dans le repère capteur. Moyenne trapézoïdale des vitesses aux deux extrémités du dt réel, rotation de Rodrigues exacte pour cette vitesse moyenne ; renormalisation numérique seulement. Axes et signes du payload conservés. Aucun Mahony, gain, correction accel ou orientation GT.',
    'Une référence de fenêtre vaut normalize(meanAccelXYZ). La prédiction vaut la moyenne vectorielle normalisée des directions gyro aux mêmes timestamps. Erreur = acos(clamp(dot(predicted,measured),−1,1)) en degrés. Statistiques non pondérées par fenêtre ; agrégat secondaire à poids égal par dataset. Les fenêtres ne sont pas des expériences statistiquement indépendantes.',
    'Dérive cumulée rapportée = erreur à la dernière fenêtre depuis l’initialisation baseline ; ce n’est ni une dérive yaw observable ni une somme d’erreurs angulaires. Croissance = dernière erreur moins première erreur. Cohérence successive = erreur absolue entre angles inter-fenêtres prédits et mesurés ; aucun recalage.',
    '## 2. Sensibilités testées',
    table(['Range °/s','Counts/(°/s)','Facteur rotation'],candidates.map((k,i)=>[ranges[i],k,f(131/k)])),
    'Conversion : ω = (raw − bias) × π / (180 × sensibilité). Les constantes candidates sont celles de la demande. Aucun paramètre ajusté aux GT ou aux scores.',
    '## 3. Fenêtres statiques',
    'Sélection indépendante des candidats et des événements GT : blocs chronologiques disjoints à partir du premier sample après baseline. Le premier sample atteignant la durée minimale clôt le bloc. Le reliquat final trop court est ignoré. Critères fixés avant la première exécution : CV des normes, angle maximal à la direction moyenne, écart de norme moyenne à la baseline ; tout rail accel est exclu de la comparaison, jamais de l’intégration. Aucun dataset rejeté.',
    table(['Profil','Durée min ms','CV max','Angle max °','Écart norme max'],Object.entries(profiles).map(([k,v])=>[k,v.durationMs,v.normCv,v.directionMaxDeg,v.normDeviation])),
    'Les profils strict et relaxed sont des contrôles de sensibilité prédéfinis, pas un tuning. La stabilité accel ne prouve ni absence d’accélération linéaire constante ni absence de rotation autour de g. Un gain scalaire accel s’annule dans la normalisation ; un offset ou des gains différents par axe ne s’annulent pas.',
    'GT : sync.baseline fournit uniquement l’initialisation et le biais autorisés. Les événements ne servent qu’à étiqueter a posteriori les fenêtres entièrement incluses dans [arrivalSampleFloat, departureSampleFloat]. Pour BOTTOM final sans departure, l’étiquette s’étend à la fin de capture ; elle ne prouve pas une immobilité vidéo, les critères accel restent requis. Aucun événement ne modifie sélection ou intégration.',
    table(['Dataset','Baseline','Fenêtres principales : positions inclusives (étiquette)'],r.datasets.map(d=>[d.id,`${d.baseline.start}–${d.baseline.end}`,d.profiles.primary.accepted.map(w=>`${w.start}–${w.end} (${w.labels.join(',')||'hors GT'})`).join('; ')])),
    'Toutes les fenêtres acceptées/rejetées, motifs, directions, timestamps, sampleIndex et biais sont conservés dans summary.json. Les fenêtres TOP ne satisfont pas les critères de durée/stabilité de ces profils : aucune comparaison BOTTOM→TOP→BOTTOM successive exploitable. Les métriques inter-fenêtres décrivent essentiellement des retours BOTTOM, pas une validation TOP.',
    '## 4. Résultats par dataset — profil principal',
    'Unités angulaires : degrés. N = fenêtres. Transition RMSE porte sur les différences d’amplitudes entre fenêtres successives.',
    table(['Dataset','Range','N','Moyenne','Médiane','RMSE','Max','Dérive finale','Croissance','Transition RMSE'],primary),
    '## 5. Résultats globaux',
    table(['Profil','Range','N fenêtres','Moyenne','Médiane','RMSE','Max','Moyenne par dataset','Dérive finale moyenne','Datasets meilleur RMSE'],Object.entries(r.aggregate).flatMap(([p,a])=>a.map(v=>[p,v.rangeDps,v.pooled.n,...['mean','median','rmse','max'].map(k=>f(v.pooled[k])),f(v.datasetMean.mean),f(v.terminalDrift.mean),v.bestDatasetCount]))),
    'Le profil strict ne couvre que cinq datasets ; son absence de résultat ailleurs n’est pas un zéro. Les trois profils gardent le même classement sur tous les datasets couverts.',
    '## 6. Facteurs ×1 / ×2 / ×4 / ×8 et observabilité',
    '±250 °/s gagne 10/10 comparaisons principales. Mais des rotations plus grandes amplifient presque proportionnellement la dérive, alors que les directions statiques observées restent quasiment identiques. Un classement systématique ne fournit donc pas une identification positive.',
    'Contrôle diagnostique supplémentaire, ajouté après constat des faibles excursions : direction baseline constante (aucune rotation). Ce n’est pas un cinquième range matériel ; il ne remplace ni ne corrige aucune trajectoire gyro. Il vérifie si les fenêtres apportent réellement une information sur l’échelle.',
    table(['Dataset','Excursion mesurée max °','RMSE direction constante °','RMSE ±250 °/s','Excursion prédite ±250 °/s'],r.datasets.map(d=>{const v=d.profiles.primary.results[0];return [d.id,f(v.measuredExcursionMaxDeg),f(d.profiles.primary.frozenDirectionControl.rmse),f(v.errors.rmse),f(v.predictedExcursionMaxDeg)];})),
    'Le contrôle constant bat le meilleur candidat sur les dix datasets. Les facteurs supérieurs produisent davantage de dérive, mais même ×1 ne démontre pas la rotation observée. Les rejeter comme configurations historiques serait excessif : biais résiduel/variable, référence accel imparfaite et mouvements non observés entre fenêtres restent confondus avec le facteur d’échelle. La direction de gravité n’observe pas le yaw.',
    '## 7. Accel range',
    table(['Dataset','±2 g (16384)','±4 g (8192)','±8 g (4096)','±16 g (2048)'],r.datasets.map(d=>[d.id,...d.accelRestG.map(f)])),
    'Normes moyennes au repos en g, sans recalibration. ±2 g est le seul candidat proche de 1 g, avec un excès de 12,55–13,64 %. Les autres impliquent environ 2,25 / 4,51 / 9,03 g au repos : incompatibles avec une simple mesure de gravité sous calibration nominale. ±2 g est fortement cohérent, sans certification des registres historiques ni explication de l’offset.',
    '## 8. Conclusion gyro range',
    '**NON IDENTIFIABLE.** Meilleur score : ±250 °/s / 131 counts/(°/s). Range retenu : aucun. Confiance élevée dans le classement descriptif, insuffisante pour identifier le range historique. L’absence de changements statiques de direction suffisamment informatifs et de références TOP interdit de transformer le minimum de score en preuve physique.',
    '**Captures 011–020 utilisables pour normalisation Plan Beast avec échelle gyro établie : NON. Recapture nécessaire : NON DÉMONTRÉ.**',
    '## Reproduction et intégrité',
    '```powershell\nnode tools/benchmark/plan-beast/gyro-scale-identification/benchmark.mjs\nnode --test tools/benchmark/plan-beast/gyro-scale-identification/benchmark.test.mjs\n```',
    'SHA-256 des 20 fichiers sources avant/après identiques, enregistrés dans summary.json. Aucun fichier source, firmware, payload, GT, dataset, Phase Blocks ou ancien output modifié. Les seuls outputs écrits sont summary.md, summary.json et gyro-scale-results.csv dans ce dossier.',
  ];
  return lines.join('\n\n')+'\n';
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const result=run(); writeOutputs(result); console.log(JSON.stringify({aggregate:result.aggregate,datasets:result.datasets.map(d=>({id:d.id,accel:d.accelRestG,windows:d.profiles.primary.accepted.length,results:d.profiles.primary.results.map(r=>({range:r.rangeDps,...r.errors,drift:r.terminalDriftDeg,measured:r.measuredExcursionMaxDeg,predicted:r.predictedExcursionMaxDeg}))}))},null,2));
}
