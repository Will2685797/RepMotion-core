# Expérience E — Progressive Global Cycle-Weighted Composition

## 1. Executive summary

Segments=999; states=50196; complete unique=3; best GT=7/11; full GT=NO; guard=NONE; verdict=**PROGRESSIVE_CYCLE_WEIGHTED_COMPOSITION_PRUNES_GT_BRANCH**.

## 2. État A/B/C/D

| metric | a | b | c | d | e |
| --- | --- | --- | --- | --- | --- |
| GT pivot availability | 11/11 | 5/11 guarded | 11/11 | 11/11 source | 11/11 source |
| GT segment coverage | 10/11 | incomplete | 11/11 | 11/11 | 11/11 |
| Best GT path | 7/11 | 3/11 | 7/11 | 10/11 | 7/11 |
| Full GT generated | NO | NO | NO | NO before guard | NO |
| Composition states | N/A | 36046 | 5119 | 865082 | 50196 |
| Unique paths | 648 | 83 | 999 | 200001 | 3 |
| Guard | NONE | MAX_SEGMENTS | NONE | MAX_UNIQUE_PATHS | NONE |
| Final GT rank | N/A | N/A | N/A | N/A | N/A |
| Runtime ms | 341.7367 | 80.0265 | 447.5146000000001 | 16465.5262 | 2294.0635999999995 |

## 3. Architecture E

Composition left-to-right sur le prochain pivot non assigné; KEEP_BASE ou segment naturel compatible; cycle count issu du préfixe contigu assigné; score local; beam K=5 par contexte comparable.

## 4. Population des 999 segments

| a | cAdditions | total | assertionPassed |
| --- | --- | --- | --- |
| 648 | 351 | 999 | true |

## 5. Composition progressive

États=50196; incompatibles=32970; structuralRejected=1633; duplicates=6359; pruned=8887.

## 6. Définition des cycles

`actualCompleteCyclesInCurrentHypothesis = floor((contiguousAssignedPrefixLength - 1) / 2)`. Seuls position 0, KEEP_BASE explicitement avancés et pivots couverts par segments comptent.

## 7. Preuves historiques des critères

| criterion | completeCycleCount | historicalEvidence | derivedWeight | derivationMethod |
| --- | --- | --- | --- | --- |
| ZERO_PROXY | 1 | first strict GT preference=1; full-path rank=1 | 1 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| ZERO_PROXY | 2 | first strict GT preference=1; full-path rank=1 | 1 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| ZERO_PROXY | 3 | first strict GT preference=1; full-path rank=1 | 1 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| ZERO_PROXY | 4 | first strict GT preference=1; full-path rank=1 | 1 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| ZERO_PROXY | 5 | first strict GT preference=1; full-path rank=1 | 1 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| JERK_PROXY | 1 | first strict GT preference=1; full-path rank=4 | 0.25 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| JERK_PROXY | 2 | first strict GT preference=1; full-path rank=4 | 0.25 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| JERK_PROXY | 3 | first strict GT preference=1; full-path rank=4 | 0.25 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| JERK_PROXY | 4 | first strict GT preference=1; full-path rank=4 | 0.25 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| JERK_PROXY | 5 | first strict GT preference=1; full-path rank=4 | 0.25 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| AMPLITUDE_PROXY | 1 | first strict GT preference=3; full-path rank=9 | 0.037037037037037035 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| AMPLITUDE_PROXY | 2 | first strict GT preference=3; full-path rank=9 | 0.07407407407407407 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| AMPLITUDE_PROXY | 3 | first strict GT preference=3; full-path rank=9 | 0.1111111111111111 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| AMPLITUDE_PROXY | 4 | first strict GT preference=3; full-path rank=9 | 0.1111111111111111 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| AMPLITUDE_PROXY | 5 | first strict GT preference=3; full-path rank=9 | 0.1111111111111111 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| TEMPORAL | 1 | first strict GT preference=4; full-path rank=1 | 0.25 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| TEMPORAL | 2 | first strict GT preference=4; full-path rank=1 | 0.5 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| TEMPORAL | 3 | first strict GT preference=4; full-path rank=1 | 0.75 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| TEMPORAL | 4 | first strict GT preference=4; full-path rank=1 | 1 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| TEMPORAL | 5 | first strict GT preference=4; full-path rank=1 | 1 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| SHAPE | 1 | first strict GT preference=5; full-path rank=1 | 0.2 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| SHAPE | 2 | first strict GT preference=5; full-path rank=1 | 0.4 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| SHAPE | 3 | first strict GT preference=5; full-path rank=1 | 0.6 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| SHAPE | 4 | first strict GT preference=5; full-path rank=1 | 0.8 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| SHAPE | 5 | first strict GT preference=5; full-path rank=1 | 1 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |

## 8. Table des poids par cycles

