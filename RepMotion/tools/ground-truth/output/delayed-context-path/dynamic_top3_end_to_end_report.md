# Dynamic Top-3 End-to-End

## 1. Executive summary

Pool=55, GT disponibles=11/11, best généré=7/11, final=6/11, full GT structurally valid=true. Verdict: **PROMOTION_SOLVED_BOTH_RECONSTRUCTION_AND_SELECTION_LIMIT**.

## 2. Conditions expérimentales

Replay dédié de `DYNAMIC_WEIGHTED_PROMOTION` Top-3 avec capacité conditionnelle couplée et Système B final inchangés. Aucun tuning, oracle décisionnel, ML ou MHT.

## 3. Ground Truth leakage audit

| function | phase | diagnosticOnly | gtRead | decisionInfluence |
| --- | --- | --- | --- | --- |
| buildInjectedCandidatePool | BEFORE | pool construction only | annotations projected to type/index/value | candidate presence intentionally neutralizes RAW absence; no GT label retained |
| neutral candidateId remapping | BEFORE | NO | NO | all IDs become EXPERIMENTAL_type_index; injected origin invisible to tie-break |
| features / compare / dynamic score / Top-3 | DURING | NO | NO | signal, type, index and current population only |
| conditional repair discovery / validPrefix | DURING | NO | NO | all pool candidates treated identically |
| System B selection | DURING | NO | NO | existing normalized scores and synergies only |
| exactCount / GT tables / bestGenerated diagnostic | AFTER EACH COMPLETED DECISION OR AFTER RUN | YES | YES | NONE; operates on stored immutable traces |
| full GT structural test | AFTER RUN | YES | YES | NONE |

GROUND_TRUTH_USED_FOR_DECISION = NO.

## 4. Pool expérimental

55 candidats ordinaires: 46 détectés + 9 pivots ajoutés pour neutraliser RAW. Tous portent un ID neutre. GT diagnostiques: BOTTOM:169, TOP:199, BOTTOM:262, TOP:291, BOTTOM:353, TOP:383, BOTTOM:445, TOP:474, BOTTOM:529, TOP:558, BOTTOM:611.

## 5. Dynamic Top-3

Poids ZERO=1, JERK=0.25, AMPLITUDE=1/9, TEMPORAL=1, SHAPE=1; activation historique inchangée; normalisation `2*(x-min)/(max-min)-1`; confiance `range/(range+MAD)`; Top-3 déterministe par position/cycle; aucun veto WORSE/CONFLICT.

## 6. État initial

BOTTOM:169|TOP:195|BOTTOM:228|TOP:291|BOTTOM:299|TOP:333|BOTTOM:391|TOP:467|BOTTOM:500|TOP:509|BOTTOM:564; GT=2/11; corrects=0:BOTTOM:169, 3:TOP:291.

## 7. Trace cycle par cycle

