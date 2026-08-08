# End-to-End Decision Root Cause Audit

## 1. Protocole exact

Rejeu réel de `DELAYED_CONTEXT_PROMISING_ALTERNATIVES` avec la décision Système B inchangée. Les diagnostics sont calculés après chaque décision sur les segments effectivement reconstruits. La déduplication par signature du chemin résultant est parallèle et ne modifie jamais le gagnant officiel.

## 2. Population analysée

Segments GT reconstruits mesurés: 5. Décisions/instances GT éligibles non choisies analysées: 5.

## 3. Résumé des décisions GT

| decisionId | cycle | populationBeforeDedup | populationAfterDedup | gtRank | actualWinner | criteriaFavoringGt | criteriaFavoringWinner | totalGt | totalWinner | margin | feasibility | rootCause | duplicateRank |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D1_C1 | 1 | 7 | 3 | 2/3 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | ZERO_PROXY | aucun | 0.5402800724899381 | 0.125 | 0.41528007248993815 | NO_POSITIVE_WEIGHT_SOLUTION | CRITERION_NON_DISCRIMINATIVE | 4/7 |
| D2_C2 | 2 | 37 | 9 | 8/9 | BOTTOM:169\|TOP:195\|BOTTOM:228\|TOP:291\|BOTTOM:299\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | ZERO_PROXY | aucun | 0.24287837136507656 | 0.125 | 0.11787837136507656 | NO_POSITIVE_WEIGHT_SOLUTION | CRITERION_NON_DISCRIMINATIVE | 31/37 |
| D3_C3 | 3 | 69 | 18 | 17/18 | BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:265\|BOTTOM:321\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | AMPLITUDE_PROXY | ZERO_PROXY,JERK_PROXY | 0.14304929628318028 | 2.1451248703227863 | -2.002075574039606 | NO_POSITIVE_WEIGHT_SOLUTION | MULTIPLE_CRITERIA_FAVOR_FALSE_SEGMENT | 63/69 |
| D4_C4 | 4 | 84 | 11 | 8/11 | BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:265\|BOTTOM:321\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | AMPLITUDE_PROXY,TEMPORAL | ZERO_PROXY | 1.2647704854067268 | 1.1100543981365572 | 0.1547160872701696 | NO_POSITIVE_WEIGHT_SOLUTION | MULTIPLE_CRITERIA_FAVOR_FALSE_SEGMENT | 50/84 |
| D5_C5 | 5 | 91 | 11 | 8/11 | BOTTOM:169\|TOP:179\|BOTTOM:228\|TOP:265\|BOTTOM:321\|TOP:333\|BOTTOM:391\|TOP:467\|BOTTOM:500\|TOP:509\|BOTTOM:564 | AMPLITUDE_PROXY,TEMPORAL | ZERO_PROXY | 2.865938744331606 | 2.693730514845782 | 0.17220822948582404 | NO_POSITIVE_WEIGHT_SOLUTION | MULTIPLE_CRITERIA_FAVOR_FALSE_SEGMENT | 57/91 |

## 4–10. Autopsies par décision

## D1_C1

Active path / actual outcome: BOTTOM:169|TOP:195|BOTTOM:228|TOP:291|BOTTOM:299|TOP:333|BOTTOM:391|TOP:467|BOTTOM:500|TOP:509|BOTTOM:564

Segment GT: BOTTOM:169|TOP:199|BOTTOM:228|TOP:291|BOTTOM:299|TOP:333|BOTTOM:391|TOP:467|BOTTOM:500|TOP:509|BOTTOM:564

Segments avant/après déduplication: 7/3. Rang GT avant/après: 4/2.

### GT vs actual winner

| criterion | gtRaw | winnerRaw | orientation | gtNormalized | winnerNormalized | weight | gtContribution | winnerContribution | delta | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ZERO_PROXY | 2728 | 2804 | LOWER | 0.24152542372881367 | 0 | 1 | 0.24152542372881367 | 0 | 0.24152542372881367 | GT_WINS |
| JERK_PROXY | 2714.4137551040935 | 2714.4137551040935 | LOWER | 0.5 | 0.5 | 0.25 | 0.125 | 0.125 | 0 | TIE |
| AMPLITUDE_PROXY |  |  |  |  |  |  |  |  |  | NOT_ACTIVE |
| TEMPORAL |  |  |  |  |  |  |  |  |  | NOT_ACTIVE |
| SHAPE |  |  |  |  |  |  |  |  |  | NOT_ACTIVE |

Score total GT=0.5402800724899381; actualWinner=0.125; marge=0.41528007248993815.

### Pouvoir discriminant

