# Expérience C — Mixed Progressive Scored Reconstruction

## 1. Executive summary

A preserved=true; T558+B611=true; B529+T558+B611=true; full suffix=true; B529 coverage=true; full GT composable=false; verdict=**MIXED_SCORED_RECONSTRUCTION_PRUNES_GT_BRANCH**.

## 2. État de référence A/B

| metric | a | b | c |
| --- | --- | --- | --- |
| Mixed hypotheses generated | 0 | 18442 | 5119 |
| Best generated GT path | 7/11 | 3/11 | 7/11 |
| Final ActivePath GT | 6/11 | 2/11 | 4/11 |
| Guard reached | NONE | MAX_SEGMENTS | NONE |

## 3. Architecture de C

Chaque conditional+repair valide est une racine indépendante. Extension vers la gauche, une position à la fois, active+promising seulement; validPrefix immédiat; score local déterministe; Top-3 par groupe frère; maximum quatre positions.

## 4. Isolation / préservation de A

| baselineSegmentsPreserved | baselineGtCompatibleSegmentsPreserved | baselineBestGtPathPreserved | aSegments | aGtSegments | unionSegments |
| --- | --- | --- | --- | --- | --- |
| true | true | true | 648 | 15 | 999 |

## 5. Construction progressive

| depth | context | generated | rejected | valid | scored | survived | pruned | unique |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | D1 | 298 | 297 | 1 | 0 | 1 | 0 | 1 |
| 1 | D1 | 1 | 0 | 1 | 1 | 1 | 0 | 1 |
| 0 | D2 | 507 | 506 | 1 | 0 | 1 | 0 | 1 |
| 1 | D2 | 1 | 0 | 1 | 1 | 1 | 0 | 1 |
| 0 | D3 | 612 | 599 | 13 | 0 | 13 | 0 | 13 |
| 1 | D3 | 55 | 18 | 37 | 37 | 37 | 0 | 37 |
| 2 | D3 | 126 | 30 | 96 | 96 | 36 | 60 | 96 |
| 0 | D4 | 679 | 621 | 58 | 0 | 58 | 0 | 58 |
| 1 | D4 | 314 | 108 | 177 | 177 | 153 | 24 | 177 |
| 2 | D4 | 617 | 153 | 401 | 401 | 171 | 230 | 401 |
| 0 | D5 | 695 | 621 | 74 | 0 | 74 | 0 | 74 |
| 1 | D5 | 401 | 138 | 234 | 234 | 203 | 31 | 234 |
| 2 | D5 | 813 | 188 | 562 | 562 | 219 | 343 | 562 |

## 6. Scoring des mini-séquences

Formule réutilisée: contribution normalisée locale orientée [-1,1] × poids `1/characterizationRank` × confiance `range/(range+MAD)`. Somme sans veto absolu. Normalisation entre extensions sœurs et activePath.

## 7. Activation des critères

Critères identiques à `criteriaAtCycle`: D1 ZERO_PROXY; D2 +JERK_PROXY; D3 +AMPLITUDE_PROXY; D4 +TEMPORAL; D5 +SHAPE. Un critère null est exclu.

## 8. Top-K

K=3 fixé avant exécution; tie-break déterministe par signature de chemin, jamais par GT.

## 9. Trace T558+B611

| hypothesis | generated | structuralValid | sequenceScore | rank | survivedTop3 | activeCriteria | detailedContributions | eliminationReason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| T558+B611 | YES | YES | 1.9442012430136062 | 1 | YES | ZERO_PROXY,JERK_PROXY,AMPLITUDE_PROXY,TEMPORAL,SHAPE | {"activeCriteria":["ZERO_PROXY","JERK_PROXY","AMPLITUDE_PROXY","TEMPORAL","SHAPE"],"raw":{"ZERO_PROXY":1954.909090909091,"JERK_PROXY":2657.5386027900845,"AMPLITUDE_PROXY":[0.6820581435985208,1308,3882.4],"TEMPORAL":-0.47872147140186777,"SHAPE":[0.3927807346598736,0.09805961263591521,0.16073187761538604]},"normalized":{"ZERO_PROXY":0.775700934579439,"JERK_PROXY":0.21687152181457003,"AMPLITUDE_PROXY":-0.011833869351528303,"TEMPORAL":0.5054320109819606,"SHAPE":0.9965547484538408},"weights":{"ZERO_PROXY":1,"JERK_PROXY":0.25,"AMPLITUDE_PROXY":0.1111111111111111,"TEMPORAL":1,"SHAPE":1},"confidence":{"ZERO_PROXY":0.9469026548672566,"JERK_PROXY":0.7667430534322783,"AMPLITUDE_PROXY":0.7849781745955297,"TEMPORAL":0.8899631754984106,"SHAPE":0.7218199068102674},"contributions":{"ZERO_PROXY":0.7345132743362829,"JERK_PROXY":0.0415711832096521,"AMPLITUDE_PROXY":-0.0010321476846627412,"TEMPORAL":0.44981587749205315,"SHAPE":0.7193330556602809}} | SURVIVED |