| decision | activeBefore | activeBeforeGt | correctBefore | falseBefore | candidatesEvaluatedCumulative | dynamicPromoted | promisingSize | conditionalAddedOrSeen | gtAvailableCumulative | generatedThisCycle | validThisCycle | uniqueValidPaths | bestGeneratedPath | bestGeneratedGt | bestGeneratedGtPivots | actualSelectedPath | selectedGt | selectionReason | decisionEffect | backtracking | restoredOrAppliedState |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D1 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 2/11 | 0:BOTTOM:169, 3:TOP:291 | 1:TOP:195, 2:BOTTOM:228, 4:BOTTOM:299, 5:TOP:333, 6:BOTTOM:391, 7:TOP:467, 8:BOTTOM:500, 9:TOP:509, 10:BOTTOM:564 | 79 | 1:TOP:179[score=0.8054607508532422,rank=1/2] ; 1:TOP:199[score=-0.41638225255972666,rank=2/2] ; 2:BOTTOM:530[score=0.8406371489349554,rank=1/24] ; 2:BOTTOM:529[score=0.8314579846786538,rank=2/24] ; 2:BOTTOM:353[score=0.7391508136198776,rank=3/24] | 5 | 23 | 3 | 322 | 7 | 3 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 3/11 | 0:BOTTOM:169, 1:TOP:199, 3:TOP:291 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 2/11 | DYNAMIC_WEIGHTED_PROMOTION_SCORE_TIE | NEUTRAL | false | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 |
| D2 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 2/11 | 0:BOTTOM:169, 3:TOP:291 | 1:TOP:195, 2:BOTTOM:228, 4:BOTTOM:299, 5:TOP:333, 6:BOTTOM:391, 7:TOP:467, 8:BOTTOM:500, 9:TOP:509, 10:BOTTOM:564 | 211 | 1:TOP:179[score=0.805460750853244,rank=1/2] ; 1:TOP:199[score=-0.4163822525597319,rank=2/2] ; 2:BOTTOM:243[score=-0.5,rank=1/1] ; 3:TOP:265[score=0.7456201822004207,rank=1/2] ; 3:TOP:236[score=-0.236860546601262,rank=2/2] ; 4:BOTTOM:530[score=0.8680427619303325,rank=1/20] ; 4:BOTTOM:529[score=0.8598142005103883,rank=2/20] ; 4:BOTTOM:353[score=0.7515916133364602,rank=3/20] | 11 | 20 | 4 | 888 | 65 | 15 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 3/11 | 0:BOTTOM:169, 1:TOP:199, 3:TOP:291 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 2/11 | DYNAMIC_WEIGHTED_PROMOTION_SCORE_TIE | NEUTRAL | false | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 |
| D3 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 2/11 | 0:BOTTOM:169, 3:TOP:291 | 1:TOP:195, 2:BOTTOM:228, 4:BOTTOM:299, 5:TOP:333, 6:BOTTOM:391, 7:TOP:467, 8:BOTTOM:500, 9:TOP:509, 10:BOTTOM:564 | 396 | 1:TOP:179[score=0.7941381863179202,rank=1/2] ; 1:TOP:199[score=-0.4256585881410075,rank=2/2] ; 2:BOTTOM:243[score=-0.5740740740740741,rank=1/1] ; 3:TOP:265[score=0.704268848623552,rank=1/2] ; 3:TOP:236[score=-0.20658131592851448,rank=2/2] ; 4:BOTTOM:321[score=0.8415637860082303,rank=1/1] ; 5:TOP:345[score=0.8298054131796442,rank=1/5] ; 5:TOP:365[score=0.5812368423234644,rank=2/5] ; 5:TOP:383[score=0.5685157814492106,rank=3/5] ; 6:BOTTOM:530[score=0.9546387283870766,rank=1/18] ; 6:BOTTOM:529[score=0.9422012220590196,rank=2/18] ; 6:BOTTOM:500[score=0.840100869300184,rank=3/18] | 18 | 15 | 5 | 1766 | 202 | 72 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 3/11 | 0:BOTTOM:169, 1:TOP:199, 3:TOP:291 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 2/11 | UNIQUE_DYNAMIC_WEIGHTED_PROMOTION_WINNER | NEUTRAL | true | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 |
| D4 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 2/11 | 0:BOTTOM:169, 3:TOP:291 | 1:TOP:195, 2:BOTTOM:228, 4:BOTTOM:299, 5:TOP:436, 6:BOTTOM:450, 7:TOP:467, 8:BOTTOM:500, 9:TOP:509, 10:BOTTOM:564 | 634 | 1:TOP:199[score=0.41568672230291576,rank=1/2] ; 1:TOP:179[score=-0.1033742949601415,rank=2/2] ; 2:BOTTOM:243[score=-1.1666666666666665,rank=1/1] ; 3:TOP:265[score=1.5130682566556577,rank=1/2] ; 3:TOP:236[score=-0.9963360316787886,rank=2/2] ; 4:BOTTOM:353[score=1.3569485171881355,rank=1/5] ; 4:BOTTOM:346[score=0.8827035563674954,rank=2/5] ; 4:BOTTOM:321[score=0.35875133620597244,rank=3/5] ; 5:TOP:383[score=1.2418377734940265,rank=1/8] ; 5:TOP:365[score=1.0539394894954301,rank=2/8] ; 5:TOP:345[score=0.9479122045264357,rank=3/8] ; 6:BOTTOM:445[score=0.1337448559670782,rank=1/1] ; 7:TOP:474[score=1.3004115226337447,rank=1/1] ; 8:BOTTOM:530[score=1.100667160526946,rank=1/9] ; 8:BOTTOM:529[score=1.0835607602715442,rank=2/9] ; 8:BOTTOM:511[score=0.5940843976073745,rank=3/9] | 24 | 21 | 8 | 2632 | 527 | 235 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:353\|TOP:383\|BOTTOM:445\|TOP:474\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 6/11 | 0:BOTTOM:169, 3:TOP:291, 4:BOTTOM:353, 5:TOP:383, 6:BOTTOM:445, 7:TOP:474 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:265\|BOTTOM:353\|TOP:383\|BOTTOM:445\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 4/11 | UNIQUE_DYNAMIC_WEIGHTED_PROMOTION_WINNER | IMPROVING | true | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:265\|BOTTOM:353\|TOP:383\|BOTTOM:445\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 |
| D5 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:265\|BOTTOM:353\|TOP:383\|BOTTOM:445\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 4/11 | 0:BOTTOM:169, 4:BOTTOM:353, 5:TOP:383, 6:BOTTOM:445 | 1:TOP:195, 2:BOTTOM:228, 3:TOP:265, 7:TOP:467, 8:BOTTOM:500, 9:TOP:509, 10:BOTTOM:564 | 925 | 1:TOP:179[score=-0.0065531025900492645,rank=1/2] ; 1:TOP:199[score=-0.12048434608316205,rank=2/2] ; 2:BOTTOM:243[score=0.47530864197530864,rank=1/1] ; 3:TOP:236[score=-0.013933291231063183,rank=1/5] ; 3:TOP:345[score=-0.10280048290643606,rank=2/5] ; 3:TOP:291[score=-0.14383121923868847,rank=3/5] ; 4:BOTTOM:346[score=1.4315882704833776,rank=1/3] ; 4:BOTTOM:321[score=-0.20890648858730237,rank=2/3] ; 4:BOTTOM:299[score=-0.656848533880113,rank=3/3] ; 5:TOP:365[score=1.1924844327702004,rank=1/5] ; 5:TOP:379[score=0.7225961768233586,rank=2/5] ; 5:TOP:436[score=-0.07153925475077161,rank=3/5] ; 6:BOTTOM:438[score=1.326911268274836,rank=1/4] ; 6:BOTTOM:426[score=0.7584645293547695,rank=2/4] ; 6:BOTTOM:450[score=0.598064944490698,rank=3/4] ; 7:TOP:474[score=-0.03292181069958844,rank=1/1] ; 9:TOP:535[score=1.4837725311965284,rank=1/3] ; 9:TOP:524[score=0.04146889199614845,rank=2/3] ; 9:TOP:555[score=-1.38586154659957,rank=3/3] ; 10:BOTTOM:609[score=1.503670572024993,rank=1/5] ; 10:BOTTOM:585[score=1.3886773086284712,rank=2/5] ; 10:BOTTOM:611[score=0.42182200985728546,rank=3/5] | 38 | 15 | 11 | 6685 | 1848 | 503 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:265\|BOTTOM:353\|TOP:383\|BOTTOM:445\|TOP:474\|BOTTOM:529\|TOP:555\|BOTTOM:611 | 7/11 | 0:BOTTOM:169, 4:BOTTOM:353, 5:TOP:383, 6:BOTTOM:445, 7:TOP:474, 8:BOTTOM:529, 10:BOTTOM:611 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:265\|BOTTOM:353\|TOP:383\|BOTTOM:445\|TOP:474\|BOTTOM:529\|TOP:555\|BOTTOM:585 | 6/11 | UNIQUE_DYNAMIC_WEIGHTED_PROMOTION_WINNER | IMPROVING | true | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:265\|BOTTOM:353\|TOP:383\|BOTTOM:445\|TOP:474\|BOTTOM:529\|TOP:555\|BOTTOM:585 |