| criterion | gtRank | population | percentile | ties | strictlyBetter | bestValue | gtValue | gtVsBest | gtVsWinner | normalizedMin | normalizedMax | normalizedMedian | rawStats | orderPreserved | normalizationEffect |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ZERO_PROXY | 2 | 3 | 50 | 1 | 1 | 1 | 0.24152542372881367 | -0.7584745762711863 | 0.24152542372881367 | 0 | 1 | 0.24152542372881367 | [{"component":0,"min":2489.3333333333335,"max":2804,"median":2728,"gt":2728,"winner":2804}] | YES_COMPONENTWISE_MIN_MAX | NEUTRAL_ORDER_PRESERVING |
| JERK_PROXY | 1 | 3 | 100 | 3 | 0 | 0.5 | 0.5 | 0 | 0 | 0.5 | 0.5 | 0.5 | [{"component":0,"min":2714.4137551040935,"max":2714.4137551040935,"median":2714.4137551040935,"gt":2714.4137551040935,"winner":2714.4137551040935}] | YES_COMPONENTWISE_MIN_MAX | AMPLIFIES_SMALL_RAW_RANGE |

### Synergies

| synergy | gtContribution | winnerContribution | delta | gtRankWith | gtRankWithout | rankChange |
| --- | --- | --- | --- | --- | --- | --- |
| ZERO_PROXY+JERK_PROXY | 0.1737546487611244 | 0 | 0.1737546487611244 | 2 | 2 | 0 |

Diagnostic: SYNERGY_ADDS_NO_INFORMATION.

### Contre-factuels

| counterfactual | gtRank | rankChange | gtBecomesWinner |
| --- | --- | --- | --- |
| WITHOUT_ZERO | 1 | 1 | true |
| WITHOUT_JERK | 2 | 0 | false |

### Frontière univariée des poids

| criterion | currentWeight | boundary | condition | feasibleNonNegative |
| --- | --- | --- | --- | --- |
| ZERO_PROXY | 1 | -0.71940521241448 | weight > -0.71940521241448 | true |
| JERK_PROXY |  |  |  |  |

### Faisabilité non négative

**NO_POSITIVE_WEIGHT_SOLUTION**

Impossibilité démontrée par le chemin dominant BOTTOM:169|TOP:179|BOTTOM:228|TOP:291|BOTTOM:299|TOP:333|BOTTOM:391|TOP:467|BOTTOM:500|TOP:509|BOTTOM:564, au moins aussi bon sur chaque critère actif et strictement meilleur sur au moins un.

### Root cause

**CRITERION_NON_DISCRIMINATIVE**

## D2_C2

Active path / actual outcome: BOTTOM:169|TOP:195|BOTTOM:228|TOP:291|BOTTOM:299|TOP:333|BOTTOM:391|TOP:467|BOTTOM:500|TOP:509|BOTTOM:564

Segment GT: BOTTOM:169|TOP:199|BOTTOM:228|TOP:291|BOTTOM:299|TOP:333|BOTTOM:391|TOP:467|BOTTOM:500|TOP:509|BOTTOM:564

Segments avant/après déduplication: 37/9. Rang GT avant/après: 31/8.

### GT vs actual winner

| criterion | gtRaw | winnerRaw | orientation | gtNormalized | winnerNormalized | weight | gtContribution | winnerContribution | delta | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ZERO_PROXY | 4109.6 | 4155.2 | LOWER | 0.04384615384615332 | 0 | 1 | 0.04384615384615332 | 0 | 0.04384615384615332 | GT_WINS |
| JERK_PROXY | 2722.464630650108 | 2722.464630650108 | LOWER | 0.5 | 0.5 | 0.25 | 0.125 | 0.125 | 0 | TIE |
| AMPLITUDE_PROXY |  |  |  |  |  |  |  |  |  | NOT_ACTIVE |
| TEMPORAL |  |  |  |  |  |  |  |  |  | NOT_ACTIVE |
| SHAPE |  |  |  |  |  |  |  |  |  | NOT_ACTIVE |

Score total GT=0.24287837136507656; actualWinner=0.125; marge=0.11787837136507656.

### Pouvoir discriminant

