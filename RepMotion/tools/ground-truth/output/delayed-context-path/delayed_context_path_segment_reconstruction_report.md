# Delayed Context Path – Reconstruction locale par segments

## 1. Question exacte

Quelle règle non pondérée récupère le mieux la Ground Truth avec des segments locaux de 2 à 4 pivots ?

## 2. Hypothèse

Des pivots couplés peuvent être corrigés sans reconstruire toute la chaîne.

## 3. Architecture conservée

Pool de 55 candidats, une chaîne active DP V1 et une liste d'alternatives; configurations isolées.

## 4. Génération des segments

Fenêtres contiguës de 2, 3 ou 4 positions dans le préfixe disponible; produits cartésiens par type, puis alternance, ordre, phase ≥8 et B-B ≥45; reste de la chaîne inchangé.

## 5. Chronologie des critères

| cycle | criteria |
| --- | --- |
| 1 | ZERO_PROXY, JERK_PROXY |
| 2 | ZERO_PROXY, JERK_PROXY |
| 3 | ZERO_PROXY, JERK_PROXY, AMPLITUDE_PROXY |
| 4 | ZERO_PROXY, JERK_PROXY, AMPLITUDE_PROXY, TEMPORAL |
| 5 | ZERO_PROXY, JERK_PROXY, AMPLITUDE_PROXY, TEMPORAL, SHAPE |

## 6. Définition de la règle A

Pareto strict: au moins une amélioration, aucune dégradation/conflit; remplacement seulement par un dominateur unique.

## 7. Définition de la règle B

Chaque critère vote uniquement pour un segment qui domine tous les concurrents selon ses propres composantes. Conflit ou absence de meilleur unique: aucun vote. Maximum unique requis; égalité: aucun remplacement.

## 8. Définition de la règle C

`UNDEFINED_CONTEXTUAL_PRIORITY_RULE`: promotion, veto, support et confirmation ne définissent pas un ordre de décision complet sans arbitraire. A et B restent exécutées.

## 9. Résultats PARETO — segments 2 pivots

| rule | segmentLength | initialPath | finalPath | exactMatch | exactPivots | tolerantPivots | incorrectPivots | recoveredPivots | gtSegmentsGenerated | gtSegmentsPromoted | gtSegmentsChosen | generatedSegments | validSegments | promotions | replacements | conflicts | ties | noWinner | states | maxAlternatives | elapsedMs | approximateBytes | guardReached | guardReason | firstCause | verdict | decisions | allGenerated |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PARETO | 2 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false | 2 | 2 | 9 | 0 | 9 | 2 | 0 | 20001 | 338 | 12 | 0 | 3 | 0 | 5 | 20757 | 128 | 59.24509999999998 | 89600 | true | MAX_SEGMENTS | COMBINATORIAL_LIMIT_REACHED | COMBINATORIAL_LIMIT_REACHED |  |  |

| cycle | criteria | segments | promoted | chosen | decisionReason | activePath | promising |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | ZERO_PROXY, JERK_PROXY | 8 | 4 |  | MULTIPLE_NON_DOMINATED | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 4 |
| 2 | ZERO_PROXY, JERK_PROXY | 17 | 9 |  | MULTIPLE_NON_DOMINATED | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 9 |
| 3 | ZERO_PROXY, JERK_PROXY, AMPLITUDE_PROXY | 79 | 2 |  | MULTIPLE_NON_DOMINATED | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 11 |
| 4 | ZERO_PROXY, JERK_PROXY, AMPLITUDE_PROXY, TEMPORAL | 128 | 0 |  | NO_WINNER | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 11 |
| 5 | ZERO_PROXY, JERK_PROXY, AMPLITUDE_PROXY, TEMPORAL, SHAPE | 106 | 1 | 6:BOTTOM:391\|TOP:436 | UNIQUE_PARETO_DOMINATOR | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 12 |

## 10. Résultats PARETO — segments 3 pivots

| rule | segmentLength | initialPath | finalPath | exactMatch | exactPivots | tolerantPivots | incorrectPivots | recoveredPivots | gtSegmentsGenerated | gtSegmentsPromoted | gtSegmentsChosen | generatedSegments | validSegments | promotions | replacements | conflicts | ties | noWinner | states | maxAlternatives | elapsedMs | approximateBytes | guardReached | guardReason | firstCause | verdict | decisions | allGenerated |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PARETO | 3 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false | 2 | 2 | 9 | 0 | 0 | 0 | 0 | 20001 | 6 | 2 | 0 | 0 | 0 | 1 | 20770 | 6 | 12.139200000000017 | 2048 | true | MAX_SEGMENTS | COMBINATORIAL_LIMIT_REACHED | COMBINATORIAL_LIMIT_REACHED |  |  |

| cycle | criteria | segments | promoted | chosen | decisionReason | activePath | promising |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | ZERO_PROXY, JERK_PROXY | 6 | 2 | 0:BOTTOM:169\|TOP:179\|BOTTOM:228 | UNIQUE_PARETO_DOMINATOR | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 2 |

## 11. Résultats PARETO — segments 4 pivots

| rule | segmentLength | initialPath | finalPath | exactMatch | exactPivots | tolerantPivots | incorrectPivots | recoveredPivots | gtSegmentsGenerated | gtSegmentsPromoted | gtSegmentsChosen | generatedSegments | validSegments | promotions | replacements | conflicts | ties | noWinner | states | maxAlternatives | elapsedMs | approximateBytes | guardReached | guardReason | firstCause | verdict | decisions | allGenerated |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PARETO | 4 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false | 2 | 2 | 9 | 0 | 0 | 0 | 0 | 20001 | 16 | 11 | 0 | 1 | 0 | 2 | 20745 | 16 | 7.695699999999988 | 6912 | true | MAX_SEGMENTS | COMBINATORIAL_LIMIT_REACHED | COMBINATORIAL_LIMIT_REACHED |  |  |

| cycle | criteria | segments | promoted | chosen | decisionReason | activePath | promising |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | ZERO_PROXY, JERK_PROXY | 0 | 0 |  | NO_WINNER | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 0 |
| 2 | ZERO_PROXY, JERK_PROXY | 16 | 11 |  | MULTIPLE_NON_DOMINATED | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 11 |

## 12. Résultats VOTE — segments 2 pivots