| criterion | completeCycleCount | historicalEvidence | derivedWeight | derivationMethod |
| --- | --- | --- | --- | --- |
| ZERO_PROXY | 1 | first strict GT preference=1; full-path rank=1 | 1 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| ZERO_PROXY | 2 | first strict GT preference=1; full-path rank=1 | 1 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| ZERO_PROXY | 3 | first strict GT preference=1; full-path rank=1 | 1 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| ZERO_PROXY | 4 | first strict GT preference=1; full-path rank=1 | 1 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| ZERO_PROXY | 5 | first strict GT preference=1; full-path rank=1 | 1 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| JERK_PROXY | 1 | first strict GT preference=1; full-path rank=4 | 0.25 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| JERK_PROXY | 2 | first strict GT preference=1; full-path rank=4 | 0.25 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| JERK_PROXY | 3 | first strict GT preference=1; full-path rank=4 | 0.25 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| JERK_PROXY | 4 | first strict GT preference=1; full-path rank=4 | 0.25 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| JERK_PROXY | 5 | first strict GT preference=1; full-path rank=4 | 0.25 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| AMPLITUDE_PROXY | 1 | first strict GT preference=3; full-path rank=9 | 0.037037037037037035 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| AMPLITUDE_PROXY | 2 | first strict GT preference=3; full-path rank=9 | 0.07407407407407407 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| AMPLITUDE_PROXY | 3 | first strict GT preference=3; full-path rank=9 | 0.1111111111111111 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| AMPLITUDE_PROXY | 4 | first strict GT preference=3; full-path rank=9 | 0.1111111111111111 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| AMPLITUDE_PROXY | 5 | first strict GT preference=3; full-path rank=9 | 0.1111111111111111 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| TEMPORAL | 1 | first strict GT preference=4; full-path rank=1 | 0.25 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| TEMPORAL | 2 | first strict GT preference=4; full-path rank=1 | 0.5 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| TEMPORAL | 3 | first strict GT preference=4; full-path rank=1 | 0.75 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| TEMPORAL | 4 | first strict GT preference=4; full-path rank=1 | 1 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| TEMPORAL | 5 | first strict GT preference=4; full-path rank=1 | 1 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| SHAPE | 1 | first strict GT preference=5; full-path rank=1 | 0.2 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| SHAPE | 2 | first strict GT preference=5; full-path rank=1 | 0.4 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| SHAPE | 3 | first strict GT preference=5; full-path rank=1 | 0.6 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| SHAPE | 4 | first strict GT preference=5; full-path rank=1 | 0.8 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |
| SHAPE | 5 | first strict GT preference=5; full-path rank=1 | 1 | WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank |

## 9. Formule de scoring

Score = somme(normalized[-1,1] × derived cycle weight × local confidence). Aucun veto; critères null non utilisés. Normalisation entre hypothèses au même nextPosition/cycleCount.

## 10. Beam / Top-K

K=5 fixé avant observation; pruning à chaque changement du préfixe réellement disponible, groupes comparables uniquement; tie-break signature puis provenance, sans GT.

## 11. Tableau par nombre de cycles

| cycleCount | criteriaWeights | before | valid | scored | survivors | pruned | bestScore | unique | bestGtCountDiagnostic |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | {"ZERO_PROXY":0,"JERK_PROXY":0,"AMPLITUDE_PROXY":0,"TEMPORAL":0,"SHAPE":0} | 3 | 3 | 3 | 3 | 0 | 0 | 3 | 3 |
| 1 | {"ZERO_PROXY":1,"JERK_PROXY":0.25,"AMPLITUDE_PROXY":0.037037037037037035,"TEMPORAL":0.25,"SHAPE":0.2} | 220 | 220 | 220 | 23 | 197 | 1.1092664847428908 | 220 | 4 |
| 2 | {"ZERO_PROXY":1,"JERK_PROXY":0.25,"AMPLITUDE_PROXY":0.07407407407407407,"TEMPORAL":0.5,"SHAPE":0.4} | 1917 | 1917 | 1917 | 40 | 1877 | 1 | 1917 | 5 |
| 3 | {"ZERO_PROXY":1,"JERK_PROXY":0.25,"AMPLITUDE_PROXY":0.1111111111111111,"TEMPORAL":0.75,"SHAPE":0.6} | 3785 | 3785 | 3785 | 55 | 3730 | 1.0456310841541172 | 3785 | 6 |
| 4 | {"ZERO_PROXY":1,"JERK_PROXY":0.25,"AMPLITUDE_PROXY":0.1111111111111111,"TEMPORAL":1,"SHAPE":0.8} | 996 | 996 | 996 | 65 | 931 | 2.049382716049383 | 996 | 5 |
| 5 | {"ZERO_PROXY":1,"JERK_PROXY":0.25,"AMPLITUDE_PROXY":0.1111111111111111,"TEMPORAL":1,"SHAPE":1} | 2192 | 2192 | 2192 | 40 | 2152 | 2.353373789164004 | 2192 | 8 |

## 12. Trace chemin 10/11 D