| criterion | gtRank | population | percentile | ties | strictlyBetter | bestValue | gtValue | gtVsBest | gtVsWinner | normalizedMin | normalizedMax | normalizedMedian | rawStats | orderPreserved | normalizationEffect |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ZERO_PROXY | 8 | 9 | 12.5 | 1 | 7 | 1 | 0.04384615384615332 | -0.9561538461538467 | 0.04384615384615332 | 0 | 1 | 0.3230769230769231 | [{"component":0,"min":3115.2,"max":4155.2,"median":3819.2,"gt":4109.6,"winner":4155.2}] | YES_COMPONENTWISE_MIN_MAX | NEUTRAL_ORDER_PRESERVING |
| JERK_PROXY | 1 | 9 | 100 | 9 | 0 | 0.5 | 0.5 | 0 | 0 | 0.5 | 0.5 | 0.5 | [{"component":0,"min":2722.464630650108,"max":2722.464630650108,"median":2722.464630650108,"gt":2722.464630650108,"winner":2722.464630650108}] | YES_COMPONENTWISE_MIN_MAX | AMPLIFIES_SMALL_RAW_RANGE |

### Synergies

| synergy | gtContribution | winnerContribution | delta | gtRankWith | gtRankWithout | rankChange |
| --- | --- | --- | --- | --- | --- | --- |
| ZERO_PROXY+JERK_PROXY | 0.07403221751892324 | 0 | 0.07403221751892324 | 8 | 8 | 0 |

Diagnostic: SYNERGY_ADDS_NO_INFORMATION.

### Contre-factuels

| counterfactual | gtRank | rankChange | gtBecomesWinner |
| --- | --- | --- | --- |
| WITHOUT_ZERO | 1 | 7 | true |
| WITHOUT_JERK | 8 | 0 | false |

### Frontière univariée des poids

| criterion | currentWeight | boundary | condition | feasibleNonNegative |
| --- | --- | --- | --- | --- |
| ZERO_PROXY | 1 | -1.6884540837649364 | weight > -1.6884540837649364 | true |
| JERK_PROXY |  |  |  |  |

### Faisabilité non négative

**NO_POSITIVE_WEIGHT_SOLUTION**

Impossibilité démontrée par le chemin dominant BOTTOM:169|TOP:179|BOTTOM:228|TOP:291|BOTTOM:299|TOP:333|BOTTOM:391|TOP:467|BOTTOM:500|TOP:509|BOTTOM:564, au moins aussi bon sur chaque critère actif et strictement meilleur sur au moins un.

### Root cause

**CRITERION_NON_DISCRIMINATIVE**

## D3_C3

Active path / actual outcome: BOTTOM:169|TOP:179|BOTTOM:228|TOP:265|BOTTOM:321|TOP:333|BOTTOM:391|TOP:467|BOTTOM:500|TOP:509|BOTTOM:564

Segment GT: BOTTOM:169|TOP:199|BOTTOM:228|TOP:291|BOTTOM:299|TOP:333|BOTTOM:391|TOP:467|BOTTOM:500|TOP:509|BOTTOM:564

Segments avant/après déduplication: 69/18. Rang GT avant/après: 63/17.

### GT vs actual winner

| criterion | gtRaw | winnerRaw | orientation | gtNormalized | winnerNormalized | weight | gtContribution | winnerContribution | delta | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ZERO_PROXY | 4664 | 3782.8571428571427 | LOWER | 0.03564727954971843 | 1 | 1 | 0.03564727954971843 | 1 | -0.9643527204502815 | WINNER_WINS |
| JERK_PROXY | 2778.8001660219784 | 2774.634756989722 | LOWER | 0 | 1 | 0.25 | 0 | 0.25 | -1 | WINNER_WINS |
| AMPLITUDE_PROXY | [0.36097124575442885,638,1653.3333333333333] | [0.4510197148693482,528,1653.3333333333333] | LOWER,LOWER,LOWER | 0.5475069489221926 | 0.4702520745263817 | 0.1111111111111111 | 0.06083410543579918 | 0.052250230502931296 | 0.07725487439581097 | GT_WINS |
| TEMPORAL |  |  |  |  |  |  |  |  |  | NOT_ACTIVE |
| SHAPE |  |  |  |  |  |  |  |  |  | NOT_ACTIVE |

Score total GT=0.14304929628318028; actualWinner=2.1451248703227863; marge=-2.002075574039606.

### Pouvoir discriminant