| rule | segmentLength | initialPath | finalPath | exactMatch | exactPivots | tolerantPivots | incorrectPivots | recoveredPivots | gtSegmentsGenerated | gtSegmentsPromoted | gtSegmentsChosen | generatedSegments | validSegments | promotions | replacements | conflicts | ties | noWinner | states | maxAlternatives | elapsedMs | approximateBytes | guardReached | guardReason | firstCause | verdict | decisions | allGenerated |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VOTE | 2 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:265\|BOTTOM:321\|TOP:345\|BOTTOM:445\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false | 2 | 2 | 9 | 0 | 14 | 2 | 0 | 20001 | 301 | 4 | 2 | 0 | 2 | 3 | 20756 | 106 | 30.22210000000001 | 78080 | true | MAX_SEGMENTS | COMBINATORIAL_LIMIT_REACHED | COMBINATORIAL_LIMIT_REACHED |  |  |

| cycle | criteria | segments | promoted | chosen | decisionReason | activePath | promising |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | ZERO_PROXY, JERK_PROXY | 8 | 0 |  | NO_WINNER | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 0 |
| 2 | ZERO_PROXY, JERK_PROXY | 17 | 1 | 3:TOP:265\|BOTTOM:321 | UNIQUE_VOTE_WINNER_1 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:265\|BOTTOM:321\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 1 |
| 3 | ZERO_PROXY, JERK_PROXY, AMPLITUDE_PROXY | 70 | 1 | 5:TOP:345\|BOTTOM:445 | UNIQUE_VOTE_WINNER_1 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:265\|BOTTOM:321\|TOP:345\|BOTTOM:445\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 2 |
| 4 | ZERO_PROXY, JERK_PROXY, AMPLITUDE_PROXY, TEMPORAL | 106 | 2 |  | VOTE_TIE | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:265\|BOTTOM:321\|TOP:345\|BOTTOM:445\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 4 |
| 5 | ZERO_PROXY, JERK_PROXY, AMPLITUDE_PROXY, TEMPORAL, SHAPE | 100 | 2 |  | VOTE_TIE | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:265\|BOTTOM:321\|TOP:345\|BOTTOM:445\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 4 |

## 13. Résultats VOTE — segments 3 pivots

| rule | segmentLength | initialPath | finalPath | exactMatch | exactPivots | tolerantPivots | incorrectPivots | recoveredPivots | gtSegmentsGenerated | gtSegmentsPromoted | gtSegmentsChosen | generatedSegments | validSegments | promotions | replacements | conflicts | ties | noWinner | states | maxAlternatives | elapsedMs | approximateBytes | guardReached | guardReason | firstCause | verdict | decisions | allGenerated |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VOTE | 3 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false | 2 | 2 | 9 | 0 | 0 | 0 | 0 | 20001 | 6 | 1 | 0 | 0 | 0 | 1 | 20770 | 6 | 6.234900000000039 | 1792 | true | MAX_SEGMENTS | COMBINATORIAL_LIMIT_REACHED | COMBINATORIAL_LIMIT_REACHED |  |  |

| cycle | criteria | segments | promoted | chosen | decisionReason | activePath | promising |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | ZERO_PROXY, JERK_PROXY | 6 | 1 | 0:BOTTOM:169\|TOP:179\|BOTTOM:228 | UNIQUE_VOTE_WINNER_1 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 1 |

## 14. Résultats VOTE — segments 4 pivots

| rule | segmentLength | initialPath | finalPath | exactMatch | exactPivots | tolerantPivots | incorrectPivots | recoveredPivots | gtSegmentsGenerated | gtSegmentsPromoted | gtSegmentsChosen | generatedSegments | validSegments | promotions | replacements | conflicts | ties | noWinner | states | maxAlternatives | elapsedMs | approximateBytes | guardReached | guardReason | firstCause | verdict | decisions | allGenerated |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| VOTE | 4 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | false | 2 | 2 | 9 | 0 | 0 | 0 | 0 | 20001 | 16 | 1 | 0 | 0 | 0 | 2 | 20745 | 16 | 8.608600000000024 | 4352 | true | MAX_SEGMENTS | COMBINATORIAL_LIMIT_REACHED | COMBINATORIAL_LIMIT_REACHED |  |  |

| cycle | criteria | segments | promoted | chosen | decisionReason | activePath | promising |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | ZERO_PROXY, JERK_PROXY | 0 | 0 |  | NO_WINNER | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 0 |
| 2 | ZERO_PROXY, JERK_PROXY | 16 | 1 | 0:BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:265 | UNIQUE_VOTE_WINNER_1 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | 1 |

## 15. Résultats C — segments 2 pivots

UNDEFINED_CONTEXTUAL_PRIORITY_RULE

## 16. Résultats C — segments 3 pivots

UNDEFINED_CONTEXTUAL_PRIORITY_RULE

## 17. Résultats C — segments 4 pivots

UNDEFINED_CONTEXTUAL_PRIORITY_RULE

## 18. Trace TOP:179 / TOP:199