## 8. Tableau des 11 GT

| gtPivot | position | pool | initialActive | normallyPromoted | conditional | firstAvailableCycle | usedInAnyReconstruction | usedInBestGeneratedPath | everSelectedIntoActivePath | finalActive | firstLossPoint |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BOTTOM:169 | 0 | true | true | false | false | 0 | true | true | true | true | FINAL_ACTIVE |
| TOP:199 | 1 | true | false | true | false | 1 | true | false | false | false | GENERATED_BUT_NOT_SELECTED |
| BOTTOM:262 | 2 | true | false | false | true | 5 | true | false | false | false | GENERATED_BUT_NOT_SELECTED |
| TOP:291 | 3 | true | true | true | false | 0 | true | false | true | false | SELECTED_THEN_LOST |
| BOTTOM:353 | 4 | true | false | true | false | 2 | true | true | true | true | FINAL_ACTIVE |
| TOP:383 | 5 | true | false | true | false | 3 | true | true | true | true | FINAL_ACTIVE |
| BOTTOM:445 | 6 | true | false | true | false | 4 | true | true | true | true | FINAL_ACTIVE |
| TOP:474 | 7 | true | false | true | false | 4 | true | true | true | true | FINAL_ACTIVE |
| BOTTOM:529 | 8 | true | false | true | false | 4 | true | true | true | true | FINAL_ACTIVE |
| TOP:558 | 9 | true | false | false | true | 5 | true | false | false | false | GENERATED_BUT_NOT_SELECTED |
| BOTTOM:611 | 10 | true | false | true | false | 5 | true | true | false | false | GENERATED_BUT_NOT_SELECTED |