| criterion | gtRank | population | percentile | ties | strictlyBetter | bestValue | gtValue | gtVsBest | gtVsWinner | normalizedMin | normalizedMax | normalizedMedian | rawStats | orderPreserved | normalizationEffect |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ZERO_PROXY | 17 | 18 | 5.882352941176471 | 1 | 16 | 1 | 0.03564727954971843 | -0.9643527204502815 | -0.9643527204502815 | 0 | 1 | 0.3943089430894303 | [{"component":0,"min":3782.8571428571427,"max":4696.571428571428,"median":4336.285714285715,"gt":4664,"winner":3782.8571428571427}] | YES_COMPONENTWISE_MIN_MAX | NEUTRAL_ORDER_PRESERVING |
| JERK_PROXY | 10 | 18 | 47.05882352941177 | 9 | 9 | 1 | 0 | -1 | -1 | 0 | 1 | 0.5 | [{"component":0,"min":2774.634756989722,"max":2778.8001660219784,"median":2776.71746150585,"gt":2778.8001660219784,"winner":2774.634756989722}] | YES_COMPONENTWISE_MIN_MAX | NEUTRAL_ORDER_PRESERVING |
| AMPLITUDE_PROXY | 7 | 18 | 64.70588235294117 | 1 | 6 | 0.7949741662752466 | 0.5475069489221926 | -0.247467217353054 | 0.07725487439581097 | 0.22610523170997354 | 0.7949741662752466 | 0.4946362920741719 | [{"component":0,"min":0.10145043449647666,"max":0.4510197148693482,"median":0.35570588166004374,"gt":0.36097124575442885,"winner":0.4510197148693482},{"component":1,"min":148,"max":4406,"median":1103,"gt":638,"winner":528},{"component":2,"min":1653.3333333333333,"max":1653.3333333333333,"median":1653.3333333333333,"gt":1653.3333333333333,"winner":1653.3333333333333}] | YES_COMPONENTWISE_MIN_MAX | AMPLIFIES_SMALL_RAW_RANGE |

### Synergies

| synergy | gtContribution | winnerContribution | delta | gtRankWith | gtRankWithout | rankChange |
| --- | --- | --- | --- | --- | --- | --- |
| ZERO_PROXY+JERK_PROXY | 0 | 0.5 | -0.5 | 17 | 17 | 0 |
| ZERO_PROXY+AMPLITUDE_PROXY | 0.04656791129766267 | 0.22858309321323678 | -0.18201518191557411 | 17 | 17 | 0 |
| JERK_PROXY+AMPLITUDE_PROXY | 0 | 0.11429154660661839 | -0.11429154660661839 | 17 | 17 | 0 |

Diagnostic: SYNERGY_ADDS_NO_INFORMATION.

### Contre-factuels

| counterfactual | gtRank | rankChange | gtBecomesWinner |
| --- | --- | --- | --- |
| WITHOUT_ZERO | 12 | 5 | false |
| WITHOUT_JERK | 17 | 0 | false |
| WITHOUT_AMPLITUDE | 17 | 0 | false |

### Frontière univariée des poids

| criterion | currentWeight | boundary | condition | feasibleNonNegative |
| --- | --- | --- | --- | --- |
| ZERO_PROXY | 1 | -1.0760822586830934 | weight < -1.0760822586830934 | false |
| JERK_PROXY | 0.25 | -1.7520755740396061 | weight < -1.7520755740396061 | false |
| AMPLITUDE_PROXY | 0.1111111111111111 | 26.026311798411246 | weight > 26.026311798411246 | true |

### Faisabilité non négative

**NO_POSITIVE_WEIGHT_SOLUTION**

Impossibilité démontrée par le chemin dominant BOTTOM:169|TOP:195|BOTTOM:228|TOP:236|BOTTOM:299|TOP:333|BOTTOM:391|TOP:467|BOTTOM:500|TOP:509|BOTTOM:564, au moins aussi bon sur chaque critère actif et strictement meilleur sur au moins un.

### Root cause

**MULTIPLE_CRITERIA_FAVOR_FALSE_SEGMENT**

## D4_C4

Active path / actual outcome: BOTTOM:169|TOP:179|BOTTOM:228|TOP:265|BOTTOM:321|TOP:333|BOTTOM:391|TOP:467|BOTTOM:500|TOP:509|BOTTOM:564

Segment GT: BOTTOM:169|TOP:199|BOTTOM:228|TOP:265|BOTTOM:321|TOP:333|BOTTOM:391|TOP:467|BOTTOM:500|TOP:509|BOTTOM:564

Segments avant/après déduplication: 84/11. Rang GT avant/après: 50/8.

### GT vs actual winner

| criterion | gtRaw | winnerRaw | orientation | gtNormalized | winnerNormalized | weight | gtContribution | winnerContribution | delta | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ZERO_PROXY | 3876.8888888888887 | 3797.3333333333335 | LOWER | 0.18758362322718766 | 0.23548300776023537 | 1 | 0.18758362322718766 | 0.23548300776023537 | -0.047899384533047706 | WINNER_WINS |
| JERK_PROXY | 2698.2399920838798 | 2698.2399920838798 | LOWER | 0 | 0 | 0.25 | 0 | 0 | 0 | TIE |
| AMPLITUDE_PROXY | [0.45946164065851813,3543,1970] | [0.4741031351943521,3733,1970] | LOWER,LOWER,LOWER | 0.05345912519242948 | 0 | 0.1111111111111111 | 0.005939902799158831 | 0 | 0.05345912519242948 | GT_WINS |
| TEMPORAL | -0.3786998556647731 | -0.40820204338718863 | HIGHER | 0.6322133534875384 | 0.523474155197028 | 1 | 0.6322133534875384 | 0.523474155197028 | 0.10873919829051037 | GT_WINS |
| SHAPE |  |  |  |  |  |  |  |  |  | NOT_ACTIVE |