| rule | segmentLength | cycle | key | candidates | promoted | chosen | support |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PARETO | 2 | 1 | 0:BOTTOM:169\|TOP:179 | BOTTOM:169\|TOP:179 | true | false | ZERO_PROXY |
| PARETO | 2 | 1 | 0:BOTTOM:169\|TOP:199 | BOTTOM:169\|TOP:199 | true | false | ZERO_PROXY |
| PARETO | 2 | 1 | 1:TOP:179\|BOTTOM:228 | TOP:179\|BOTTOM:228 | true | false | ZERO_PROXY |
| PARETO | 2 | 1 | 1:TOP:179\|BOTTOM:243 | TOP:179\|BOTTOM:243 | false | false |  |
| PARETO | 2 | 1 | 1:TOP:199\|BOTTOM:228 | TOP:199\|BOTTOM:228 | true | false | ZERO_PROXY |
| PARETO | 2 | 1 | 1:TOP:199\|BOTTOM:243 | TOP:199\|BOTTOM:243 | false | false |  |
| PARETO | 2 | 2 | 0:BOTTOM:169\|TOP:179 | BOTTOM:169\|TOP:179 | true | false | ZERO_PROXY |
| PARETO | 2 | 2 | 0:BOTTOM:169\|TOP:199 | BOTTOM:169\|TOP:199 | true | false | ZERO_PROXY |
| PARETO | 2 | 2 | 1:TOP:179\|BOTTOM:228 | TOP:179\|BOTTOM:228 | true | false | ZERO_PROXY |
| PARETO | 2 | 2 | 1:TOP:179\|BOTTOM:243 | TOP:179\|BOTTOM:243 | false | false | JERK_PROXY |
| PARETO | 2 | 2 | 1:TOP:199\|BOTTOM:228 | TOP:199\|BOTTOM:228 | true | false | ZERO_PROXY |
| PARETO | 2 | 2 | 1:TOP:199\|BOTTOM:243 | TOP:199\|BOTTOM:243 | false | false | JERK_PROXY |
| PARETO | 2 | 3 | 0:BOTTOM:169\|TOP:179 | BOTTOM:169\|TOP:179 | false | false | ZERO_PROXY |
| PARETO | 2 | 3 | 0:BOTTOM:169\|TOP:199 | BOTTOM:169\|TOP:199 | false | false | ZERO_PROXY |
| PARETO | 2 | 3 | 1:TOP:179\|BOTTOM:228 | TOP:179\|BOTTOM:228 | false | false | ZERO_PROXY |
| PARETO | 2 | 3 | 1:TOP:179\|BOTTOM:243 | TOP:179\|BOTTOM:243 | false | false | JERK_PROXY |
| PARETO | 2 | 3 | 1:TOP:199\|BOTTOM:228 | TOP:199\|BOTTOM:228 | false | false | ZERO_PROXY |
| PARETO | 2 | 3 | 1:TOP:199\|BOTTOM:243 | TOP:199\|BOTTOM:243 | false | false | JERK_PROXY |
| PARETO | 2 | 4 | 0:BOTTOM:169\|TOP:179 | BOTTOM:169\|TOP:179 | false | false | ZERO_PROXY |
| PARETO | 2 | 4 | 0:BOTTOM:169\|TOP:199 | BOTTOM:169\|TOP:199 | false | false | ZERO_PROXY, TEMPORAL |
| PARETO | 2 | 4 | 1:TOP:179\|BOTTOM:228 | TOP:179\|BOTTOM:228 | false | false | ZERO_PROXY |
| PARETO | 2 | 4 | 1:TOP:179\|BOTTOM:243 | TOP:179\|BOTTOM:243 | false | false | JERK_PROXY |
| PARETO | 2 | 4 | 1:TOP:199\|BOTTOM:228 | TOP:199\|BOTTOM:228 | false | false | ZERO_PROXY, TEMPORAL |
| PARETO | 2 | 4 | 1:TOP:199\|BOTTOM:243 | TOP:199\|BOTTOM:243 | false | false | JERK_PROXY, TEMPORAL |
| PARETO | 2 | 5 | 0:BOTTOM:169\|TOP:179 | BOTTOM:169\|TOP:179 | false | false | ZERO_PROXY |
| PARETO | 2 | 5 | 0:BOTTOM:169\|TOP:199 | BOTTOM:169\|TOP:199 | false | false | ZERO_PROXY, TEMPORAL |
| PARETO | 2 | 5 | 1:TOP:179\|BOTTOM:228 | TOP:179\|BOTTOM:228 | false | false | ZERO_PROXY |
| PARETO | 2 | 5 | 1:TOP:179\|BOTTOM:243 | TOP:179\|BOTTOM:243 | false | false | JERK_PROXY |
| PARETO | 2 | 5 | 1:TOP:199\|BOTTOM:228 | TOP:199\|BOTTOM:228 | false | false | ZERO_PROXY, TEMPORAL |
| PARETO | 2 | 5 | 1:TOP:199\|BOTTOM:243 | TOP:199\|BOTTOM:243 | false | false | JERK_PROXY, TEMPORAL |
| PARETO | 3 | 1 | 0:BOTTOM:169\|TOP:179\|BOTTOM:228 | BOTTOM:169\|TOP:179\|BOTTOM:228 | true | true | ZERO_PROXY |
| PARETO | 3 | 1 | 0:BOTTOM:169\|TOP:179\|BOTTOM:243 | BOTTOM:169\|TOP:179\|BOTTOM:243 | false | false |  |
| PARETO | 3 | 1 | 0:BOTTOM:169\|TOP:199\|BOTTOM:228 | BOTTOM:169\|TOP:199\|BOTTOM:228 | true | false | ZERO_PROXY |
| PARETO | 3 | 1 | 0:BOTTOM:169\|TOP:199\|BOTTOM:243 | BOTTOM:169\|TOP:199\|BOTTOM:243 | false | false |  |
| PARETO | 4 | 2 | 0:BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:236 | BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:236 | true | false | ZERO_PROXY |
| PARETO | 4 | 2 | 0:BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:265 | BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:265 | true | false | ZERO_PROXY |
| PARETO | 4 | 2 | 0:BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:291 | BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:291 | true | false | ZERO_PROXY |
| PARETO | 4 | 2 | 0:BOTTOM:169\|TOP:179\|BOTTOM:243\|TOP:265 | BOTTOM:169\|TOP:179\|BOTTOM:243\|TOP:265 | true | false | ZERO_PROXY, JERK_PROXY |
| PARETO | 4 | 2 | 0:BOTTOM:169\|TOP:179\|BOTTOM:243\|TOP:291 | BOTTOM:169\|TOP:179\|BOTTOM:243\|TOP:291 | false | false | JERK_PROXY |
| PARETO | 4 | 2 | 0:BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:236 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:236 | true | false | ZERO_PROXY |
| PARETO | 4 | 2 | 0:BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:265 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:265 | true | false | ZERO_PROXY |
| PARETO | 4 | 2 | 0:BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291 | true | false | ZERO_PROXY |
| PARETO | 4 | 2 | 0:BOTTOM:169\|TOP:199\|BOTTOM:243\|TOP:265 | BOTTOM:169\|TOP:199\|BOTTOM:243\|TOP:265 | true | false | ZERO_PROXY, JERK_PROXY |
| PARETO | 4 | 2 | 0:BOTTOM:169\|TOP:199\|BOTTOM:243\|TOP:291 | BOTTOM:169\|TOP:199\|BOTTOM:243\|TOP:291 | false | false | JERK_PROXY |
| VOTE | 2 | 1 | 0:BOTTOM:169\|TOP:179 | BOTTOM:169\|TOP:179 | false | false | ZERO_PROXY |
| VOTE | 2 | 1 | 0:BOTTOM:169\|TOP:199 | BOTTOM:169\|TOP:199 | false | false | ZERO_PROXY |
| VOTE | 2 | 1 | 1:TOP:179\|BOTTOM:228 | TOP:179\|BOTTOM:228 | false | false | ZERO_PROXY |
| VOTE | 2 | 1 | 1:TOP:179\|BOTTOM:243 | TOP:179\|BOTTOM:243 | false | false |  |
| VOTE | 2 | 1 | 1:TOP:199\|BOTTOM:228 | TOP:199\|BOTTOM:228 | false | false | ZERO_PROXY |
| VOTE | 2 | 1 | 1:TOP:199\|BOTTOM:243 | TOP:199\|BOTTOM:243 | false | false |  |
| VOTE | 2 | 2 | 0:BOTTOM:169\|TOP:179 | BOTTOM:169\|TOP:179 | false | false | ZERO_PROXY |
| VOTE | 2 | 2 | 0:BOTTOM:169\|TOP:199 | BOTTOM:169\|TOP:199 | false | false | ZERO_PROXY |
| VOTE | 2 | 2 | 1:TOP:179\|BOTTOM:228 | TOP:179\|BOTTOM:228 | false | false | ZERO_PROXY |
| VOTE | 2 | 2 | 1:TOP:179\|BOTTOM:243 | TOP:179\|BOTTOM:243 | false | false | JERK_PROXY |
| VOTE | 2 | 2 | 1:TOP:199\|BOTTOM:228 | TOP:199\|BOTTOM:228 | false | false | ZERO_PROXY |
| VOTE | 2 | 2 | 1:TOP:199\|BOTTOM:243 | TOP:199\|BOTTOM:243 | false | false | JERK_PROXY |
| VOTE | 2 | 3 | 0:BOTTOM:169\|TOP:179 | BOTTOM:169\|TOP:179 | false | false | ZERO_PROXY |
| VOTE | 2 | 3 | 0:BOTTOM:169\|TOP:199 | BOTTOM:169\|TOP:199 | false | false | ZERO_PROXY |
| VOTE | 2 | 3 | 1:TOP:179\|BOTTOM:228 | TOP:179\|BOTTOM:228 | false | false | ZERO_PROXY |
| VOTE | 2 | 3 | 1:TOP:179\|BOTTOM:243 | TOP:179\|BOTTOM:243 | false | false |  |
| VOTE | 2 | 3 | 1:TOP:199\|BOTTOM:228 | TOP:199\|BOTTOM:228 | false | false | ZERO_PROXY |
| VOTE | 2 | 3 | 1:TOP:199\|BOTTOM:243 | TOP:199\|BOTTOM:243 | false | false |  |
| VOTE | 2 | 4 | 0:BOTTOM:169\|TOP:179 | BOTTOM:169\|TOP:179 | false | false | ZERO_PROXY |
| VOTE | 2 | 4 | 0:BOTTOM:169\|TOP:199 | BOTTOM:169\|TOP:199 | false | false | ZERO_PROXY |
| VOTE | 2 | 4 | 1:TOP:179\|BOTTOM:228 | TOP:179\|BOTTOM:228 | false | false | ZERO_PROXY |
| VOTE | 2 | 4 | 1:TOP:179\|BOTTOM:243 | TOP:179\|BOTTOM:243 | false | false | TEMPORAL |
| VOTE | 2 | 4 | 1:TOP:199\|BOTTOM:228 | TOP:199\|BOTTOM:228 | false | false | ZERO_PROXY |
| VOTE | 2 | 4 | 1:TOP:199\|BOTTOM:243 | TOP:199\|BOTTOM:243 | false | false | TEMPORAL |
| VOTE | 2 | 5 | 0:BOTTOM:169\|TOP:179 | BOTTOM:169\|TOP:179 | false | false | ZERO_PROXY |
| VOTE | 2 | 5 | 0:BOTTOM:169\|TOP:199 | BOTTOM:169\|TOP:199 | false | false | ZERO_PROXY |
| VOTE | 2 | 5 | 1:TOP:179\|BOTTOM:228 | TOP:179\|BOTTOM:228 | false | false | ZERO_PROXY |
| VOTE | 2 | 5 | 1:TOP:179\|BOTTOM:243 | TOP:179\|BOTTOM:243 | false | false | TEMPORAL |
| VOTE | 2 | 5 | 1:TOP:199\|BOTTOM:228 | TOP:199\|BOTTOM:228 | false | false | ZERO_PROXY |
| VOTE | 2 | 5 | 1:TOP:199\|BOTTOM:243 | TOP:199\|BOTTOM:243 | false | false | TEMPORAL |
| VOTE | 3 | 1 | 0:BOTTOM:169\|TOP:179\|BOTTOM:228 | BOTTOM:169\|TOP:179\|BOTTOM:228 | true | true | ZERO_PROXY |
| VOTE | 3 | 1 | 0:BOTTOM:169\|TOP:179\|BOTTOM:243 | BOTTOM:169\|TOP:179\|BOTTOM:243 | false | false |  |
| VOTE | 3 | 1 | 0:BOTTOM:169\|TOP:199\|BOTTOM:228 | BOTTOM:169\|TOP:199\|BOTTOM:228 | false | false | ZERO_PROXY |
| VOTE | 3 | 1 | 0:BOTTOM:169\|TOP:199\|BOTTOM:243 | BOTTOM:169\|TOP:199\|BOTTOM:243 | false | false |  |
| VOTE | 4 | 2 | 0:BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:236 | BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:236 | false | false | ZERO_PROXY |
| VOTE | 4 | 2 | 0:BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:265 | BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:265 | true | true | ZERO_PROXY |
| VOTE | 4 | 2 | 0:BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:291 | BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:291 | false | false | ZERO_PROXY |
| VOTE | 4 | 2 | 0:BOTTOM:169\|TOP:179\|BOTTOM:243\|TOP:265 | BOTTOM:169\|TOP:179\|BOTTOM:243\|TOP:265 | false | false | ZERO_PROXY, JERK_PROXY |
| VOTE | 4 | 2 | 0:BOTTOM:169\|TOP:179\|BOTTOM:243\|TOP:291 | BOTTOM:169\|TOP:179\|BOTTOM:243\|TOP:291 | false | false | JERK_PROXY |
| VOTE | 4 | 2 | 0:BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:236 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:236 | false | false | ZERO_PROXY |
| VOTE | 4 | 2 | 0:BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:265 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:265 | false | false | ZERO_PROXY |
| VOTE | 4 | 2 | 0:BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291 | false | false | ZERO_PROXY |
| VOTE | 4 | 2 | 0:BOTTOM:169\|TOP:199\|BOTTOM:243\|TOP:265 | BOTTOM:169\|TOP:199\|BOTTOM:243\|TOP:265 | false | false | ZERO_PROXY, JERK_PROXY |
| VOTE | 4 | 2 | 0:BOTTOM:169\|TOP:199\|BOTTOM:243\|TOP:291 | BOTTOM:169\|TOP:199\|BOTTOM:243\|TOP:291 | false | false | JERK_PROXY |