## 9. Availability vs Generation vs Selection

| gtPivot | available | generated | selectedEver | final | loss |
| --- | --- | --- | --- | --- | --- |
| BOTTOM:169 | true | true | true | true | FINAL_ACTIVE |
| TOP:199 | true | true | false | false | GENERATED_BUT_NOT_SELECTED |
| BOTTOM:262 | true | true | false | false | GENERATED_BUT_NOT_SELECTED |
| TOP:291 | true | true | true | false | SELECTED_THEN_LOST |
| BOTTOM:353 | true | true | true | true | FINAL_ACTIVE |
| TOP:383 | true | true | true | true | FINAL_ACTIVE |
| BOTTOM:445 | true | true | true | true | FINAL_ACTIVE |
| TOP:474 | true | true | true | true | FINAL_ACTIVE |
| BOTTOM:529 | true | true | true | true | FINAL_ACTIVE |
| TOP:558 | true | true | false | false | GENERATED_BUT_NOT_SELECTED |
| BOTTOM:611 | true | true | false | false | GENERATED_BUT_NOT_SELECTED |

## 10. Best generated path par cycle / ActivePath réel

| decision | available | bestGenerated | selected | delta | effect |
| --- | --- | --- | --- | --- | --- |
| D1 | 3 | 3/11 | 2/11 | -1 | NEUTRAL |
| D2 | 4 | 3/11 | 2/11 | -1 | NEUTRAL |
| D3 | 5 | 3/11 | 2/11 | -1 | NEUTRAL |
| D4 | 8 | 6/11 | 4/11 | -2 | IMPROVING |
| D5 | 11 | 7/11 | 6/11 | -1 | IMPROVING |

## 11. GT non présents dans le meilleur chemin

| gtPivot | position | available | generatedSomewhere | reconstructionsUsingPivot | maxGtWithPivot | coexistsWithOtherMissing | exactCause | requiresMultipleSimultaneousReplacements |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TOP:199 | 1 | true | true | 145 | 6/11 | TOP:291 | GENERATED_SEPARATELY_BUT_NOT_IN_GLOBAL_BEST; max path containing pivot=6/11 | OUI |
| BOTTOM:262 | 2 | true | true | 4 | 6/11 | TOP:291 | GENERATED_SEPARATELY_BUT_NOT_IN_GLOBAL_BEST; max path containing pivot=6/11 | OUI |
| TOP:291 | 3 | true | true | 708 | 6/11 | TOP:199, BOTTOM:262 | GENERATED_SEPARATELY_BUT_NOT_IN_GLOBAL_BEST; max path containing pivot=6/11 | OUI |
| TOP:558 | 9 | true | true | 5 | 6/11 | aucun | GENERATED_SEPARATELY_BUT_NOT_IN_GLOBAL_BEST; max path containing pivot=6/11 | OUI |

## 12. Validation structurelle GT 11/11

| position | pivot | alternation | increasing | adjacentDistance | adjacentPass | bottomDistance | bottomPass |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | BOTTOM:169 | true | true |  | true |  | true |
| 1 | TOP:199 | true | true | 30 | true |  | true |
| 2 | BOTTOM:262 | true | true | 63 | true | 93 | true |
| 3 | TOP:291 | true | true | 29 | true |  | true |
| 4 | BOTTOM:353 | true | true | 62 | true | 91 | true |
| 5 | TOP:383 | true | true | 30 | true |  | true |
| 6 | BOTTOM:445 | true | true | 62 | true | 92 | true |
| 7 | TOP:474 | true | true | 29 | true |  | true |
| 8 | BOTTOM:529 | true | true | 55 | true | 84 | true |
| 9 | TOP:558 | true | true | 29 | true |  | true |
| 10 | BOTTOM:611 | true | true | 53 | true | 82 | true |

FULL_GT_STRUCTURALLY_VALID = YES.

## 13. Reconstruction/backtracking et sélection

