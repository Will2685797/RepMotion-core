# Delayed Context Path – Déclenchement et profondeur de révision

## 1. Question exacte

À quel moment l'alternative Ground Truth BOTTOM:262 devient-elle meilleure que le chemin actif BOTTOM:260, et quelle profondeur locale minimale permet de la récupérer ?

## 2. Objectif

Caractériser un signal relatif et une profondeur de révision, sans implémenter de backtracking permanent ni de règle de seuil.

## 3. Données et pool contrôlé

rowing_5reps_007.json; 46 candidats RAW + 9 injections Ground Truth individuelles = 55; parasites conservés; tolérance existante ±2 samples.

## 4. Cas BOTTOM:260 / BOTTOM:262

Actif: BOTTOM:169|TOP:199|BOTTOM:260|TOP:291|BOTTOM:353|TOP:383|BOTTOM:445|TOP:474|BOTTOM:529|TOP:558|BOTTOM:611.

Alternative GT: BOTTOM:169|TOP:199|BOTTOM:262|TOP:291|BOTTOM:353|TOP:383|BOTTOM:445|TOP:474|BOTTOM:529|TOP:558|BOTTOM:611. Les deux chaînes ne diffèrent qu'au pivot 3. B260 est déjà dans la tolérance ±2 de B262, mais seule B262 est la GT exacte.

## 5. Comparaison après 1 cycle

| Métrique | Actif B260 | Alternative B262 | Écart absolu | Écart relatif | Meilleur | Stable au stade suivant |
| --- | --- | --- | --- | --- | --- | --- |
| Temporal | — | — | — | — | NOT_COMPUTABLE | false |
| Shape | — | — | — | — | NOT_COMPUTABLE | false |

Durées actif (concentrique/excentrique/total): [{"concentric":30,"eccentric":61,"total":91}].

Durées alternative: [{"concentric":30,"eccentric":63,"total":93}].

Composantes Temporal actif/alternative: {"partialFullRepDurationCV":null,"partialBottomToTopDurationCV":null,"partialTopToBottomDurationCV":null,"status":"PARTIAL_TEMPORAL_FEATURE_UNAVAILABLE"} / {"partialFullRepDurationCV":null,"partialBottomToTopDurationCV":null,"partialTopToBottomDurationCV":null,"status":"PARTIAL_TEMPORAL_FEATURE_UNAVAILABLE"}.

Composantes Shape actif/alternative: null / null.

## 6. Comparaison après 2 cycles

| Métrique | Actif B260 | Alternative B262 | Écart absolu | Écart relatif | Meilleur | Stable au stade suivant |
| --- | --- | --- | --- | --- | --- | --- |
| Temporal | -0.011797696 | -0.011939573 | 0.00014187621 | 0.011882855 | BOTTOM:260 | true |
| Shape | 0.33333333 | -0.33333333 | 0.66666667 | 2.0000000 | BOTTOM:260 | true |

Durées actif (concentrique/excentrique/total): [{"concentric":30,"eccentric":61,"total":91},{"concentric":31,"eccentric":62,"total":93}].

Durées alternative: [{"concentric":30,"eccentric":63,"total":93},{"concentric":29,"eccentric":62,"total":91}].

Composantes Temporal actif/alternative: {"partialFullRepDurationCV":0.010869565217391304,"partialBottomToTopDurationCV":0.01639344262295082,"partialTopToBottomDurationCV":0.008130081300813009,"status":"AVAILABLE"} / {"partialFullRepDurationCV":0.010869565217391304,"partialBottomToTopDurationCV":0.01694915254237288,"partialTopToBottomDurationCV":0.008,"status":"AVAILABLE"}.

Composantes Shape actif/alternative: {"meanCycleCorrelation":0.804628262205427,"minCycleCorrelation":0.782613728950911,"cycleCorrelationStd":0.022014533254516078} / {"meanCycleCorrelation":0.8059984919958199,"minCycleCorrelation":0.7791554382651273,"cycleCorrelationStd":0.026843053730692457}.

## 7. Comparaison après 3 cycles

| Métrique | Actif B260 | Alternative B262 | Écart absolu | Écart relatif | Meilleur | Stable au stade suivant |
| --- | --- | --- | --- | --- | --- | --- |
| Temporal | -0.010686723 | -0.010775881 | 0.000089157795 | 0.0082738291 | BOTTOM:260 | false |
| Shape | 1.0000000 | -1.0000000 | 2.0000000 | 2.0000000 | BOTTOM:260 | true |

Durées actif (concentrique/excentrique/total): [{"concentric":30,"eccentric":61,"total":91},{"concentric":31,"eccentric":62,"total":93},{"concentric":30,"eccentric":62,"total":92}].

Durées alternative: [{"concentric":30,"eccentric":63,"total":93},{"concentric":29,"eccentric":62,"total":91},{"concentric":30,"eccentric":62,"total":92}].