Score total GT=1.2647704854067268; actualWinner=1.1100543981365572; marge=0.1547160872701696.

### Pouvoir discriminant

| criterion | gtRank | population | percentile | ties | strictlyBetter | bestValue | gtValue | gtVsBest | gtVsWinner | normalizedMin | normalizedMax | normalizedMedian | rawStats | orderPreserved | normalizationEffect |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ZERO_PROXY | 8 | 11 | 30 | 1 | 7 | 1 | 0.18758362322718766 | -0.8124163767728123 | -0.047899384533047706 | 0 | 1 | 0.37115333154937113 | [{"component":0,"min":2527.5555555555557,"max":4188.444444444444,"median":3572,"gt":3876.8888888888887,"winner":3797.3333333333335}] | YES_COMPONENTWISE_MIN_MAX | NEUTRAL_ORDER_PRESERVING |
| JERK_PROXY | 7 | 11 | 40 | 5 | 6 | 1 | 0 | -1 | 0 | 0 | 1 | 0.16145896617416278 | [{"component":0,"min":2642.458324942418,"max":2698.2399920838798,"median":2689.233541775748,"gt":2698.2399920838798,"winner":2698.2399920838798}] | YES_COMPONENTWISE_MIN_MAX | NEUTRAL_ORDER_PRESERVING |
| AMPLITUDE_PROXY | 10 | 11 | 10 | 1 | 9 | 1 | 0.05345912519242948 | -0.9465408748075705 | 0.05345912519242948 | 0 | 1 | 0.6073928840132546 | [{"component":0,"min":0.2947548565888521,"max":0.4741031351943521,"median":0.382817329269002,"gt":0.45946164065851813,"winner":0.4741031351943521},{"component":1,"min":1320,"max":3733,"median":2617,"gt":3543,"winner":3733},{"component":2,"min":510,"max":1970,"median":510,"gt":1970,"winner":1970}] | YES_COMPONENTWISE_MIN_MAX | NEUTRAL_ORDER_PRESERVING |
| TEMPORAL | 4 | 11 | 70 | 1 | 3 | 1 | 0.6322133534875384 | -0.3677866465124616 | 0.10873919829051037 | 0 | 1 | 0.6062586046427362 | [{"component":0,"min":-0.5502265666248533,"max":-0.2789151335241901,"median":-0.38574167576962415,"gt":-0.3786998556647731,"winner":-0.40820204338718863}] | YES_COMPONENTWISE_MIN_MAX | NEUTRAL_ORDER_PRESERVING |

### Synergies

| synergy | gtContribution | winnerContribution | delta | gtRankWith | gtRankWithout | rankChange |
| --- | --- | --- | --- | --- | --- | --- |
| ZERO_PROXY+JERK_PROXY | 0 | 0 | 0 | 8 | 8 | 0 |
| ZERO_PROXY+AMPLITUDE_PROXY | 0.03338006124445441 | 0 | 0.03338006124445441 | 8 | 8 | 0 |
| ZERO_PROXY+TEMPORAL | 0.34437315734505675 | 0.35109723517929387 | -0.006724077834237119 | 8 | 8 | 0 |
| JERK_PROXY+AMPLITUDE_PROXY | 0 | 0 | 0 | 8 | 8 | 0 |
| JERK_PROXY+TEMPORAL | 0 | 0 | 0 | 8 | 8 | 0 |
| AMPLITUDE_PROXY+TEMPORAL | 0.06128038730333075 | 0 | 0.06128038730333075 | 8 | 8 | 0 |

Diagnostic: SYNERGY_ADDS_NO_INFORMATION.

### Contre-factuels

| counterfactual | gtRank | rankChange | gtBecomesWinner |
| --- | --- | --- | --- |
| WITHOUT_ZERO | 7 | 1 | false |
| WITHOUT_JERK | 7 | 1 | false |
| WITHOUT_AMPLITUDE | 8 | 0 | false |
| WITHOUT_TEMPORAL | 9 | -1 | false |

### Frontière univariée des poids

