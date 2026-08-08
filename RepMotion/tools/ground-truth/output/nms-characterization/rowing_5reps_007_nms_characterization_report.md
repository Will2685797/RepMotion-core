# rowing_5reps_007 — NMS minimal characterization

## Paramètres de l'expérience

- Entrée contrôlée: 46 candidats réels + 9 candidats Ground Truth injectés individuellement = 55 candidats.
- Regroupement: composantes connexes de candidats du même type; deux voisins temporels successifs appartiennent au même groupe si leur écart est inférieur ou égal à la fenêtre testée.
- Fenêtres: ±1, ±2, ±3, ±5 samples.
- Tolérance Ground Truth existante réutilisée: ±2 samples.
- Règles: candidat le plus extrême, meilleure prominence existante, candidat le plus proche du centre temporel moyen du groupe.
- Aucun DP, score temporel partiel, gyroscope ou changement de stratégie n'intervient dans cette simulation.

## Comparaison fenêtre × représentant

| windowSamples | rule | inputCandidateCount | groupCount | candidatesRemoved | mergedGroundTruthGroupCount | allRequiredPivotsPresent | missingGroundTruthPivots | groundTruthSequenceReconstructible | verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ±1 | MOST_EXTREME | 55 | 54 | 1 | 0 | true |  | true | RECONSTRUCTIBLE |
| ±1 | BEST_PROMINENCE | 55 | 54 | 1 | 0 | true |  | true | RECONSTRUCTIBLE |
| ±1 | GROUP_CENTER | 55 | 54 | 1 | 0 | true |  | true | RECONSTRUCTIBLE |
| ±2 | MOST_EXTREME | 55 | 52 | 3 | 0 | true |  | true | RECONSTRUCTIBLE |
| ±2 | BEST_PROMINENCE | 55 | 52 | 3 | 0 | true |  | true | RECONSTRUCTIBLE |
| ±2 | GROUP_CENTER | 55 | 52 | 3 | 0 | true |  | true | RECONSTRUCTIBLE |
| ±3 | MOST_EXTREME | 55 | 51 | 4 | 0 | false | TOP:558 | false | DESTROYED |
| ±3 | BEST_PROMINENCE | 55 | 51 | 4 | 0 | false | TOP:558 | false | DESTROYED |
| ±3 | GROUP_CENTER | 55 | 51 | 4 | 0 | false | TOP:558 | false | DESTROYED |
| ±5 | MOST_EXTREME | 55 | 48 | 7 | 0 | false | TOP:199, TOP:383, BOTTOM:445, TOP:558 | false | DESTROYED |
| ±5 | BEST_PROMINENCE | 55 | 48 | 7 | 0 | false | TOP:199, TOP:383, BOTTOM:445, TOP:558 | false | DESTROYED |
| ±5 | GROUP_CENTER | 55 | 48 | 7 | 0 | false | TOP:199, TOP:383, TOP:558 | false | DESTROYED |

## Contenu de tous les groupes