| nextPosition | cycles | prefix | fullPath | segmentIds | score | rank | survivedBeam | criteria | detail |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | 0 | BOTTOM:169\|TOP:199 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | S0002 | 0 | 3 | true | NONE | {"raw":{},"orientation":{},"normalized":{},"weights":{},"confidence":{},"contributions":{},"activeCriteria":[]} |
| 4 | 1 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | S0030 | 0.9239662777035536 | 9 | false | ZERO_PROXY,JERK_PROXY | {"raw":{"ZERO_PROXY":2728,"JERK_PROXY":2714.4137551040935},"orientation":{"ZERO_PROXY":["LOWER"],"JERK_PROXY":["LOWER"]},"normalized":{"ZERO_PROXY":0.7885410513880686,"JERK_PROXY":1},"weights":{"ZERO_PROXY":1,"JERK_PROXY":0.25},"confidence":{"ZERO_PROXY":0.8762939958592133,"JERK_PROXY":0.9318899555347103},"contributions":{"ZERO_PROXY":0.6909937888198759,"JERK_PROXY":0.23297248888367758},"activeCriteria":["ZERO_PROXY","JERK_PROXY"]} |
| 5 | 2 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291\|BOTTOM:353 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291\|BOTTOM:353\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | S0100 | 0.3953556704924398 | 18 | false | ZERO_PROXY,JERK_PROXY | {"raw":{"ZERO_PROXY":2622.4,"JERK_PROXY":2771.2519800859086},"orientation":{"ZERO_PROXY":["LOWER"],"JERK_PROXY":["LOWER"]},"normalized":{"ZERO_PROXY":0.4623702422145328,"JERK_PROXY":-0.015719697103089958},"weights":{"ZERO_PROXY":1,"JERK_PROXY":0.25},"confidence":{"ZERO_PROXY":0.8622843822843822,"JERK_PROXY":0.8496266003859535},"contributions":{"ZERO_PROXY":0.3986946386946386,"JERK_PROXY":-0.0033389682021988105},"activeCriteria":["ZERO_PROXY","JERK_PROXY"]} |
| 3 | 1 | BOTTOM:169\|TOP:199\|BOTTOM:228 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | S0002 | 0.8566086956521739 | 2 | true | ZERO_PROXY,JERK_PROXY | {"raw":{"ZERO_PROXY":2728,"JERK_PROXY":2714.4137551040935},"orientation":{"ZERO_PROXY":["LOWER"],"JERK_PROXY":["LOWER"]},"normalized":{"ZERO_PROXY":0.7089430894308943,"JERK_PROXY":1},"weights":{"ZERO_PROXY":1,"JERK_PROXY":0.25},"confidence":{"ZERO_PROXY":0.8556521739130434,"JERK_PROXY":1},"contributions":{"ZERO_PROXY":0.6066086956521739,"JERK_PROXY":0.25},"activeCriteria":["ZERO_PROXY","JERK_PROXY"]} |
| 4 | 1 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | S0002 -> S0030 | 0.8618120359961647 | 9 | false | ZERO_PROXY,JERK_PROXY | {"raw":{"ZERO_PROXY":2728,"JERK_PROXY":2714.4137551040935},"orientation":{"ZERO_PROXY":["LOWER"],"JERK_PROXY":["LOWER"]},"normalized":{"ZERO_PROXY":0.7954285714285716,"JERK_PROXY":1},"weights":{"ZERO_PROXY":1,"JERK_PROXY":0.25},"confidence":{"ZERO_PROXY":0.7709251101321586,"JERK_PROXY":0.9943847078613107},"contributions":{"ZERO_PROXY":0.6132158590308371,"JERK_PROXY":0.24859617696532768},"activeCriteria":["ZERO_PROXY","JERK_PROXY"]} |
| 5 | 2 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291\|BOTTOM:353 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291\|BOTTOM:353\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | S0002 -> S0100 | 0.4182055267758539 | 39 | false | ZERO_PROXY,JERK_PROXY | {"raw":{"ZERO_PROXY":2622.4,"JERK_PROXY":2771.2519800859086},"orientation":{"ZERO_PROXY":["LOWER"],"JERK_PROXY":["LOWER"]},"normalized":{"ZERO_PROXY":0.4832675119517771,"JERK_PROXY":-0.015719697103089958},"weights":{"ZERO_PROXY":1,"JERK_PROXY":0.25},"confidence":{"ZERO_PROXY":0.8726646109196444,"JERK_PROXY":0.8969456570394995},"contributions":{"ZERO_PROXY":0.42173045528750214,"JERK_PROXY":-0.0035249285116482347},"activeCriteria":["ZERO_PROXY","JERK_PROXY"]} |
| 4 | 1 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | S0002 | 0.7921994884910487 | 18 | false | ZERO_PROXY,JERK_PROXY | {"raw":{"ZERO_PROXY":2728,"JERK_PROXY":2714.4137551040935},"orientation":{"ZERO_PROXY":["LOWER"],"JERK_PROXY":["LOWER"]},"normalized":{"ZERO_PROXY":0.6398390342052316,"JERK_PROXY":1},"weights":{"ZERO_PROXY":1,"JERK_PROXY":0.25},"confidence":{"ZERO_PROXY":0.8473998294970162,"JERK_PROXY":1},"contributions":{"ZERO_PROXY":0.5421994884910487,"JERK_PROXY":0.25},"activeCriteria":["ZERO_PROXY","JERK_PROXY"]} |
| 4 | 1 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | S0002 -> S0030 | 0.7921994884910487 | 19 | false | ZERO_PROXY,JERK_PROXY | {"raw":{"ZERO_PROXY":2728,"JERK_PROXY":2714.4137551040935},"orientation":{"ZERO_PROXY":["LOWER"],"JERK_PROXY":["LOWER"]},"normalized":{"ZERO_PROXY":0.6398390342052316,"JERK_PROXY":1},"weights":{"ZERO_PROXY":1,"JERK_PROXY":0.25},"confidence":{"ZERO_PROXY":0.8473998294970162,"JERK_PROXY":1},"contributions":{"ZERO_PROXY":0.5421994884910487,"JERK_PROXY":0.25},"activeCriteria":["ZERO_PROXY","JERK_PROXY"]} |
| 4 | 1 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | S0002 -> S0241 | 0.7921994884910487 | 20 | false | ZERO_PROXY,JERK_PROXY | {"raw":{"ZERO_PROXY":2728,"JERK_PROXY":2714.4137551040935},"orientation":{"ZERO_PROXY":["LOWER"],"JERK_PROXY":["LOWER"]},"normalized":{"ZERO_PROXY":0.6398390342052316,"JERK_PROXY":1},"weights":{"ZERO_PROXY":1,"JERK_PROXY":0.25},"confidence":{"ZERO_PROXY":0.8473998294970162,"JERK_PROXY":1},"contributions":{"ZERO_PROXY":0.5421994884910487,"JERK_PROXY":0.25},"activeCriteria":["ZERO_PROXY","JERK_PROXY"]} |
| 5 | 2 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291\|BOTTOM:353 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291\|BOTTOM:353\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | S0002 -> S0100 | 0.3551109247764969 | 52 | false | ZERO_PROXY,JERK_PROXY | {"raw":{"ZERO_PROXY":2622.4,"JERK_PROXY":2771.2519800859086},"orientation":{"ZERO_PROXY":["LOWER"],"JERK_PROXY":["LOWER"]},"normalized":{"ZERO_PROXY":0.4139986752042393,"JERK_PROXY":-0.015719697103089958},"weights":{"ZERO_PROXY":1,"JERK_PROXY":0.25},"confidence":{"ZERO_PROXY":0.8659655831739961,"JERK_PROXY":0.8645661319609194},"contributions":{"ZERO_PROXY":0.3585086042065009,"JERK_PROXY":-0.0033976794300039385},"activeCriteria":["ZERO_PROXY","JERK_PROXY"]} |
| 6 | 2 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291\|BOTTOM:353\|TOP:383 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291\|BOTTOM:353\|TOP:383\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | S0002 -> S0327 | 0.28090850512532295 | 114 | false | ZERO_PROXY,JERK_PROXY | {"raw":{"ZERO_PROXY":2622.4,"JERK_PROXY":2771.2519800859086},"orientation":{"ZERO_PROXY":["LOWER"],"JERK_PROXY":["LOWER"]},"normalized":{"ZERO_PROXY":0.3366658335416146,"JERK_PROXY":-0.015719697103089958},"weights":{"ZERO_PROXY":1,"JERK_PROXY":0.25},"confidence":{"ZERO_PROXY":0.8440928270042194,"JERK_PROXY":0.8317488671987183},"contributions":{"ZERO_PROXY":0.28417721518987343,"JERK_PROXY":-0.003268710064550512},"activeCriteria":["ZERO_PROXY","JERK_PROXY"]} |
| 7 | 3 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291\|BOTTOM:353\|TOP:383\|BOTTOM:445 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291\|BOTTOM:353\|TOP:383\|BOTTOM:445\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | S0002 -> S0508 | 0.5692233829271067 | 183 | false | ZERO_PROXY,JERK_PROXY,AMPLITUDE_PROXY | {"raw":{"ZERO_PROXY":2074.8571428571427,"JERK_PROXY":2748.4777308215184,"AMPLITUDE_PROXY":[0.5356963092933142,3366,2117.3333333333335]},"orientation":{"ZERO_PROXY":["LOWER"],"JERK_PROXY":["LOWER"],"AMPLITUDE_PROXY":["LOWER","LOWER","LOWER"]},"normalized":{"ZERO_PROXY":0.5963498098859317,"JERK_PROXY":0.21815854906030085,"AMPLITUDE_PROXY":-0.09871439780051534},"weights":{"ZERO_PROXY":1,"JERK_PROXY":0.25,"AMPLITUDE_PROXY":0.1111111111111111},"confidence":{"ZERO_PROXY":0.887314439946019,"JERK_PROXY":0.9133630451690432,"AMPLITUDE_PROXY":0.8880987608763175},"contributions":{"ZERO_PROXY":0.5291497975708503,"JERK_PROXY":0.04981448917484412,"AMPLITUDE_PROXY":-0.009740903818587728},"activeCriteria":["ZERO_PROXY","JERK_PROXY","AMPLITUDE_PROXY"]} |