| criterion | currentWeight | boundary | condition | feasibleNonNegative |
| --- | --- | --- | --- | --- |
| ZERO_PROXY | 1 | 4.230022447645956 | weight < 4.230022447645956 | true |
| JERK_PROXY |  |  |  |  |
| AMPLITUDE_PROXY | 0.1111111111111111 | -2.7829895071324415 | weight > -2.7829895071324415 | true |
| TEMPORAL | 1 | -0.4228179874641546 | weight > -0.4228179874641546 | true |

### Faisabilité non négative

**NO_POSITIVE_WEIGHT_SOLUTION**

Impossibilité démontrée par le chemin dominant BOTTOM:169|TOP:179|BOTTOM:228|TOP:265|BOTTOM:321|TOP:333|BOTTOM:391|TOP:436|BOTTOM:500|TOP:509|BOTTOM:564, au moins aussi bon sur chaque critère actif et strictement meilleur sur au moins un.

### Root cause

**MULTIPLE_CRITERIA_FAVOR_FALSE_SEGMENT**

## D5_C5

Active path / actual outcome: BOTTOM:169|TOP:179|BOTTOM:228|TOP:265|BOTTOM:321|TOP:333|BOTTOM:391|TOP:467|BOTTOM:500|TOP:509|BOTTOM:564

Segment GT: BOTTOM:169|TOP:199|BOTTOM:228|TOP:265|BOTTOM:321|TOP:333|BOTTOM:391|TOP:467|BOTTOM:500|TOP:509|BOTTOM:564

Segments avant/après déduplication: 91/11. Rang GT avant/après: 57/8.

### GT vs actual winner

| criterion | gtRaw | winnerRaw | orientation | gtNormalized | winnerNormalized | weight | gtContribution | winnerContribution | delta | status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ZERO_PROXY | 4177.090909090909 | 4112 | LOWER | 0.18758362322718763 | 0.23548300776023548 | 1 | 0.18758362322718763 | 0.23548300776023548 | -0.047899384533047845 | WINNER_WINS |
| JERK_PROXY | 2683.8337856067783 | 2683.8337856067783 | LOWER | 0 | 0 | 0.25 | 0 | 0 | 0 | TIE |
| AMPLITUDE_PROXY | [0.40664721146602634,4802,1752] | [0.41894770604205295,4802,1752] | LOWER,LOWER,LOWER | 0.03306904637300833 | 0 | 0.1111111111111111 | 0.003674338485889814 | 0 | 0.03306904637300833 | GT_WINS |
| TEMPORAL | -0.4147384665247162 | -0.43895055931141375 | HIGHER | 0.5804300543609333 | 0.48696011164899805 | 1 | 0.5804300543609333 | 0.48696011164899805 | 0.09346994271193526 | GT_WINS |
| SHAPE | [0.4749355427637565,0.35286071230703675,0.08759387859431611] | [0.4749355427637565,0.35286071230703675,0.08759387859431611] | HIGHER,HIGHER,LOWER | 0.6666666666666666 | 0.6666666666666666 | 1 | 0.6666666666666666 | 0.6666666666666666 | 0 | TIE |

Score total GT=2.865938744331606; actualWinner=2.693730514845782; marge=0.17220822948582404.

### Pouvoir discriminant