## 10. Trace B529+T558+B611

| hypothesis | generated | structuralValid | sequenceScore | rank | survivedTop3 | activeCriteria | detailedContributions | eliminationReason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| B529+T558+B611 | YES | YES | 0.8927478409894615 | 3 | YES | ZERO_PROXY,JERK_PROXY,AMPLITUDE_PROXY,TEMPORAL,SHAPE | {"activeCriteria":["ZERO_PROXY","JERK_PROXY","AMPLITUDE_PROXY","TEMPORAL","SHAPE"],"raw":{"ZERO_PROXY":1855.2727272727273,"JERK_PROXY":2682.1529925623395,"AMPLITUDE_PROXY":[0.7963462774671899,2262,1733.6],"TEMPORAL":-0.4523052669585292,"SHAPE":[0.3395842350853274,-0.11967417909601218,0.296388497789311]},"normalized":{"ZERO_PROXY":0.9983746444534742,"JERK_PROXY":-1,"AMPLITUDE_PROXY":-0.3333333333333333,"TEMPORAL":1,"SHAPE":-1},"weights":{"ZERO_PROXY":1,"JERK_PROXY":0.25,"AMPLITUDE_PROXY":0.1111111111111111,"TEMPORAL":1,"SHAPE":1},"confidence":{"ZERO_PROXY":0.9469026548672566,"JERK_PROXY":0.7667430534322783,"AMPLITUDE_PROXY":0.7849781745955297,"TEMPORAL":0.8899631754984106,"SHAPE":0.7218199068102674},"contributions":{"ZERO_PROXY":0.9453636013851481,"JERK_PROXY":-0.19168576335806958,"AMPLITUDE_PROXY":-0.029073265725760356,"TEMPORAL":0.8899631754984106,"SHAPE":-0.7218199068102674}} | SURVIVED |

## 11. Trace T474+B529+T558+B611

| hypothesis | generated | structuralValid | sequenceScore | rank | survivedTop3 | activeCriteria | detailedContributions | eliminationReason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| T474+B529+T558+B611 | YES | YES | 0.6424412747064974 | 4 | NO | ZERO_PROXY,JERK_PROXY,AMPLITUDE_PROXY,TEMPORAL,SHAPE | {"activeCriteria":["ZERO_PROXY","JERK_PROXY","AMPLITUDE_PROXY","TEMPORAL","SHAPE"],"raw":{"ZERO_PROXY":1488.7272727272727,"JERK_PROXY":2682.1529925623395,"AMPLITUDE_PROXY":[0.9412606039906886,462,1733.6],"TEMPORAL":-0.43688837126412156,"SHAPE":[0.3395842350853274,-0.11967417909601218,0.296388497789311]},"normalized":{"ZERO_PROXY":0.9988469299509946,"JERK_PROXY":-1,"AMPLITUDE_PROXY":0.31218761183873484,"TEMPORAL":1,"SHAPE":-1},"weights":{"ZERO_PROXY":1,"JERK_PROXY":0.25,"AMPLITUDE_PROXY":0.1111111111111111,"TEMPORAL":1,"SHAPE":1},"confidence":{"ZERO_PROXY":0.8257557724351344,"JERK_PROXY":0.9944035534235288,"AMPLITUDE_PROXY":0.8086343683538894,"TEMPORAL":0.8771556786364713,"SHAPE":0.8389666484610294},"contributions":{"ZERO_PROXY":0.8248036181861461,"JERK_PROXY":-0.2486008883558822,"AMPLITUDE_PROXY":0.028049514700791613,"TEMPORAL":0.8771556786364713,"SHAPE":-0.8389666484610294}} | PRUNED_BY_TOP_K |