## 13. Trace branche GT

| nextPosition | cycles | prefix | fullPath | segmentIds | score | rank | survivedBeam | criteria | detail |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | 0 | BOTTOM:169\|TOP:199 | BOTTOM:169\|TOP:199\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | S0002 | 0 | 3 | true | NONE | {"raw":{},"orientation":{},"normalized":{},"weights":{},"confidence":{},"contributions":{},"activeCriteria":[]} |
| 4 | 1 | BOTTOM:169\|TOP:199\|BOTTOM:262\|TOP:291 | BOTTOM:169\|TOP:199\|BOTTOM:262\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | S0043 | 0.4154717673034189 | 17 | false | ZERO_PROXY,JERK_PROXY | {"raw":{"ZERO_PROXY":2826.6666666666665,"JERK_PROXY":2826.974947685018},"orientation":{"ZERO_PROXY":["LOWER"],"JERK_PROXY":["LOWER"]},"normalized":{"ZERO_PROXY":0.7011222681630245,"JERK_PROXY":-0.8538238467733914},"weights":{"ZERO_PROXY":1,"JERK_PROXY":0.25},"confidence":{"ZERO_PROXY":0.8762939958592133,"JERK_PROXY":0.9318899555347103},"contributions":{"ZERO_PROXY":0.6143892339544517,"JERK_PROXY":-0.19891746665103277},"activeCriteria":["ZERO_PROXY","JERK_PROXY"]} |
| 4 | 1 | BOTTOM:169\|TOP:199\|BOTTOM:262\|TOP:291 | BOTTOM:169\|TOP:199\|BOTTOM:262\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | S0002 -> S0043 | 0.33576027703567984 | 21 | false | ZERO_PROXY,JERK_PROXY | {"raw":{"ZERO_PROXY":2826.6666666666665,"JERK_PROXY":2826.974947685018},"orientation":{"ZERO_PROXY":["LOWER"],"JERK_PROXY":["LOWER"]},"normalized":{"ZERO_PROXY":0.7108571428571431,"JERK_PROXY":-0.8538238467733914},"weights":{"ZERO_PROXY":1,"JERK_PROXY":0.25},"confidence":{"ZERO_PROXY":0.7709251101321586,"JERK_PROXY":0.9943847078613107},"contributions":{"ZERO_PROXY":0.5480176211453747,"JERK_PROXY":-0.21225734410969482},"activeCriteria":["ZERO_PROXY","JERK_PROXY"]} |
| 4 | 1 | BOTTOM:169\|TOP:199\|BOTTOM:262\|TOP:291 | BOTTOM:169\|TOP:199\|BOTTOM:262\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | S0002 -> S0150 | 0.33576027703567984 | 22 | false | ZERO_PROXY,JERK_PROXY | {"raw":{"ZERO_PROXY":2826.6666666666665,"JERK_PROXY":2826.974947685018},"orientation":{"ZERO_PROXY":["LOWER"],"JERK_PROXY":["LOWER"]},"normalized":{"ZERO_PROXY":0.7108571428571431,"JERK_PROXY":-0.8538238467733914},"weights":{"ZERO_PROXY":1,"JERK_PROXY":0.25},"confidence":{"ZERO_PROXY":0.7709251101321586,"JERK_PROXY":0.9943847078613107},"contributions":{"ZERO_PROXY":0.5480176211453747,"JERK_PROXY":-0.21225734410969482},"activeCriteria":["ZERO_PROXY","JERK_PROXY"]} |