| criterion | gtRank | population | percentile | ties | strictlyBetter | bestValue | gtValue | gtVsBest | gtVsWinner | normalizedMin | normalizedMax | normalizedMedian | rawStats | orderPreserved | normalizationEffect |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ZERO_PROXY | 8 | 11 | 30 | 1 | 7 | 1 | 0.18758362322718763 | -0.8124163767728123 | -0.047899384533047845 | 0 | 1 | 0.37115333154937125 | [{"component":0,"min":3073.090909090909,"max":4432,"median":3927.6363636363635,"gt":4177.090909090909,"winner":4112}] | YES_COMPONENTWISE_MIN_MAX | NEUTRAL_ORDER_PRESERVING |
| JERK_PROXY | 7 | 11 | 40 | 5 | 6 | 1 | 0 | -1 | 0 | 0 | 1 | 0.16145896617416278 | [{"component":0,"min":2639.208451893609,"max":2683.8337856067783,"median":2676.628625360273,"gt":2683.8337856067783,"winner":2683.8337856067783}] | YES_COMPONENTWISE_MIN_MAX | NEUTRAL_ORDER_PRESERVING |
| AMPLITUDE_PROXY | 10 | 11 | 10 | 1 | 9 | 0.9931188461190968 | 0.03306904637300833 | -0.9600497997460885 | 0.03306904637300833 | 0 | 0.9931188461190968 | 0.7058990705909207 | [{"component":0,"min":0.2949597079477934,"max":0.41894770604205295,"median":0.3426391137712847,"gt":0.40664721146602634,"winner":0.41894770604205295},{"component":1,"min":2160,"max":4802,"median":2580,"gt":4802,"winner":4802},{"component":2,"min":584,"max":1752,"median":584,"gt":1752,"winner":1752}] | YES_COMPONENTWISE_MIN_MAX | NEUTRAL_ORDER_PRESERVING |
| TEMPORAL | 6 | 11 | 50 | 1 | 5 | 1 | 0.5804300543609333 | -0.4195699456390667 | 0.09346994271193526 | 0 | 1 | 0.5804300543609333 | [{"component":0,"min":-0.5650908249902182,"max":-0.3060546890495261,"median":-0.4147384665247162,"gt":-0.4147384665247162,"winner":-0.43895055931141375}] | YES_COMPONENTWISE_MIN_MAX | NEUTRAL_ORDER_PRESERVING |
| SHAPE | 1 | 11 | 100 | 5 | 0 | 0.6666666666666666 | 0.6666666666666666 | 0 | 0 | 0.2591314466147397 | 0.6666666666666666 | 0.5398363516238324 | [{"component":0,"min":0.4749355427637565,"max":0.5475781420234901,"median":0.510404430459029,"gt":0.4749355427637565,"winner":0.4749355427637565},{"component":1,"min":0.2869776382142892,"max":0.35286071230703675,"median":0.327792799177516,"gt":0.35286071230703675,"winner":0.35286071230703675},{"component":2,"min":0.08759387859431611,"max":0.15484761749111947,"median":0.13540263369696787,"gt":0.08759387859431611,"winner":0.08759387859431611}] | YES_COMPONENTWISE_MIN_MAX | NEUTRAL_ORDER_PRESERVING |

### Synergies

| synergy | gtContribution | winnerContribution | delta | gtRankWith | gtRankWithout | rankChange |
| --- | --- | --- | --- | --- | --- | --- |
| ZERO_PROXY+JERK_PROXY | 0 | 0 | 0 | 8 | 8 | 0 |
| ZERO_PROXY+AMPLITUDE_PROXY | 0.026253489789860508 | 0 | 0.026253489789860508 | 8 | 8 | 0 |
| ZERO_PROXY+TEMPORAL | 0.32996844186524465 | 0.33863081925655575 | -0.008662377391311094 | 8 | 8 | 0 |
| ZERO_PROXY+SHAPE | 0.35363222253935667 | 0.3962179600171564 | -0.04258573747779976 | 8 | 8 | 0 |
| JERK_PROXY+AMPLITUDE_PROXY | 0 | 0 | 0 | 8 | 8 | 0 |
| JERK_PROXY+TEMPORAL | 0 | 0 | 0 | 8 | 8 | 0 |
| JERK_PROXY+SHAPE | 0 | 0 | 0 | 8 | 8 | 0 |
| AMPLITUDE_PROXY+TEMPORAL | 0.04618112695794131 | 0 | 0.04618112695794131 | 8 | 8 | 0 |
| AMPLITUDE_PROXY+SHAPE | 0.04949301961482254 | 0 | 0.04949301961482254 | 8 | 8 | 0 |
| TEMPORAL+SHAPE | 0.6220557608237026 | 0.5697719494961694 | 0.052283811327533236 | 8 | 8 | 0 |

Diagnostic: SYNERGY_ADDS_NO_INFORMATION.

### Contre-factuels

| counterfactual | gtRank | rankChange | gtBecomesWinner |
| --- | --- | --- | --- |
| WITHOUT_ZERO | 7 | 1 | false |
| WITHOUT_JERK | 7 | 1 | false |
| WITHOUT_AMPLITUDE | 8 | 0 | false |
| WITHOUT_TEMPORAL | 9 | -1 | false |
| WITHOUT_SHAPE | 8 | 0 | false |

### Frontière univariée des poids

| criterion | currentWeight | boundary | condition | feasibleNonNegative |
| --- | --- | --- | --- | --- |
| ZERO_PROXY | 1 | 4.595207561947068 | weight < 4.595207561947068 | true |
| JERK_PROXY |  |  |  |  |
| AMPLITUDE_PROXY | 0.1111111111111111 | -5.096424284478164 | weight > -5.096424284478164 | true |
| TEMPORAL | 1 | -0.8423915163460843 | weight > -0.8423915163460843 | true |
| SHAPE |  |  |  |  |

### Faisabilité non négative

**NO_POSITIVE_WEIGHT_SOLUTION**