## 19. Trace du groupe B228 / B262 / T291 / B353

| rule | segmentLength | cycle | key | candidates | promoted | chosen | support |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PARETO | 2 | 1 | 1:TOP:179\|BOTTOM:228 | TOP:179\|BOTTOM:228 | true | false | ZERO_PROXY |
| PARETO | 2 | 1 | 1:TOP:199\|BOTTOM:228 | TOP:199\|BOTTOM:228 | true | false | ZERO_PROXY |
| PARETO | 2 | 2 | 1:TOP:179\|BOTTOM:228 | TOP:179\|BOTTOM:228 | true | false | ZERO_PROXY |
| PARETO | 2 | 2 | 1:TOP:199\|BOTTOM:228 | TOP:199\|BOTTOM:228 | true | false | ZERO_PROXY |
| PARETO | 2 | 2 | 2:BOTTOM:228\|TOP:236 | BOTTOM:228\|TOP:236 | true | false | ZERO_PROXY |
| PARETO | 2 | 2 | 2:BOTTOM:228\|TOP:265 | BOTTOM:228\|TOP:265 | true | false | ZERO_PROXY |
| PARETO | 2 | 2 | 2:BOTTOM:243\|TOP:291 | BOTTOM:243\|TOP:291 | false | false | JERK_PROXY |
| PARETO | 2 | 2 | 3:TOP:291\|BOTTOM:321 | TOP:291\|BOTTOM:321 | false | false | ZERO_PROXY |
| PARETO | 2 | 3 | 1:TOP:179\|BOTTOM:228 | TOP:179\|BOTTOM:228 | false | false | ZERO_PROXY |
| PARETO | 2 | 3 | 1:TOP:199\|BOTTOM:228 | TOP:199\|BOTTOM:228 | false | false | ZERO_PROXY |
| PARETO | 2 | 3 | 2:BOTTOM:228\|TOP:236 | BOTTOM:228\|TOP:236 | false | false | ZERO_PROXY |
| PARETO | 2 | 3 | 2:BOTTOM:228\|TOP:265 | BOTTOM:228\|TOP:265 | false | false | ZERO_PROXY |
| PARETO | 2 | 3 | 2:BOTTOM:243\|TOP:291 | BOTTOM:243\|TOP:291 | false | false | JERK_PROXY |
| PARETO | 2 | 3 | 3:TOP:291\|BOTTOM:321 | TOP:291\|BOTTOM:321 | true | false | ZERO_PROXY, JERK_PROXY, AMPLITUDE_PROXY |
| PARETO | 2 | 3 | 5:TOP:317\|BOTTOM:353 | TOP:317\|BOTTOM:353 | false | false | ZERO_PROXY |
| PARETO | 2 | 3 | 5:TOP:333\|BOTTOM:353 | TOP:333\|BOTTOM:353 | false | false | ZERO_PROXY |
| PARETO | 2 | 3 | 5:TOP:345\|BOTTOM:353 | TOP:345\|BOTTOM:353 | false | false | ZERO_PROXY |
| PARETO | 2 | 4 | 1:TOP:179\|BOTTOM:228 | TOP:179\|BOTTOM:228 | false | false | ZERO_PROXY |
| PARETO | 2 | 4 | 1:TOP:199\|BOTTOM:228 | TOP:199\|BOTTOM:228 | false | false | ZERO_PROXY, TEMPORAL |
| PARETO | 2 | 4 | 2:BOTTOM:228\|TOP:236 | BOTTOM:228\|TOP:236 | false | false | ZERO_PROXY |
| PARETO | 2 | 4 | 2:BOTTOM:228\|TOP:265 | BOTTOM:228\|TOP:265 | false | false | ZERO_PROXY, TEMPORAL |
| PARETO | 2 | 4 | 2:BOTTOM:243\|TOP:291 | BOTTOM:243\|TOP:291 | false | false | JERK_PROXY, TEMPORAL |
| PARETO | 2 | 4 | 3:TOP:291\|BOTTOM:321 | TOP:291\|BOTTOM:321 | false | false | ZERO_PROXY, JERK_PROXY, TEMPORAL |
| PARETO | 2 | 4 | 5:TOP:317\|BOTTOM:353 | TOP:317\|BOTTOM:353 | false | false | ZERO_PROXY |
| PARETO | 2 | 4 | 5:TOP:333\|BOTTOM:353 | TOP:333\|BOTTOM:353 | false | false | ZERO_PROXY |
| PARETO | 2 | 4 | 5:TOP:345\|BOTTOM:353 | TOP:345\|BOTTOM:353 | false | false | ZERO_PROXY |
| PARETO | 2 | 4 | 6:BOTTOM:353\|TOP:365 | BOTTOM:353\|TOP:365 | false | false | ZERO_PROXY |
| PARETO | 2 | 4 | 6:BOTTOM:353\|TOP:379 | BOTTOM:353\|TOP:379 | false | false | ZERO_PROXY |
| PARETO | 2 | 4 | 6:BOTTOM:353\|TOP:383 | BOTTOM:353\|TOP:383 | false | false | ZERO_PROXY |
| PARETO | 2 | 4 | 6:BOTTOM:353\|TOP:411 | BOTTOM:353\|TOP:411 | false | false | ZERO_PROXY |
| PARETO | 2 | 4 | 6:BOTTOM:353\|TOP:421 | BOTTOM:353\|TOP:421 | false | false | ZERO_PROXY |
| PARETO | 2 | 4 | 6:BOTTOM:353\|TOP:436 | BOTTOM:353\|TOP:436 | false | false | ZERO_PROXY |
| PARETO | 2 | 4 | 6:BOTTOM:353\|TOP:467 | BOTTOM:353\|TOP:467 | false | false | ZERO_PROXY |
| PARETO | 2 | 4 | 6:BOTTOM:353\|TOP:474 | BOTTOM:353\|TOP:474 | false | false | ZERO_PROXY |
| PARETO | 2 | 5 | 1:TOP:179\|BOTTOM:228 | TOP:179\|BOTTOM:228 | false | false | ZERO_PROXY |
| PARETO | 2 | 5 | 1:TOP:199\|BOTTOM:228 | TOP:199\|BOTTOM:228 | false | false | ZERO_PROXY, TEMPORAL |
| PARETO | 2 | 5 | 2:BOTTOM:228\|TOP:236 | BOTTOM:228\|TOP:236 | false | false | ZERO_PROXY |
| PARETO | 2 | 5 | 2:BOTTOM:228\|TOP:265 | BOTTOM:228\|TOP:265 | false | false | ZERO_PROXY, TEMPORAL |
| PARETO | 2 | 5 | 2:BOTTOM:243\|TOP:291 | BOTTOM:243\|TOP:291 | false | false | JERK_PROXY, TEMPORAL |
| PARETO | 2 | 5 | 3:TOP:291\|BOTTOM:321 | TOP:291\|BOTTOM:321 | false | false | ZERO_PROXY, JERK_PROXY, AMPLITUDE_PROXY, TEMPORAL |
| PARETO | 2 | 5 | 5:TOP:317\|BOTTOM:353 | TOP:317\|BOTTOM:353 | false | false | ZERO_PROXY |
| PARETO | 2 | 5 | 5:TOP:333\|BOTTOM:353 | TOP:333\|BOTTOM:353 | false | false | ZERO_PROXY |
| PARETO | 2 | 5 | 5:TOP:345\|BOTTOM:353 | TOP:345\|BOTTOM:353 | false | false | ZERO_PROXY |
| PARETO | 2 | 5 | 6:BOTTOM:353\|TOP:365 | BOTTOM:353\|TOP:365 | false | false | ZERO_PROXY |
| PARETO | 2 | 5 | 6:BOTTOM:353\|TOP:379 | BOTTOM:353\|TOP:379 | false | false | ZERO_PROXY |
| PARETO | 2 | 5 | 6:BOTTOM:353\|TOP:383 | BOTTOM:353\|TOP:383 | false | false | ZERO_PROXY |
| PARETO | 2 | 5 | 6:BOTTOM:353\|TOP:411 | BOTTOM:353\|TOP:411 | false | false | ZERO_PROXY |
| PARETO | 2 | 5 | 6:BOTTOM:353\|TOP:421 | BOTTOM:353\|TOP:421 | false | false | ZERO_PROXY |
| PARETO | 2 | 5 | 6:BOTTOM:353\|TOP:436 | BOTTOM:353\|TOP:436 | false | false | ZERO_PROXY |
| PARETO | 2 | 5 | 6:BOTTOM:353\|TOP:467 | BOTTOM:353\|TOP:467 | false | false | ZERO_PROXY |
| PARETO | 2 | 5 | 6:BOTTOM:353\|TOP:474 | BOTTOM:353\|TOP:474 | false | false | ZERO_PROXY |
| PARETO | 3 | 1 | 0:BOTTOM:169\|TOP:179\|BOTTOM:228 | BOTTOM:169\|TOP:179\|BOTTOM:228 | true | true | ZERO_PROXY |
| PARETO | 3 | 1 | 0:BOTTOM:169\|TOP:199\|BOTTOM:228 | BOTTOM:169\|TOP:199\|BOTTOM:228 | true | false | ZERO_PROXY |
| PARETO | 4 | 2 | 0:BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:236 | BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:236 | true | false | ZERO_PROXY |
| PARETO | 4 | 2 | 0:BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:265 | BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:265 | true | false | ZERO_PROXY |
| PARETO | 4 | 2 | 0:BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:291 | BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:291 | true | false | ZERO_PROXY |
| PARETO | 4 | 2 | 0:BOTTOM:169\|TOP:179\|BOTTOM:243\|TOP:291 | BOTTOM:169\|TOP:179\|BOTTOM:243\|TOP:291 | false | false | JERK_PROXY |
| PARETO | 4 | 2 | 0:BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:236 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:236 | true | false | ZERO_PROXY |
| PARETO | 4 | 2 | 0:BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:265 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:265 | true | false | ZERO_PROXY |
| PARETO | 4 | 2 | 0:BOTTOM:169\|TOP:195\|BOTTOM:243\|TOP:291 | BOTTOM:169\|TOP:195\|BOTTOM:243\|TOP:291 | false | false | JERK_PROXY |
| PARETO | 4 | 2 | 0:BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:236 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:236 | true | false | ZERO_PROXY |
| PARETO | 4 | 2 | 0:BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:265 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:265 | true | false | ZERO_PROXY |
| PARETO | 4 | 2 | 0:BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291 | true | false | ZERO_PROXY |
| PARETO | 4 | 2 | 0:BOTTOM:169\|TOP:199\|BOTTOM:243\|TOP:291 | BOTTOM:169\|TOP:199\|BOTTOM:243\|TOP:291 | false | false | JERK_PROXY |
| PARETO | 4 | 2 | 0:BOTTOM:169\|TOP:222\|BOTTOM:243\|TOP:291 | BOTTOM:169\|TOP:222\|BOTTOM:243\|TOP:291 | false | false | JERK_PROXY |
| VOTE | 2 | 1 | 1:TOP:179\|BOTTOM:228 | TOP:179\|BOTTOM:228 | false | false | ZERO_PROXY |
| VOTE | 2 | 1 | 1:TOP:199\|BOTTOM:228 | TOP:199\|BOTTOM:228 | false | false | ZERO_PROXY |
| VOTE | 2 | 2 | 1:TOP:179\|BOTTOM:228 | TOP:179\|BOTTOM:228 | false | false | ZERO_PROXY |
| VOTE | 2 | 2 | 1:TOP:199\|BOTTOM:228 | TOP:199\|BOTTOM:228 | false | false | ZERO_PROXY |
| VOTE | 2 | 2 | 2:BOTTOM:228\|TOP:236 | BOTTOM:228\|TOP:236 | false | false | ZERO_PROXY |
| VOTE | 2 | 2 | 2:BOTTOM:228\|TOP:265 | BOTTOM:228\|TOP:265 | false | false | ZERO_PROXY |
| VOTE | 2 | 2 | 2:BOTTOM:243\|TOP:291 | BOTTOM:243\|TOP:291 | false | false | JERK_PROXY |
| VOTE | 2 | 2 | 3:TOP:291\|BOTTOM:321 | TOP:291\|BOTTOM:321 | false | false | ZERO_PROXY |
| VOTE | 2 | 3 | 1:TOP:179\|BOTTOM:228 | TOP:179\|BOTTOM:228 | false | false | ZERO_PROXY |
| VOTE | 2 | 3 | 1:TOP:199\|BOTTOM:228 | TOP:199\|BOTTOM:228 | false | false | ZERO_PROXY |
| VOTE | 2 | 3 | 2:BOTTOM:228\|TOP:236 | BOTTOM:228\|TOP:236 | false | false | AMPLITUDE_PROXY |
| VOTE | 2 | 3 | 2:BOTTOM:228\|TOP:291 | BOTTOM:228\|TOP:291 | false | false | AMPLITUDE_PROXY |
| VOTE | 2 | 3 | 2:BOTTOM:243\|TOP:291 | BOTTOM:243\|TOP:291 | false | false |  |
| VOTE | 2 | 3 | 2:BOTTOM:260\|TOP:291 | BOTTOM:260\|TOP:291 | false | false |  |
| VOTE | 2 | 3 | 2:BOTTOM:262\|TOP:291 | BOTTOM:262\|TOP:291 | false | false |  |
| VOTE | 2 | 3 | 3:TOP:291\|BOTTOM:299 | TOP:291\|BOTTOM:299 | false | false | AMPLITUDE_PROXY |
| VOTE | 2 | 3 | 3:TOP:291\|BOTTOM:321 | TOP:291\|BOTTOM:321 | false | false | AMPLITUDE_PROXY |
| VOTE | 2 | 4 | 1:TOP:179\|BOTTOM:228 | TOP:179\|BOTTOM:228 | false | false | ZERO_PROXY |
| VOTE | 2 | 4 | 1:TOP:199\|BOTTOM:228 | TOP:199\|BOTTOM:228 | false | false | ZERO_PROXY |
| VOTE | 2 | 4 | 2:BOTTOM:228\|TOP:236 | BOTTOM:228\|TOP:236 | false | false | AMPLITUDE_PROXY |
| VOTE | 2 | 4 | 2:BOTTOM:228\|TOP:291 | BOTTOM:228\|TOP:291 | false | false | AMPLITUDE_PROXY |
| VOTE | 2 | 4 | 2:BOTTOM:243\|TOP:291 | BOTTOM:243\|TOP:291 | false | false |  |
| VOTE | 2 | 4 | 2:BOTTOM:260\|TOP:291 | BOTTOM:260\|TOP:291 | false | false | TEMPORAL |
| VOTE | 2 | 4 | 2:BOTTOM:262\|TOP:291 | BOTTOM:262\|TOP:291 | false | false | TEMPORAL |
| VOTE | 2 | 4 | 3:TOP:291\|BOTTOM:299 | TOP:291\|BOTTOM:299 | false | false | JERK_PROXY |
| VOTE | 2 | 4 | 3:TOP:291\|BOTTOM:321 | TOP:291\|BOTTOM:321 | false | false | AMPLITUDE_PROXY |
| VOTE | 2 | 4 | 4:BOTTOM:353\|TOP:365 | BOTTOM:353\|TOP:365 | false | false | ZERO_PROXY, JERK_PROXY |
| VOTE | 2 | 4 | 4:BOTTOM:353\|TOP:379 | BOTTOM:353\|TOP:379 | false | false | ZERO_PROXY, JERK_PROXY, TEMPORAL |
| VOTE | 2 | 4 | 4:BOTTOM:353\|TOP:383 | BOTTOM:353\|TOP:383 | true | false | ZERO_PROXY, JERK_PROXY, TEMPORAL |
| VOTE | 2 | 4 | 4:BOTTOM:353\|TOP:411 | BOTTOM:353\|TOP:411 | false | false | JERK_PROXY |
| VOTE | 2 | 4 | 4:BOTTOM:353\|TOP:421 | BOTTOM:353\|TOP:421 | false | false | ZERO_PROXY, JERK_PROXY |
| VOTE | 2 | 4 | 4:BOTTOM:353\|TOP:436 | BOTTOM:353\|TOP:436 | false | false | ZERO_PROXY, JERK_PROXY |
| VOTE | 2 | 5 | 1:TOP:179\|BOTTOM:228 | TOP:179\|BOTTOM:228 | false | false | ZERO_PROXY |
| VOTE | 2 | 5 | 1:TOP:199\|BOTTOM:228 | TOP:199\|BOTTOM:228 | false | false | ZERO_PROXY |
| VOTE | 2 | 5 | 2:BOTTOM:228\|TOP:236 | BOTTOM:228\|TOP:236 | false | false | AMPLITUDE_PROXY |
| VOTE | 2 | 5 | 2:BOTTOM:228\|TOP:291 | BOTTOM:228\|TOP:291 | false | false | AMPLITUDE_PROXY |
| VOTE | 2 | 5 | 2:BOTTOM:243\|TOP:291 | BOTTOM:243\|TOP:291 | false | false |  |
| VOTE | 2 | 5 | 2:BOTTOM:260\|TOP:291 | BOTTOM:260\|TOP:291 | false | false | TEMPORAL, SHAPE |
| VOTE | 2 | 5 | 2:BOTTOM:262\|TOP:291 | BOTTOM:262\|TOP:291 | false | false | TEMPORAL |
| VOTE | 2 | 5 | 3:TOP:291\|BOTTOM:299 | TOP:291\|BOTTOM:299 | false | false | JERK_PROXY, SHAPE |
| VOTE | 2 | 5 | 3:TOP:291\|BOTTOM:321 | TOP:291\|BOTTOM:321 | false | false | AMPLITUDE_PROXY |
| VOTE | 2 | 5 | 4:BOTTOM:353\|TOP:365 | BOTTOM:353\|TOP:365 | false | false | ZERO_PROXY, JERK_PROXY |
| VOTE | 2 | 5 | 4:BOTTOM:353\|TOP:379 | BOTTOM:353\|TOP:379 | false | false | ZERO_PROXY, JERK_PROXY, TEMPORAL |
| VOTE | 2 | 5 | 4:BOTTOM:353\|TOP:383 | BOTTOM:353\|TOP:383 | true | false | ZERO_PROXY, JERK_PROXY, TEMPORAL |
| VOTE | 2 | 5 | 4:BOTTOM:353\|TOP:411 | BOTTOM:353\|TOP:411 | false | false | JERK_PROXY |
| VOTE | 2 | 5 | 4:BOTTOM:353\|TOP:421 | BOTTOM:353\|TOP:421 | false | false | ZERO_PROXY, JERK_PROXY |
| VOTE | 2 | 5 | 4:BOTTOM:353\|TOP:436 | BOTTOM:353\|TOP:436 | false | false | ZERO_PROXY, JERK_PROXY |
| VOTE | 3 | 1 | 0:BOTTOM:169\|TOP:179\|BOTTOM:228 | BOTTOM:169\|TOP:179\|BOTTOM:228 | true | true | ZERO_PROXY |
| VOTE | 3 | 1 | 0:BOTTOM:169\|TOP:199\|BOTTOM:228 | BOTTOM:169\|TOP:199\|BOTTOM:228 | false | false | ZERO_PROXY |
| VOTE | 4 | 2 | 0:BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:236 | BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:236 | false | false | ZERO_PROXY |
| VOTE | 4 | 2 | 0:BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:265 | BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:265 | true | true | ZERO_PROXY |
| VOTE | 4 | 2 | 0:BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:291 | BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:291 | false | false | ZERO_PROXY |
| VOTE | 4 | 2 | 0:BOTTOM:169\|TOP:179\|BOTTOM:243\|TOP:291 | BOTTOM:169\|TOP:179\|BOTTOM:243\|TOP:291 | false | false | JERK_PROXY |
| VOTE | 4 | 2 | 0:BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:236 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:236 | false | false | ZERO_PROXY |
| VOTE | 4 | 2 | 0:BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:265 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:265 | false | false | ZERO_PROXY |
| VOTE | 4 | 2 | 0:BOTTOM:169\|TOP:195\|BOTTOM:243\|TOP:291 | BOTTOM:169\|TOP:195\|BOTTOM:243\|TOP:291 | false | false | JERK_PROXY |
| VOTE | 4 | 2 | 0:BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:236 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:236 | false | false | ZERO_PROXY |
| VOTE | 4 | 2 | 0:BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:265 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:265 | false | false | ZERO_PROXY |
| VOTE | 4 | 2 | 0:BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291 | false | false | ZERO_PROXY |
| VOTE | 4 | 2 | 0:BOTTOM:169\|TOP:199\|BOTTOM:243\|TOP:291 | BOTTOM:169\|TOP:199\|BOTTOM:243\|TOP:291 | false | false | JERK_PROXY |
| VOTE | 4 | 2 | 0:BOTTOM:169\|TOP:222\|BOTTOM:243\|TOP:291 | BOTTOM:169\|TOP:222\|BOTTOM:243\|TOP:291 | false | false | JERK_PROXY |