Composantes Temporal actif/alternative: {"partialFullRepDurationCV":0.008874962836170935,"partialBottomToTopDurationCV":0.01554080837772632,"partialTopToBottomDurationCV":0.007644397634449162,"status":"AVAILABLE"} / {"partialFullRepDurationCV":0.008874962836170935,"partialBottomToTopDurationCV":0.015890040026663988,"partialTopToBottomDurationCV":0.0075626393709791176,"status":"AVAILABLE"}.

Composantes Shape actif/alternative: {"meanCycleCorrelation":0.6852853433490725,"minCycleCorrelation":0.6287885480933197,"cycleCorrelationStd":0.053704345358910395} / {"meanCycleCorrelation":0.6705712147561846,"minCycleCorrelation":0.5318136243428938,"cycleCorrelationStd":0.10331450134662153}.

## 8. Comparaison après 4 cycles

| Métrique | Actif B260 | Alternative B262 | Écart absolu | Écart relatif | Meilleur | Stable au stade suivant |
| --- | --- | --- | --- | --- | --- | --- |
| Temporal | -0.037148401 | -0.036383748 | 0.00076465239 | 0.020583723 | BOTTOM:262 | true |
| Shape | 0.33333333 | -0.33333333 | 0.66666667 | 2.0000000 | BOTTOM:260 | false |

Durées actif (concentrique/excentrique/total): [{"concentric":30,"eccentric":61,"total":91},{"concentric":31,"eccentric":62,"total":93},{"concentric":30,"eccentric":62,"total":92},{"concentric":29,"eccentric":55,"total":84}].

Durées alternative: [{"concentric":30,"eccentric":63,"total":93},{"concentric":29,"eccentric":62,"total":91},{"concentric":30,"eccentric":62,"total":92},{"concentric":29,"eccentric":55,"total":84}].

Composantes Temporal actif/alternative: {"partialFullRepDurationCV":0.03928371006591931,"partialBottomToTopDurationCV":0.023570226039551587,"partialTopToBottomDurationCV":0.04859126579037751,"status":"AVAILABLE"} / {"partialFullRepDurationCV":0.03928371006591931,"partialBottomToTopDurationCV":0.01694915254237288,"partialTopToBottomDurationCV":0.052918382127544204,"status":"AVAILABLE"}.

Composantes Shape actif/alternative: {"meanCycleCorrelation":0.6796754309024792,"minCycleCorrelation":0.6355652686523944,"cycleCorrelationStd":0.04413519386714472} / {"meanCycleCorrelation":0.6811298502602539,"minCycleCorrelation":0.5615902534459329,"cycleCorrelationStd":0.07161635946326964}.

## 9. Comparaison après 5 cycles

| Métrique | Actif B260 | Alternative B262 | Écart absolu | Écart relatif | Meilleur | Stable au stade suivant |
| --- | --- | --- | --- | --- | --- | --- |
| Temporal | -0.047099383 | -0.045949541 | 0.0011498415 | 0.024413090 | BOTTOM:262 | — |
| Shape | -0.33333333 | 0.33333333 | 0.66666667 | 2.0000000 | BOTTOM:262 | — |

Durées actif (concentrique/excentrique/total): [{"concentric":30,"eccentric":61,"total":91},{"concentric":31,"eccentric":62,"total":93},{"concentric":30,"eccentric":62,"total":92},{"concentric":29,"eccentric":55,"total":84},{"concentric":29,"eccentric":53,"total":82}].

Durées alternative: [{"concentric":30,"eccentric":63,"total":93},{"concentric":29,"eccentric":62,"total":91},{"concentric":30,"eccentric":62,"total":92},{"concentric":29,"eccentric":55,"total":84},{"concentric":29,"eccentric":53,"total":82}].

Composantes Temporal actif/alternative: {"partialFullRepDurationCV":0.050892406693221676,"partialBottomToTopDurationCV":0.02511179454210699,"partialTopToBottomDurationCV":0.06529394699559384,"status":"AVAILABLE"} / {"partialFullRepDurationCV":0.050892406693221676,"partialBottomToTopDurationCV":0.016663195529137267,"partialTopToBottomDurationCV":0.07029302153670414,"status":"AVAILABLE"}.

Composantes Shape actif/alternative: {"meanCycleCorrelation":0.6229322005910303,"minCycleCorrelation":0.5254607422269765,"cycleCorrelationStd":0.07170204838000231} / {"meanCycleCorrelation":0.6293649964149314,"minCycleCorrelation":0.5127806575493022,"cycleCorrelationStd":0.06501870282566592}.

## 10. Stabilité des écarts