## 14. GT 11/11 générée ou non

FULL_GT_11_11_GENERATED_BY_E = NO. First loss=cycles 1, rank 17.

## 15. Ranking final

| rank | path | temporal | shapeRaw | shapeScore | weighted | gtCountDiagnostic | segmentIds |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:265\|BOTTOM:353\|TOP:383\|BOTTOM:445\|TOP:474\|BOTTOM:530\|TOP:558\|BOTTOM:609 | -0.2701395382762403 | [0.3935648721015058,0.10217363329951956,0.19657496032301341] | 0.3333333333333333 | 1.7257135026010233 | 6 | S0001 -> S0007 -> S0058 -> S0305 -> S0433 -> S0728 -> S0917 |
| 2 | BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:265\|BOTTOM:353\|TOP:383\|BOTTOM:445\|TOP:474\|BOTTOM:529\|TOP:558\|BOTTOM:585 | -0.32897687071928083 | [0.3292777104441719,0.19477754306139267,0.13474771792492493] | 0.6666666666666666 | 1.554182932857747 | 7 | S0007 -> S0433 -> S0902 |
| 3 | BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:265\|BOTTOM:353\|TOP:383\|BOTTOM:445\|TOP:474\|BOTTOM:529\|TOP:555\|BOTTOM:585 | -0.3244893993171576 | [0.3292777104441719,0.19477754306139267,0.13474771792492493] | 0.6666666666666666 | 1.349342954873104 | 6 | S0001 -> S0007 -> S0058 -> S0305 -> S0728 -> S0940 |