| decision | generated | valid | backtracking | reason | effect | state |
| --- | --- | --- | --- | --- | --- | --- |
| D1 | 322 | 7 | false | DYNAMIC_WEIGHTED_PROMOTION_SCORE_TIE | NEUTRAL | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 |
| D2 | 888 | 65 | false | DYNAMIC_WEIGHTED_PROMOTION_SCORE_TIE | NEUTRAL | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 |
| D3 | 1766 | 202 | true | UNIQUE_DYNAMIC_WEIGHTED_PROMOTION_WINNER | NEUTRAL | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:436\|BOTTOM:450\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 |
| D4 | 2632 | 527 | true | UNIQUE_DYNAMIC_WEIGHTED_PROMOTION_WINNER | IMPROVING | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:265\|BOTTOM:353\|TOP:383\|BOTTOM:445\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 |
| D5 | 6685 | 1848 | true | UNIQUE_DYNAMIC_WEIGHTED_PROMOTION_WINNER | IMPROVING | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:265\|BOTTOM:353\|TOP:383\|BOTTOM:445\|TOP:474\|BOTTOM:529\|TOP:555\|BOTTOM:585 |

## 14. Métriques globales

| poolTotal | realCandidates | gtInjected | diagnosticGtAvailable | promisingTotal | conditionalTotal | maxSimultaneousAlternatives | reconstructionsGenerated | validReconstructions | statesExamined | backtrackings | guardReached | bestGeneratedGt | finalActiveGt | improvingDecisions | neutralDecisions | degradingDecisions |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 55 | 46 | 9 | 11/11 | 38 | 84 | 122 | 12293 | 2649 | 50026 | 3 | NON | 7/11 | 6/11 | 2 | 1 | 0 |

## 15. Réponses Q1–Q11

| question | answer | proof |
| --- | --- | --- |
| Q1 11/11 disponibles | OUI | 11/11 identités+positions actives, promising ou conditionnelles |
| Q2 Décisions sans identité GT | OUI | IDs neutralisés; aucune lecture GT dans promotion, reconstruction ou sélection |
| Q3 Best réellement généré | 7/11 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:265\|BOTTOM:353\|TOP:383\|BOTTOM:445\|TOP:474\|BOTTOM:529\|TOP:555\|BOTTOM:611 |
| Q4 Pourquoi pas 11/11 | GÉNÉRATION LOCALE INSUFFISANTE | 4 pivots disponibles absents du meilleur chemin; fenêtres 2–4 et couplage 2 depuis un seul activePath |
| Q5 GT complète structurellement valide | OUI | validPrefix(GT)=true |
| Q6 GT non utilisés ensemble | TOP:199, BOTTOM:262, TOP:291, TOP:558 | table d’analyse des GT non générés |
| Q7 Cause par GT manquant | Voir tableau | TOP:199:GENERATED_SEPARATELY_BUT_NOT_IN_GLOBAL_BEST; max path containing pivot=6/11; BOTTOM:262:GENERATED_SEPARATELY_BUT_NOT_IN_GLOBAL_BEST; max path containing pivot=6/11; TOP:291:GENERATED_SEPARATELY_BUT_NOT_IN_GLOBAL_BEST; max path containing pivot=6/11; TOP:558:GENERATED_SEPARATELY_BUT_NOT_IN_GLOBAL_BEST; max path containing pivot=6/11 |
| Q8 Plafond principal | RECONSTRUCTION + SÉLECTION | disponible=11, généré=7, final=6 |
| Q9 GT perdus best→final | 1 | 7/11→6/11 |
| Q10 Sélecteur global | DÉGRADE LE PLAFOND DISPONIBLE | best=7/11, final=6/11 |
| Q11 Prochaine étape | AMÉLIORER/ÉTUDIER D’ABORD LA RECONSTRUCTION | GT 11/11 valide mais jamais générée |

## 16. Cause racine

Promotion atteint 11/11. La GT complète passe validPrefix mais n’est jamais énumérée; plafond généré=7/11. Le sélecteur termine à 6/11, soit 1 pivot(s) sous le meilleur chemin disponible.

## 17. Verdict

**PROMOTION_SOLVED_BOTH_RECONSTRUCTION_AND_SELECTION_LIMIT**

## 18. Prochaine expérience justifiée

Caractériser une reconstruction capable de composer plusieurs corrections disponibles au-delà d’une seule fenêtre locale, avant de reprendre les expériences de ranking final. Ne rien modifier ici.

## Validation

Expérience réellement exécutée, sans changement production, DP V1, DP V2, RAW detector, critères, Top-3, reconstruction, validation, backtracking ou sélection finale.

```powershell
$env:GROUND_TRUTH_VALIDATION_MODE='DYNAMIC_TOP3_END_TO_END'; npx tsx ../ground-truth/groundTruthValidationRunner.ts
```
