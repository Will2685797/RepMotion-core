// Render the measured evidence; no production execution or source edits.
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
require(path.join(process.cwd(),'tools/calibration-runner/node_modules/tsx/dist/cjs/index.cjs'));
const {validatePath}=require(path.join(process.cwd(),'mobile/RepMotion/analytics/delayed-context-path/validation/validatePath.ts'));
const dir=__dirname,read=(id,suffix)=>JSON.parse(fs.readFileSync(path.join(dir,`${id}.${suffix}.json`),'utf8'));
const key=c=>`${c.type}:${c.index}`,orig=(k,start)=>k.split(':')[0][0]+(Number(k.split(':')[1])+start),yes=x=>x?'oui':'non';
const table=(headers,rows)=>['| '+headers.join(' | ')+' |','| '+headers.map(()=>'---').join(' | ')+' |',...rows.map(row=>'| '+row.map(x=>String(x??'—').replaceAll('|',' / ').replaceAll('\n',' ')).join(' | ')+' |')].join('\n');
const csv=(name,rows)=>{if(!rows.length)return;const headers=Object.keys(rows[0]),q=x=>'"'+String(x??'').replaceAll('"','""')+'"';fs.writeFileSync(path.join(dir,name),[headers.map(q).join(','),...rows.map(r=>headers.map(h=>q(typeof r[h]==='object'?JSON.stringify(r[h]):r[h])).join(','))].join('\n')+'\n');};
const classes=sys=>[...new Set(sys.observations.flatMap(o=>o.roles))].map(s=>({Active:'Ac',Promising:'P',Conditional:'Q',Repair:'R'})[s]).join('+')||'—';
const score=sys=>{const o=sys.observations.find(o=>o.score!==null);return o?`c${o.cycle} ${o.score.toFixed(4)}/${o.rank}`:'—';};
const repairs=sys=>{const a=sys.observations.filter(o=>o.repairs!==null);return a.length?a.map(o=>`c${o.cycle}:${o.repairs}`).join('; '):'non exécuté';};
const first=t=>t.firstLoss==='NONE'?'—':t.firstLoss==='FINAL_WINNER_SELECTION'?'Final':t.firstLoss==='C_PROMOTION_C5_LAST_REPAIR_NEIGHBOR_TRIAL'?'L009':t.firstLoss==='C_RECONSTRUCTION_C4_MAX_SEGMENTS'?'C4 guard':t.firstLoss==='D_GUARD'?'D guard':'UNKNOWN';
const cause=t=>t.firstLoss==='NONE'?'Winner':t.firstLoss==='FINAL_WINNER_SELECTION'?'Autre chemin classé premier':t.firstLoss==='C_PROMOTION_C5_LAST_REPAIR_NEIGHBOR_TRIAL'?'Zéro repair, dernière voie épuisée':t.firstLoss==='C_RECONSTRUCTION_C4_MAX_SEGMENTS'?'C5 jamais exécuté':t.firstLoss==='D_GUARD'?'Continuation valide encore en file':'B299−B262=37<45 ; ordre D';
const obligatory=t=>[t.label,`${t.inOraclePool?'oui':'non'} / ${t.source}`,yes(t.bootstrap),`${classes(t.systems.A)} / ${classes(t.systems.C)}`,`${score(t.systems.A)} ; ${score(t.systems.C)}`,t.systems.A.considered,t.systems.A.reconstructions,t.systems.A.segments,t.systems.C.considered,repairs(t.systems.C),t.systems.C.reconstructions,t.systems.C.segments,`${t.D.unionSegments} seg / ${t.D.paths} chemins`,first(t),cause(t)];
const headers=['Candidate','Pool / source','Bootstrap','Promotion class A / C','Promotion score/rank A ; C','A considered','A reconstruction','A segment','C considered','C repairs','C reconstruction','C segment','D','First loss','Exact reason'];
const data=['007','009','010'].map(id=>read(id,'lifecycle')),raw=Object.fromEntries(data.map(r=>[r.id,read(r.id,'trace2')]));
const lines=[
'# Audit runtime READ-ONLY — Delayed Context Path legacy — 007 / 009 / 010',
'',
'FACT — Trois exécutions sans instrumentation, puis deux passes instrumentées par dataset. Toutes les passes ont reproduit exactement les trajectoires, reconstructions ordonnées, Maps, segments, scores, classements, chemins D et provenances des runs sans instrumentation (SHA-256 et compteurs). Aucun changement des sources de production, Calibration, DP, scores, guards, GT ou tests. Seuls les scripts et résultats diagnostiques de ce dossier ont été créés. Les transformations TypeScript sont en mémoire. Aucun timeout n’a été déclenché.',
'',
'FACT — Le protocole est celui du harness historique : historical007Input sur les samples complets de 007, et sur les samples après offset 174 / 177 pour 009 / 010. Un seul appel Calibration et DP naturel, avant lecture GT. Puis augmentation oracle du pool, tri index/type/ID, IDs neutres EXPERIMENTAL_type_index, aucun recalcul du bootstrap. La GT définit les injections explicitement demandées par le protocole ; aucune annotation ni distance GT n’est passée aux fonctions de décision. Les évaluations et recherches de preuves sont postérieures aux décisions observées.',
'',
'## Définitions indispensables',
'',
'- Tous les résultats oracle sont mesurés à la position ordinale correcte. Une occurrence du même type:index à une autre position ne compte pas.',
'- NATURAL_POOL = membre du pool naturel admissible historique, sans appartenance oracle ; ORACLE_INJECTED = absent du pool naturel et ajouté ; BOTH = déjà naturel ET membre de l’ensemble oracle (pas une double insertion). Les 22 candidats des witnesses 009/010 sont ORACLE_INJECTED. Aucun n’est présenté comme naturellement détecté.',
'- Ac/P/Q/R = Active / Promising / Conditional / partenaire de repair. Ce sont des rôles cumulés, non une partition. Un candidat hors top 3 peut être R. Q et R n’ont aucun score/rang de catégorie ; seul le classement des substitutions directes valides possède un rang.',
'- considered = candidat explicitement parcouru comme option de reconstruction, cible/partenaire couplé, seed ou option d’extension ; la simple présence ambiante dans un Active ne suffit pas. Compteurs d’occurrences, incluant essais partiels et échecs. Les présences dans les reconstructions comptent, elles, toute la chaîne valide, même hors fenêtre.',
'- A/C segment = segment distinct extrait séparément de chaque audit ; C inclut les segments également produits par A, et ne signifie pas C-only. D = segments dans l’union puis nombre de chemins uniques D contenant le candidat.',
'- Les scores des tableaux principaux sont le PREMIER score direct réellement calculé à cette position, avec cycle et rang. Ils ne représentent ni un score permanent ni la meilleure admission ultérieure. Les chronologies complètes ci-dessous et promotion-timeline.csv donnent tous les scores/rangs/cycles.',
'- Une absence intermédiaire n’est pas une perte irréversible. Les pertes d’exploration sont séparées de FINAL_WINNER_SELECTION : un candidat présent dans D mais absent du winner n’était pas perdu avant cette sélection finale. UNKNOWN signifie que la première instruction irréversible n’est pas démontrée.',
'- best generated = maximum de récupération parmi les chemins réellement enregistrés dans D. Pour 007 : exact historique. Pour 009/010 : appartenance aux ensembles discrets windowOracle, comprenant leurs approximations de résolution. Ce maximum ne prouve pas une chaîne complètement compatible. Le meilleur représentant est le mieux classé au score combiné parmi ceux de récupération maximale.',
'',
'## 1. Populations et résultats',
'',table(['Dataset','RAW','Pool naturel','Options oracle','BOTH','Ajouts','Pool augmenté','Bootstrap compatible','Distance moyenne au witness','Best A / C / D','Winner compatible'],data.map(r=>[r.id,r.global.raw,r.global.naturalPool,r.global.oracleOptions,r.global.overlap,r.global.injected,r.global.pool,`${r.bootstrap.compatible}/11`,r.bootstrap.meanAbsWitness.toFixed(3),`${r.best.A.recovery} / ${r.best.C.recovery} / ${r.best.D.recovery}`,`${r.finalRecovery}/11`])),
'',
'FACT — La compatibilité discrète du winner 009 est 1/11, mais cela ne signifie pas un pivot dans une fenêtre continue GT : la discrétisation peut retenir des samples voisins d’une fenêtre sans entier. Les métriques de fenêtres continues et les witnesses exacts ne sont pas confondus ici.',
'',
'## 2. Statistiques globales de candidats distincts',
'',
'Chaque nombre ci-dessous compte des identités type:index uniques, à n’importe quelle position pour cette statistique globale. Les rôles se chevauchent. “Non retenus” = jamais Active, Promising, Conditional ni Repair dans ce run. Les tableaux oracle utilisent au contraire la position correcte.',
'',table(['Dataset/run','Évalués promotion distincts','Visites promotion','Active au moins une fois','Promising','Conditional','Repair','Non retenus','Considérés','En reconstruction','En segment'],data.flatMap(r=>['A','C'].map(s=>{const g=r.global[s];return [r.id+'/'+s,g.promotionEvaluatedDistinct,g.promotionVisits,g.activeEver,g.promising,g.conditional,g.repair,g.notRetainedAnyRole,g.considered,g.reconstructionCandidates,g.segmentCandidates];}))),
'',table(['Dataset','Candidats distincts union segments','Candidats distincts chemins D','Witness disponibles A / C','Oracle disponibles A / C'],data.map(r=>[r.id,r.global.DInputUnion,r.global.D,`${r.global.A.witnessAvailable} / ${r.global.C.witnessAvailable}`,`${r.global.A.oracleAvailable} / ${r.global.C.oracleAvailable}`])),
'',
'Un candidat du bootstrap peut atteindre D sans apparaître dans un segment (exemple B169). C’est pourquoi le nombre dans D peut dépasser celui des identités dans l’union des segments. Chaque Active final contient 11 pivots.',
'',
'## 3. Tableaux obligatoires des witnesses',
'',
'Les colonnes de classe regroupent les rôles observés sur tous les cycles ; les scores sont les premiers scores directs, pas des scores Conditional. Les raisons détaillées L009, C4 guard, D guard et UNKNOWN sont démontrées dans la section 5.',
];
const witnessTables=[];
for(const r of data){const section=['',`### ${r.id}`,'',table(headers,r.targets.filter(t=>t.witness).map(obligatory))];lines.push(...section);witnessTables.push(...section);}
lines.push('','## 4. Guards et qualité des segments','',table(['Dataset','A guard / cycle','C guard / cycle','A états / segments essayés','C états / segments essayés','Segments A / C / C-only / union','D chemins','D tentatives','D guard'],data.map(r=>[r.id,`${r.contexts.A.limit??'aucun'} / ${r.cycles.A.at(-1).cycle}`,`${r.contexts.C.limit??'aucun'} / ${r.cycles.C.at(-1).cycle}`,`${r.contexts.A.states} / ${r.contexts.A.segmentsReconstructed}`,`${r.contexts.C.states} / ${r.contexts.C.segmentsReconstructed}`,`${r.segments.A} / ${r.segments.C} / ${r.segments.COnly} / ${r.segments.union}`,r.histograms.D?Object.values(r.histograms.D).reduce((a,b)=>a+b,0):0,r.contexts.D.examined,r.contexts.D.guard])),
'',
'FACT — Aucun MAX_STATES, TIMEOUT ni progressiveGuard dans ces runs. 009 A atteint MAX_SEGMENTS au cycle 5, fenêtre start=6, longueur=4. 010 C atteint MAX_SEGMENTS au cycle 4, fenêtre start=1, longueur=4. Le bloc progressif C4 continue ensuite et produit encore 423 lignes valides ; il reste limité aux positions 0..8. Le cycle 5 n’est pas exécuté.',
'',
'## 5. Premières pertes : preuves et limites',
'',
'### 007 — B262 : blocage de composition prouvé, première instruction UNKNOWN',
'',
'FACT — B262 est rank 12 au cycle 1 (score 0.37077967389403776), mais reste accessible comme repair. Il devient ensuite Conditional (A cycle 5 ; C cycles 4/5), apparaît dans 4 reconstructions A, 56 C, 4 segments A et 12 C. Les 12 segments de l’union arrivent à D. Il subit 180 tentatives : 28 rejets structurels et 152 incompatibilités, aucun chemin D.',
'',
'FACT — Tous les segments portant B262 terminent à la position 3. Le bootstrap conserve B299 à la position 4 : 299−262=37<45. Pour chacun des 12 segments, la recherche exhaustive dans la liste des segments précédents constate zéro segment compatible modifiant la position 4. D impose des indices de segments croissants et une validité complète à chaque application. Cela exclut B262 même si le guard D n’intervenait pas. Le certificat est enregistré dans proof-certificates.json.',
'',
'INFERENCE — Le contexte extérieur à la portion extraite, notamment le BOTTOM de position 4 qui avait rendu les reconstructions locales valides, ne peut pas être rétabli à temps par D. Ce n’est PAS une perte définitive au rang 12, une absence de reconstruction, ou un D_GUARD. Catégorie factuelle : NOT_COMPOSED_BY_D. FIRST_LOSS_STAGE reste UNKNOWN : ce run ne localise pas la toute première instruction irréversible entre la fin de génération des alternatives, leur extraction et leur admission ordonnée dans D.',
'',
'### 009 — T527 et T528 : dernière voie de repair épuisée en promotion C5',
'',
'FACT — Au cycle 5 de A comme C, le suffixe courant est T507 B532 T554 B599. Remplacer T554 par T527 inverse l’ordre B532→T527. Aucune des 50 réparations directes à un voisin ne valide le préfixe. T527 est aussi essayé 48 fois comme partenaire d’autres cibles, sans succès. Même résultat pour T528. Aucun rôle Active/P/Q/R à la position 9, aucun segment A ou C antérieur, aucune présence dans le bootstrap.',
'',
'La substitution directe invalide n’est pas encore une perte irréversible : la recherche suivante pourrait introduire T527 comme partenaire. La DERNIÈRE tentative dans C5 est le repair de B560, position 10, par T527 à la position 9 (trace order 8807 ; T528 order 8808). Elle échoue. La seule substitution évaluée ensuite est B578, valide directement ; elle ne recherche aucun repair. B599 est l’Active et est ignoré. Il n’existe plus de cycle après C5, et la reconstruction ne lit pas RAW. FIRST_LOSS_STAGE = C_PROMOTION_C5_LAST_REPAIR_NEIGHBOR_TRIAL ; catégorie ZERO_ONE_NEIGHBOR_REPAIRS.',
'',
'FACT — Les recherches diagnostiques postérieures trouvent au minimum 2 autres positions à changer pour intégrer T527 dans l’Active A5, et 4 dans C5, en autorisant le pool complet et en exigeant une chaîne complète valide. Ces coûts sont distincts de repairs.length, qui compte seulement les réparations à UN voisin réellement testées.',
'',
'T449 et B501 ne sont jamais considérés par C (zéro repair dans ce contexte), mais survivent grâce à A : respectivement 30 et 4 segments A, puis 8 504 et 480 chemins D. Leur absence de C n’est donc pas une perte irréversible. B578 survit aussi au guard A et apparaît dans 7 792 chemins D.',
'',
'### 010 — T517 et B563 : MAX_SEGMENTS dans C4',
'',
'FACT — Dans A5, T517 a 106 trials de repair comme cible et 106 comme voisin, tous invalides ; B563 a 26 trials comme cible et 25 comme voisin, tous invalides. Aucun des deux n’entre dans une reconstruction ou un segment A. Le minimum diagnostique pour chacun est de 2 changements supplémentaires dans l’Active A5.',
'',
'FACT — Dans C, la position 9 et la position 10 ne sont jamais ouvertes : MAX_SEGMENTS se déclenche au cycle 4 à 20 001 tentatives. Les deux candidats sont hors du préfixe 0..8, absents du bootstrap et des segments A. La phase progressive restante ne peut pas les assigner et le guard supprime le cycle 5. FIRST_LOSS_STAGE = C_RECONSTRUCTION_C4_MAX_SEGMENTS ; catégorie MAX_SEGMENTS. Affirmer ZERO_ONE_NEIGHBOR_REPAIRS dans C serait faux : la recherche n’y a pas été exécutée.',
'',
'### 010 — T445 et B487 : D_GUARD démontré par une continuation en attente',
'',
'FACT — A conserve T445 comme repair malgré son rang direct 5, et B487 comme Conditional avec 5 repairs. T445 apparaît dans 14 reconstructions / 7 segments A ; B487 dans 10 / 5. Tous ces segments arrivent dans l’union D. Les tentatives observées sont structurellement invalides : 3 304 pour T445, 2 360 pour B487. Cela seul ne prouverait pas l’irréversibilité.',
'',
'Preuve supplémentaire prise après la boucle de recherche, sans aucune insertion : l’état réellement présent à queue[1223], issu de S2253, peut recevoir S2323 avec un index croissant, sans conflit d’assignments et avec validatePath=true. Le chemin serait B217 T291 B333 T365 B385 T403 B436 T445 B487 T531 B589. Il est absent de uniquePaths. Cette continuation est encore légale lorsque MAX_COMPOSITIONS arrête D. FIRST_LOSS_STAGE = D_GUARD. Les autres options oracle T446, B488 et B489 ont la même preuve de continuation disponible.',
'',
'## 6. Pourquoi 007 atteint 10/11',
'',
'FACT — Un unique chemin D atteint 10/11, au rang combiné 148 598 sur 200 001 : B169 T199 B228 T291 B353 T383 B445 T474 B529 T558 B611. Le winner est B169 T199 B243 T291 B346 T383 B438 T467 B511 T555 B611, soit 5/11. Le score final sélectionne un autre chemin ; il ne mesure pas la GT.',
'',
'Le chemin à 10/11 est construit par trois segments réellement disponibles : S0002=T199 (A+C), S0728=B353 T383 B445 T474 (A cycle 4), S0946=B529 T558 B611 (C cycle 5). B169 et T291 sont hérités du bootstrap. La seed T558+B611 est admissible ; C étend ensuite à gauche avec B529, déjà Promising depuis le cycle 4. Cette continuité locale existe dans 007.',
'',
'Dans 009, T527 ne possède aucune seed à un voisin. Il manque aussi dans tous les segments, ce qui interdit 11/11 avant D. Dans 010, C réintroduit T301/B348/T377/B418 que A n’avait jamais reconstruits, mais s’arrête avant T517/B563 ; deux autres witnesses (T445/B487) sont ensuite perdus au guard D. Ce sont des mécanismes distincts : aucune cause unique “C mauvais” n’est justifiée.',
'',
'## 7. Première différence observable et profondeur des corrections',
'',
'FACT — La première différence est déjà dans l’entrée : 007 a 2 pivots exacts du bootstrap, 009 et 010 en ont 0. L’écart moyen au witness est 29.818 / 30.545 / 44.273 samples. 009 n’est donc pas nettement plus éloigné en moyenne que 007 ; cette moyenne ne suffit pas à expliquer l’écart de résultat.',
'',
'FACT — Le sens des écarts diffère aussi : les 9 pivots non exacts de 007 sont tous avant leur cible ; les 11 pivots de 009 et les 11 de 010 sont tous après leur witness. Cela décrit les entrées mesurées ; aucune causalité indépendante de ce décalage n’est affirmée sans expérience supplémentaire.',
'',
'À la première promotion : 007 conserve B169 Active et admet T199 rang 2 ; 009 admet B190 rang 1 et T218 rang 2 (pas de faiblesse générale de promotion) ; 010 doit déjà passer par Conditional pour T221 (221−217=4<8) et B269 (avant T291 du bootstrap). Les dépendances structurelles apparaissent plus tôt dans 010. Dans 009, la divergence A/C devient concrète après le cycle 3 : A choisit T374/B423, C reste inchangé sur égalité. Au cycle 4, A peut alors admettre T449 et réparer B501 ; C ne le peut pas.',
'',
'Nombre MINIMAL de positions supplémentaires à changer pour intégrer chaque witness dans le bootstrap complet, pool augmenté libre, indépendamment des limites A/C. Ce diagnostic exhaustif par programmation dynamique est post-décision ; il ne modifie aucun chemin de production :',
'',table(['Position','007 candidat / changements supplémentaires','009 candidat / changements supplémentaires','010 candidat / changements supplémentaires'],Array.from({length:11},(_,p)=>[p,...data.map(r=>{const t=r.targets.find(t=>t.witness&&t.position===p),m=r.minRepair.find(m=>m.system==='BOOTSTRAP'&&m.position===p);return `${t.label} / ${m.additionalChanges}`;})])),
'',
'INFERENCE — Le facteur explicatif est la compatibilité des corrections avec les contextes effectivement atteints, puis leur disponibilité en segments composables, pas seulement le nombre de candidats RAW ni leur qualité isolée. Les minima ci-dessus sont globaux : “1 autre changement” peut porter sur un voisin non adjacent, et ne garantit donc pas une repair legacy.',
'',
'## 8. Comptabilité des pertes irréversibles',
'',
'Les cases comptent des witnesses à leur position correcte, une seule fois, au premier stade prouvé. “0 prouvé” ne transforme pas un UNKNOWN en preuve d’absence. A et C sont indépendants : il n’existe pas de transfert de l’Active A vers C.',
'',table(['Dataset','Avant A','Dans A','Entre A et C','Promotion C','Reconstruction/guard C','Après C avant D','D guard','UNKNOWN extraction/D','Sélection finale parmi survivants D','Winner'],data.map(r=>{const w=r.targets.filter(t=>t.witness);return [r.id,0,0,0,w.filter(t=>t.firstLoss==='C_PROMOTION_C5_LAST_REPAIR_NEIGHBOR_TRIAL').length,w.filter(t=>t.firstLoss==='C_RECONSTRUCTION_C4_MAX_SEGMENTS').length,0,w.filter(t=>t.firstLoss==='D_GUARD').length,w.filter(t=>t.firstLoss==='UNKNOWN').length,w.filter(t=>t.firstLoss==='FINAL_WINNER_SELECTION').length,w.filter(t=>t.firstLoss==='NONE').length];})),
'',
'Pour toutes les options oracle (pas seulement les witnesses) : 007 = 1 UNKNOWN, 5 exclusions finales, 5 winners ; 009 = 2 pertes d’admission C5, 16 exclusions finales, 1 winner ; 010 = 2 pertes au guard C4, 5 au guard D, 39 exclusions finales, 0 winner. Ces totaux portent respectivement sur 11, 19 et 46 candidats.',
'',
'UNKNOWN — Pour B262, la première instruction irréversible n’est pas identifiée malgré la preuve du blocage structurel D. Aucun effet causal de déduplication n’est attribué sans preuve. Le potentiel d’amélioration du nombre de pivots conjointement compatibles au-delà des populations D générées n’est pas mesuré par un changement de budgets.',
'',
'## 9. Toutes les options oracle — tableaux complets',
);
for(const r of data)lines.push('',`### ${r.id} — ${r.targets.length} candidats`,'',table(headers,r.targets.map(obligatory)));
lines.push('','## 10. Chronologie complète, candidat par candidat','',
'Les valeurs numériques complètes sont dans les CSV/JSON (pas d’arrondi décisionnel). “Hors préfixe” et “Active non évalué” ne signifient pas rejet. Available décrit les Maps au début de reconstruction ; considered désigne les parcours effectifs. repairs=— signifie fonction non exécutée pour cette cible/cycle, pas zéro.',
);
const targetCSV=[],timelineCSV=[],sourceCSV=[],minimumCSV=[],allPromotionCSV=[];
for(const r of data){const rr=raw[r.id];
 for(const c of rr.pool){const nat=rr.natural.some(n=>key(n)===key(c)),ora=r.targets.some(t=>t.candidate===key(c));sourceCSV.push({dataset:r.id,candidate:key(c),originalIndex:c.index+rr.start,source:nat?(ora?'BOTH':'NATURAL_POOL'):'ORACLE_INJECTED',inCalibrationRAW:rr.raw.some(n=>key(n)===key(c)),inNaturalPool:nat,inOracleOptions:ora,inAugmentedPool:true});}
 for(const pr of rr.trace.promotions)for(const v of pr.visits){const rank=pr.ranks.find(x=>x.position===v.position)?.rows.find(x=>x.candidate===v.candidate),rp=rr.trace.repairs.find(x=>x.system===pr.system&&x.cycle===pr.cycle&&x.position===v.position&&x.candidate===v.candidate);allPromotionCSV.push({dataset:r.id,system:pr.system,cycle:pr.cycle,position:v.position,candidate:v.candidate,originalCandidate:orig(v.candidate,rr.start),prefixValid:v.valid,score:rank?.score??null,rank:rank?.rank??null,promoted:rank?.promoted??false,repairs:rp?.count??null});}
 for(const t of r.targets){const A=t.systems.A,C=t.systems.C;targetCSV.push({dataset:r.id,position:t.position,candidate:t.label,localIdentity:t.candidate,source:t.source,witness:t.witness,candidatePool:t.inOraclePool,bootstrap:t.bootstrap,promotionEvaluatedA:A.observations.some(o=>o.evaluated),promotionEvaluatedC:C.observations.some(o=>o.evaluated),promotionClassA:classes(A),promotionClassC:classes(C),promotionScoresA:A.observations.map(o=>({cycle:o.cycle,score:o.score,rank:o.rank})),promotionScoresC:C.observations.map(o=>({cycle:o.cycle,score:o.score,rank:o.rank})),availableA:A.available,consideredA:A.considered,reconstructionA:A.reconstructions,segmentA:A.segments,availableC:C.available,consideredC:C.considered,directValidityA:A.observations.map(o=>[o.cycle,o.directValid]),directValidityC:C.observations.map(o=>[o.cycle,o.directValid]),repairsA:repairs(A),repairsC:repairs(C),reconstructionC:C.reconstructions,segmentC:C.segments,unionSegmentCount:t.D.unionSegments,reachesDInput:t.D.unionSegments>0||t.bootstrap,DPathCount:t.D.paths,inBestGenerated:t.inBest,inFinalWinner:t.inFinal,FIRST_LOSS_STAGE:t.firstLoss,category:t.category,EXACT_REASON:t.reason});
  lines.push('',`### ${r.id} / position ${t.position} / ${t.label}${t.witness?' — witness':''}`,'',`SOURCE=${t.source}. Bootstrap=${yes(t.bootstrap)}. Disponible A/C=${yes(A.available)}/${yes(C.available)}. Dans best D=${yes(t.inBest)} ; winner=${yes(t.inFinal)}. FIRST_LOSS_STAGE=${t.firstLoss}. ${t.reason}`,'');
  const rows=[];for(const s of ['A','C'])for(const o of t.systems[s].observations){const row={dataset:r.id,candidate:t.label,position:t.position,system:s,cycle:o.cycle,evaluated:o.evaluated,prefixOpen:o.prefixOpen,directValid:o.directValid,roles:o.roles.join('+'),score:o.score,rank:o.rank,promotedThisCycle:o.promoted,repairs:o.repairs,repairPartners:o.repairPartners.map(x=>`${x.position}:${orig(x.candidate,rr.start)}`).join('; ')};timelineCSV.push(row);rows.push([s,o.cycle,o.prefixOpen?yes(o.evaluated):'hors préfixe',o.directValid===null?'—':yes(o.directValid),o.roles.join('+')||'—',o.score===null?'—':o.score,o.rank??'—',yes(o.promoted),o.repairs??'—',row.repairPartners||'—']);}
  lines.push(table(['Run','Cycle','Évalué','Substitution directe valide','Rôles disponibles','Score','Rang','Top3 ce cycle','repairs.length','Partenaires'],rows));
 }
 for(const m of r.minRepair){const pool=new Map(rr.pool.map(c=>[key(c),c]));assert(m.path);assert(validatePath(m.path.map(k=>pool.get(k))));assert.equal(m.path[m.position],m.candidate);minimumCSV.push({dataset:r.id,...m,originalPath:m.path.map(k=>orig(k,rr.start)).join(' ')});}
}
const rr=raw['007'],targetSegments=rr.segments.map((s,i)=>({s,i})).filter(({s})=>s.start<=2&&s.end>=2&&key(s.replacements[2-s.start])==='BOTTOM:262');
assert.equal(targetSegments.length,12);
const certificate=targetSegments.map(({s,i})=>{assert.equal(s.end,3);const compatibleEarlier=rr.segments.slice(0,i).filter(a=>a.start<=4&&a.end>=4&&!a.replacements.some((c,j)=>{const p=a.start+j;return p>=s.start&&p<=s.end&&key(c)!==key(s.replacements[p-s.start]);}));assert.equal(compatibleEarlier.length,0);return {id:s.id,index:i,start:s.start,end:s.end,compatibleEarlierModifiersOfSlot4:compatibleEarlier.map(a=>a.id),baseBottomAtSlot4:299,bottomAtSlot2:262,gap:37,minimum:45};});
fs.writeFileSync(path.join(dir,'proof-certificates.json'),JSON.stringify({B262OrderedComposition:certificate,DQueuedContinuations:Object.fromEntries(data.map(r=>[r.id,r.dContinuation]))},null,2)+'\n');
csv('candidate-lifecycle.csv',targetCSV);csv('promotion-timeline.csv',timelineCSV);csv('pool-sources.csv',sourceCSV);csv('minimum-repairs-posthoc.csv',minimumCSV);csv('all-promotion-visits.csv',allPromotionCSV);
lines.push('','## 11. Fichiers et reproduction','',
'- audit.cjs : instrumentation en mémoire, exécution de référence, parité stricte, assertions de validité et manifests SHA-256 des sources.',
'- summarize.cjs : agrégats et recherche diagnostique exacte du minimum de corrections ; jamais appelée par la production.',
'- render.cjs : génération de ce rapport, CSV et vérification des certificats.',
'- *.baseline.json : runs non instrumentés ; *.trace.json puis *.trace2.json : observations, ordres, listes, compteurs et signatures de sorties.',
'- *.lifecycle.json : les 21 dimensions demandées, par candidat et cycle, et les preuves de continuation.',
'- candidate-lifecycle.csv : 76 candidats oracle ; pool-sources.csv : toutes les identités de tous les pools ; all-promotion-visits.csv : chaque substitution effectivement évaluée, même non oracle.',
'- promotion-timeline.csv : scores/rangs complets des candidats oracle, tous cycles ; minimum-repairs-posthoc.csv : certificats de corrections minimales des witnesses.',
'- proof-certificates.json : impossibilité ordonnée B262 et continuations valides interrompues dans D.',
'',
'Reproduction depuis la racine du workspace : `node tools/ground-truth/output/candidate-lifecycle-audit/audit.cjs 009 trace nouveau-label`. Les fichiers de run utilisent flag wx : ils ne sont jamais écrasés. Baseline et trace sont comparées ; toute variation des sorties décisionnelles échoue. Les étapes summarize/render ne touchent qu’aux artefacts de ce dossier.',
'',
'Code de décision vérifié : promotion/promoteCandidates.ts:54–158 ; system-c/buildConditionalAlternatives.ts:31–87 ; shared/reconstructLocalPaths.ts:65–163 et 238–368 ; shared/selectLocalReconstruction.ts:139–177 ; composition/system-d/extractSegments.ts:16–59 ; composeGlobalPaths.ts:58–133 et 171–192. Racine : mobile/RepMotion/analytics/delayed-context-path/. Entrées : tools/ground-truth/historical007Input.ts:11–35, historical007Injection.ts:12–91 et windowOracle.ts:7–31.',
);
fs.writeFileSync(path.join(dir,'REPORT.md'),lines.join('\n')+'\n');fs.writeFileSync(path.join(dir,'witness-tables.md'),witnessTables.join('\n')+'\n');
console.log(JSON.stringify({report:path.join(dir,'REPORT.md'),oracleCandidates:targetCSV.length,promotionTimeline:timelineCSV.length,allPromotionVisits:allPromotionCSV.length,poolRows:sourceCSV.length,proofs:'PASS',files:fs.readdirSync(dir)}));