| windowSamples | rule | groupId | groupContent | representative | reason | associatedGroundTruth | signedDistanceToGroundTruth | withinExistingTolerance | mergedGroundTruthEvents | mergesDistinctGroundTruth |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ±1 | MOST_EXTREME | BOTTOM_1 | BOTTOM:169 | BOTTOM:169 | minimum value=14604 | BOTTOM:169 | 0 | true | BOTTOM:169 | false |
| ±1 | MOST_EXTREME | BOTTOM_2 | BOTTOM:210 | BOTTOM:210 | minimum value=14860 | BOTTOM:169 | 41 | false |  | false |
| ±1 | MOST_EXTREME | BOTTOM_3 | BOTTOM:228 | BOTTOM:228 | minimum value=14568 | BOTTOM:262 | -34 | false |  | false |
| ±1 | MOST_EXTREME | BOTTOM_4 | BOTTOM:243 | BOTTOM:243 | minimum value=15208 | BOTTOM:262 | -19 | false |  | false |
| ±1 | MOST_EXTREME | BOTTOM_5 | BOTTOM:260 | BOTTOM:260 | minimum value=16712 | BOTTOM:262 | -2 | true |  | false |
| ±1 | MOST_EXTREME | BOTTOM_6 | BOTTOM:262 | BOTTOM:262 | minimum value=17972 | BOTTOM:262 | 0 | true | BOTTOM:262 | false |
| ±1 | MOST_EXTREME | BOTTOM_7 | BOTTOM:299 | BOTTOM:299 | minimum value=11676 | BOTTOM:262 | 37 | false |  | false |
| ±1 | MOST_EXTREME | BOTTOM_8 | BOTTOM:321 | BOTTOM:321 | minimum value=14516 | BOTTOM:353 | -32 | false |  | false |
| ±1 | MOST_EXTREME | BOTTOM_9 | BOTTOM:346 | BOTTOM:346 | minimum value=17284 | BOTTOM:353 | -7 | false |  | false |
| ±1 | MOST_EXTREME | BOTTOM_10 | BOTTOM:353 | BOTTOM:353 | minimum value=20092 | BOTTOM:353 | 0 | true | BOTTOM:353 | false |
| ±1 | MOST_EXTREME | BOTTOM_11 | BOTTOM:391 | BOTTOM:391 | minimum value=9644 | BOTTOM:353 | 38 | false |  | false |
| ±1 | MOST_EXTREME | BOTTOM_12 | BOTTOM:405 | BOTTOM:405 | minimum value=14108 | BOTTOM:445 | -40 | false |  | false |
| ±1 | MOST_EXTREME | BOTTOM_13 | BOTTOM:426 | BOTTOM:426 | minimum value=14136 | BOTTOM:445 | -19 | false |  | false |
| ±1 | MOST_EXTREME | BOTTOM_14 | BOTTOM:438 | BOTTOM:438 | minimum value=17812 | BOTTOM:445 | -7 | false |  | false |
| ±1 | MOST_EXTREME | BOTTOM_15 | BOTTOM:445 | BOTTOM:445 | minimum value=19300 | BOTTOM:445 | 0 | true | BOTTOM:445 | false |
| ±1 | MOST_EXTREME | BOTTOM_16 | BOTTOM:450 | BOTTOM:450 | minimum value=17936 | BOTTOM:445 | 5 | false |  | false |
| ±1 | MOST_EXTREME | BOTTOM_17 | BOTTOM:480 | BOTTOM:480 | minimum value=13324 | BOTTOM:445 | 35 | false |  | false |
| ±1 | MOST_EXTREME | BOTTOM_18 | BOTTOM:500 | BOTTOM:500 | minimum value=12564 | BOTTOM:529 | -29 | false |  | false |
| ±1 | MOST_EXTREME | BOTTOM_19 | BOTTOM:511 | BOTTOM:511 | minimum value=14312 | BOTTOM:529 | -18 | false |  | false |
| ±1 | MOST_EXTREME | BOTTOM_20 | BOTTOM:529, BOTTOM:530 | BOTTOM:530 | minimum value=17708 | BOTTOM:529 | 1 | true | BOTTOM:529 | false |
| ±1 | MOST_EXTREME | BOTTOM_21 | BOTTOM:564 | BOTTOM:564 | minimum value=13444 | BOTTOM:529 | 35 | false |  | false |
| ±1 | MOST_EXTREME | BOTTOM_22 | BOTTOM:585 | BOTTOM:585 | minimum value=14512 | BOTTOM:611 | -26 | false |  | false |
| ±1 | MOST_EXTREME | BOTTOM_23 | BOTTOM:595 | BOTTOM:595 | minimum value=14628 | BOTTOM:611 | -16 | false |  | false |
| ±1 | MOST_EXTREME | BOTTOM_24 | BOTTOM:609 | BOTTOM:609 | minimum value=16532 | BOTTOM:611 | -2 | true |  | false |
| ±1 | MOST_EXTREME | BOTTOM_25 | BOTTOM:611 | BOTTOM:611 | minimum value=18888 | BOTTOM:611 | 0 | true | BOTTOM:611 | false |
| ±1 | MOST_EXTREME | BOTTOM_26 | BOTTOM:641 | BOTTOM:641 | minimum value=13456 | BOTTOM:611 | 30 | false |  | false |
| ±1 | MOST_EXTREME | TOP_27 | TOP:170 | TOP:170 | maximum value=20964 | TOP:199 | -29 | false |  | false |
| ±1 | MOST_EXTREME | TOP_28 | TOP:179 | TOP:179 | maximum value=19464 | TOP:199 | -20 | false |  | false |
| ±1 | MOST_EXTREME | TOP_29 | TOP:195 | TOP:195 | maximum value=24256 | TOP:199 | -4 | false |  | false |
| ±1 | MOST_EXTREME | TOP_30 | TOP:199 | TOP:199 | maximum value=19844 | TOP:199 | 0 | true | TOP:199 | false |
| ±1 | MOST_EXTREME | TOP_31 | TOP:222 | TOP:222 | maximum value=19504 | TOP:199 | 23 | false |  | false |
| ±1 | MOST_EXTREME | TOP_32 | TOP:236 | TOP:236 | maximum value=22480 | TOP:199 | 37 | false |  | false |
| ±1 | MOST_EXTREME | TOP_33 | TOP:265 | TOP:265 | maximum value=19948 | TOP:291 | -26 | false |  | false |
| ±1 | MOST_EXTREME | TOP_34 | TOP:291 | TOP:291 | maximum value=26248 | TOP:291 | 0 | true | TOP:291 | false |
| ±1 | MOST_EXTREME | TOP_35 | TOP:317 | TOP:317 | maximum value=21232 | TOP:291 | 26 | false |  | false |
| ±1 | MOST_EXTREME | TOP_36 | TOP:333 | TOP:333 | maximum value=24424 | TOP:291 | 42 | false |  | false |
| ±1 | MOST_EXTREME | TOP_37 | TOP:345 | TOP:345 | maximum value=21060 | TOP:383 | -38 | false |  | false |
| ±1 | MOST_EXTREME | TOP_38 | TOP:365 | TOP:365 | maximum value=19272 | TOP:383 | -18 | false |  | false |
| ±1 | MOST_EXTREME | TOP_39 | TOP:379 | TOP:379 | maximum value=23748 | TOP:383 | -4 | false |  | false |
| ±1 | MOST_EXTREME | TOP_40 | TOP:383 | TOP:383 | maximum value=17804 | TOP:383 | 0 | true | TOP:383 | false |
| ±1 | MOST_EXTREME | TOP_41 | TOP:411 | TOP:411 | maximum value=22604 | TOP:383 | 28 | false |  | false |
| ±1 | MOST_EXTREME | TOP_42 | TOP:421 | TOP:421 | maximum value=22684 | TOP:383 | 38 | false |  | false |
| ±1 | MOST_EXTREME | TOP_43 | TOP:436 | TOP:436 | maximum value=20868 | TOP:474 | -38 | false |  | false |
| ±1 | MOST_EXTREME | TOP_44 | TOP:467 | TOP:467 | maximum value=26536 | TOP:474 | -7 | false |  | false |
| ±1 | MOST_EXTREME | TOP_45 | TOP:474 | TOP:474 | maximum value=15656 | TOP:474 | 0 | true | TOP:474 | false |
| ±1 | MOST_EXTREME | TOP_46 | TOP:509 | TOP:509 | maximum value=23212 | TOP:474 | 35 | false |  | false |
| ±1 | MOST_EXTREME | TOP_47 | TOP:524 | TOP:524 | maximum value=22020 | TOP:558 | -34 | false |  | false |
| ±1 | MOST_EXTREME | TOP_48 | TOP:535 | TOP:535 | maximum value=19576 | TOP:558 | -23 | false |  | false |
| ±1 | MOST_EXTREME | TOP_49 | TOP:555 | TOP:555 | maximum value=22964 | TOP:558 | -3 | false |  | false |
| ±1 | MOST_EXTREME | TOP_50 | TOP:558 | TOP:558 | maximum value=17932 | TOP:558 | 0 | true | TOP:558 | false |
| ±1 | MOST_EXTREME | TOP_51 | TOP:583 | TOP:583 | maximum value=21420 | TOP:558 | 25 | false |  | false |
| ±1 | MOST_EXTREME | TOP_52 | TOP:594 | TOP:594 | maximum value=22464 | TOP:558 | 36 | false |  | false |
| ±1 | MOST_EXTREME | TOP_53 | TOP:605 | TOP:605 | maximum value=22888 | TOP:558 | 47 | false |  | false |
| ±1 | MOST_EXTREME | TOP_54 | TOP:640 | TOP:640 | maximum value=21204 | TOP:558 | 82 | false |  | false |
| ±1 | BEST_PROMINENCE | BOTTOM_1 | BOTTOM:169 | BOTTOM:169 | prominence=6360 | BOTTOM:169 | 0 | true | BOTTOM:169 | false |
| ±1 | BEST_PROMINENCE | BOTTOM_2 | BOTTOM:210 | BOTTOM:210 | prominence=2860 | BOTTOM:169 | 41 | false |  | false |
| ±1 | BEST_PROMINENCE | BOTTOM_3 | BOTTOM:228 | BOTTOM:228 | prominence=5612 | BOTTOM:262 | -34 | false |  | false |
| ±1 | BEST_PROMINENCE | BOTTOM_4 | BOTTOM:243 | BOTTOM:243 | prominence=6972 | BOTTOM:262 | -19 | false |  | false |
| ±1 | BEST_PROMINENCE | BOTTOM_5 | BOTTOM:260 | BOTTOM:260 | prominence=3236 | BOTTOM:262 | -2 | true |  | false |
| ±1 | BEST_PROMINENCE | BOTTOM_6 | BOTTOM:262 | BOTTOM:262 | prominence=1976 | BOTTOM:262 | 0 | true | BOTTOM:262 | false |
| ±1 | BEST_PROMINENCE | BOTTOM_7 | BOTTOM:299 | BOTTOM:299 | prominence=8220 | BOTTOM:262 | 37 | false |  | false |
| ±1 | BEST_PROMINENCE | BOTTOM_8 | BOTTOM:321 | BOTTOM:321 | prominence=6360 | BOTTOM:353 | -32 | false |  | false |
| ±1 | BEST_PROMINENCE | BOTTOM_9 | BOTTOM:346 | BOTTOM:346 | prominence=3404 | BOTTOM:353 | -7 | false |  | false |
| ±1 | BEST_PROMINENCE | BOTTOM_10 | BOTTOM:353 | BOTTOM:353 | prominence=0 | BOTTOM:353 | 0 | true | BOTTOM:353 | false |
| ±1 | BEST_PROMINENCE | BOTTOM_11 | BOTTOM:391 | BOTTOM:391 | prominence=8356 | BOTTOM:353 | 38 | false |  | false |
| ±1 | BEST_PROMINENCE | BOTTOM_12 | BOTTOM:405 | BOTTOM:405 | prominence=8496 | BOTTOM:445 | -40 | false |  | false |
| ±1 | BEST_PROMINENCE | BOTTOM_13 | BOTTOM:426 | BOTTOM:426 | prominence=5244 | BOTTOM:445 | -19 | false |  | false |
| ±1 | BEST_PROMINENCE | BOTTOM_14 | BOTTOM:438 | BOTTOM:438 | prominence=2864 | BOTTOM:445 | -7 | false |  | false |
| ±1 | BEST_PROMINENCE | BOTTOM_15 | BOTTOM:445 | BOTTOM:445 | prominence=0 | BOTTOM:445 | 0 | true | BOTTOM:445 | false |
| ±1 | BEST_PROMINENCE | BOTTOM_16 | BOTTOM:450 | BOTTOM:450 | prominence=1028 | BOTTOM:445 | 5 | false |  | false |
| ±1 | BEST_PROMINENCE | BOTTOM_17 | BOTTOM:480 | BOTTOM:480 | prominence=5408 | BOTTOM:445 | 35 | false |  | false |
| ±1 | BEST_PROMINENCE | BOTTOM_18 | BOTTOM:500 | BOTTOM:500 | prominence=8920 | BOTTOM:529 | -29 | false |  | false |
| ±1 | BEST_PROMINENCE | BOTTOM_19 | BOTTOM:511 | BOTTOM:511 | prominence=7544 | BOTTOM:529 | -18 | false |  | false |
| ±1 | BEST_PROMINENCE | BOTTOM_20 | BOTTOM:529, BOTTOM:530 | BOTTOM:530 | prominence=1868 | BOTTOM:529 | 1 | true | BOTTOM:529 | false |
| ±1 | BEST_PROMINENCE | BOTTOM_21 | BOTTOM:564 | BOTTOM:564 | prominence=5416 | BOTTOM:529 | 35 | false |  | false |
| ±1 | BEST_PROMINENCE | BOTTOM_22 | BOTTOM:585 | BOTTOM:585 | prominence=6316 | BOTTOM:611 | -26 | false |  | false |
| ±1 | BEST_PROMINENCE | BOTTOM_23 | BOTTOM:595 | BOTTOM:595 | prominence=6396 | BOTTOM:611 | -16 | false |  | false |
| ±1 | BEST_PROMINENCE | BOTTOM_24 | BOTTOM:609 | BOTTOM:609 | prominence=3880 | BOTTOM:611 | -2 | true |  | false |
| ±1 | BEST_PROMINENCE | BOTTOM_25 | BOTTOM:611 | BOTTOM:611 | prominence=852 | BOTTOM:611 | 0 | true | BOTTOM:611 | false |
| ±1 | BEST_PROMINENCE | BOTTOM_26 | BOTTOM:641 | BOTTOM:641 | prominence=5332 | BOTTOM:611 | 30 | false |  | false |
| ±1 | BEST_PROMINENCE | TOP_27 | TOP:170 | TOP:170 | prominence=4476 | TOP:199 | -29 | false |  | false |
| ±1 | BEST_PROMINENCE | TOP_28 | TOP:179 | TOP:179 | prominence=1064 | TOP:199 | -20 | false |  | false |
| ±1 | BEST_PROMINENCE | TOP_29 | TOP:195 | TOP:195 | prominence=7624 | TOP:199 | -4 | false |  | false |
| ±1 | BEST_PROMINENCE | TOP_30 | TOP:199 | TOP:199 | prominence=4104 | TOP:199 | 0 | true | TOP:199 | false |
| ±1 | BEST_PROMINENCE | TOP_31 | TOP:222 | TOP:222 | prominence=4936 | TOP:199 | 23 | false |  | false |
| ±1 | BEST_PROMINENCE | TOP_32 | TOP:236 | TOP:236 | prominence=7272 | TOP:199 | 37 | false |  | false |
| ±1 | BEST_PROMINENCE | TOP_33 | TOP:265 | TOP:265 | prominence=1404 | TOP:291 | -26 | false |  | false |
| ±1 | BEST_PROMINENCE | TOP_34 | TOP:291 | TOP:291 | prominence=9772 | TOP:291 | 0 | true | TOP:291 | false |
| ±1 | BEST_PROMINENCE | TOP_35 | TOP:317 | TOP:317 | prominence=6716 | TOP:291 | 26 | false |  | false |
| ±1 | BEST_PROMINENCE | TOP_36 | TOP:333 | TOP:333 | prominence=6684 | TOP:291 | 42 | false |  | false |
| ±1 | BEST_PROMINENCE | TOP_37 | TOP:345 | TOP:345 | prominence=3776 | TOP:383 | -38 | false |  | false |
| ±1 | BEST_PROMINENCE | TOP_38 | TOP:365 | TOP:365 | prominence=780 | TOP:383 | -18 | false |  | false |
| ±1 | BEST_PROMINENCE | TOP_39 | TOP:379 | TOP:379 | prominence=8920 | TOP:383 | -4 | false |  | false |
| ±1 | BEST_PROMINENCE | TOP_40 | TOP:383 | TOP:383 | prominence=3536 | TOP:383 | 0 | true | TOP:383 | false |
| ±1 | BEST_PROMINENCE | TOP_41 | TOP:411 | TOP:411 | prominence=7684 | TOP:383 | 28 | false |  | false |
| ±1 | BEST_PROMINENCE | TOP_42 | TOP:421 | TOP:421 | prominence=8548 | TOP:383 | 38 | false |  | false |
| ±1 | BEST_PROMINENCE | TOP_43 | TOP:436 | TOP:436 | prominence=3056 | TOP:474 | -38 | false |  | false |
| ±1 | BEST_PROMINENCE | TOP_44 | TOP:467 | TOP:467 | prominence=10880 | TOP:474 | -7 | false |  | false |
| ±1 | BEST_PROMINENCE | TOP_45 | TOP:474 | TOP:474 | prominence=2332 | TOP:474 | 0 | true | TOP:474 | false |
| ±1 | BEST_PROMINENCE | TOP_46 | TOP:509 | TOP:509 | prominence=8900 | TOP:474 | 35 | false |  | false |
| ±1 | BEST_PROMINENCE | TOP_47 | TOP:524 | TOP:524 | prominence=4312 | TOP:558 | -34 | false |  | false |
| ±1 | BEST_PROMINENCE | TOP_48 | TOP:535 | TOP:535 | prominence=1120 | TOP:558 | -23 | false |  | false |
| ±1 | BEST_PROMINENCE | TOP_49 | TOP:555 | TOP:555 | prominence=7020 | TOP:558 | -3 | false |  | false |
| ±1 | BEST_PROMINENCE | TOP_50 | TOP:558 | TOP:558 | prominence=4488 | TOP:558 | 0 | true | TOP:558 | false |
| ±1 | BEST_PROMINENCE | TOP_51 | TOP:583 | TOP:583 | prominence=6908 | TOP:558 | 25 | false |  | false |
| ±1 | BEST_PROMINENCE | TOP_52 | TOP:594 | TOP:594 | prominence=7836 | TOP:558 | 36 | false |  | false |
| ±1 | BEST_PROMINENCE | TOP_53 | TOP:605 | TOP:605 | prominence=6356 | TOP:558 | 47 | false |  | false |
| ±1 | BEST_PROMINENCE | TOP_54 | TOP:640 | TOP:640 | prominence=7748 | TOP:558 | 82 | false |  | false |
| ±1 | GROUP_CENTER | BOTTOM_1 | BOTTOM:169 | BOTTOM:169 | distanceToGroupCenter=0, center=169 | BOTTOM:169 | 0 | true | BOTTOM:169 | false |
| ±1 | GROUP_CENTER | BOTTOM_2 | BOTTOM:210 | BOTTOM:210 | distanceToGroupCenter=0, center=210 | BOTTOM:169 | 41 | false |  | false |
| ±1 | GROUP_CENTER | BOTTOM_3 | BOTTOM:228 | BOTTOM:228 | distanceToGroupCenter=0, center=228 | BOTTOM:262 | -34 | false |  | false |
| ±1 | GROUP_CENTER | BOTTOM_4 | BOTTOM:243 | BOTTOM:243 | distanceToGroupCenter=0, center=243 | BOTTOM:262 | -19 | false |  | false |
| ±1 | GROUP_CENTER | BOTTOM_5 | BOTTOM:260 | BOTTOM:260 | distanceToGroupCenter=0, center=260 | BOTTOM:262 | -2 | true |  | false |
| ±1 | GROUP_CENTER | BOTTOM_6 | BOTTOM:262 | BOTTOM:262 | distanceToGroupCenter=0, center=262 | BOTTOM:262 | 0 | true | BOTTOM:262 | false |
| ±1 | GROUP_CENTER | BOTTOM_7 | BOTTOM:299 | BOTTOM:299 | distanceToGroupCenter=0, center=299 | BOTTOM:262 | 37 | false |  | false |
| ±1 | GROUP_CENTER | BOTTOM_8 | BOTTOM:321 | BOTTOM:321 | distanceToGroupCenter=0, center=321 | BOTTOM:353 | -32 | false |  | false |
| ±1 | GROUP_CENTER | BOTTOM_9 | BOTTOM:346 | BOTTOM:346 | distanceToGroupCenter=0, center=346 | BOTTOM:353 | -7 | false |  | false |
| ±1 | GROUP_CENTER | BOTTOM_10 | BOTTOM:353 | BOTTOM:353 | distanceToGroupCenter=0, center=353 | BOTTOM:353 | 0 | true | BOTTOM:353 | false |
| ±1 | GROUP_CENTER | BOTTOM_11 | BOTTOM:391 | BOTTOM:391 | distanceToGroupCenter=0, center=391 | BOTTOM:353 | 38 | false |  | false |
| ±1 | GROUP_CENTER | BOTTOM_12 | BOTTOM:405 | BOTTOM:405 | distanceToGroupCenter=0, center=405 | BOTTOM:445 | -40 | false |  | false |
| ±1 | GROUP_CENTER | BOTTOM_13 | BOTTOM:426 | BOTTOM:426 | distanceToGroupCenter=0, center=426 | BOTTOM:445 | -19 | false |  | false |
| ±1 | GROUP_CENTER | BOTTOM_14 | BOTTOM:438 | BOTTOM:438 | distanceToGroupCenter=0, center=438 | BOTTOM:445 | -7 | false |  | false |
| ±1 | GROUP_CENTER | BOTTOM_15 | BOTTOM:445 | BOTTOM:445 | distanceToGroupCenter=0, center=445 | BOTTOM:445 | 0 | true | BOTTOM:445 | false |
| ±1 | GROUP_CENTER | BOTTOM_16 | BOTTOM:450 | BOTTOM:450 | distanceToGroupCenter=0, center=450 | BOTTOM:445 | 5 | false |  | false |
| ±1 | GROUP_CENTER | BOTTOM_17 | BOTTOM:480 | BOTTOM:480 | distanceToGroupCenter=0, center=480 | BOTTOM:445 | 35 | false |  | false |
| ±1 | GROUP_CENTER | BOTTOM_18 | BOTTOM:500 | BOTTOM:500 | distanceToGroupCenter=0, center=500 | BOTTOM:529 | -29 | false |  | false |
| ±1 | GROUP_CENTER | BOTTOM_19 | BOTTOM:511 | BOTTOM:511 | distanceToGroupCenter=0, center=511 | BOTTOM:529 | -18 | false |  | false |
| ±1 | GROUP_CENTER | BOTTOM_20 | BOTTOM:529, BOTTOM:530 | BOTTOM:529 | distanceToGroupCenter=0.5, center=529.5 | BOTTOM:529 | 0 | true | BOTTOM:529 | false |
| ±1 | GROUP_CENTER | BOTTOM_21 | BOTTOM:564 | BOTTOM:564 | distanceToGroupCenter=0, center=564 | BOTTOM:529 | 35 | false |  | false |
| ±1 | GROUP_CENTER | BOTTOM_22 | BOTTOM:585 | BOTTOM:585 | distanceToGroupCenter=0, center=585 | BOTTOM:611 | -26 | false |  | false |
| ±1 | GROUP_CENTER | BOTTOM_23 | BOTTOM:595 | BOTTOM:595 | distanceToGroupCenter=0, center=595 | BOTTOM:611 | -16 | false |  | false |
| ±1 | GROUP_CENTER | BOTTOM_24 | BOTTOM:609 | BOTTOM:609 | distanceToGroupCenter=0, center=609 | BOTTOM:611 | -2 | true |  | false |
| ±1 | GROUP_CENTER | BOTTOM_25 | BOTTOM:611 | BOTTOM:611 | distanceToGroupCenter=0, center=611 | BOTTOM:611 | 0 | true | BOTTOM:611 | false |
| ±1 | GROUP_CENTER | BOTTOM_26 | BOTTOM:641 | BOTTOM:641 | distanceToGroupCenter=0, center=641 | BOTTOM:611 | 30 | false |  | false |
| ±1 | GROUP_CENTER | TOP_27 | TOP:170 | TOP:170 | distanceToGroupCenter=0, center=170 | TOP:199 | -29 | false |  | false |
| ±1 | GROUP_CENTER | TOP_28 | TOP:179 | TOP:179 | distanceToGroupCenter=0, center=179 | TOP:199 | -20 | false |  | false |
| ±1 | GROUP_CENTER | TOP_29 | TOP:195 | TOP:195 | distanceToGroupCenter=0, center=195 | TOP:199 | -4 | false |  | false |
| ±1 | GROUP_CENTER | TOP_30 | TOP:199 | TOP:199 | distanceToGroupCenter=0, center=199 | TOP:199 | 0 | true | TOP:199 | false |
| ±1 | GROUP_CENTER | TOP_31 | TOP:222 | TOP:222 | distanceToGroupCenter=0, center=222 | TOP:199 | 23 | false |  | false |
| ±1 | GROUP_CENTER | TOP_32 | TOP:236 | TOP:236 | distanceToGroupCenter=0, center=236 | TOP:199 | 37 | false |  | false |
| ±1 | GROUP_CENTER | TOP_33 | TOP:265 | TOP:265 | distanceToGroupCenter=0, center=265 | TOP:291 | -26 | false |  | false |
| ±1 | GROUP_CENTER | TOP_34 | TOP:291 | TOP:291 | distanceToGroupCenter=0, center=291 | TOP:291 | 0 | true | TOP:291 | false |
| ±1 | GROUP_CENTER | TOP_35 | TOP:317 | TOP:317 | distanceToGroupCenter=0, center=317 | TOP:291 | 26 | false |  | false |
| ±1 | GROUP_CENTER | TOP_36 | TOP:333 | TOP:333 | distanceToGroupCenter=0, center=333 | TOP:291 | 42 | false |  | false |
| ±1 | GROUP_CENTER | TOP_37 | TOP:345 | TOP:345 | distanceToGroupCenter=0, center=345 | TOP:383 | -38 | false |  | false |
| ±1 | GROUP_CENTER | TOP_38 | TOP:365 | TOP:365 | distanceToGroupCenter=0, center=365 | TOP:383 | -18 | false |  | false |
| ±1 | GROUP_CENTER | TOP_39 | TOP:379 | TOP:379 | distanceToGroupCenter=0, center=379 | TOP:383 | -4 | false |  | false |
| ±1 | GROUP_CENTER | TOP_40 | TOP:383 | TOP:383 | distanceToGroupCenter=0, center=383 | TOP:383 | 0 | true | TOP:383 | false |
| ±1 | GROUP_CENTER | TOP_41 | TOP:411 | TOP:411 | distanceToGroupCenter=0, center=411 | TOP:383 | 28 | false |  | false |
| ±1 | GROUP_CENTER | TOP_42 | TOP:421 | TOP:421 | distanceToGroupCenter=0, center=421 | TOP:383 | 38 | false |  | false |
| ±1 | GROUP_CENTER | TOP_43 | TOP:436 | TOP:436 | distanceToGroupCenter=0, center=436 | TOP:474 | -38 | false |  | false |
| ±1 | GROUP_CENTER | TOP_44 | TOP:467 | TOP:467 | distanceToGroupCenter=0, center=467 | TOP:474 | -7 | false |  | false |
| ±1 | GROUP_CENTER | TOP_45 | TOP:474 | TOP:474 | distanceToGroupCenter=0, center=474 | TOP:474 | 0 | true | TOP:474 | false |
| ±1 | GROUP_CENTER | TOP_46 | TOP:509 | TOP:509 | distanceToGroupCenter=0, center=509 | TOP:474 | 35 | false |  | false |
| ±1 | GROUP_CENTER | TOP_47 | TOP:524 | TOP:524 | distanceToGroupCenter=0, center=524 | TOP:558 | -34 | false |  | false |
| ±1 | GROUP_CENTER | TOP_48 | TOP:535 | TOP:535 | distanceToGroupCenter=0, center=535 | TOP:558 | -23 | false |  | false |
| ±1 | GROUP_CENTER | TOP_49 | TOP:555 | TOP:555 | distanceToGroupCenter=0, center=555 | TOP:558 | -3 | false |  | false |
| ±1 | GROUP_CENTER | TOP_50 | TOP:558 | TOP:558 | distanceToGroupCenter=0, center=558 | TOP:558 | 0 | true | TOP:558 | false |
| ±1 | GROUP_CENTER | TOP_51 | TOP:583 | TOP:583 | distanceToGroupCenter=0, center=583 | TOP:558 | 25 | false |  | false |
| ±1 | GROUP_CENTER | TOP_52 | TOP:594 | TOP:594 | distanceToGroupCenter=0, center=594 | TOP:558 | 36 | false |  | false |
| ±1 | GROUP_CENTER | TOP_53 | TOP:605 | TOP:605 | distanceToGroupCenter=0, center=605 | TOP:558 | 47 | false |  | false |
| ±1 | GROUP_CENTER | TOP_54 | TOP:640 | TOP:640 | distanceToGroupCenter=0, center=640 | TOP:558 | 82 | false |  | false |
| ±2 | MOST_EXTREME | BOTTOM_1 | BOTTOM:169 | BOTTOM:169 | minimum value=14604 | BOTTOM:169 | 0 | true | BOTTOM:169 | false |
| ±2 | MOST_EXTREME | BOTTOM_2 | BOTTOM:210 | BOTTOM:210 | minimum value=14860 | BOTTOM:169 | 41 | false |  | false |
| ±2 | MOST_EXTREME | BOTTOM_3 | BOTTOM:228 | BOTTOM:228 | minimum value=14568 | BOTTOM:262 | -34 | false |  | false |
| ±2 | MOST_EXTREME | BOTTOM_4 | BOTTOM:243 | BOTTOM:243 | minimum value=15208 | BOTTOM:262 | -19 | false |  | false |
| ±2 | MOST_EXTREME | BOTTOM_5 | BOTTOM:260, BOTTOM:262 | BOTTOM:260 | minimum value=16712 | BOTTOM:262 | -2 | true | BOTTOM:262 | false |
| ±2 | MOST_EXTREME | BOTTOM_6 | BOTTOM:299 | BOTTOM:299 | minimum value=11676 | BOTTOM:262 | 37 | false |  | false |
| ±2 | MOST_EXTREME | BOTTOM_7 | BOTTOM:321 | BOTTOM:321 | minimum value=14516 | BOTTOM:353 | -32 | false |  | false |
| ±2 | MOST_EXTREME | BOTTOM_8 | BOTTOM:346 | BOTTOM:346 | minimum value=17284 | BOTTOM:353 | -7 | false |  | false |
| ±2 | MOST_EXTREME | BOTTOM_9 | BOTTOM:353 | BOTTOM:353 | minimum value=20092 | BOTTOM:353 | 0 | true | BOTTOM:353 | false |
| ±2 | MOST_EXTREME | BOTTOM_10 | BOTTOM:391 | BOTTOM:391 | minimum value=9644 | BOTTOM:353 | 38 | false |  | false |
| ±2 | MOST_EXTREME | BOTTOM_11 | BOTTOM:405 | BOTTOM:405 | minimum value=14108 | BOTTOM:445 | -40 | false |  | false |
| ±2 | MOST_EXTREME | BOTTOM_12 | BOTTOM:426 | BOTTOM:426 | minimum value=14136 | BOTTOM:445 | -19 | false |  | false |
| ±2 | MOST_EXTREME | BOTTOM_13 | BOTTOM:438 | BOTTOM:438 | minimum value=17812 | BOTTOM:445 | -7 | false |  | false |
| ±2 | MOST_EXTREME | BOTTOM_14 | BOTTOM:445 | BOTTOM:445 | minimum value=19300 | BOTTOM:445 | 0 | true | BOTTOM:445 | false |
| ±2 | MOST_EXTREME | BOTTOM_15 | BOTTOM:450 | BOTTOM:450 | minimum value=17936 | BOTTOM:445 | 5 | false |  | false |
| ±2 | MOST_EXTREME | BOTTOM_16 | BOTTOM:480 | BOTTOM:480 | minimum value=13324 | BOTTOM:445 | 35 | false |  | false |
| ±2 | MOST_EXTREME | BOTTOM_17 | BOTTOM:500 | BOTTOM:500 | minimum value=12564 | BOTTOM:529 | -29 | false |  | false |
| ±2 | MOST_EXTREME | BOTTOM_18 | BOTTOM:511 | BOTTOM:511 | minimum value=14312 | BOTTOM:529 | -18 | false |  | false |
| ±2 | MOST_EXTREME | BOTTOM_19 | BOTTOM:529, BOTTOM:530 | BOTTOM:530 | minimum value=17708 | BOTTOM:529 | 1 | true | BOTTOM:529 | false |
| ±2 | MOST_EXTREME | BOTTOM_20 | BOTTOM:564 | BOTTOM:564 | minimum value=13444 | BOTTOM:529 | 35 | false |  | false |
| ±2 | MOST_EXTREME | BOTTOM_21 | BOTTOM:585 | BOTTOM:585 | minimum value=14512 | BOTTOM:611 | -26 | false |  | false |
| ±2 | MOST_EXTREME | BOTTOM_22 | BOTTOM:595 | BOTTOM:595 | minimum value=14628 | BOTTOM:611 | -16 | false |  | false |
| ±2 | MOST_EXTREME | BOTTOM_23 | BOTTOM:609, BOTTOM:611 | BOTTOM:609 | minimum value=16532 | BOTTOM:611 | -2 | true | BOTTOM:611 | false |
| ±2 | MOST_EXTREME | BOTTOM_24 | BOTTOM:641 | BOTTOM:641 | minimum value=13456 | BOTTOM:611 | 30 | false |  | false |
| ±2 | MOST_EXTREME | TOP_25 | TOP:170 | TOP:170 | maximum value=20964 | TOP:199 | -29 | false |  | false |
| ±2 | MOST_EXTREME | TOP_26 | TOP:179 | TOP:179 | maximum value=19464 | TOP:199 | -20 | false |  | false |
| ±2 | MOST_EXTREME | TOP_27 | TOP:195 | TOP:195 | maximum value=24256 | TOP:199 | -4 | false |  | false |
| ±2 | MOST_EXTREME | TOP_28 | TOP:199 | TOP:199 | maximum value=19844 | TOP:199 | 0 | true | TOP:199 | false |
| ±2 | MOST_EXTREME | TOP_29 | TOP:222 | TOP:222 | maximum value=19504 | TOP:199 | 23 | false |  | false |
| ±2 | MOST_EXTREME | TOP_30 | TOP:236 | TOP:236 | maximum value=22480 | TOP:199 | 37 | false |  | false |
| ±2 | MOST_EXTREME | TOP_31 | TOP:265 | TOP:265 | maximum value=19948 | TOP:291 | -26 | false |  | false |
| ±2 | MOST_EXTREME | TOP_32 | TOP:291 | TOP:291 | maximum value=26248 | TOP:291 | 0 | true | TOP:291 | false |
| ±2 | MOST_EXTREME | TOP_33 | TOP:317 | TOP:317 | maximum value=21232 | TOP:291 | 26 | false |  | false |
| ±2 | MOST_EXTREME | TOP_34 | TOP:333 | TOP:333 | maximum value=24424 | TOP:291 | 42 | false |  | false |
| ±2 | MOST_EXTREME | TOP_35 | TOP:345 | TOP:345 | maximum value=21060 | TOP:383 | -38 | false |  | false |
| ±2 | MOST_EXTREME | TOP_36 | TOP:365 | TOP:365 | maximum value=19272 | TOP:383 | -18 | false |  | false |
| ±2 | MOST_EXTREME | TOP_37 | TOP:379 | TOP:379 | maximum value=23748 | TOP:383 | -4 | false |  | false |
| ±2 | MOST_EXTREME | TOP_38 | TOP:383 | TOP:383 | maximum value=17804 | TOP:383 | 0 | true | TOP:383 | false |
| ±2 | MOST_EXTREME | TOP_39 | TOP:411 | TOP:411 | maximum value=22604 | TOP:383 | 28 | false |  | false |
| ±2 | MOST_EXTREME | TOP_40 | TOP:421 | TOP:421 | maximum value=22684 | TOP:383 | 38 | false |  | false |
| ±2 | MOST_EXTREME | TOP_41 | TOP:436 | TOP:436 | maximum value=20868 | TOP:474 | -38 | false |  | false |
| ±2 | MOST_EXTREME | TOP_42 | TOP:467 | TOP:467 | maximum value=26536 | TOP:474 | -7 | false |  | false |
| ±2 | MOST_EXTREME | TOP_43 | TOP:474 | TOP:474 | maximum value=15656 | TOP:474 | 0 | true | TOP:474 | false |
| ±2 | MOST_EXTREME | TOP_44 | TOP:509 | TOP:509 | maximum value=23212 | TOP:474 | 35 | false |  | false |
| ±2 | MOST_EXTREME | TOP_45 | TOP:524 | TOP:524 | maximum value=22020 | TOP:558 | -34 | false |  | false |
| ±2 | MOST_EXTREME | TOP_46 | TOP:535 | TOP:535 | maximum value=19576 | TOP:558 | -23 | false |  | false |
| ±2 | MOST_EXTREME | TOP_47 | TOP:555 | TOP:555 | maximum value=22964 | TOP:558 | -3 | false |  | false |
| ±2 | MOST_EXTREME | TOP_48 | TOP:558 | TOP:558 | maximum value=17932 | TOP:558 | 0 | true | TOP:558 | false |
| ±2 | MOST_EXTREME | TOP_49 | TOP:583 | TOP:583 | maximum value=21420 | TOP:558 | 25 | false |  | false |
| ±2 | MOST_EXTREME | TOP_50 | TOP:594 | TOP:594 | maximum value=22464 | TOP:558 | 36 | false |  | false |
| ±2 | MOST_EXTREME | TOP_51 | TOP:605 | TOP:605 | maximum value=22888 | TOP:558 | 47 | false |  | false |
| ±2 | MOST_EXTREME | TOP_52 | TOP:640 | TOP:640 | maximum value=21204 | TOP:558 | 82 | false |  | false |
| ±2 | BEST_PROMINENCE | BOTTOM_1 | BOTTOM:169 | BOTTOM:169 | prominence=6360 | BOTTOM:169 | 0 | true | BOTTOM:169 | false |
| ±2 | BEST_PROMINENCE | BOTTOM_2 | BOTTOM:210 | BOTTOM:210 | prominence=2860 | BOTTOM:169 | 41 | false |  | false |
| ±2 | BEST_PROMINENCE | BOTTOM_3 | BOTTOM:228 | BOTTOM:228 | prominence=5612 | BOTTOM:262 | -34 | false |  | false |
| ±2 | BEST_PROMINENCE | BOTTOM_4 | BOTTOM:243 | BOTTOM:243 | prominence=6972 | BOTTOM:262 | -19 | false |  | false |
| ±2 | BEST_PROMINENCE | BOTTOM_5 | BOTTOM:260, BOTTOM:262 | BOTTOM:260 | prominence=3236 | BOTTOM:262 | -2 | true | BOTTOM:262 | false |
| ±2 | BEST_PROMINENCE | BOTTOM_6 | BOTTOM:299 | BOTTOM:299 | prominence=8220 | BOTTOM:262 | 37 | false |  | false |
| ±2 | BEST_PROMINENCE | BOTTOM_7 | BOTTOM:321 | BOTTOM:321 | prominence=6360 | BOTTOM:353 | -32 | false |  | false |
| ±2 | BEST_PROMINENCE | BOTTOM_8 | BOTTOM:346 | BOTTOM:346 | prominence=3404 | BOTTOM:353 | -7 | false |  | false |
| ±2 | BEST_PROMINENCE | BOTTOM_9 | BOTTOM:353 | BOTTOM:353 | prominence=0 | BOTTOM:353 | 0 | true | BOTTOM:353 | false |
| ±2 | BEST_PROMINENCE | BOTTOM_10 | BOTTOM:391 | BOTTOM:391 | prominence=8356 | BOTTOM:353 | 38 | false |  | false |
| ±2 | BEST_PROMINENCE | BOTTOM_11 | BOTTOM:405 | BOTTOM:405 | prominence=8496 | BOTTOM:445 | -40 | false |  | false |
| ±2 | BEST_PROMINENCE | BOTTOM_12 | BOTTOM:426 | BOTTOM:426 | prominence=5244 | BOTTOM:445 | -19 | false |  | false |
| ±2 | BEST_PROMINENCE | BOTTOM_13 | BOTTOM:438 | BOTTOM:438 | prominence=2864 | BOTTOM:445 | -7 | false |  | false |
| ±2 | BEST_PROMINENCE | BOTTOM_14 | BOTTOM:445 | BOTTOM:445 | prominence=0 | BOTTOM:445 | 0 | true | BOTTOM:445 | false |
| ±2 | BEST_PROMINENCE | BOTTOM_15 | BOTTOM:450 | BOTTOM:450 | prominence=1028 | BOTTOM:445 | 5 | false |  | false |
| ±2 | BEST_PROMINENCE | BOTTOM_16 | BOTTOM:480 | BOTTOM:480 | prominence=5408 | BOTTOM:445 | 35 | false |  | false |
| ±2 | BEST_PROMINENCE | BOTTOM_17 | BOTTOM:500 | BOTTOM:500 | prominence=8920 | BOTTOM:529 | -29 | false |  | false |
| ±2 | BEST_PROMINENCE | BOTTOM_18 | BOTTOM:511 | BOTTOM:511 | prominence=7544 | BOTTOM:529 | -18 | false |  | false |
| ±2 | BEST_PROMINENCE | BOTTOM_19 | BOTTOM:529, BOTTOM:530 | BOTTOM:530 | prominence=1868 | BOTTOM:529 | 1 | true | BOTTOM:529 | false |
| ±2 | BEST_PROMINENCE | BOTTOM_20 | BOTTOM:564 | BOTTOM:564 | prominence=5416 | BOTTOM:529 | 35 | false |  | false |
| ±2 | BEST_PROMINENCE | BOTTOM_21 | BOTTOM:585 | BOTTOM:585 | prominence=6316 | BOTTOM:611 | -26 | false |  | false |
| ±2 | BEST_PROMINENCE | BOTTOM_22 | BOTTOM:595 | BOTTOM:595 | prominence=6396 | BOTTOM:611 | -16 | false |  | false |
| ±2 | BEST_PROMINENCE | BOTTOM_23 | BOTTOM:609, BOTTOM:611 | BOTTOM:609 | prominence=3880 | BOTTOM:611 | -2 | true | BOTTOM:611 | false |
| ±2 | BEST_PROMINENCE | BOTTOM_24 | BOTTOM:641 | BOTTOM:641 | prominence=5332 | BOTTOM:611 | 30 | false |  | false |
| ±2 | BEST_PROMINENCE | TOP_25 | TOP:170 | TOP:170 | prominence=4476 | TOP:199 | -29 | false |  | false |
| ±2 | BEST_PROMINENCE | TOP_26 | TOP:179 | TOP:179 | prominence=1064 | TOP:199 | -20 | false |  | false |
| ±2 | BEST_PROMINENCE | TOP_27 | TOP:195 | TOP:195 | prominence=7624 | TOP:199 | -4 | false |  | false |
| ±2 | BEST_PROMINENCE | TOP_28 | TOP:199 | TOP:199 | prominence=4104 | TOP:199 | 0 | true | TOP:199 | false |
| ±2 | BEST_PROMINENCE | TOP_29 | TOP:222 | TOP:222 | prominence=4936 | TOP:199 | 23 | false |  | false |
| ±2 | BEST_PROMINENCE | TOP_30 | TOP:236 | TOP:236 | prominence=7272 | TOP:199 | 37 | false |  | false |
| ±2 | BEST_PROMINENCE | TOP_31 | TOP:265 | TOP:265 | prominence=1404 | TOP:291 | -26 | false |  | false |
| ±2 | BEST_PROMINENCE | TOP_32 | TOP:291 | TOP:291 | prominence=9772 | TOP:291 | 0 | true | TOP:291 | false |
| ±2 | BEST_PROMINENCE | TOP_33 | TOP:317 | TOP:317 | prominence=6716 | TOP:291 | 26 | false |  | false |
| ±2 | BEST_PROMINENCE | TOP_34 | TOP:333 | TOP:333 | prominence=6684 | TOP:291 | 42 | false |  | false |
| ±2 | BEST_PROMINENCE | TOP_35 | TOP:345 | TOP:345 | prominence=3776 | TOP:383 | -38 | false |  | false |
| ±2 | BEST_PROMINENCE | TOP_36 | TOP:365 | TOP:365 | prominence=780 | TOP:383 | -18 | false |  | false |
| ±2 | BEST_PROMINENCE | TOP_37 | TOP:379 | TOP:379 | prominence=8920 | TOP:383 | -4 | false |  | false |
| ±2 | BEST_PROMINENCE | TOP_38 | TOP:383 | TOP:383 | prominence=3536 | TOP:383 | 0 | true | TOP:383 | false |
| ±2 | BEST_PROMINENCE | TOP_39 | TOP:411 | TOP:411 | prominence=7684 | TOP:383 | 28 | false |  | false |
| ±2 | BEST_PROMINENCE | TOP_40 | TOP:421 | TOP:421 | prominence=8548 | TOP:383 | 38 | false |  | false |
| ±2 | BEST_PROMINENCE | TOP_41 | TOP:436 | TOP:436 | prominence=3056 | TOP:474 | -38 | false |  | false |
| ±2 | BEST_PROMINENCE | TOP_42 | TOP:467 | TOP:467 | prominence=10880 | TOP:474 | -7 | false |  | false |
| ±2 | BEST_PROMINENCE | TOP_43 | TOP:474 | TOP:474 | prominence=2332 | TOP:474 | 0 | true | TOP:474 | false |
| ±2 | BEST_PROMINENCE | TOP_44 | TOP:509 | TOP:509 | prominence=8900 | TOP:474 | 35 | false |  | false |
| ±2 | BEST_PROMINENCE | TOP_45 | TOP:524 | TOP:524 | prominence=4312 | TOP:558 | -34 | false |  | false |
| ±2 | BEST_PROMINENCE | TOP_46 | TOP:535 | TOP:535 | prominence=1120 | TOP:558 | -23 | false |  | false |
| ±2 | BEST_PROMINENCE | TOP_47 | TOP:555 | TOP:555 | prominence=7020 | TOP:558 | -3 | false |  | false |
| ±2 | BEST_PROMINENCE | TOP_48 | TOP:558 | TOP:558 | prominence=4488 | TOP:558 | 0 | true | TOP:558 | false |
| ±2 | BEST_PROMINENCE | TOP_49 | TOP:583 | TOP:583 | prominence=6908 | TOP:558 | 25 | false |  | false |
| ±2 | BEST_PROMINENCE | TOP_50 | TOP:594 | TOP:594 | prominence=7836 | TOP:558 | 36 | false |  | false |
| ±2 | BEST_PROMINENCE | TOP_51 | TOP:605 | TOP:605 | prominence=6356 | TOP:558 | 47 | false |  | false |
| ±2 | BEST_PROMINENCE | TOP_52 | TOP:640 | TOP:640 | prominence=7748 | TOP:558 | 82 | false |  | false |
| ±2 | GROUP_CENTER | BOTTOM_1 | BOTTOM:169 | BOTTOM:169 | distanceToGroupCenter=0, center=169 | BOTTOM:169 | 0 | true | BOTTOM:169 | false |
| ±2 | GROUP_CENTER | BOTTOM_2 | BOTTOM:210 | BOTTOM:210 | distanceToGroupCenter=0, center=210 | BOTTOM:169 | 41 | false |  | false |
| ±2 | GROUP_CENTER | BOTTOM_3 | BOTTOM:228 | BOTTOM:228 | distanceToGroupCenter=0, center=228 | BOTTOM:262 | -34 | false |  | false |
| ±2 | GROUP_CENTER | BOTTOM_4 | BOTTOM:243 | BOTTOM:243 | distanceToGroupCenter=0, center=243 | BOTTOM:262 | -19 | false |  | false |
| ±2 | GROUP_CENTER | BOTTOM_5 | BOTTOM:260, BOTTOM:262 | BOTTOM:260 | distanceToGroupCenter=1, center=261 | BOTTOM:262 | -2 | true | BOTTOM:262 | false |
| ±2 | GROUP_CENTER | BOTTOM_6 | BOTTOM:299 | BOTTOM:299 | distanceToGroupCenter=0, center=299 | BOTTOM:262 | 37 | false |  | false |
| ±2 | GROUP_CENTER | BOTTOM_7 | BOTTOM:321 | BOTTOM:321 | distanceToGroupCenter=0, center=321 | BOTTOM:353 | -32 | false |  | false |
| ±2 | GROUP_CENTER | BOTTOM_8 | BOTTOM:346 | BOTTOM:346 | distanceToGroupCenter=0, center=346 | BOTTOM:353 | -7 | false |  | false |
| ±2 | GROUP_CENTER | BOTTOM_9 | BOTTOM:353 | BOTTOM:353 | distanceToGroupCenter=0, center=353 | BOTTOM:353 | 0 | true | BOTTOM:353 | false |
| ±2 | GROUP_CENTER | BOTTOM_10 | BOTTOM:391 | BOTTOM:391 | distanceToGroupCenter=0, center=391 | BOTTOM:353 | 38 | false |  | false |
| ±2 | GROUP_CENTER | BOTTOM_11 | BOTTOM:405 | BOTTOM:405 | distanceToGroupCenter=0, center=405 | BOTTOM:445 | -40 | false |  | false |
| ±2 | GROUP_CENTER | BOTTOM_12 | BOTTOM:426 | BOTTOM:426 | distanceToGroupCenter=0, center=426 | BOTTOM:445 | -19 | false |  | false |
| ±2 | GROUP_CENTER | BOTTOM_13 | BOTTOM:438 | BOTTOM:438 | distanceToGroupCenter=0, center=438 | BOTTOM:445 | -7 | false |  | false |
| ±2 | GROUP_CENTER | BOTTOM_14 | BOTTOM:445 | BOTTOM:445 | distanceToGroupCenter=0, center=445 | BOTTOM:445 | 0 | true | BOTTOM:445 | false |
| ±2 | GROUP_CENTER | BOTTOM_15 | BOTTOM:450 | BOTTOM:450 | distanceToGroupCenter=0, center=450 | BOTTOM:445 | 5 | false |  | false |
| ±2 | GROUP_CENTER | BOTTOM_16 | BOTTOM:480 | BOTTOM:480 | distanceToGroupCenter=0, center=480 | BOTTOM:445 | 35 | false |  | false |
| ±2 | GROUP_CENTER | BOTTOM_17 | BOTTOM:500 | BOTTOM:500 | distanceToGroupCenter=0, center=500 | BOTTOM:529 | -29 | false |  | false |
| ±2 | GROUP_CENTER | BOTTOM_18 | BOTTOM:511 | BOTTOM:511 | distanceToGroupCenter=0, center=511 | BOTTOM:529 | -18 | false |  | false |
| ±2 | GROUP_CENTER | BOTTOM_19 | BOTTOM:529, BOTTOM:530 | BOTTOM:529 | distanceToGroupCenter=0.5, center=529.5 | BOTTOM:529 | 0 | true | BOTTOM:529 | false |
| ±2 | GROUP_CENTER | BOTTOM_20 | BOTTOM:564 | BOTTOM:564 | distanceToGroupCenter=0, center=564 | BOTTOM:529 | 35 | false |  | false |
| ±2 | GROUP_CENTER | BOTTOM_21 | BOTTOM:585 | BOTTOM:585 | distanceToGroupCenter=0, center=585 | BOTTOM:611 | -26 | false |  | false |
| ±2 | GROUP_CENTER | BOTTOM_22 | BOTTOM:595 | BOTTOM:595 | distanceToGroupCenter=0, center=595 | BOTTOM:611 | -16 | false |  | false |
| ±2 | GROUP_CENTER | BOTTOM_23 | BOTTOM:609, BOTTOM:611 | BOTTOM:609 | distanceToGroupCenter=1, center=610 | BOTTOM:611 | -2 | true | BOTTOM:611 | false |
| ±2 | GROUP_CENTER | BOTTOM_24 | BOTTOM:641 | BOTTOM:641 | distanceToGroupCenter=0, center=641 | BOTTOM:611 | 30 | false |  | false |
| ±2 | GROUP_CENTER | TOP_25 | TOP:170 | TOP:170 | distanceToGroupCenter=0, center=170 | TOP:199 | -29 | false |  | false |
| ±2 | GROUP_CENTER | TOP_26 | TOP:179 | TOP:179 | distanceToGroupCenter=0, center=179 | TOP:199 | -20 | false |  | false |
| ±2 | GROUP_CENTER | TOP_27 | TOP:195 | TOP:195 | distanceToGroupCenter=0, center=195 | TOP:199 | -4 | false |  | false |
| ±2 | GROUP_CENTER | TOP_28 | TOP:199 | TOP:199 | distanceToGroupCenter=0, center=199 | TOP:199 | 0 | true | TOP:199 | false |
| ±2 | GROUP_CENTER | TOP_29 | TOP:222 | TOP:222 | distanceToGroupCenter=0, center=222 | TOP:199 | 23 | false |  | false |
| ±2 | GROUP_CENTER | TOP_30 | TOP:236 | TOP:236 | distanceToGroupCenter=0, center=236 | TOP:199 | 37 | false |  | false |
| ±2 | GROUP_CENTER | TOP_31 | TOP:265 | TOP:265 | distanceToGroupCenter=0, center=265 | TOP:291 | -26 | false |  | false |
| ±2 | GROUP_CENTER | TOP_32 | TOP:291 | TOP:291 | distanceToGroupCenter=0, center=291 | TOP:291 | 0 | true | TOP:291 | false |
| ±2 | GROUP_CENTER | TOP_33 | TOP:317 | TOP:317 | distanceToGroupCenter=0, center=317 | TOP:291 | 26 | false |  | false |
| ±2 | GROUP_CENTER | TOP_34 | TOP:333 | TOP:333 | distanceToGroupCenter=0, center=333 | TOP:291 | 42 | false |  | false |
| ±2 | GROUP_CENTER | TOP_35 | TOP:345 | TOP:345 | distanceToGroupCenter=0, center=345 | TOP:383 | -38 | false |  | false |
| ±2 | GROUP_CENTER | TOP_36 | TOP:365 | TOP:365 | distanceToGroupCenter=0, center=365 | TOP:383 | -18 | false |  | false |
| ±2 | GROUP_CENTER | TOP_37 | TOP:379 | TOP:379 | distanceToGroupCenter=0, center=379 | TOP:383 | -4 | false |  | false |
| ±2 | GROUP_CENTER | TOP_38 | TOP:383 | TOP:383 | distanceToGroupCenter=0, center=383 | TOP:383 | 0 | true | TOP:383 | false |
| ±2 | GROUP_CENTER | TOP_39 | TOP:411 | TOP:411 | distanceToGroupCenter=0, center=411 | TOP:383 | 28 | false |  | false |
| ±2 | GROUP_CENTER | TOP_40 | TOP:421 | TOP:421 | distanceToGroupCenter=0, center=421 | TOP:383 | 38 | false |  | false |
| ±2 | GROUP_CENTER | TOP_41 | TOP:436 | TOP:436 | distanceToGroupCenter=0, center=436 | TOP:474 | -38 | false |  | false |
| ±2 | GROUP_CENTER | TOP_42 | TOP:467 | TOP:467 | distanceToGroupCenter=0, center=467 | TOP:474 | -7 | false |  | false |
| ±2 | GROUP_CENTER | TOP_43 | TOP:474 | TOP:474 | distanceToGroupCenter=0, center=474 | TOP:474 | 0 | true | TOP:474 | false |
| ±2 | GROUP_CENTER | TOP_44 | TOP:509 | TOP:509 | distanceToGroupCenter=0, center=509 | TOP:474 | 35 | false |  | false |
| ±2 | GROUP_CENTER | TOP_45 | TOP:524 | TOP:524 | distanceToGroupCenter=0, center=524 | TOP:558 | -34 | false |  | false |
| ±2 | GROUP_CENTER | TOP_46 | TOP:535 | TOP:535 | distanceToGroupCenter=0, center=535 | TOP:558 | -23 | false |  | false |
| ±2 | GROUP_CENTER | TOP_47 | TOP:555 | TOP:555 | distanceToGroupCenter=0, center=555 | TOP:558 | -3 | false |  | false |
| ±2 | GROUP_CENTER | TOP_48 | TOP:558 | TOP:558 | distanceToGroupCenter=0, center=558 | TOP:558 | 0 | true | TOP:558 | false |
| ±2 | GROUP_CENTER | TOP_49 | TOP:583 | TOP:583 | distanceToGroupCenter=0, center=583 | TOP:558 | 25 | false |  | false |
| ±2 | GROUP_CENTER | TOP_50 | TOP:594 | TOP:594 | distanceToGroupCenter=0, center=594 | TOP:558 | 36 | false |  | false |
| ±2 | GROUP_CENTER | TOP_51 | TOP:605 | TOP:605 | distanceToGroupCenter=0, center=605 | TOP:558 | 47 | false |  | false |
| ±2 | GROUP_CENTER | TOP_52 | TOP:640 | TOP:640 | distanceToGroupCenter=0, center=640 | TOP:558 | 82 | false |  | false |
| ±3 | MOST_EXTREME | BOTTOM_1 | BOTTOM:169 | BOTTOM:169 | minimum value=14604 | BOTTOM:169 | 0 | true | BOTTOM:169 | false |
| ±3 | MOST_EXTREME | BOTTOM_2 | BOTTOM:210 | BOTTOM:210 | minimum value=14860 | BOTTOM:169 | 41 | false |  | false |
| ±3 | MOST_EXTREME | BOTTOM_3 | BOTTOM:228 | BOTTOM:228 | minimum value=14568 | BOTTOM:262 | -34 | false |  | false |
| ±3 | MOST_EXTREME | BOTTOM_4 | BOTTOM:243 | BOTTOM:243 | minimum value=15208 | BOTTOM:262 | -19 | false |  | false |
| ±3 | MOST_EXTREME | BOTTOM_5 | BOTTOM:260, BOTTOM:262 | BOTTOM:260 | minimum value=16712 | BOTTOM:262 | -2 | true | BOTTOM:262 | false |
| ±3 | MOST_EXTREME | BOTTOM_6 | BOTTOM:299 | BOTTOM:299 | minimum value=11676 | BOTTOM:262 | 37 | false |  | false |
| ±3 | MOST_EXTREME | BOTTOM_7 | BOTTOM:321 | BOTTOM:321 | minimum value=14516 | BOTTOM:353 | -32 | false |  | false |
| ±3 | MOST_EXTREME | BOTTOM_8 | BOTTOM:346 | BOTTOM:346 | minimum value=17284 | BOTTOM:353 | -7 | false |  | false |
| ±3 | MOST_EXTREME | BOTTOM_9 | BOTTOM:353 | BOTTOM:353 | minimum value=20092 | BOTTOM:353 | 0 | true | BOTTOM:353 | false |
| ±3 | MOST_EXTREME | BOTTOM_10 | BOTTOM:391 | BOTTOM:391 | minimum value=9644 | BOTTOM:353 | 38 | false |  | false |
| ±3 | MOST_EXTREME | BOTTOM_11 | BOTTOM:405 | BOTTOM:405 | minimum value=14108 | BOTTOM:445 | -40 | false |  | false |
| ±3 | MOST_EXTREME | BOTTOM_12 | BOTTOM:426 | BOTTOM:426 | minimum value=14136 | BOTTOM:445 | -19 | false |  | false |
| ±3 | MOST_EXTREME | BOTTOM_13 | BOTTOM:438 | BOTTOM:438 | minimum value=17812 | BOTTOM:445 | -7 | false |  | false |
| ±3 | MOST_EXTREME | BOTTOM_14 | BOTTOM:445 | BOTTOM:445 | minimum value=19300 | BOTTOM:445 | 0 | true | BOTTOM:445 | false |
| ±3 | MOST_EXTREME | BOTTOM_15 | BOTTOM:450 | BOTTOM:450 | minimum value=17936 | BOTTOM:445 | 5 | false |  | false |
| ±3 | MOST_EXTREME | BOTTOM_16 | BOTTOM:480 | BOTTOM:480 | minimum value=13324 | BOTTOM:445 | 35 | false |  | false |
| ±3 | MOST_EXTREME | BOTTOM_17 | BOTTOM:500 | BOTTOM:500 | minimum value=12564 | BOTTOM:529 | -29 | false |  | false |
| ±3 | MOST_EXTREME | BOTTOM_18 | BOTTOM:511 | BOTTOM:511 | minimum value=14312 | BOTTOM:529 | -18 | false |  | false |
| ±3 | MOST_EXTREME | BOTTOM_19 | BOTTOM:529, BOTTOM:530 | BOTTOM:530 | minimum value=17708 | BOTTOM:529 | 1 | true | BOTTOM:529 | false |
| ±3 | MOST_EXTREME | BOTTOM_20 | BOTTOM:564 | BOTTOM:564 | minimum value=13444 | BOTTOM:529 | 35 | false |  | false |
| ±3 | MOST_EXTREME | BOTTOM_21 | BOTTOM:585 | BOTTOM:585 | minimum value=14512 | BOTTOM:611 | -26 | false |  | false |
| ±3 | MOST_EXTREME | BOTTOM_22 | BOTTOM:595 | BOTTOM:595 | minimum value=14628 | BOTTOM:611 | -16 | false |  | false |
| ±3 | MOST_EXTREME | BOTTOM_23 | BOTTOM:609, BOTTOM:611 | BOTTOM:609 | minimum value=16532 | BOTTOM:611 | -2 | true | BOTTOM:611 | false |
| ±3 | MOST_EXTREME | BOTTOM_24 | BOTTOM:641 | BOTTOM:641 | minimum value=13456 | BOTTOM:611 | 30 | false |  | false |
| ±3 | MOST_EXTREME | TOP_25 | TOP:170 | TOP:170 | maximum value=20964 | TOP:199 | -29 | false |  | false |
| ±3 | MOST_EXTREME | TOP_26 | TOP:179 | TOP:179 | maximum value=19464 | TOP:199 | -20 | false |  | false |
| ±3 | MOST_EXTREME | TOP_27 | TOP:195 | TOP:195 | maximum value=24256 | TOP:199 | -4 | false |  | false |
| ±3 | MOST_EXTREME | TOP_28 | TOP:199 | TOP:199 | maximum value=19844 | TOP:199 | 0 | true | TOP:199 | false |
| ±3 | MOST_EXTREME | TOP_29 | TOP:222 | TOP:222 | maximum value=19504 | TOP:199 | 23 | false |  | false |
| ±3 | MOST_EXTREME | TOP_30 | TOP:236 | TOP:236 | maximum value=22480 | TOP:199 | 37 | false |  | false |
| ±3 | MOST_EXTREME | TOP_31 | TOP:265 | TOP:265 | maximum value=19948 | TOP:291 | -26 | false |  | false |
| ±3 | MOST_EXTREME | TOP_32 | TOP:291 | TOP:291 | maximum value=26248 | TOP:291 | 0 | true | TOP:291 | false |
| ±3 | MOST_EXTREME | TOP_33 | TOP:317 | TOP:317 | maximum value=21232 | TOP:291 | 26 | false |  | false |
| ±3 | MOST_EXTREME | TOP_34 | TOP:333 | TOP:333 | maximum value=24424 | TOP:291 | 42 | false |  | false |
| ±3 | MOST_EXTREME | TOP_35 | TOP:345 | TOP:345 | maximum value=21060 | TOP:383 | -38 | false |  | false |
| ±3 | MOST_EXTREME | TOP_36 | TOP:365 | TOP:365 | maximum value=19272 | TOP:383 | -18 | false |  | false |
| ±3 | MOST_EXTREME | TOP_37 | TOP:379 | TOP:379 | maximum value=23748 | TOP:383 | -4 | false |  | false |
| ±3 | MOST_EXTREME | TOP_38 | TOP:383 | TOP:383 | maximum value=17804 | TOP:383 | 0 | true | TOP:383 | false |
| ±3 | MOST_EXTREME | TOP_39 | TOP:411 | TOP:411 | maximum value=22604 | TOP:383 | 28 | false |  | false |
| ±3 | MOST_EXTREME | TOP_40 | TOP:421 | TOP:421 | maximum value=22684 | TOP:383 | 38 | false |  | false |
| ±3 | MOST_EXTREME | TOP_41 | TOP:436 | TOP:436 | maximum value=20868 | TOP:474 | -38 | false |  | false |
| ±3 | MOST_EXTREME | TOP_42 | TOP:467 | TOP:467 | maximum value=26536 | TOP:474 | -7 | false |  | false |
| ±3 | MOST_EXTREME | TOP_43 | TOP:474 | TOP:474 | maximum value=15656 | TOP:474 | 0 | true | TOP:474 | false |
| ±3 | MOST_EXTREME | TOP_44 | TOP:509 | TOP:509 | maximum value=23212 | TOP:474 | 35 | false |  | false |
| ±3 | MOST_EXTREME | TOP_45 | TOP:524 | TOP:524 | maximum value=22020 | TOP:558 | -34 | false |  | false |
| ±3 | MOST_EXTREME | TOP_46 | TOP:535 | TOP:535 | maximum value=19576 | TOP:558 | -23 | false |  | false |
| ±3 | MOST_EXTREME | TOP_47 | TOP:555, TOP:558 | TOP:555 | maximum value=22964 | TOP:558 | -3 | false | TOP:558 | false |
| ±3 | MOST_EXTREME | TOP_48 | TOP:583 | TOP:583 | maximum value=21420 | TOP:558 | 25 | false |  | false |
| ±3 | MOST_EXTREME | TOP_49 | TOP:594 | TOP:594 | maximum value=22464 | TOP:558 | 36 | false |  | false |
| ±3 | MOST_EXTREME | TOP_50 | TOP:605 | TOP:605 | maximum value=22888 | TOP:558 | 47 | false |  | false |
| ±3 | MOST_EXTREME | TOP_51 | TOP:640 | TOP:640 | maximum value=21204 | TOP:558 | 82 | false |  | false |
| ±3 | BEST_PROMINENCE | BOTTOM_1 | BOTTOM:169 | BOTTOM:169 | prominence=6360 | BOTTOM:169 | 0 | true | BOTTOM:169 | false |
| ±3 | BEST_PROMINENCE | BOTTOM_2 | BOTTOM:210 | BOTTOM:210 | prominence=2860 | BOTTOM:169 | 41 | false |  | false |
| ±3 | BEST_PROMINENCE | BOTTOM_3 | BOTTOM:228 | BOTTOM:228 | prominence=5612 | BOTTOM:262 | -34 | false |  | false |
| ±3 | BEST_PROMINENCE | BOTTOM_4 | BOTTOM:243 | BOTTOM:243 | prominence=6972 | BOTTOM:262 | -19 | false |  | false |
| ±3 | BEST_PROMINENCE | BOTTOM_5 | BOTTOM:260, BOTTOM:262 | BOTTOM:260 | prominence=3236 | BOTTOM:262 | -2 | true | BOTTOM:262 | false |
| ±3 | BEST_PROMINENCE | BOTTOM_6 | BOTTOM:299 | BOTTOM:299 | prominence=8220 | BOTTOM:262 | 37 | false |  | false |
| ±3 | BEST_PROMINENCE | BOTTOM_7 | BOTTOM:321 | BOTTOM:321 | prominence=6360 | BOTTOM:353 | -32 | false |  | false |
| ±3 | BEST_PROMINENCE | BOTTOM_8 | BOTTOM:346 | BOTTOM:346 | prominence=3404 | BOTTOM:353 | -7 | false |  | false |
| ±3 | BEST_PROMINENCE | BOTTOM_9 | BOTTOM:353 | BOTTOM:353 | prominence=0 | BOTTOM:353 | 0 | true | BOTTOM:353 | false |
| ±3 | BEST_PROMINENCE | BOTTOM_10 | BOTTOM:391 | BOTTOM:391 | prominence=8356 | BOTTOM:353 | 38 | false |  | false |
| ±3 | BEST_PROMINENCE | BOTTOM_11 | BOTTOM:405 | BOTTOM:405 | prominence=8496 | BOTTOM:445 | -40 | false |  | false |
| ±3 | BEST_PROMINENCE | BOTTOM_12 | BOTTOM:426 | BOTTOM:426 | prominence=5244 | BOTTOM:445 | -19 | false |  | false |
| ±3 | BEST_PROMINENCE | BOTTOM_13 | BOTTOM:438 | BOTTOM:438 | prominence=2864 | BOTTOM:445 | -7 | false |  | false |
| ±3 | BEST_PROMINENCE | BOTTOM_14 | BOTTOM:445 | BOTTOM:445 | prominence=0 | BOTTOM:445 | 0 | true | BOTTOM:445 | false |
| ±3 | BEST_PROMINENCE | BOTTOM_15 | BOTTOM:450 | BOTTOM:450 | prominence=1028 | BOTTOM:445 | 5 | false |  | false |
| ±3 | BEST_PROMINENCE | BOTTOM_16 | BOTTOM:480 | BOTTOM:480 | prominence=5408 | BOTTOM:445 | 35 | false |  | false |
| ±3 | BEST_PROMINENCE | BOTTOM_17 | BOTTOM:500 | BOTTOM:500 | prominence=8920 | BOTTOM:529 | -29 | false |  | false |
| ±3 | BEST_PROMINENCE | BOTTOM_18 | BOTTOM:511 | BOTTOM:511 | prominence=7544 | BOTTOM:529 | -18 | false |  | false |
| ±3 | BEST_PROMINENCE | BOTTOM_19 | BOTTOM:529, BOTTOM:530 | BOTTOM:530 | prominence=1868 | BOTTOM:529 | 1 | true | BOTTOM:529 | false |
| ±3 | BEST_PROMINENCE | BOTTOM_20 | BOTTOM:564 | BOTTOM:564 | prominence=5416 | BOTTOM:529 | 35 | false |  | false |
| ±3 | BEST_PROMINENCE | BOTTOM_21 | BOTTOM:585 | BOTTOM:585 | prominence=6316 | BOTTOM:611 | -26 | false |  | false |
| ±3 | BEST_PROMINENCE | BOTTOM_22 | BOTTOM:595 | BOTTOM:595 | prominence=6396 | BOTTOM:611 | -16 | false |  | false |
| ±3 | BEST_PROMINENCE | BOTTOM_23 | BOTTOM:609, BOTTOM:611 | BOTTOM:609 | prominence=3880 | BOTTOM:611 | -2 | true | BOTTOM:611 | false |
| ±3 | BEST_PROMINENCE | BOTTOM_24 | BOTTOM:641 | BOTTOM:641 | prominence=5332 | BOTTOM:611 | 30 | false |  | false |
| ±3 | BEST_PROMINENCE | TOP_25 | TOP:170 | TOP:170 | prominence=4476 | TOP:199 | -29 | false |  | false |
| ±3 | BEST_PROMINENCE | TOP_26 | TOP:179 | TOP:179 | prominence=1064 | TOP:199 | -20 | false |  | false |
| ±3 | BEST_PROMINENCE | TOP_27 | TOP:195 | TOP:195 | prominence=7624 | TOP:199 | -4 | false |  | false |
| ±3 | BEST_PROMINENCE | TOP_28 | TOP:199 | TOP:199 | prominence=4104 | TOP:199 | 0 | true | TOP:199 | false |
| ±3 | BEST_PROMINENCE | TOP_29 | TOP:222 | TOP:222 | prominence=4936 | TOP:199 | 23 | false |  | false |
| ±3 | BEST_PROMINENCE | TOP_30 | TOP:236 | TOP:236 | prominence=7272 | TOP:199 | 37 | false |  | false |
| ±3 | BEST_PROMINENCE | TOP_31 | TOP:265 | TOP:265 | prominence=1404 | TOP:291 | -26 | false |  | false |
| ±3 | BEST_PROMINENCE | TOP_32 | TOP:291 | TOP:291 | prominence=9772 | TOP:291 | 0 | true | TOP:291 | false |
| ±3 | BEST_PROMINENCE | TOP_33 | TOP:317 | TOP:317 | prominence=6716 | TOP:291 | 26 | false |  | false |
| ±3 | BEST_PROMINENCE | TOP_34 | TOP:333 | TOP:333 | prominence=6684 | TOP:291 | 42 | false |  | false |
| ±3 | BEST_PROMINENCE | TOP_35 | TOP:345 | TOP:345 | prominence=3776 | TOP:383 | -38 | false |  | false |
| ±3 | BEST_PROMINENCE | TOP_36 | TOP:365 | TOP:365 | prominence=780 | TOP:383 | -18 | false |  | false |
| ±3 | BEST_PROMINENCE | TOP_37 | TOP:379 | TOP:379 | prominence=8920 | TOP:383 | -4 | false |  | false |
| ±3 | BEST_PROMINENCE | TOP_38 | TOP:383 | TOP:383 | prominence=3536 | TOP:383 | 0 | true | TOP:383 | false |
| ±3 | BEST_PROMINENCE | TOP_39 | TOP:411 | TOP:411 | prominence=7684 | TOP:383 | 28 | false |  | false |
| ±3 | BEST_PROMINENCE | TOP_40 | TOP:421 | TOP:421 | prominence=8548 | TOP:383 | 38 | false |  | false |
| ±3 | BEST_PROMINENCE | TOP_41 | TOP:436 | TOP:436 | prominence=3056 | TOP:474 | -38 | false |  | false |
| ±3 | BEST_PROMINENCE | TOP_42 | TOP:467 | TOP:467 | prominence=10880 | TOP:474 | -7 | false |  | false |
| ±3 | BEST_PROMINENCE | TOP_43 | TOP:474 | TOP:474 | prominence=2332 | TOP:474 | 0 | true | TOP:474 | false |
| ±3 | BEST_PROMINENCE | TOP_44 | TOP:509 | TOP:509 | prominence=8900 | TOP:474 | 35 | false |  | false |
| ±3 | BEST_PROMINENCE | TOP_45 | TOP:524 | TOP:524 | prominence=4312 | TOP:558 | -34 | false |  | false |
| ±3 | BEST_PROMINENCE | TOP_46 | TOP:535 | TOP:535 | prominence=1120 | TOP:558 | -23 | false |  | false |
| ±3 | BEST_PROMINENCE | TOP_47 | TOP:555, TOP:558 | TOP:555 | prominence=7020 | TOP:558 | -3 | false | TOP:558 | false |
| ±3 | BEST_PROMINENCE | TOP_48 | TOP:583 | TOP:583 | prominence=6908 | TOP:558 | 25 | false |  | false |
| ±3 | BEST_PROMINENCE | TOP_49 | TOP:594 | TOP:594 | prominence=7836 | TOP:558 | 36 | false |  | false |
| ±3 | BEST_PROMINENCE | TOP_50 | TOP:605 | TOP:605 | prominence=6356 | TOP:558 | 47 | false |  | false |
| ±3 | BEST_PROMINENCE | TOP_51 | TOP:640 | TOP:640 | prominence=7748 | TOP:558 | 82 | false |  | false |
| ±3 | GROUP_CENTER | BOTTOM_1 | BOTTOM:169 | BOTTOM:169 | distanceToGroupCenter=0, center=169 | BOTTOM:169 | 0 | true | BOTTOM:169 | false |
| ±3 | GROUP_CENTER | BOTTOM_2 | BOTTOM:210 | BOTTOM:210 | distanceToGroupCenter=0, center=210 | BOTTOM:169 | 41 | false |  | false |
| ±3 | GROUP_CENTER | BOTTOM_3 | BOTTOM:228 | BOTTOM:228 | distanceToGroupCenter=0, center=228 | BOTTOM:262 | -34 | false |  | false |
| ±3 | GROUP_CENTER | BOTTOM_4 | BOTTOM:243 | BOTTOM:243 | distanceToGroupCenter=0, center=243 | BOTTOM:262 | -19 | false |  | false |
| ±3 | GROUP_CENTER | BOTTOM_5 | BOTTOM:260, BOTTOM:262 | BOTTOM:260 | distanceToGroupCenter=1, center=261 | BOTTOM:262 | -2 | true | BOTTOM:262 | false |
| ±3 | GROUP_CENTER | BOTTOM_6 | BOTTOM:299 | BOTTOM:299 | distanceToGroupCenter=0, center=299 | BOTTOM:262 | 37 | false |  | false |
| ±3 | GROUP_CENTER | BOTTOM_7 | BOTTOM:321 | BOTTOM:321 | distanceToGroupCenter=0, center=321 | BOTTOM:353 | -32 | false |  | false |
| ±3 | GROUP_CENTER | BOTTOM_8 | BOTTOM:346 | BOTTOM:346 | distanceToGroupCenter=0, center=346 | BOTTOM:353 | -7 | false |  | false |
| ±3 | GROUP_CENTER | BOTTOM_9 | BOTTOM:353 | BOTTOM:353 | distanceToGroupCenter=0, center=353 | BOTTOM:353 | 0 | true | BOTTOM:353 | false |
| ±3 | GROUP_CENTER | BOTTOM_10 | BOTTOM:391 | BOTTOM:391 | distanceToGroupCenter=0, center=391 | BOTTOM:353 | 38 | false |  | false |
| ±3 | GROUP_CENTER | BOTTOM_11 | BOTTOM:405 | BOTTOM:405 | distanceToGroupCenter=0, center=405 | BOTTOM:445 | -40 | false |  | false |
| ±3 | GROUP_CENTER | BOTTOM_12 | BOTTOM:426 | BOTTOM:426 | distanceToGroupCenter=0, center=426 | BOTTOM:445 | -19 | false |  | false |
| ±3 | GROUP_CENTER | BOTTOM_13 | BOTTOM:438 | BOTTOM:438 | distanceToGroupCenter=0, center=438 | BOTTOM:445 | -7 | false |  | false |
| ±3 | GROUP_CENTER | BOTTOM_14 | BOTTOM:445 | BOTTOM:445 | distanceToGroupCenter=0, center=445 | BOTTOM:445 | 0 | true | BOTTOM:445 | false |
| ±3 | GROUP_CENTER | BOTTOM_15 | BOTTOM:450 | BOTTOM:450 | distanceToGroupCenter=0, center=450 | BOTTOM:445 | 5 | false |  | false |
| ±3 | GROUP_CENTER | BOTTOM_16 | BOTTOM:480 | BOTTOM:480 | distanceToGroupCenter=0, center=480 | BOTTOM:445 | 35 | false |  | false |
| ±3 | GROUP_CENTER | BOTTOM_17 | BOTTOM:500 | BOTTOM:500 | distanceToGroupCenter=0, center=500 | BOTTOM:529 | -29 | false |  | false |
| ±3 | GROUP_CENTER | BOTTOM_18 | BOTTOM:511 | BOTTOM:511 | distanceToGroupCenter=0, center=511 | BOTTOM:529 | -18 | false |  | false |
| ±3 | GROUP_CENTER | BOTTOM_19 | BOTTOM:529, BOTTOM:530 | BOTTOM:529 | distanceToGroupCenter=0.5, center=529.5 | BOTTOM:529 | 0 | true | BOTTOM:529 | false |
| ±3 | GROUP_CENTER | BOTTOM_20 | BOTTOM:564 | BOTTOM:564 | distanceToGroupCenter=0, center=564 | BOTTOM:529 | 35 | false |  | false |
| ±3 | GROUP_CENTER | BOTTOM_21 | BOTTOM:585 | BOTTOM:585 | distanceToGroupCenter=0, center=585 | BOTTOM:611 | -26 | false |  | false |
| ±3 | GROUP_CENTER | BOTTOM_22 | BOTTOM:595 | BOTTOM:595 | distanceToGroupCenter=0, center=595 | BOTTOM:611 | -16 | false |  | false |
| ±3 | GROUP_CENTER | BOTTOM_23 | BOTTOM:609, BOTTOM:611 | BOTTOM:609 | distanceToGroupCenter=1, center=610 | BOTTOM:611 | -2 | true | BOTTOM:611 | false |
| ±3 | GROUP_CENTER | BOTTOM_24 | BOTTOM:641 | BOTTOM:641 | distanceToGroupCenter=0, center=641 | BOTTOM:611 | 30 | false |  | false |
| ±3 | GROUP_CENTER | TOP_25 | TOP:170 | TOP:170 | distanceToGroupCenter=0, center=170 | TOP:199 | -29 | false |  | false |
| ±3 | GROUP_CENTER | TOP_26 | TOP:179 | TOP:179 | distanceToGroupCenter=0, center=179 | TOP:199 | -20 | false |  | false |
| ±3 | GROUP_CENTER | TOP_27 | TOP:195 | TOP:195 | distanceToGroupCenter=0, center=195 | TOP:199 | -4 | false |  | false |
| ±3 | GROUP_CENTER | TOP_28 | TOP:199 | TOP:199 | distanceToGroupCenter=0, center=199 | TOP:199 | 0 | true | TOP:199 | false |
| ±3 | GROUP_CENTER | TOP_29 | TOP:222 | TOP:222 | distanceToGroupCenter=0, center=222 | TOP:199 | 23 | false |  | false |
| ±3 | GROUP_CENTER | TOP_30 | TOP:236 | TOP:236 | distanceToGroupCenter=0, center=236 | TOP:199 | 37 | false |  | false |
| ±3 | GROUP_CENTER | TOP_31 | TOP:265 | TOP:265 | distanceToGroupCenter=0, center=265 | TOP:291 | -26 | false |  | false |
| ±3 | GROUP_CENTER | TOP_32 | TOP:291 | TOP:291 | distanceToGroupCenter=0, center=291 | TOP:291 | 0 | true | TOP:291 | false |
| ±3 | GROUP_CENTER | TOP_33 | TOP:317 | TOP:317 | distanceToGroupCenter=0, center=317 | TOP:291 | 26 | false |  | false |
| ±3 | GROUP_CENTER | TOP_34 | TOP:333 | TOP:333 | distanceToGroupCenter=0, center=333 | TOP:291 | 42 | false |  | false |
| ±3 | GROUP_CENTER | TOP_35 | TOP:345 | TOP:345 | distanceToGroupCenter=0, center=345 | TOP:383 | -38 | false |  | false |
| ±3 | GROUP_CENTER | TOP_36 | TOP:365 | TOP:365 | distanceToGroupCenter=0, center=365 | TOP:383 | -18 | false |  | false |
| ±3 | GROUP_CENTER | TOP_37 | TOP:379 | TOP:379 | distanceToGroupCenter=0, center=379 | TOP:383 | -4 | false |  | false |
| ±3 | GROUP_CENTER | TOP_38 | TOP:383 | TOP:383 | distanceToGroupCenter=0, center=383 | TOP:383 | 0 | true | TOP:383 | false |
| ±3 | GROUP_CENTER | TOP_39 | TOP:411 | TOP:411 | distanceToGroupCenter=0, center=411 | TOP:383 | 28 | false |  | false |
| ±3 | GROUP_CENTER | TOP_40 | TOP:421 | TOP:421 | distanceToGroupCenter=0, center=421 | TOP:383 | 38 | false |  | false |
| ±3 | GROUP_CENTER | TOP_41 | TOP:436 | TOP:436 | distanceToGroupCenter=0, center=436 | TOP:474 | -38 | false |  | false |
| ±3 | GROUP_CENTER | TOP_42 | TOP:467 | TOP:467 | distanceToGroupCenter=0, center=467 | TOP:474 | -7 | false |  | false |
| ±3 | GROUP_CENTER | TOP_43 | TOP:474 | TOP:474 | distanceToGroupCenter=0, center=474 | TOP:474 | 0 | true | TOP:474 | false |
| ±3 | GROUP_CENTER | TOP_44 | TOP:509 | TOP:509 | distanceToGroupCenter=0, center=509 | TOP:474 | 35 | false |  | false |
| ±3 | GROUP_CENTER | TOP_45 | TOP:524 | TOP:524 | distanceToGroupCenter=0, center=524 | TOP:558 | -34 | false |  | false |
| ±3 | GROUP_CENTER | TOP_46 | TOP:535 | TOP:535 | distanceToGroupCenter=0, center=535 | TOP:558 | -23 | false |  | false |
| ±3 | GROUP_CENTER | TOP_47 | TOP:555, TOP:558 | TOP:555 | distanceToGroupCenter=1.5, center=556.5 | TOP:558 | -3 | false | TOP:558 | false |
| ±3 | GROUP_CENTER | TOP_48 | TOP:583 | TOP:583 | distanceToGroupCenter=0, center=583 | TOP:558 | 25 | false |  | false |
| ±3 | GROUP_CENTER | TOP_49 | TOP:594 | TOP:594 | distanceToGroupCenter=0, center=594 | TOP:558 | 36 | false |  | false |
| ±3 | GROUP_CENTER | TOP_50 | TOP:605 | TOP:605 | distanceToGroupCenter=0, center=605 | TOP:558 | 47 | false |  | false |
| ±3 | GROUP_CENTER | TOP_51 | TOP:640 | TOP:640 | distanceToGroupCenter=0, center=640 | TOP:558 | 82 | false |  | false |
| ±5 | MOST_EXTREME | BOTTOM_1 | BOTTOM:169 | BOTTOM:169 | minimum value=14604 | BOTTOM:169 | 0 | true | BOTTOM:169 | false |
| ±5 | MOST_EXTREME | BOTTOM_2 | BOTTOM:210 | BOTTOM:210 | minimum value=14860 | BOTTOM:169 | 41 | false |  | false |
| ±5 | MOST_EXTREME | BOTTOM_3 | BOTTOM:228 | BOTTOM:228 | minimum value=14568 | BOTTOM:262 | -34 | false |  | false |
| ±5 | MOST_EXTREME | BOTTOM_4 | BOTTOM:243 | BOTTOM:243 | minimum value=15208 | BOTTOM:262 | -19 | false |  | false |
| ±5 | MOST_EXTREME | BOTTOM_5 | BOTTOM:260, BOTTOM:262 | BOTTOM:260 | minimum value=16712 | BOTTOM:262 | -2 | true | BOTTOM:262 | false |
| ±5 | MOST_EXTREME | BOTTOM_6 | BOTTOM:299 | BOTTOM:299 | minimum value=11676 | BOTTOM:262 | 37 | false |  | false |
| ±5 | MOST_EXTREME | BOTTOM_7 | BOTTOM:321 | BOTTOM:321 | minimum value=14516 | BOTTOM:353 | -32 | false |  | false |
| ±5 | MOST_EXTREME | BOTTOM_8 | BOTTOM:346 | BOTTOM:346 | minimum value=17284 | BOTTOM:353 | -7 | false |  | false |
| ±5 | MOST_EXTREME | BOTTOM_9 | BOTTOM:353 | BOTTOM:353 | minimum value=20092 | BOTTOM:353 | 0 | true | BOTTOM:353 | false |
| ±5 | MOST_EXTREME | BOTTOM_10 | BOTTOM:391 | BOTTOM:391 | minimum value=9644 | BOTTOM:353 | 38 | false |  | false |
| ±5 | MOST_EXTREME | BOTTOM_11 | BOTTOM:405 | BOTTOM:405 | minimum value=14108 | BOTTOM:445 | -40 | false |  | false |
| ±5 | MOST_EXTREME | BOTTOM_12 | BOTTOM:426 | BOTTOM:426 | minimum value=14136 | BOTTOM:445 | -19 | false |  | false |
| ±5 | MOST_EXTREME | BOTTOM_13 | BOTTOM:438 | BOTTOM:438 | minimum value=17812 | BOTTOM:445 | -7 | false |  | false |
| ±5 | MOST_EXTREME | BOTTOM_14 | BOTTOM:445, BOTTOM:450 | BOTTOM:450 | minimum value=17936 | BOTTOM:445 | 5 | false | BOTTOM:445 | false |
| ±5 | MOST_EXTREME | BOTTOM_15 | BOTTOM:480 | BOTTOM:480 | minimum value=13324 | BOTTOM:445 | 35 | false |  | false |
| ±5 | MOST_EXTREME | BOTTOM_16 | BOTTOM:500 | BOTTOM:500 | minimum value=12564 | BOTTOM:529 | -29 | false |  | false |
| ±5 | MOST_EXTREME | BOTTOM_17 | BOTTOM:511 | BOTTOM:511 | minimum value=14312 | BOTTOM:529 | -18 | false |  | false |
| ±5 | MOST_EXTREME | BOTTOM_18 | BOTTOM:529, BOTTOM:530 | BOTTOM:530 | minimum value=17708 | BOTTOM:529 | 1 | true | BOTTOM:529 | false |
| ±5 | MOST_EXTREME | BOTTOM_19 | BOTTOM:564 | BOTTOM:564 | minimum value=13444 | BOTTOM:529 | 35 | false |  | false |
| ±5 | MOST_EXTREME | BOTTOM_20 | BOTTOM:585 | BOTTOM:585 | minimum value=14512 | BOTTOM:611 | -26 | false |  | false |
| ±5 | MOST_EXTREME | BOTTOM_21 | BOTTOM:595 | BOTTOM:595 | minimum value=14628 | BOTTOM:611 | -16 | false |  | false |
| ±5 | MOST_EXTREME | BOTTOM_22 | BOTTOM:609, BOTTOM:611 | BOTTOM:609 | minimum value=16532 | BOTTOM:611 | -2 | true | BOTTOM:611 | false |
| ±5 | MOST_EXTREME | BOTTOM_23 | BOTTOM:641 | BOTTOM:641 | minimum value=13456 | BOTTOM:611 | 30 | false |  | false |
| ±5 | MOST_EXTREME | TOP_24 | TOP:170 | TOP:170 | maximum value=20964 | TOP:199 | -29 | false |  | false |
| ±5 | MOST_EXTREME | TOP_25 | TOP:179 | TOP:179 | maximum value=19464 | TOP:199 | -20 | false |  | false |
| ±5 | MOST_EXTREME | TOP_26 | TOP:195, TOP:199 | TOP:195 | maximum value=24256 | TOP:199 | -4 | false | TOP:199 | false |
| ±5 | MOST_EXTREME | TOP_27 | TOP:222 | TOP:222 | maximum value=19504 | TOP:199 | 23 | false |  | false |
| ±5 | MOST_EXTREME | TOP_28 | TOP:236 | TOP:236 | maximum value=22480 | TOP:199 | 37 | false |  | false |
| ±5 | MOST_EXTREME | TOP_29 | TOP:265 | TOP:265 | maximum value=19948 | TOP:291 | -26 | false |  | false |
| ±5 | MOST_EXTREME | TOP_30 | TOP:291 | TOP:291 | maximum value=26248 | TOP:291 | 0 | true | TOP:291 | false |
| ±5 | MOST_EXTREME | TOP_31 | TOP:317 | TOP:317 | maximum value=21232 | TOP:291 | 26 | false |  | false |
| ±5 | MOST_EXTREME | TOP_32 | TOP:333 | TOP:333 | maximum value=24424 | TOP:291 | 42 | false |  | false |
| ±5 | MOST_EXTREME | TOP_33 | TOP:345 | TOP:345 | maximum value=21060 | TOP:383 | -38 | false |  | false |
| ±5 | MOST_EXTREME | TOP_34 | TOP:365 | TOP:365 | maximum value=19272 | TOP:383 | -18 | false |  | false |
| ±5 | MOST_EXTREME | TOP_35 | TOP:379, TOP:383 | TOP:379 | maximum value=23748 | TOP:383 | -4 | false | TOP:383 | false |
| ±5 | MOST_EXTREME | TOP_36 | TOP:411 | TOP:411 | maximum value=22604 | TOP:383 | 28 | false |  | false |
| ±5 | MOST_EXTREME | TOP_37 | TOP:421 | TOP:421 | maximum value=22684 | TOP:383 | 38 | false |  | false |
| ±5 | MOST_EXTREME | TOP_38 | TOP:436 | TOP:436 | maximum value=20868 | TOP:474 | -38 | false |  | false |
| ±5 | MOST_EXTREME | TOP_39 | TOP:467 | TOP:467 | maximum value=26536 | TOP:474 | -7 | false |  | false |
| ±5 | MOST_EXTREME | TOP_40 | TOP:474 | TOP:474 | maximum value=15656 | TOP:474 | 0 | true | TOP:474 | false |
| ±5 | MOST_EXTREME | TOP_41 | TOP:509 | TOP:509 | maximum value=23212 | TOP:474 | 35 | false |  | false |
| ±5 | MOST_EXTREME | TOP_42 | TOP:524 | TOP:524 | maximum value=22020 | TOP:558 | -34 | false |  | false |
| ±5 | MOST_EXTREME | TOP_43 | TOP:535 | TOP:535 | maximum value=19576 | TOP:558 | -23 | false |  | false |
| ±5 | MOST_EXTREME | TOP_44 | TOP:555, TOP:558 | TOP:555 | maximum value=22964 | TOP:558 | -3 | false | TOP:558 | false |
| ±5 | MOST_EXTREME | TOP_45 | TOP:583 | TOP:583 | maximum value=21420 | TOP:558 | 25 | false |  | false |
| ±5 | MOST_EXTREME | TOP_46 | TOP:594 | TOP:594 | maximum value=22464 | TOP:558 | 36 | false |  | false |
| ±5 | MOST_EXTREME | TOP_47 | TOP:605 | TOP:605 | maximum value=22888 | TOP:558 | 47 | false |  | false |
| ±5 | MOST_EXTREME | TOP_48 | TOP:640 | TOP:640 | maximum value=21204 | TOP:558 | 82 | false |  | false |
| ±5 | BEST_PROMINENCE | BOTTOM_1 | BOTTOM:169 | BOTTOM:169 | prominence=6360 | BOTTOM:169 | 0 | true | BOTTOM:169 | false |
| ±5 | BEST_PROMINENCE | BOTTOM_2 | BOTTOM:210 | BOTTOM:210 | prominence=2860 | BOTTOM:169 | 41 | false |  | false |
| ±5 | BEST_PROMINENCE | BOTTOM_3 | BOTTOM:228 | BOTTOM:228 | prominence=5612 | BOTTOM:262 | -34 | false |  | false |
| ±5 | BEST_PROMINENCE | BOTTOM_4 | BOTTOM:243 | BOTTOM:243 | prominence=6972 | BOTTOM:262 | -19 | false |  | false |
| ±5 | BEST_PROMINENCE | BOTTOM_5 | BOTTOM:260, BOTTOM:262 | BOTTOM:260 | prominence=3236 | BOTTOM:262 | -2 | true | BOTTOM:262 | false |
| ±5 | BEST_PROMINENCE | BOTTOM_6 | BOTTOM:299 | BOTTOM:299 | prominence=8220 | BOTTOM:262 | 37 | false |  | false |
| ±5 | BEST_PROMINENCE | BOTTOM_7 | BOTTOM:321 | BOTTOM:321 | prominence=6360 | BOTTOM:353 | -32 | false |  | false |
| ±5 | BEST_PROMINENCE | BOTTOM_8 | BOTTOM:346 | BOTTOM:346 | prominence=3404 | BOTTOM:353 | -7 | false |  | false |
| ±5 | BEST_PROMINENCE | BOTTOM_9 | BOTTOM:353 | BOTTOM:353 | prominence=0 | BOTTOM:353 | 0 | true | BOTTOM:353 | false |
| ±5 | BEST_PROMINENCE | BOTTOM_10 | BOTTOM:391 | BOTTOM:391 | prominence=8356 | BOTTOM:353 | 38 | false |  | false |
| ±5 | BEST_PROMINENCE | BOTTOM_11 | BOTTOM:405 | BOTTOM:405 | prominence=8496 | BOTTOM:445 | -40 | false |  | false |
| ±5 | BEST_PROMINENCE | BOTTOM_12 | BOTTOM:426 | BOTTOM:426 | prominence=5244 | BOTTOM:445 | -19 | false |  | false |
| ±5 | BEST_PROMINENCE | BOTTOM_13 | BOTTOM:438 | BOTTOM:438 | prominence=2864 | BOTTOM:445 | -7 | false |  | false |
| ±5 | BEST_PROMINENCE | BOTTOM_14 | BOTTOM:445, BOTTOM:450 | BOTTOM:450 | prominence=1028 | BOTTOM:445 | 5 | false | BOTTOM:445 | false |
| ±5 | BEST_PROMINENCE | BOTTOM_15 | BOTTOM:480 | BOTTOM:480 | prominence=5408 | BOTTOM:445 | 35 | false |  | false |
| ±5 | BEST_PROMINENCE | BOTTOM_16 | BOTTOM:500 | BOTTOM:500 | prominence=8920 | BOTTOM:529 | -29 | false |  | false |
| ±5 | BEST_PROMINENCE | BOTTOM_17 | BOTTOM:511 | BOTTOM:511 | prominence=7544 | BOTTOM:529 | -18 | false |  | false |
| ±5 | BEST_PROMINENCE | BOTTOM_18 | BOTTOM:529, BOTTOM:530 | BOTTOM:530 | prominence=1868 | BOTTOM:529 | 1 | true | BOTTOM:529 | false |
| ±5 | BEST_PROMINENCE | BOTTOM_19 | BOTTOM:564 | BOTTOM:564 | prominence=5416 | BOTTOM:529 | 35 | false |  | false |
| ±5 | BEST_PROMINENCE | BOTTOM_20 | BOTTOM:585 | BOTTOM:585 | prominence=6316 | BOTTOM:611 | -26 | false |  | false |
| ±5 | BEST_PROMINENCE | BOTTOM_21 | BOTTOM:595 | BOTTOM:595 | prominence=6396 | BOTTOM:611 | -16 | false |  | false |
| ±5 | BEST_PROMINENCE | BOTTOM_22 | BOTTOM:609, BOTTOM:611 | BOTTOM:609 | prominence=3880 | BOTTOM:611 | -2 | true | BOTTOM:611 | false |
| ±5 | BEST_PROMINENCE | BOTTOM_23 | BOTTOM:641 | BOTTOM:641 | prominence=5332 | BOTTOM:611 | 30 | false |  | false |
| ±5 | BEST_PROMINENCE | TOP_24 | TOP:170 | TOP:170 | prominence=4476 | TOP:199 | -29 | false |  | false |
| ±5 | BEST_PROMINENCE | TOP_25 | TOP:179 | TOP:179 | prominence=1064 | TOP:199 | -20 | false |  | false |
| ±5 | BEST_PROMINENCE | TOP_26 | TOP:195, TOP:199 | TOP:195 | prominence=7624 | TOP:199 | -4 | false | TOP:199 | false |
| ±5 | BEST_PROMINENCE | TOP_27 | TOP:222 | TOP:222 | prominence=4936 | TOP:199 | 23 | false |  | false |
| ±5 | BEST_PROMINENCE | TOP_28 | TOP:236 | TOP:236 | prominence=7272 | TOP:199 | 37 | false |  | false |
| ±5 | BEST_PROMINENCE | TOP_29 | TOP:265 | TOP:265 | prominence=1404 | TOP:291 | -26 | false |  | false |
| ±5 | BEST_PROMINENCE | TOP_30 | TOP:291 | TOP:291 | prominence=9772 | TOP:291 | 0 | true | TOP:291 | false |
| ±5 | BEST_PROMINENCE | TOP_31 | TOP:317 | TOP:317 | prominence=6716 | TOP:291 | 26 | false |  | false |
| ±5 | BEST_PROMINENCE | TOP_32 | TOP:333 | TOP:333 | prominence=6684 | TOP:291 | 42 | false |  | false |
| ±5 | BEST_PROMINENCE | TOP_33 | TOP:345 | TOP:345 | prominence=3776 | TOP:383 | -38 | false |  | false |
| ±5 | BEST_PROMINENCE | TOP_34 | TOP:365 | TOP:365 | prominence=780 | TOP:383 | -18 | false |  | false |
| ±5 | BEST_PROMINENCE | TOP_35 | TOP:379, TOP:383 | TOP:379 | prominence=8920 | TOP:383 | -4 | false | TOP:383 | false |
| ±5 | BEST_PROMINENCE | TOP_36 | TOP:411 | TOP:411 | prominence=7684 | TOP:383 | 28 | false |  | false |
| ±5 | BEST_PROMINENCE | TOP_37 | TOP:421 | TOP:421 | prominence=8548 | TOP:383 | 38 | false |  | false |
| ±5 | BEST_PROMINENCE | TOP_38 | TOP:436 | TOP:436 | prominence=3056 | TOP:474 | -38 | false |  | false |
| ±5 | BEST_PROMINENCE | TOP_39 | TOP:467 | TOP:467 | prominence=10880 | TOP:474 | -7 | false |  | false |
| ±5 | BEST_PROMINENCE | TOP_40 | TOP:474 | TOP:474 | prominence=2332 | TOP:474 | 0 | true | TOP:474 | false |
| ±5 | BEST_PROMINENCE | TOP_41 | TOP:509 | TOP:509 | prominence=8900 | TOP:474 | 35 | false |  | false |
| ±5 | BEST_PROMINENCE | TOP_42 | TOP:524 | TOP:524 | prominence=4312 | TOP:558 | -34 | false |  | false |
| ±5 | BEST_PROMINENCE | TOP_43 | TOP:535 | TOP:535 | prominence=1120 | TOP:558 | -23 | false |  | false |
| ±5 | BEST_PROMINENCE | TOP_44 | TOP:555, TOP:558 | TOP:555 | prominence=7020 | TOP:558 | -3 | false | TOP:558 | false |
| ±5 | BEST_PROMINENCE | TOP_45 | TOP:583 | TOP:583 | prominence=6908 | TOP:558 | 25 | false |  | false |
| ±5 | BEST_PROMINENCE | TOP_46 | TOP:594 | TOP:594 | prominence=7836 | TOP:558 | 36 | false |  | false |
| ±5 | BEST_PROMINENCE | TOP_47 | TOP:605 | TOP:605 | prominence=6356 | TOP:558 | 47 | false |  | false |
| ±5 | BEST_PROMINENCE | TOP_48 | TOP:640 | TOP:640 | prominence=7748 | TOP:558 | 82 | false |  | false |
| ±5 | GROUP_CENTER | BOTTOM_1 | BOTTOM:169 | BOTTOM:169 | distanceToGroupCenter=0, center=169 | BOTTOM:169 | 0 | true | BOTTOM:169 | false |
| ±5 | GROUP_CENTER | BOTTOM_2 | BOTTOM:210 | BOTTOM:210 | distanceToGroupCenter=0, center=210 | BOTTOM:169 | 41 | false |  | false |
| ±5 | GROUP_CENTER | BOTTOM_3 | BOTTOM:228 | BOTTOM:228 | distanceToGroupCenter=0, center=228 | BOTTOM:262 | -34 | false |  | false |
| ±5 | GROUP_CENTER | BOTTOM_4 | BOTTOM:243 | BOTTOM:243 | distanceToGroupCenter=0, center=243 | BOTTOM:262 | -19 | false |  | false |
| ±5 | GROUP_CENTER | BOTTOM_5 | BOTTOM:260, BOTTOM:262 | BOTTOM:260 | distanceToGroupCenter=1, center=261 | BOTTOM:262 | -2 | true | BOTTOM:262 | false |
| ±5 | GROUP_CENTER | BOTTOM_6 | BOTTOM:299 | BOTTOM:299 | distanceToGroupCenter=0, center=299 | BOTTOM:262 | 37 | false |  | false |
| ±5 | GROUP_CENTER | BOTTOM_7 | BOTTOM:321 | BOTTOM:321 | distanceToGroupCenter=0, center=321 | BOTTOM:353 | -32 | false |  | false |
| ±5 | GROUP_CENTER | BOTTOM_8 | BOTTOM:346 | BOTTOM:346 | distanceToGroupCenter=0, center=346 | BOTTOM:353 | -7 | false |  | false |
| ±5 | GROUP_CENTER | BOTTOM_9 | BOTTOM:353 | BOTTOM:353 | distanceToGroupCenter=0, center=353 | BOTTOM:353 | 0 | true | BOTTOM:353 | false |
| ±5 | GROUP_CENTER | BOTTOM_10 | BOTTOM:391 | BOTTOM:391 | distanceToGroupCenter=0, center=391 | BOTTOM:353 | 38 | false |  | false |
| ±5 | GROUP_CENTER | BOTTOM_11 | BOTTOM:405 | BOTTOM:405 | distanceToGroupCenter=0, center=405 | BOTTOM:445 | -40 | false |  | false |
| ±5 | GROUP_CENTER | BOTTOM_12 | BOTTOM:426 | BOTTOM:426 | distanceToGroupCenter=0, center=426 | BOTTOM:445 | -19 | false |  | false |
| ±5 | GROUP_CENTER | BOTTOM_13 | BOTTOM:438 | BOTTOM:438 | distanceToGroupCenter=0, center=438 | BOTTOM:445 | -7 | false |  | false |
| ±5 | GROUP_CENTER | BOTTOM_14 | BOTTOM:445, BOTTOM:450 | BOTTOM:445 | distanceToGroupCenter=2.5, center=447.5 | BOTTOM:445 | 0 | true | BOTTOM:445 | false |
| ±5 | GROUP_CENTER | BOTTOM_15 | BOTTOM:480 | BOTTOM:480 | distanceToGroupCenter=0, center=480 | BOTTOM:445 | 35 | false |  | false |
| ±5 | GROUP_CENTER | BOTTOM_16 | BOTTOM:500 | BOTTOM:500 | distanceToGroupCenter=0, center=500 | BOTTOM:529 | -29 | false |  | false |
| ±5 | GROUP_CENTER | BOTTOM_17 | BOTTOM:511 | BOTTOM:511 | distanceToGroupCenter=0, center=511 | BOTTOM:529 | -18 | false |  | false |
| ±5 | GROUP_CENTER | BOTTOM_18 | BOTTOM:529, BOTTOM:530 | BOTTOM:529 | distanceToGroupCenter=0.5, center=529.5 | BOTTOM:529 | 0 | true | BOTTOM:529 | false |
| ±5 | GROUP_CENTER | BOTTOM_19 | BOTTOM:564 | BOTTOM:564 | distanceToGroupCenter=0, center=564 | BOTTOM:529 | 35 | false |  | false |
| ±5 | GROUP_CENTER | BOTTOM_20 | BOTTOM:585 | BOTTOM:585 | distanceToGroupCenter=0, center=585 | BOTTOM:611 | -26 | false |  | false |
| ±5 | GROUP_CENTER | BOTTOM_21 | BOTTOM:595 | BOTTOM:595 | distanceToGroupCenter=0, center=595 | BOTTOM:611 | -16 | false |  | false |
| ±5 | GROUP_CENTER | BOTTOM_22 | BOTTOM:609, BOTTOM:611 | BOTTOM:609 | distanceToGroupCenter=1, center=610 | BOTTOM:611 | -2 | true | BOTTOM:611 | false |
| ±5 | GROUP_CENTER | BOTTOM_23 | BOTTOM:641 | BOTTOM:641 | distanceToGroupCenter=0, center=641 | BOTTOM:611 | 30 | false |  | false |
| ±5 | GROUP_CENTER | TOP_24 | TOP:170 | TOP:170 | distanceToGroupCenter=0, center=170 | TOP:199 | -29 | false |  | false |
| ±5 | GROUP_CENTER | TOP_25 | TOP:179 | TOP:179 | distanceToGroupCenter=0, center=179 | TOP:199 | -20 | false |  | false |
| ±5 | GROUP_CENTER | TOP_26 | TOP:195, TOP:199 | TOP:195 | distanceToGroupCenter=2, center=197 | TOP:199 | -4 | false | TOP:199 | false |
| ±5 | GROUP_CENTER | TOP_27 | TOP:222 | TOP:222 | distanceToGroupCenter=0, center=222 | TOP:199 | 23 | false |  | false |
| ±5 | GROUP_CENTER | TOP_28 | TOP:236 | TOP:236 | distanceToGroupCenter=0, center=236 | TOP:199 | 37 | false |  | false |
| ±5 | GROUP_CENTER | TOP_29 | TOP:265 | TOP:265 | distanceToGroupCenter=0, center=265 | TOP:291 | -26 | false |  | false |
| ±5 | GROUP_CENTER | TOP_30 | TOP:291 | TOP:291 | distanceToGroupCenter=0, center=291 | TOP:291 | 0 | true | TOP:291 | false |
| ±5 | GROUP_CENTER | TOP_31 | TOP:317 | TOP:317 | distanceToGroupCenter=0, center=317 | TOP:291 | 26 | false |  | false |
| ±5 | GROUP_CENTER | TOP_32 | TOP:333 | TOP:333 | distanceToGroupCenter=0, center=333 | TOP:291 | 42 | false |  | false |
| ±5 | GROUP_CENTER | TOP_33 | TOP:345 | TOP:345 | distanceToGroupCenter=0, center=345 | TOP:383 | -38 | false |  | false |
| ±5 | GROUP_CENTER | TOP_34 | TOP:365 | TOP:365 | distanceToGroupCenter=0, center=365 | TOP:383 | -18 | false |  | false |
| ±5 | GROUP_CENTER | TOP_35 | TOP:379, TOP:383 | TOP:379 | distanceToGroupCenter=2, center=381 | TOP:383 | -4 | false | TOP:383 | false |
| ±5 | GROUP_CENTER | TOP_36 | TOP:411 | TOP:411 | distanceToGroupCenter=0, center=411 | TOP:383 | 28 | false |  | false |
| ±5 | GROUP_CENTER | TOP_37 | TOP:421 | TOP:421 | distanceToGroupCenter=0, center=421 | TOP:383 | 38 | false |  | false |
| ±5 | GROUP_CENTER | TOP_38 | TOP:436 | TOP:436 | distanceToGroupCenter=0, center=436 | TOP:474 | -38 | false |  | false |
| ±5 | GROUP_CENTER | TOP_39 | TOP:467 | TOP:467 | distanceToGroupCenter=0, center=467 | TOP:474 | -7 | false |  | false |
| ±5 | GROUP_CENTER | TOP_40 | TOP:474 | TOP:474 | distanceToGroupCenter=0, center=474 | TOP:474 | 0 | true | TOP:474 | false |
| ±5 | GROUP_CENTER | TOP_41 | TOP:509 | TOP:509 | distanceToGroupCenter=0, center=509 | TOP:474 | 35 | false |  | false |
| ±5 | GROUP_CENTER | TOP_42 | TOP:524 | TOP:524 | distanceToGroupCenter=0, center=524 | TOP:558 | -34 | false |  | false |
| ±5 | GROUP_CENTER | TOP_43 | TOP:535 | TOP:535 | distanceToGroupCenter=0, center=535 | TOP:558 | -23 | false |  | false |
| ±5 | GROUP_CENTER | TOP_44 | TOP:555, TOP:558 | TOP:555 | distanceToGroupCenter=1.5, center=556.5 | TOP:558 | -3 | false | TOP:558 | false |
| ±5 | GROUP_CENTER | TOP_45 | TOP:583 | TOP:583 | distanceToGroupCenter=0, center=583 | TOP:558 | 25 | false |  | false |
| ±5 | GROUP_CENTER | TOP_46 | TOP:594 | TOP:594 | distanceToGroupCenter=0, center=594 | TOP:558 | 36 | false |  | false |
| ±5 | GROUP_CENTER | TOP_47 | TOP:605 | TOP:605 | distanceToGroupCenter=0, center=605 | TOP:558 | 47 | false |  | false |
| ±5 | GROUP_CENTER | TOP_48 | TOP:640 | TOP:640 | distanceToGroupCenter=0, center=640 | TOP:558 | 82 | false |  | false |