## 16. TEMPORAL

| rank | path | temporal | shapeRaw | shapeScore | weighted | gtCountDiagnostic | segmentIds |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:265\|BOTTOM:353\|TOP:383\|BOTTOM:445\|TOP:474\|BOTTOM:530\|TOP:558\|BOTTOM:609 | -0.2701395382762403 | [0.3935648721015058,0.10217363329951956,0.19657496032301341] | 0.3333333333333333 | 1.7257135026010233 | 6 | S0001 -> S0007 -> S0058 -> S0305 -> S0433 -> S0728 -> S0917 |
| 2 | BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:265\|BOTTOM:353\|TOP:383\|BOTTOM:445\|TOP:474\|BOTTOM:529\|TOP:555\|BOTTOM:585 | -0.3244893993171576 | [0.3292777104441719,0.19477754306139267,0.13474771792492493] | 0.6666666666666666 | 1.349342954873104 | 6 | S0001 -> S0007 -> S0058 -> S0305 -> S0728 -> S0940 |
| 3 | BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:265\|BOTTOM:353\|TOP:383\|BOTTOM:445\|TOP:474\|BOTTOM:529\|TOP:558\|BOTTOM:585 | -0.32897687071928083 | [0.3292777104441719,0.19477754306139267,0.13474771792492493] | 0.6666666666666666 | 1.554182932857747 | 7 | S0007 -> S0433 -> S0902 |

## 17. SHAPE

| rank | path | temporal | shapeRaw | shapeScore | weighted | gtCountDiagnostic | segmentIds |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:265\|BOTTOM:353\|TOP:383\|BOTTOM:445\|TOP:474\|BOTTOM:529\|TOP:555\|BOTTOM:585 | -0.3244893993171576 | [0.3292777104441719,0.19477754306139267,0.13474771792492493] | 0.6666666666666666 | 1.349342954873104 | 6 | S0001 -> S0007 -> S0058 -> S0305 -> S0728 -> S0940 |
| 2 | BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:265\|BOTTOM:353\|TOP:383\|BOTTOM:445\|TOP:474\|BOTTOM:529\|TOP:558\|BOTTOM:585 | -0.32897687071928083 | [0.3292777104441719,0.19477754306139267,0.13474771792492493] | 0.6666666666666666 | 1.554182932857747 | 7 | S0007 -> S0433 -> S0902 |
| 3 | BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:265\|BOTTOM:353\|TOP:383\|BOTTOM:445\|TOP:474\|BOTTOM:530\|TOP:558\|BOTTOM:609 | -0.2701395382762403 | [0.3935648721015058,0.10217363329951956,0.19657496032301341] | 0.3333333333333333 | 1.7257135026010233 | 6 | S0001 -> S0007 -> S0058 -> S0305 -> S0433 -> S0728 -> S0917 |

## 18. Weighted global score

| rank | path | temporal | shapeRaw | shapeScore | weighted | gtCountDiagnostic | segmentIds |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:265\|BOTTOM:353\|TOP:383\|BOTTOM:445\|TOP:474\|BOTTOM:530\|TOP:558\|BOTTOM:609 | -0.2701395382762403 | [0.3935648721015058,0.10217363329951956,0.19657496032301341] | 0.3333333333333333 | 1.7257135026010233 | 6 | S0001 -> S0007 -> S0058 -> S0305 -> S0433 -> S0728 -> S0917 |
| 2 | BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:265\|BOTTOM:353\|TOP:383\|BOTTOM:445\|TOP:474\|BOTTOM:529\|TOP:558\|BOTTOM:585 | -0.32897687071928083 | [0.3292777104441719,0.19477754306139267,0.13474771792492493] | 0.6666666666666666 | 1.554182932857747 | 7 | S0007 -> S0433 -> S0902 |
| 3 | BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:265\|BOTTOM:353\|TOP:383\|BOTTOM:445\|TOP:474\|BOTTOM:529\|TOP:555\|BOTTOM:585 | -0.3244893993171576 | [0.3292777104441719,0.19477754306139267,0.13474771792492493] | 0.6666666666666666 | 1.349342954873104 | 6 | S0001 -> S0007 -> S0058 -> S0305 -> S0728 -> S0940 |

## 19. Réduction combinatoire

| dCompositions | eStates | compositionReductionRatio | dUnique | eUnique | uniquePathReductionRatio | stateReductionRatio | dRuntimeMs | eRuntimeMs | runtimeRatio |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 865082 | 50196 | 0.9419754427903945 | 200001 | 3 | 0.9999850000749996 | 0.9419754427903945 | 16465.5262 | 2296.7919999999995 | 0.1393151468186908 |

