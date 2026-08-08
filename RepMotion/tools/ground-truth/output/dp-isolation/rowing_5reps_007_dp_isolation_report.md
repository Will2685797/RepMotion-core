# Rowing 5 reps 007 — DP isolation

## Métadonnées

- Mode: DP_ISOLATION
- Dataset: rowing_5reps_007.json
- Axe: az
- Fréquence: 20 Hz
- Offset vidéo vers IMU: 6.620000000000001
- Nombre de candidats injectés: 11
- Nombre total d'états DP créés: 57
- Nombre d'états terminaux: 1

## Candidats injectés

| order | candidateId | type | index | value | display |
| --- | --- | --- | --- | --- | --- |
| 1 | INJECTED_GT_1_BOTTOM_169 | BOTTOM | 169 | 14604 | B169 |
| 2 | INJECTED_GT_2_TOP_199 | TOP | 199 | 19844 | T199 |
| 3 | INJECTED_GT_3_BOTTOM_262 | BOTTOM | 262 | 17972 | B262 |
| 4 | INJECTED_GT_4_TOP_291 | TOP | 291 | 26248 | T291 |
| 5 | INJECTED_GT_5_BOTTOM_353 | BOTTOM | 353 | 20092 | B353 |
| 6 | INJECTED_GT_6_TOP_383 | TOP | 383 | 17804 | T383 |
| 7 | INJECTED_GT_7_BOTTOM_445 | BOTTOM | 445 | 19300 | B445 |
| 8 | INJECTED_GT_8_TOP_474 | TOP | 474 | 15656 | T474 |
| 9 | INJECTED_GT_9_BOTTOM_529 | BOTTOM | 529 | 17976 | B529 |
| 10 | INJECTED_GT_10_TOP_558 | TOP | 558 | 17932 | T558 |
| 11 | INJECTED_GT_11_BOTTOM_611 | BOTTOM | 611 | 18888 | B611 |

## Chaîne gagnante

- Chaîne: B(169) -> T(199) -> B(262) -> T(291) -> B(353) -> T(383) -> B(445) -> T(474) -> B(529) -> T(558) -> B(611)
- Score final: -11348
- Comparaison globale: MATCH_EXACT

## Comparaison événement par événement

| eventNumber | groundTruth | winnerDp | status |
| --- | --- | --- | --- |
| 1 | B169 | B169 | MATCH_EXACT |
| 2 | T199 | T199 | MATCH_EXACT |
| 3 | B262 | B262 | MATCH_EXACT |
| 4 | T291 | T291 | MATCH_EXACT |
| 5 | B353 | B353 | MATCH_EXACT |
| 6 | T383 | T383 | MATCH_EXACT |
| 7 | B445 | B445 | MATCH_EXACT |
| 8 | T474 | T474 | MATCH_EXACT |
| 9 | B529 | B529 | MATCH_EXACT |
| 10 | T558 | T558 | MATCH_EXACT |
| 11 | B611 | B611 | MATCH_EXACT |

## Tous les états DP créés