## Analyse ciblée BOTTOM:260 / BOTTOM:262

| windowSamples | rule | groupId | groupContent | representative | reason | associatedGroundTruth | signedDistanceToGroundTruth | withinExistingTolerance | mergedGroundTruthEvents | mergesDistinctGroundTruth |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ±1 | MOST_EXTREME | BOTTOM_5 | BOTTOM:260 | BOTTOM:260 | minimum value=16712 | BOTTOM:262 | -2 | true |  | false |
| ±1 | MOST_EXTREME | BOTTOM_6 | BOTTOM:262 | BOTTOM:262 | minimum value=17972 | BOTTOM:262 | 0 | true | BOTTOM:262 | false |
| ±1 | BEST_PROMINENCE | BOTTOM_5 | BOTTOM:260 | BOTTOM:260 | prominence=3236 | BOTTOM:262 | -2 | true |  | false |
| ±1 | BEST_PROMINENCE | BOTTOM_6 | BOTTOM:262 | BOTTOM:262 | prominence=1976 | BOTTOM:262 | 0 | true | BOTTOM:262 | false |
| ±1 | GROUP_CENTER | BOTTOM_5 | BOTTOM:260 | BOTTOM:260 | distanceToGroupCenter=0, center=260 | BOTTOM:262 | -2 | true |  | false |
| ±1 | GROUP_CENTER | BOTTOM_6 | BOTTOM:262 | BOTTOM:262 | distanceToGroupCenter=0, center=262 | BOTTOM:262 | 0 | true | BOTTOM:262 | false |
| ±2 | MOST_EXTREME | BOTTOM_5 | BOTTOM:260, BOTTOM:262 | BOTTOM:260 | minimum value=16712 | BOTTOM:262 | -2 | true | BOTTOM:262 | false |
| ±2 | BEST_PROMINENCE | BOTTOM_5 | BOTTOM:260, BOTTOM:262 | BOTTOM:260 | prominence=3236 | BOTTOM:262 | -2 | true | BOTTOM:262 | false |
| ±2 | GROUP_CENTER | BOTTOM_5 | BOTTOM:260, BOTTOM:262 | BOTTOM:260 | distanceToGroupCenter=1, center=261 | BOTTOM:262 | -2 | true | BOTTOM:262 | false |
| ±3 | MOST_EXTREME | BOTTOM_5 | BOTTOM:260, BOTTOM:262 | BOTTOM:260 | minimum value=16712 | BOTTOM:262 | -2 | true | BOTTOM:262 | false |
| ±3 | BEST_PROMINENCE | BOTTOM_5 | BOTTOM:260, BOTTOM:262 | BOTTOM:260 | prominence=3236 | BOTTOM:262 | -2 | true | BOTTOM:262 | false |
| ±3 | GROUP_CENTER | BOTTOM_5 | BOTTOM:260, BOTTOM:262 | BOTTOM:260 | distanceToGroupCenter=1, center=261 | BOTTOM:262 | -2 | true | BOTTOM:262 | false |
| ±5 | MOST_EXTREME | BOTTOM_5 | BOTTOM:260, BOTTOM:262 | BOTTOM:260 | minimum value=16712 | BOTTOM:262 | -2 | true | BOTTOM:262 | false |
| ±5 | BEST_PROMINENCE | BOTTOM_5 | BOTTOM:260, BOTTOM:262 | BOTTOM:260 | prominence=3236 | BOTTOM:262 | -2 | true | BOTTOM:262 | false |
| ±5 | GROUP_CENTER | BOTTOM_5 | BOTTOM:260, BOTTOM:262 | BOTTOM:260 | distanceToGroupCenter=1, center=261 | BOTTOM:262 | -2 | true | BOTTOM:262 | false |