## 20. Comparaison D/E

| metric | d | e |
| --- | --- | --- |
| GT pivot availability | 11/11 source | 11/11 source |
| GT segment coverage | 11/11 | 11/11 |
| Best GT path | 10/11 | 7/11 |
| Full GT generated | NO before guard | NO |
| Composition states | 865082 | 50196 |
| Unique paths | 200001 | 3 |
| Guard | MAX_UNIQUE_PATHS | NONE |
| Final GT rank | N/A | N/A |
| Runtime ms | 16465.5262 | 2294.0635999999995 |

## 21. Comparaison A/B/C/D/E

| metric | a | b | c | d | e |
| --- | --- | --- | --- | --- | --- |
| GT pivot availability | 11/11 | 5/11 guarded | 11/11 | 11/11 source | 11/11 source |
| GT segment coverage | 10/11 | incomplete | 11/11 | 11/11 | 11/11 |
| Best GT path | 7/11 | 3/11 | 7/11 | 10/11 | 7/11 |
| Full GT generated | NO | NO | NO | NO before guard | NO |
| Composition states | N/A | 36046 | 5119 | 865082 | 50196 |
| Unique paths | 648 | 83 | 999 | 200001 | 3 |
| Guard | NONE | MAX_SEGMENTS | NONE | MAX_UNIQUE_PATHS | NONE |
| Final GT rank | N/A | N/A | N/A | N/A | N/A |
| Runtime ms | 341.7367 | 80.0265 | 447.5146000000001 | 16465.5262 | 2294.0635999999995 |

## 22. Audit fuite GT

| phase | gtRead | detail |
| --- | --- | --- |
| weights | NO | GT labels computed only post-hoc after beam completion |
| cycle count | NO | GT labels computed only post-hoc after beam completion |
| expansion order | NO | GT labels computed only post-hoc after beam completion |
| score/normalization | NO | GT labels computed only post-hoc after beam completion |
| beam/tie-break | NO | GT labels computed only post-hoc after beam completion |
| guards | NO | GT labels computed only post-hoc after beam completion |
| compatibility/validPrefix | NO | GT labels computed only post-hoc after beam completion |

GROUND_TRUTH_USED_FOR_DECISION = NO.

## 23. Réponses Q1-Q20