## 12. Extraction du segment

GT_MISSING_SEGMENT_NOW_GENERATED = NO; canonical full suffix=NONE; ID=NONE.

B529_GT_COMPATIBLE_SEGMENT_NOW_GENERATED = YES.

| id | positions | canonicalReplacement | dedupKey | provenance |
| --- | --- | --- | --- | --- |
| S0946 | 8-10 | BOTTOM:529 \| TOP:558 \| BOTTOM:611 | 8-10:BOTTOM:529\|TOP:558\|BOTTOM:611 | C |

## 13. Couverture GT

| position | gtPivot | aCoverage | aPlusCCoverage | delta | baseAlreadyGt |
| --- | --- | --- | --- | --- | --- |
| 0 | BOTTOM:169 | NO | NO | UNCHANGED | YES |
| 1 | TOP:199 | YES | YES | UNCHANGED | NO |
| 2 | BOTTOM:262 | YES | YES | UNCHANGED | NO |
| 3 | TOP:291 | YES | YES | UNCHANGED | YES |
| 4 | BOTTOM:353 | YES | YES | UNCHANGED | NO |
| 5 | TOP:383 | YES | YES | UNCHANGED | NO |
| 6 | BOTTOM:445 | YES | YES | UNCHANGED | NO |
| 7 | TOP:474 | YES | YES | UNCHANGED | NO |
| 8 | BOTTOM:529 | NO | YES | IMPROVED | NO |
| 9 | TOP:558 | YES | YES | UNCHANGED | NO |
| 10 | BOTTOM:611 | YES | YES | UNCHANGED | NO |

## 14. Oracle de composabilité

| population | composable | minimumSegments | ids | uncovered |
| --- | --- | --- | --- | --- |
| A | false | N/A | NONE | 8 |
| A+C | false | N/A | NONE | NONE |

## 15. Réduction du bruit

| cGenerated | cValid | cScored | cPruned | bNaiveGenerated | mixedGenerationReductionRatio |
| --- | --- | --- | --- | --- | --- |
| 5119 | 1840 | 1509 | 688 | 18442 | 0.7224270686476522 |

## 16. Coût combinatoire

| states | generated | valid | scored | prunedTopK | completeMixed | newSegments | newGtSegments | elapsedMs | guard | stateReductionRatio | runtimeRatioVsB |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 5119 | 5119 | 1840 | 1509 | 688 | 695 | 351 | 4 | 450.8918000000001 | NONE | 0.8579870165899128 | 5.634281144370928 |

## 17. Comparaison A/B/C

| metric | a | b | c |
| --- | --- | --- | --- |
| GT available after promotion | 11/11 | 5/11 (guarded) | 11/11 |
| Baseline preserved | REFERENCE | NO | YES |
| Mixed hypotheses generated | 0 | 18442 | 5119 |
| Valid mixed reconstructions | 0 | 32 | 1840 |
| Unique segments | 648 | 83 | 999 |
| GT-compatible segments | 15 | 2 | 19 |
| B529 GT-compatible coverage | NO | NO | YES |
| Full GT composable | NO | NO | NO |
| Best generated GT path | 7/11 | 3/11 | 7/11 |
| Final ActivePath GT | 6/11 | 2/11 | 4/11 |
| States | 50026 | 36046 | 5119 |
| Guard reached | NONE | MAX_SEGMENTS | NONE |
| Runtime ms | 326.23629999999997 | 80.0265 | 450.8918000000001 |

## 18. End-to-end

| system | bestGenerated | bestPath | finalActiveGt | finalPath |
| --- | --- | --- | --- | --- |
| A | 7 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:265\|BOTTOM:353\|TOP:383\|BOTTOM:445\|TOP:474\|BOTTOM:529\|TOP:555\|BOTTOM:611 | 6 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:265\|BOTTOM:353\|TOP:383\|BOTTOM:445\|TOP:474\|BOTTOM:529\|TOP:555\|BOTTOM:585 |
| C replay | 5 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:265\|BOTTOM:353\|TOP:383\|BOTTOM:445\|TOP:474\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 4 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:265\|BOTTOM:346\|TOP:383\|BOTTOM:445\|TOP:474\|BOTTOM:500\|TOP:509\|BOTTOM:564 |