## 20. Comparaison des neuf configurations

| rule | segmentMax | exactPivots | tolerantPivots | states | replacements | verdict |
| --- | --- | --- | --- | --- | --- | --- |
| PARETO | 2 | 2 | 2 | 20757 | 0 | COMBINATORIAL_LIMIT_REACHED |
| PARETO | 3 | 2 | 2 | 20770 | 0 | COMBINATORIAL_LIMIT_REACHED |
| PARETO | 4 | 2 | 2 | 20745 | 0 | COMBINATORIAL_LIMIT_REACHED |
| VOTE | 2 | 2 | 2 | 20756 | 2 | COMBINATORIAL_LIMIT_REACHED |
| VOTE | 3 | 2 | 2 | 20770 | 0 | COMBINATORIAL_LIMIT_REACHED |
| VOTE | 4 | 2 | 2 | 20745 | 0 | COMBINATORIAL_LIMIT_REACHED |
| CONTEXTUAL_PRIORITY | 2 |  |  | 0 | 0 | UNDEFINED_CONTEXTUAL_PRIORITY_RULE |
| CONTEXTUAL_PRIORITY | 3 |  |  | 0 | 0 | UNDEFINED_CONTEXTUAL_PRIORITY_RULE |
| CONTEXTUAL_PRIORITY | 4 |  |  | 0 | 0 | UNDEFINED_CONTEXTUAL_PRIORITY_RULE |