| question | answer |
| --- | --- |
| Q1 A/B/C/D inchangés | OUI |
| Q2 mêmes 999 segments | OUI |
| Q3 cycles depuis hypothèse | OUI — floor((contiguousAssignedPrefixLength-1)/2) |
| Q4 poids 1..5 | [{"criterion":"ZERO_PROXY","completeCycleCount":1,"historicalEvidence":"first strict GT preference=1; full-path rank=1","derivedWeight":1,"derivationMethod":"WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank"},{"criterion":"ZERO_PROXY","completeCycleCount":2,"historicalEvidence":"first strict GT preference=1; full-path rank=1","derivedWeight":1,"derivationMethod":"WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank"},{"criterion":"ZERO_PROXY","completeCycleCount":3,"historicalEvidence":"first strict GT preference=1; full-path rank=1","derivedWeight":1,"derivationMethod":"WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank"},{"criterion":"ZERO_PROXY","completeCycleCount":4,"historicalEvidence":"first strict GT preference=1; full-path rank=1","derivedWeight":1,"derivationMethod":"WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank"},{"criterion":"ZERO_PROXY","completeCycleCount":5,"historicalEvidence":"first strict GT preference=1; full-path rank=1","derivedWeight":1,"derivationMethod":"WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank"},{"criterion":"JERK_PROXY","completeCycleCount":1,"historicalEvidence":"first strict GT preference=1; full-path rank=4","derivedWeight":0.25,"derivationMethod":"WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank"},{"criterion":"JERK_PROXY","completeCycleCount":2,"historicalEvidence":"first strict GT preference=1; full-path rank=4","derivedWeight":0.25,"derivationMethod":"WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank"},{"criterion":"JERK_PROXY","completeCycleCount":3,"historicalEvidence":"first strict GT preference=1; full-path rank=4","derivedWeight":0.25,"derivationMethod":"WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank"},{"criterion":"JERK_PROXY","completeCycleCount":4,"historicalEvidence":"first strict GT preference=1; full-path rank=4","derivedWeight":0.25,"derivationMethod":"WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank"},{"criterion":"JERK_PROXY","completeCycleCount":5,"historicalEvidence":"first strict GT preference=1; full-path rank=4","derivedWeight":0.25,"derivationMethod":"WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank"},{"criterion":"AMPLITUDE_PROXY","completeCycleCount":1,"historicalEvidence":"first strict GT preference=3; full-path rank=9","derivedWeight":0.037037037037037035,"derivationMethod":"WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank"},{"criterion":"AMPLITUDE_PROXY","completeCycleCount":2,"historicalEvidence":"first strict GT preference=3; full-path rank=9","derivedWeight":0.07407407407407407,"derivationMethod":"WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank"},{"criterion":"AMPLITUDE_PROXY","completeCycleCount":3,"historicalEvidence":"first strict GT preference=3; full-path rank=9","derivedWeight":0.1111111111111111,"derivationMethod":"WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank"},{"criterion":"AMPLITUDE_PROXY","completeCycleCount":4,"historicalEvidence":"first strict GT preference=3; full-path rank=9","derivedWeight":0.1111111111111111,"derivationMethod":"WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank"},{"criterion":"AMPLITUDE_PROXY","completeCycleCount":5,"historicalEvidence":"first strict GT preference=3; full-path rank=9","derivedWeight":0.1111111111111111,"derivationMethod":"WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank"},{"criterion":"TEMPORAL","completeCycleCount":1,"historicalEvidence":"first strict GT preference=4; full-path rank=1","derivedWeight":0.25,"derivationMethod":"WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank"},{"criterion":"TEMPORAL","completeCycleCount":2,"historicalEvidence":"first strict GT preference=4; full-path rank=1","derivedWeight":0.5,"derivationMethod":"WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank"},{"criterion":"TEMPORAL","completeCycleCount":3,"historicalEvidence":"first strict GT preference=4; full-path rank=1","derivedWeight":0.75,"derivationMethod":"WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank"},{"criterion":"TEMPORAL","completeCycleCount":4,"historicalEvidence":"first strict GT preference=4; full-path rank=1","derivedWeight":1,"derivationMethod":"WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank"},{"criterion":"TEMPORAL","completeCycleCount":5,"historicalEvidence":"first strict GT preference=4; full-path rank=1","derivedWeight":1,"derivationMethod":"WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank"},{"criterion":"SHAPE","completeCycleCount":1,"historicalEvidence":"first strict GT preference=5; full-path rank=1","derivedWeight":0.2,"derivationMethod":"WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank"},{"criterion":"SHAPE","completeCycleCount":2,"historicalEvidence":"first strict GT preference=5; full-path rank=1","derivedWeight":0.4,"derivationMethod":"WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank"},{"criterion":"SHAPE","completeCycleCount":3,"historicalEvidence":"first strict GT preference=5; full-path rank=1","derivedWeight":0.6,"derivationMethod":"WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank"},{"criterion":"SHAPE","completeCycleCount":4,"historicalEvidence":"first strict GT preference=5; full-path rank=1","derivedWeight":0.8,"derivationMethod":"WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank"},{"criterion":"SHAPE","completeCycleCount":5,"historicalEvidence":"first strict GT preference=5; full-path rank=1","derivedWeight":1,"derivationMethod":"WEIGHT_NOT_EMPIRICALLY_IDENTIFIED; neutral linear maturity × reciprocal historical rank"}] |
| Q5 preuves historiques | timeline: ZERO/JERK=1, AMPLITUDE=3, TEMPORAL=4, SHAPE=5; ranks full path 1/4/9/1/1 |
| Q6 éliminations/cycle | [{"cycles":0,"pruned":0},{"cycles":1,"pruned":197},{"cycles":2,"pruned":1877},{"cycles":3,"pruned":3730},{"cycles":4,"pruned":931},{"cycles":5,"pruned":2152}] |
| Q7 facteur réduction D | {"compositionReductionRatio":0.9419754427903945,"uniquePathReductionRatio":0.9999850000749996,"stateReductionRatio":0.9419754427903945,"runtimeRatio":0.1393151468186908} |
| Q8 chemin D 10/11 retrouvé | NON |
| Q9 survit beam | NON |
| Q10 préfixe GT exact généré | OUI |
| Q11 niveau apparition | 1 |
| Q12 survit tous pruning | NON |
| Q13 FULL_GT_11_11_GENERATED_BY_E | NO |
| Q14 première perte | cycles=1, rank=17, score=0.4154717673034189 |
| Q15 GT TEMPORAL rank | NON_GÉNÉRÉE |
| Q16 GT SHAPE rank | NON_GÉNÉRÉE |
| Q17 GT weighted rank | NON_GÉNÉRÉE |
| Q18 garde | NONE |
| Q19 Temporal/Shape plus discriminants | OBSERVATION DANS TABLE DES CONTRIBUTIONS; AUCUNE PREUVE CAUSALE SUPPLÉMENTAIRE |
| Q20 E améliore D | NON |

## 24. Verdict

**PROGRESSIVE_CYCLE_WEIGHTED_COMPOSITION_PRUNES_GT_BRANCH**

## 25. Conséquence architecturale

Observation uniquement: E évalue la réduction et la survie des branches sans modifier les stratégies antérieures ni proposer de tuning post-hoc.

## Reproduction

```powershell
$env:GROUND_TRUTH_VALIDATION_MODE='PROGRESSIVE_GLOBAL_CYCLE_WEIGHTED_COMPOSITION'; npx tsx ../ground-truth/groundTruthValidationRunner.ts
```