Impossibilité démontrée par le chemin dominant BOTTOM:169|TOP:179|BOTTOM:228|TOP:265|BOTTOM:321|TOP:333|BOTTOM:391|TOP:436|BOTTOM:500|TOP:509|BOTTOM:564, au moins aussi bon sur chaque critère actif et strictement meilleur sur au moins un.

### Root cause

**MULTIPLE_CRITERIA_FAVOR_FALSE_SEGMENT**

## 11. Évolution avec le contexte

| decisionId | cycle | gtRank | gtMargin | gtCriteria | falseCriteria | rootCause |
| --- | --- | --- | --- | --- | --- | --- |
| D1_C1 | 1 | 2/3 | 0.41528007248993815 | ZERO_PROXY | aucun | CRITERION_NON_DISCRIMINATIVE |
| D2_C2 | 2 | 8/9 | 0.11787837136507656 | ZERO_PROXY | aucun | CRITERION_NON_DISCRIMINATIVE |
| D3_C3 | 3 | 17/18 | -2.002075574039606 | AMPLITUDE_PROXY | ZERO_PROXY,JERK_PROXY | MULTIPLE_CRITERIA_FAVOR_FALSE_SEGMENT |
| D4_C4 | 4 | 8/11 | 0.1547160872701696 | AMPLITUDE_PROXY,TEMPORAL | ZERO_PROXY | MULTIPLE_CRITERIA_FAVOR_FALSE_SEGMENT |
| D5_C5 | 5 | 8/11 | 0.17220822948582404 | AMPLITUDE_PROXY,TEMPORAL | ZERO_PROXY | MULTIPLE_CRITERIA_FAVOR_FALSE_SEGMENT |

Les cas observés sont classés par les causes mesurées ci-dessus: conflit mixte lorsque des critères favorisent chaque côté, non-discrimination lorsque les égalités dominent, ou limite de représentation lorsque la GT reste dominée au contexte maximal.

## 12. Comparaison controlled vs end-to-end

| criterion | controlledExpectation | endToEndGtWins | endToEndWinnerWins |
| --- | --- | --- | --- |
| ZERO_PROXY | GT dès cycle 1 | 2 | 3 |
| JERK_PROXY | GT dès cycle 1 | 0 | 1 |
| AMPLITUDE_PROXY | GT dès cycle 3 | 3 | 0 |
| TEMPORAL | GT dès cycle 4 | 2 | 0 |
| SHAPE | GT dès cycle 5 | 0 | 0 |

## 13. Synthèse globale

Décisions récupérables par pondération: 0; impossibles: 5. Temporal généralise systématiquement dans ses décisions disponibles: true. Shape généralise systématiquement: false. Les écarts contrôlés B260/B262 ne suffisent donc pas à prédire le classement face à toute la population end-to-end; les tableaux détaillent les concurrents et conflits réellement rencontrés.

## Réponses obligatoires

1. Information suffisante via poids non négatifs: 0/5 décisions. 2. Généralisation contrôlée: ZERO/JERK/AMPLITUDE/TEMPORAL/SHAPE sont comptés explicitement dans le tableau controlled vs end-to-end. 3. Temporal=true, Shape=false. 4. Chaque victoire est décomposée dans les tableaux GT vs winner. 5. Cause principale selon mesures: CRITERIA_DISCRIMINATION_IS_PRIMARY_PROBLEM. 6. Solutions non négatives: 0 oui, 5 non. 7–8. Une meilleure décision reste mathématiquement viable uniquement sur les cas avec témoin; les cas dominés sont impossibles avec ces features. 9. Le contexte tardif n’aide que si les rangs/marges progressent dans la chronologie; aucune hypothèse MHT n’est exécutée. 10. Direction justifiée: nouvelles features / représentation pour les cas dominés; décision/poids seulement pour les cas faisables.

## 14. Verdict final

**CRITERIA_DISCRIMINATION_IS_PRIMARY_PROBLEM**

## 15. Recommandation

Étudier diagnostiquement la représentation des segments dominés avant toute stratégie de pondération ou multi-hypothèses. Ne rien modifier ici.

## Validation

Audit réellement exécuté, sans simulation ni adaptation après observation. Aucun changement à l’architecture, aux critères, à la promotion, à la reconstruction, au backtracking, aux contraintes, au pipeline, à DP V1, DP V2 ou `current_filters`; aucun MHT, NMS ou ML. Le pool RAW n’est pas utilisé directement pour reconstruire les segments.

```powershell
$env:GROUND_TRUTH_VALIDATION_MODE='END_TO_END_DECISION_ROOT_CAUSE_AUDIT'; npx tsx ../ground-truth/groundTruthValidationRunner.ts
```