## 21. Complexité

| rule | segmentLength | states | versus925 | versus300000 | validSegments | maxAlternatives | elapsedMs | approximateKiB | guardReached |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PARETO | 2 | 20757 | 22.44 | 0.06919 | 338 | 128 | 59.24509999999998 | 87.5 | true |
| PARETO | 3 | 20770 | 22.454054054054055 | 0.06923333333333333 | 6 | 6 | 12.139200000000017 | 2 | true |
| PARETO | 4 | 20745 | 22.427027027027027 | 0.06915 | 16 | 16 | 7.695699999999988 | 6.75 | true |
| VOTE | 2 | 20756 | 22.43891891891892 | 0.06918666666666666 | 301 | 106 | 30.22210000000001 | 76.25 | true |
| VOTE | 3 | 20770 | 22.454054054054055 | 0.06923333333333333 | 6 | 6 | 6.234900000000039 | 1.75 | true |
| VOTE | 4 | 20745 | 22.427027027027027 | 0.06915 | 16 | 16 | 8.608600000000024 | 4.25 | true |

## 22. Première cause d'échec par configuration

| rule | segmentLength | firstCause |
| --- | --- | --- |
| PARETO | 2 | COMBINATORIAL_LIMIT_REACHED |
| PARETO | 3 | COMBINATORIAL_LIMIT_REACHED |
| PARETO | 4 | COMBINATORIAL_LIMIT_REACHED |
| VOTE | 2 | COMBINATORIAL_LIMIT_REACHED |
| VOTE | 3 | COMBINATORIAL_LIMIT_REACHED |
| VOTE | 4 | COMBINATORIAL_LIMIT_REACHED |
| CONTEXTUAL_PRIORITY | 2 | UNDEFINED_CONTEXTUAL_PRIORITY_RULE |
| CONTEXTUAL_PRIORITY | 3 | UNDEFINED_CONTEXTUAL_PRIORITY_RULE |
| CONTEXTUAL_PRIORITY | 4 | UNDEFINED_CONTEXTUAL_PRIORITY_RULE |

## 23. Verdict global

**COMBINATORIAL_LIMIT_REACHED**

## 24. Limites

Garde-fous: states=100000, segments=20000, alternatives=1000, timeout=30000 ms, profondeur maximale=4. Ground Truth inaccessible jusqu'à l'évaluation de chaque configuration.

## 25. Prochaine décision appuyée uniquement par les résultats

Comparer les pivots exacts, mauvais remplacements et états du tableau avant toute modification de l'algorithme.

## Validation finale

Expérience réellement exécutée pour A et B; aucune simulation papier ni adaptation après observation. C seule est arrêtée conformément au protocole. Aucun changement à DP V1, DP V2, `current_filters` ou au pipeline; aucun MHT, NMS, score combiné, pondération ou normalisation commune.

Commande depuis `RepMotion/tools/calibration-runner`:

```powershell
$env:GROUND_TRUTH_VALIDATION_MODE='DELAYED_CONTEXT_SEGMENT_RECONSTRUCTION'; npx tsx ../ground-truth/groundTruthValidationRunner.ts
```