## 19. Audit fuite GT

| phase | gtRead | detail |
| --- | --- | --- |
| extension | NO | identity-neutral candidates; GT read only in post-hoc trace matching, coverage and oracle |
| score | NO | identity-neutral candidates; GT read only in post-hoc trace matching, coverage and oracle |
| weights/K/tie-break | NO | identity-neutral candidates; GT read only in post-hoc trace matching, coverage and oracle |
| validPrefix | NO | identity-neutral candidates; GT read only in post-hoc trace matching, coverage and oracle |
| segment extraction | NO | identity-neutral candidates; GT read only in post-hoc trace matching, coverage and oracle |
| final selection | NO | identity-neutral candidates; GT read only in post-hoc trace matching, coverage and oracle |

GROUND_TRUTH_USED_FOR_DECISION = NO.

## 20. Réponses Q1-Q18

| question | answer |
| --- | --- |
| Q1 A entièrement préservée | OUI |
| Q2 Départ conditional+repair | OUI |
| Q3 T558+B611 créée | OUI |
| Q4 B529+T558+B611 créée | OUI |
| Q5 Score/rang | 0.8927478409894615 / rank 3 |
| Q6 Survit Top-3 | OUI |
| Q7 Full suffix créé | OUI |
| Q8 Full suffix validPrefix | YES |
| Q9 Segment canonique | NON |
| Q10 Couverture B529 | OUI — S0946:8-10:BOTTOM:529\|TOP:558\|BOTTOM:611 |
| Q11 Full GT composable | NON — COVERAGE_COMPLETE_BUT_NO_VALID_ORDERED_COMBINATION |
| Q12 Branches Top-K éliminées | 688 |
| Q13 Réduction vs 18442 | 0.7224270686476522 |
| Q14 Garde-fou | NONE |
| Q15 Critères éliminant branche GT | {"activeCriteria":["ZERO_PROXY","JERK_PROXY","AMPLITUDE_PROXY","TEMPORAL","SHAPE"],"raw":{"ZERO_PROXY":1488.7272727272727,"JERK_PROXY":2682.1529925623395,"AMPLITUDE_PROXY":[0.9412606039906886,462,1733.6],"TEMPORAL":-0.43688837126412156,"SHAPE":[0.3395842350853274,-0.11967417909601218,0.296388497789311]},"normalized":{"ZERO_PROXY":0.9988469299509946,"JERK_PROXY":-1,"AMPLITUDE_PROXY":0.31218761183873484,"TEMPORAL":1,"SHAPE":-1},"weights":{"ZERO_PROXY":1,"JERK_PROXY":0.25,"AMPLITUDE_PROXY":0.1111111111111111,"TEMPORAL":1,"SHAPE":1},"confidence":{"ZERO_PROXY":0.8257557724351344,"JERK_PROXY":0.9944035534235288,"AMPLITUDE_PROXY":0.8086343683538894,"TEMPORAL":0.8771556786364713,"SHAPE":0.8389666484610294},"contributions":{"ZERO_PROXY":0.8248036181861461,"JERK_PROXY":-0.2486008883558822,"AMPLITUDE_PROXY":0.028049514700791613,"TEMPORAL":0.8771556786364713,"SHAPE":-0.8389666484610294}} |
| Q16 Best generated >7/11 | NON — 7/11 |
| Q17 ActivePath final >6/11 | NON — 4/11 |
| Q18 Prochain problème composition/ranking | NON |

## 21. Verdict

**MIXED_SCORED_RECONSTRUCTION_PRUNES_GT_BRANCH**

## 22. Conséquence architecturale

Observation uniquement: le résultat distingue génération progressive, pruning, couverture, composabilité et sélection finale. Aucune modification supplémentaire n’est proposée.

## Reproduction

```powershell
$env:GROUND_TRUTH_VALIDATION_MODE='MIXED_PROGRESSIVE_SCORED_RECONSTRUCTION'; npx tsx ../ground-truth/groundTruthValidationRunner.ts
```