| stateId | score | predecessorStateId | candidateId | candidateIndex | chainLength |
| --- | --- | --- | --- | --- | --- |
| 0:-1:-1 | 0 |  |  |  | 0 |
| 1:0:169 | -14604 | 0:-1:-1 | INJECTED_GT_1_BOTTOM_169 | 169 | 1 |
| 1:2:262 | -17972 | 0:-1:-1 | INJECTED_GT_3_BOTTOM_262 | 262 | 1 |
| 1:4:353 | -20092 | 0:-1:-1 | INJECTED_GT_5_BOTTOM_353 | 353 | 1 |
| 1:6:445 | -19300 | 0:-1:-1 | INJECTED_GT_7_BOTTOM_445 | 445 | 1 |
| 1:8:529 | -17976 | 0:-1:-1 | INJECTED_GT_9_BOTTOM_529 | 529 | 1 |
| 1:10:611 | -18888 | 0:-1:-1 | INJECTED_GT_11_BOTTOM_611 | 611 | 1 |
| 2:1:169 | 5240 | 1:0:169 | INJECTED_GT_2_TOP_199 | 199 | 2 |
| 2:3:169 | 11644 | 1:0:169 | INJECTED_GT_4_TOP_291 | 291 | 2 |
| 2:5:169 | 3200 | 1:0:169 | INJECTED_GT_6_TOP_383 | 383 | 2 |
| 2:7:169 | 1052 | 1:0:169 | INJECTED_GT_8_TOP_474 | 474 | 2 |
| 2:9:169 | 3328 | 1:0:169 | INJECTED_GT_10_TOP_558 | 558 | 2 |
| 2:3:262 | 8276 | 1:2:262 | INJECTED_GT_4_TOP_291 | 291 | 2 |
| 2:5:262 | -168 | 1:2:262 | INJECTED_GT_6_TOP_383 | 383 | 2 |
| 2:7:262 | -2316 | 1:2:262 | INJECTED_GT_8_TOP_474 | 474 | 2 |
| 2:9:262 | -40 | 1:2:262 | INJECTED_GT_10_TOP_558 | 558 | 2 |
| 2:5:353 | -2288 | 1:4:353 | INJECTED_GT_6_TOP_383 | 383 | 2 |
| 2:7:353 | -4436 | 1:4:353 | INJECTED_GT_8_TOP_474 | 474 | 2 |
| 2:9:353 | -2160 | 1:4:353 | INJECTED_GT_10_TOP_558 | 558 | 2 |
| 2:7:445 | -3644 | 1:6:445 | INJECTED_GT_8_TOP_474 | 474 | 2 |
| 2:9:445 | -1368 | 1:6:445 | INJECTED_GT_10_TOP_558 | 558 | 2 |
| 2:9:529 | -44 | 1:8:529 | INJECTED_GT_10_TOP_558 | 558 | 2 |
| 3:2:262 | -12732 | 2:1:169 | INJECTED_GT_3_BOTTOM_262 | 262 | 3 |
| 3:4:353 | -8448 | 2:3:169 | INJECTED_GT_5_BOTTOM_353 | 353 | 3 |
| 3:6:445 | -7656 | 2:3:169 | INJECTED_GT_7_BOTTOM_445 | 445 | 3 |
| 3:8:529 | -6332 | 2:3:169 | INJECTED_GT_9_BOTTOM_529 | 529 | 3 |
| 3:10:611 | -7244 | 2:3:169 | INJECTED_GT_11_BOTTOM_611 | 611 | 3 |
| 4:3:262 | 13516 | 3:2:262 | INJECTED_GT_4_TOP_291 | 291 | 4 |
| 4:5:262 | 5072 | 3:2:262 | INJECTED_GT_6_TOP_383 | 383 | 4 |
| 4:7:262 | 2924 | 3:2:262 | INJECTED_GT_8_TOP_474 | 474 | 4 |
| 4:9:262 | 5200 | 3:2:262 | INJECTED_GT_10_TOP_558 | 558 | 4 |
| 4:5:353 | 9356 | 3:4:353 | INJECTED_GT_6_TOP_383 | 383 | 4 |
| 4:7:353 | 7208 | 3:4:353 | INJECTED_GT_8_TOP_474 | 474 | 4 |
| 4:9:353 | 9484 | 3:4:353 | INJECTED_GT_10_TOP_558 | 558 | 4 |
| 4:7:445 | 8000 | 3:6:445 | INJECTED_GT_8_TOP_474 | 474 | 4 |
| 4:9:445 | 10276 | 3:6:445 | INJECTED_GT_10_TOP_558 | 558 | 4 |
| 4:9:529 | 11600 | 3:8:529 | INJECTED_GT_10_TOP_558 | 558 | 4 |
| 5:4:353 | -6576 | 4:3:262 | INJECTED_GT_5_BOTTOM_353 | 353 | 5 |
| 5:6:445 | -5784 | 4:3:262 | INJECTED_GT_7_BOTTOM_445 | 445 | 5 |
| 5:8:529 | -4460 | 4:3:262 | INJECTED_GT_9_BOTTOM_529 | 529 | 5 |
| 5:10:611 | -5372 | 4:3:262 | INJECTED_GT_11_BOTTOM_611 | 611 | 5 |
| 6:5:353 | 11228 | 5:4:353 | INJECTED_GT_6_TOP_383 | 383 | 6 |
| 6:7:353 | 9080 | 5:4:353 | INJECTED_GT_8_TOP_474 | 474 | 6 |
| 6:9:353 | 11356 | 5:4:353 | INJECTED_GT_10_TOP_558 | 558 | 6 |
| 6:7:445 | 9872 | 5:6:445 | INJECTED_GT_8_TOP_474 | 474 | 6 |
| 6:9:445 | 12148 | 5:6:445 | INJECTED_GT_10_TOP_558 | 558 | 6 |
| 6:9:529 | 13472 | 5:8:529 | INJECTED_GT_10_TOP_558 | 558 | 6 |
| 7:6:445 | -8072 | 6:5:353 | INJECTED_GT_7_BOTTOM_445 | 445 | 7 |
| 7:8:529 | -6748 | 6:5:353 | INJECTED_GT_9_BOTTOM_529 | 529 | 7 |
| 7:10:611 | -5416 | 6:9:529 | INJECTED_GT_11_BOTTOM_611 | 611 | 7 |
| 8:7:445 | 7584 | 7:6:445 | INJECTED_GT_8_TOP_474 | 474 | 8 |
| 8:9:445 | 9860 | 7:6:445 | INJECTED_GT_10_TOP_558 | 558 | 8 |
| 8:9:529 | 11184 | 7:8:529 | INJECTED_GT_10_TOP_558 | 558 | 8 |
| 9:8:529 | -10392 | 8:7:445 | INJECTED_GT_9_BOTTOM_529 | 529 | 9 |
| 9:10:611 | -7704 | 8:9:529 | INJECTED_GT_11_BOTTOM_611 | 611 | 9 |
| 10:9:529 | 7540 | 9:8:529 | INJECTED_GT_10_TOP_558 | 558 | 10 |
| 11:10:611 | -11348 | 10:9:529 | INJECTED_GT_11_BOTTOM_611 | 611 | 11 |

## États terminaux

| rank | stateId | score | chain |
| --- | --- | --- | --- |
| 1 | 11:10:611 | -11348 | B(169) -> T(199) -> B(262) -> T(291) -> B(353) -> T(383) -> B(445) -> T(474) -> B(529) -> T(558) -> B(611) |