## Meilleure combinaison observée

| windowSamples | rule | inputCandidateCount | groupCount | candidatesRemoved | mergedGroundTruthGroupCount | allRequiredPivotsPresent | missingGroundTruthPivots | groundTruthSequenceReconstructible | verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ±2 | MOST_EXTREME | 55 | 52 | 3 | 0 | true |  | true | RECONSTRUCTIBLE |
| ±2 | BEST_PROMINENCE | 55 | 52 | 3 | 0 | true |  | true | RECONSTRUCTIBLE |
| ±2 | GROUP_CENTER | 55 | 52 | 3 | 0 | true |  | true | RECONSTRUCTIBLE |

La meilleure combinaison est définie uniquement parmi les configurations qui conservent la chaîne Ground Truth reconstructible, puis par le plus grand nombre de candidats supprimés. Les ex æquo sont tous conservés.

## Cas où le regroupement détruit une Ground Truth

| windowSamples | rule | inputCandidateCount | groupCount | candidatesRemoved | mergedGroundTruthGroupCount | allRequiredPivotsPresent | missingGroundTruthPivots | groundTruthSequenceReconstructible | verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ±3 | MOST_EXTREME | 55 | 51 | 4 | 0 | false | TOP:558 | false | DESTROYED |
| ±3 | BEST_PROMINENCE | 55 | 51 | 4 | 0 | false | TOP:558 | false | DESTROYED |
| ±3 | GROUP_CENTER | 55 | 51 | 4 | 0 | false | TOP:558 | false | DESTROYED |
| ±5 | MOST_EXTREME | 55 | 48 | 7 | 0 | false | TOP:199, TOP:383, BOTTOM:445, TOP:558 | false | DESTROYED |
| ±5 | BEST_PROMINENCE | 55 | 48 | 7 | 0 | false | TOP:199, TOP:383, BOTTOM:445, TOP:558 | false | DESTROYED |
| ±5 | GROUP_CENTER | 55 | 48 | 7 | 0 | false | TOP:199, TOP:383, TOP:558 | false | DESTROYED |

## Conclusion factuelle

6/12 combinaisons conservent une séquence Ground Truth reconstructible; 6/12 la détruisent.