Premier avantage Temporal B262: 4 cycle(s). Premier avantage Shape B262: 5 cycle(s). Première convergence: 5 cycle(s). Aucun seuil minimal d'écart n'est déduit de ce cas unique.

## 11. Test de révision d'un pivot

| Niveau | Candidats | Variantes | États | GT exacte | GT ±2 | Temporal meilleur | Shape meilleur | Pivots exacts | Pivots ±2 | Temps ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 ONE_PIVOT | 27 | 4 | 5 | true | true | -0.045949541 | 1.0263460 | 11 | 11 | 5.2173000 |
| 2 THREE_PIVOTS | 55 | 99 | 636 | true | true | -0.045949541 | 1.1384482 | 11 | 11 | 32.043100 |
| 3 ONE_CYCLE | 55 | 21 | 402 | true | true | -0.045949541 | 1.0241049 | 11 | 11 | 5.7992000 |
| 4 TWO_CYCLES | 55 | 295 | 24135 | true | true | -0.045949541 | 2.6316006 | 11 | 11 | 57.516600 |

## 12. Test de révision de trois pivots

Le niveau 2 révise T199-B260-T291; ses mesures figurent dans le tableau commun.

## 13. Test de révision d'un cycle

Le niveau 3 révise le segment initial B169-T199-B260 qui se termine au pivot ambigu.

## 14. Test de révision de deux cycles

Le niveau 4 révise B169-T199-B260-T291-B353. Il est mesuré pour comparaison même si un niveau inférieur récupère déjà la GT.

## 15. Cas supplémentaires

Les traces existantes contiennent aussi des évictions B228/B262 et des variantes T195/T199. Elles modifient plusieurs durées et ne constituent pas un remplacement local isolé aussi contrôlé que B260/B262. Elles ne sont pas utilisées pour prétendre à une généralisation; un seul cas principal exploitable est conclu ici.

## 16. Complexité

| Niveau | Candidats | Variantes | États | GT exacte | GT ±2 | Temporal meilleur | Shape meilleur | Pivots exacts | Pivots ±2 | Temps ms |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 ONE_PIVOT | 27 | 4 | 5 | true | true | -0.045949541 | 1.0263460 | 11 | 11 | 5.2173000 |
| 2 THREE_PIVOTS | 55 | 99 | 636 | true | true | -0.045949541 | 1.1384482 | 11 | 11 | 32.043100 |
| 3 ONE_CYCLE | 55 | 21 | 402 | true | true | -0.045949541 | 1.0241049 | 11 | 11 | 5.7992000 |
| 4 TWO_CYCLES | 55 | 295 | 24135 | true | true | -0.045949541 | 2.6316006 | 11 | 11 | 57.516600 |

Comparaison exhaustive précédente: arrêt à 300000 états. Cette expérience locale a exploré 25178 états de génération au total. La mémoire approximative cumulée des variantes matérialisées est 75.289 KiB.

## 17. Signal de révision observable

Le signal descriptif recherché est le basculement relatif B260→B262 dans Temporal et/ou Shape, accompagné de sa persistance au stade suivant. Les données permettent de discuter convergence et persistance, mais pas de figer un seuil d'écart à partir d'un seul cas.

## 18. Profondeur minimale observée

La première profondeur contenant une chaîne GT exacte ou équivalente ±2 est le niveau 1: **ONE_PIVOT_SUFFICIENT**. Comme B260 est lui-même à ±2, le rapport distingue explicitement récupération tolérante et récupération exacte.

## 19. Limites

Un cycle ne permet pas Temporal ou Shape inter-cycles. Le score Shape est la normalisation robuste existante appliquée uniquement à la paire contrôlée à chaque stade; ses composantes brutes sont fournies. Un seul dataset et un seul remplacement strictement isolé sont exploitables. Les niveaux locaux ne constituent pas un moteur de backtracking.

## 20. Verdict final

Déclenchement: **TEMPORAL_AND_SHAPE_CONVERGE**. Profondeur: **ONE_PIVOT_SUFFICIENT**.

## 21. Prochaine décision appuyée uniquement par les résultats

Tester le même signal relatif sur d'autres évictions annotées et distinguer explicitement l'objectif « GT exacte » de l'objectif « équivalente dans la tolérance » avant de définir une règle de déclenchement permanente.

## Validation finale

Aucune modification de DP V1, DP V2, `current_filters` ou du pipeline de production. Aucun moteur de backtracking complet, aucun score combiné, aucune modification de Temporal/Shape, aucun NMS et aucun gyroscope. Le code ajouté est un mode diagnostique opt-in du runner Ground Truth.

Commande (depuis `RepMotion/tools/calibration-runner`):

```powershell
$env:GROUND_TRUTH_VALIDATION_MODE='DELAYED_CONTEXT_TRIGGER_AND_DEPTH'; npx tsx ../ground-truth/groundTruthValidationRunner.ts
```

