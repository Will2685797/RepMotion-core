# Rowing 5 reps 007 — DP V2 path ranking analysis

## Contexte et population

- 46 candidats DP réels, 55 après injection sans doublon.
- 1207 états créés, 14 états terminaux.
- 14 chemins terminaux plus GROUND_TRUTH_REFERENCE externe.

## Définitions et normalisation

| name | direction | family | definition |
| --- | --- | --- | --- |
| meanNormalizedProminence | HIGHER | LOCAL | mean(localProminence / robustSignalRange) |
| medianNormalizedProminence | HIGHER | LOCAL | median(localProminence / robustSignalRange) |
| meanProminenceToNoiseRatio | HIGHER | LOCAL | mean(localProminence / localNoiseEstimate) |
| fullRepDurationCV | LOWER | TEMPORAL | populationStd(B-B duration) / mean(B-B duration) |
| fullRepDurationMAD | LOWER | TEMPORAL | MAD(B-B duration) |
| bottomToTopDurationCV | LOWER | TEMPORAL | populationStd(B-T duration) / mean(B-T duration) |
| topToBottomDurationCV | LOWER | TEMPORAL | populationStd(T-B duration) / mean(T-B duration) |
| fullRepDurationRange | LOWER | TEMPORAL | max(B-B duration) - min(B-B duration) |
| bottomToTopDurationRange | LOWER | TEMPORAL | max(B-T duration) - min(B-T duration) |
| topToBottomDurationRange | LOWER | TEMPORAL | max(T-B duration) - min(T-B duration) |
| cycleAmplitudeCV | LOWER | AMPLITUDE | populationStd(mean cycle amplitude) / mean(mean cycle amplitude) |
| cycleAmplitudeMAD | LOWER | AMPLITUDE | MAD(mean cycle amplitude) |
| meanBottomDrift | LOWER | AMPLITUDE | mean(abs(endBottomValue-startBottomValue)) |
| maxBottomDrift | LOWER | AMPLITUDE | max(abs(endBottomValue-startBottomValue)) |
| coverageRatio | HIGHER | COVERAGE | selectedSpan / real admissible candidate span |
| unselectedPrefixSamples | LOWER | COVERAGE | firstSelectedIndex-activeRegionStart |
| unselectedSuffixSamples | LOWER | COVERAGE | activeRegionEnd-lastSelectedIndex |
| selectedSpanSamples | HIGHER | COVERAGE | lastSelectedIndex-firstSelectedIndex |
| meanCycleCorrelation | HIGHER | SHAPE | mean Pearson correlation to pointwise median 100-point cycle |
| medianCycleCorrelation | HIGHER | SHAPE | median Pearson correlation to pointwise median 100-point cycle |
| minCycleCorrelation | HIGHER | SHAPE | minimum Pearson correlation to pointwise median 100-point cycle |
| cycleCorrelationStd | LOWER | SHAPE | population std of cycle correlations |

- Normalisation: robustZ=(value-medianAcrossPaths)/MADAcrossPaths.
- Si MAD=0: z-score population standard; si écart-type=0: CONSTANT_METRIC exclue.
- Orientation: signe inversé pour les métriques LOWER; signe conservé pour HIGHER.
- Valeurs orientées limitées à [-3,+3].
- Scores de famille: moyenne non pondérée des métriques disponibles.

| metricName | medianAcrossPaths | madAcrossPaths | populationStdAcrossPaths | method | orientation | clipping |
| --- | --- | --- | --- | --- | --- | --- |
| meanNormalizedProminence | 1.867727272727273 | 0.10181818181818159 | 0.28552024335656334 | ROBUST_Z_MEDIAN_MAD | orientedValue=+z | [-3,+3] |
| medianNormalizedProminence | 1.906 | 0.14900000000000024 | 0.3559503086418415 | ROBUST_Z_MEDIAN_MAD | orientedValue=+z | [-3,+3] |
| meanProminenceToNoiseRatio | 4.574383175991834 | 0.3648229511346601 | 0.7300028089564372 | ROBUST_Z_MEDIAN_MAD | orientedValue=+z | [-3,+3] |
| fullRepDurationCV | 0.22885810682134736 | 0.03362847365400376 | 0.07913569634998373 | ROBUST_Z_MEDIAN_MAD | orientedValue=-z | [-3,+3] |
| fullRepDurationMAD | 12 | 5 | 5.573747990954262 | ROBUST_Z_MEDIAN_MAD | orientedValue=-z | [-3,+3] |
| bottomToTopDurationCV | 0.44091492497762075 | 0.08615768441152138 | 0.14928377574796478 | ROBUST_Z_MEDIAN_MAD | orientedValue=-z | [-3,+3] |
| topToBottomDurationCV | 0.5616158402956649 | 0.07539681575360235 | 0.15734981141645277 | ROBUST_Z_MEDIAN_MAD | orientedValue=-z | [-3,+3] |
| fullRepDurationRange | 50 | 8 | 18.284662668173258 | ROBUST_Z_MEDIAN_MAD | orientedValue=-z | [-3,+3] |
| bottomToTopDurationRange | 50 | 13 | 17.566888044145884 | ROBUST_Z_MEDIAN_MAD | orientedValue=-z | [-3,+3] |
| topToBottomDurationRange | 50 | 25 | 31.787209167630092 | ROBUST_Z_MEDIAN_MAD | orientedValue=-z | [-3,+3] |
| cycleAmplitudeCV | 0.18646121756122322 | 0.024119825019581015 | 0.13068436673332237 | ROBUST_Z_MEDIAN_MAD | orientedValue=-z | [-3,+3] |
| cycleAmplitudeMAD | 1926 | 380 | 847.4018855038946 | ROBUST_Z_MEDIAN_MAD | orientedValue=-z | [-3,+3] |
| meanBottomDrift | 2658.4 | 906.4000000000001 | 1215.8814632283124 | ROBUST_Z_MEDIAN_MAD | orientedValue=-z | [-3,+3] |
| maxBottomDrift | 4652 | 1732 | 2338.5288594898007 | ROBUST_Z_MEDIAN_MAD | orientedValue=-z | [-3,+3] |
| coverageRatio | 0.7648305084745762 | 0.13771186440677974 | 0.13888670239908094 | ROBUST_Z_MEDIAN_MAD | orientedValue=+z | [-3,+3] |
| unselectedPrefixSamples | 0 | 0 | 0 | CONSTANT_METRIC | orientedValue=-z | [-3,+3] |
| unselectedSuffixSamples | 111 | 65 | 65.5545235323662 | ROBUST_Z_MEDIAN_MAD | orientedValue=-z | [-3,+3] |
| selectedSpanSamples | 361 | 65 | 65.5545235323662 | ROBUST_Z_MEDIAN_MAD | orientedValue=+z | [-3,+3] |
| meanCycleCorrelation | 0.5416462918579489 | 0.02221970914316984 | 0.040345139502610344 | ROBUST_Z_MEDIAN_MAD | orientedValue=+z | [-3,+3] |
| medianCycleCorrelation | 0.5537918719873582 | 0.0243907882833424 | 0.05050434790686724 | ROBUST_Z_MEDIAN_MAD | orientedValue=+z | [-3,+3] |
| minCycleCorrelation | 0.33399195093019646 | 0.028973850299064463 | 0.07736136441072246 | ROBUST_Z_MEDIAN_MAD | orientedValue=+z | [-3,+3] |
| cycleCorrelationStd | 0.11782522115113866 | 0.025000904202095275 | 0.032125155074750215 | ROBUST_Z_MEDIAN_MAD | orientedValue=-z | [-3,+3] |

## Tableau A — Toutes les chaînes

| pathId | terminalStateId | isGroundTruth | isLegacyWinner | legacyDpScore | legacyDpRank | fullPath | LOCAL_QUALITY_SCORE | TEMPORAL_CONSISTENCY_SCORE | AMPLITUDE_CONSISTENCY_SCORE | COVERAGE_SCORE | SHAPE_SIMILARITY_SCORE |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TERMINAL_01 | 11:45:564 | false | true | 48176 | 1 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(564) | 1.0140310493584126 | -0.2358958933658472 | 0.15157888718184587 | 0.34871794871794864 | -0.5503570109021135 |
| TERMINAL_02 | 11:54:641 | false | false | 48164 | 2 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(641) | 1.3246324307040658 | -2.2093308610957143 | 0.14909813908045608 | 1.1384615384615382 | 1.66759354236234 |
| TERMINAL_03 | 11:47:585 | false | false | 47108 | 3 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(585) | 1.0732142857142868 | -0.3669812408749678 | -0.07855251544571928 | 0.564102564102564 | 0.2472195411284811 |
| TERMINAL_04 | 11:49:595 | false | false | 46992 | 4 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(595) | 1.0854234352163115 | -0.6876858317238104 | -0.1046419232832196 | 0.6666666666666666 | 1.570575880206394 |
| TERMINAL_05 | 11:51:609 | false | false | 45088 | 5 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(609) | 0.8061899309026397 | -1.0420684776008466 | -0.560458958517211 | 0.81025641025641 | 1.0306918675237813 |
| TERMINAL_06 | 11:36:500 | false | false | 44872 | 6 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(500) | 0.8135684036583806 | -0.6543573348542994 | 0.49778738484519885 | -0.3076923076923075 | -1.8238694408115876 |
| TERMINAL_07 | 11:35:480 | false | false | 44112 | 7 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(480) | -0.07091051898074503 | -0.17366123787561327 | 0.5733184081512496 | -0.5128205128205126 | -0.4199544572015566 |
| TERMINAL_08 | 11:41:530 | false | false | 43152 | 8 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(530) | -0.2340342278018429 | -0.6461572658847279 | -0.5963624780702007 | 0 | 1.000338990071027 |
| TERMINAL_09 | 11:38:511 | false | false | 43124 | 9 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(511) | 0.08898809523809403 | -0.9400464666949452 | 0.6672636278706833 | -0.19487179487179485 | -0.3602520297560326 |
| TERMINAL_10 | 11:40:529 | false | false | 42884 | 10 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(529) | -0.3143437865152405 | -0.7043612665117147 | -0.6711285229253354 | -0.01025641025641024 | 0.6620531211340976 |
| TERMINAL_11 | 11:52:611 | false | false | 42732 | 11 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(611) | 0.43416355904732856 | -1.200395167880494 | -1.1869949161540128 | 0.8307692307692305 | -0.724929714056112 |
| TERMINAL_12 | 11:30:438 | false | false | 35772 | 12 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(438) | -0.8013610728465341 | 1.2068184376841704 | 0.8587569942008324 | -0.9435897435897432 | -1.6901084195701968 |
| TERMINAL_13 | 11:32:450 | false | false | 35648 | 13 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(450) | -0.9742980074126368 | 0.8172789175315291 | 0.8305680057392922 | -0.8205128205128203 | -0.2514069224609517 |
| TERMINAL_14 | 11:31:445 | false | false | 34284 | 14 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(445) | -1.268612724165534 | 1.1124582884754992 | 0.4919900069058188 | -0.8717948717948714 | -0.9505499045647867 |
| GROUND_TRUTH_REFERENCE |  | true | false | -11348 | 15 | B(169) -> T(199) -> B(262) -> T(291) -> B(353) -> T(383) -> B(445) -> T(474) -> B(529) -> T(558) -> B(611) | -3 | 2.75 | 0.08461312150632543 | 0.8307692307692305 | 2.7040614464528994 |

## Classement par métrique — résumé

| metricName | preferredDirection | groundTruthValue | groundTruthRank | winnerValue | winnerRank | bestPathId | bestChainValue | groundTruthMinusWinner | groundTruthInTop1 | groundTruthInTop3 | groundTruthInTop5 | topThreePaths |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| meanNormalizedProminence | HIGHER | 0.795909090909091 | 15 | 1.9714545454545453 | 3 | TERMINAL_04 | 1.9937272727272728 | -1.1755454545454542 | false | false | false | TERMINAL_04, TERMINAL_03, TERMINAL_01 |
| medianNormalizedProminence | HIGHER | 0.583 | 15 | 2.055 | 4 | TERMINAL_01 | 2.055 | -1.4720000000000002 | false | false | false |  |
| meanProminenceToNoiseRatio | HIGHER | 2.079655455478551 | 15 | 4.9477222432960755 | 2 | TERMINAL_02 | 5.29450621133692 | -2.8680667878175243 | false | false | false | TERMINAL_02, TERMINAL_01, TERMINAL_04 |
| fullRepDurationCV | LOWER | 0.050892406693221676 | 1 | 0.2373544300422121 | 11 | GROUND_TRUTH_REFERENCE | 0.050892406693221676 | -0.18646202334899042 | true | true | true | GROUND_TRUTH_REFERENCE, TERMINAL_13, TERMINAL_14 |
| fullRepDurationMAD | LOWER | 2 | 1.5 | 12 | 6 | TERMINAL_12 | 2 | -10 | false | true | true | TERMINAL_12, GROUND_TRUTH_REFERENCE, TERMINAL_14 |
| bottomToTopDurationCV | LOWER | 0.016663195529137267 | 1 | 0.5893297391275264 | 12.5 | GROUND_TRUTH_REFERENCE | 0.016663195529137267 | -0.5726665435983891 | true | true | true | GROUND_TRUTH_REFERENCE, TERMINAL_12, TERMINAL_13, TERMINAL_14 |
| topToBottomDurationCV | LOWER | 0.07029302153670414 | 1 | 0.483831637915188 | 2 | GROUND_TRUTH_REFERENCE | 0.07029302153670414 | -0.4135386163784839 | true | true | true | GROUND_TRUTH_REFERENCE, TERMINAL_01, TERMINAL_14 |
| fullRepDurationRange | LOWER | 11 | 1 | 50 | 9.5 | GROUND_TRUTH_REFERENCE | 11 | -39 | true | true | true | GROUND_TRUTH_REFERENCE, TERMINAL_12, TERMINAL_13, TERMINAL_14 |
| bottomToTopDurationRange | LOWER | 1 | 1 | 67 | 12.5 | GROUND_TRUTH_REFERENCE | 1 | -66 | true | true | true | GROUND_TRUTH_REFERENCE, TERMINAL_12, TERMINAL_13, TERMINAL_14 |
| topToBottomDurationRange | LOWER | 10 | 1 | 50 | 9 | GROUND_TRUTH_REFERENCE | 10 | -40 | true | true | true | GROUND_TRUTH_REFERENCE |
| cycleAmplitudeCV | LOWER | 0.6965827797809451 | 15 | 0.17549304885475642 | 5 | TERMINAL_12 | 0.1378614727277771 | 0.5210897309261886 | false | false | false | TERMINAL_12, TERMINAL_13, TERMINAL_14 |
| cycleAmplitudeMAD | LOWER | 1090 | 7 | 2306 | 12.5 | TERMINAL_12 | 340 | -1216 | false | false | false | TERMINAL_12, TERMINAL_13, TERMINAL_14 |
| meanBottomDrift | LOWER | 1703.2 | 1 | 1752 | 2 | GROUND_TRUTH_REFERENCE | 1703.2 | -48.799999999999955 | true | true | true | GROUND_TRUTH_REFERENCE, TERMINAL_01, TERMINAL_02 |
| maxBottomDrift | LOWER | 3368 | 5 | 2920 | 2.5 | TERMINAL_01 | 2920 | 448 | false | false | true | TERMINAL_01, TERMINAL_02, TERMINAL_03, TERMINAL_04 |
| coverageRatio | HIGHER | 0.9364406779661016 | 2.5 | 0.836864406779661 | 7 | TERMINAL_02 | 1 | 0.09957627118644063 | false | true | true | TERMINAL_02, TERMINAL_11, GROUND_TRUTH_REFERENCE |
| unselectedPrefixSamples | LOWER | 0 | 8 | 0 | 8 | TERMINAL_01 | 0 | 0 | false | false | false |  |
| unselectedSuffixSamples | LOWER | 30 | 2.5 | 77 | 7 | TERMINAL_02 | 0 | -47 | false | true | true | TERMINAL_02, TERMINAL_11, GROUND_TRUTH_REFERENCE |
| selectedSpanSamples | HIGHER | 442 | 2.5 | 395 | 7 | TERMINAL_02 | 472 | 47 | false | true | true | TERMINAL_02, TERMINAL_11, GROUND_TRUTH_REFERENCE |
| meanCycleCorrelation | HIGHER | 0.6293649964149314 | 1 | 0.5516053268020519 | 6 | GROUND_TRUTH_REFERENCE | 0.6293649964149314 | 0.0777596696128795 | true | true | true | GROUND_TRUTH_REFERENCE, TERMINAL_08, TERMINAL_10 |
| medianCycleCorrelation | HIGHER | 0.6466210043910802 | 2 | 0.5573188619576567 | 6 | TERMINAL_10 | 0.6571146171845793 | 0.08930214243342349 | false | true | true | TERMINAL_10, GROUND_TRUTH_REFERENCE, TERMINAL_08 |
| minCycleCorrelation | HIGHER | 0.5127806575493022 | 1 | 0.3127284371247655 | 12 | GROUND_TRUTH_REFERENCE | 0.5127806575493022 | 0.20005222042453674 | true | true | true | GROUND_TRUTH_REFERENCE, TERMINAL_02, TERMINAL_04 |
| cycleCorrelationStd | LOWER | 0.06501870282566592 | 1 | 0.1519612538123109 | 11 | GROUND_TRUTH_REFERENCE | 0.06501870282566592 | -0.08694255098664498 | true | true | true | GROUND_TRUTH_REFERENCE, TERMINAL_02, TERMINAL_04 |

## Classement complet par métrique

| metricName | preferredDirection | pathId | value | rank | normalizedRankPercentile | tiedRank |
| --- | --- | --- | --- | --- | --- | --- |
| meanNormalizedProminence | HIGHER | TERMINAL_04 | 1.9937272727272728 | 1 | 100 | false |
| meanNormalizedProminence | HIGHER | TERMINAL_03 | 1.991909090909091 | 2 | 92.85714285714286 | false |
| meanNormalizedProminence | HIGHER | TERMINAL_01 | 1.9714545454545453 | 3 | 85.71428571428571 | false |
| meanNormalizedProminence | HIGHER | TERMINAL_02 | 1.9695454545454545 | 4 | 78.57142857142857 | false |
| meanNormalizedProminence | HIGHER | TERMINAL_05 | 1.9365454545454546 | 5 | 71.42857142857143 | false |
| meanNormalizedProminence | HIGHER | TERMINAL_06 | 1.926181818181818 | 6 | 64.28571428571429 | false |
| meanNormalizedProminence | HIGHER | TERMINAL_09 | 1.8949090909090907 | 7 | 57.14285714285714 | false |
| meanNormalizedProminence | HIGHER | TERMINAL_11 | 1.867727272727273 | 8 | 50 | false |
| meanNormalizedProminence | HIGHER | TERMINAL_07 | 1.8463636363636362 | 9 | 42.857142857142854 | false |
| meanNormalizedProminence | HIGHER | TERMINAL_08 | 1.811 | 10 | 35.714285714285715 | false |
| meanNormalizedProminence | HIGHER | TERMINAL_10 | 1.8049090909090908 | 11 | 28.57142857142857 | false |
| meanNormalizedProminence | HIGHER | TERMINAL_12 | 1.7355454545454547 | 12 | 21.428571428571427 | false |
| meanNormalizedProminence | HIGHER | TERMINAL_13 | 1.693818181818182 | 13 | 14.285714285714285 | false |
| meanNormalizedProminence | HIGHER | TERMINAL_14 | 1.6704545454545454 | 14 | 7.142857142857142 | false |
| meanNormalizedProminence | HIGHER | GROUND_TRUTH_REFERENCE | 0.795909090909091 | 15 | 0 | false |
| medianNormalizedProminence | HIGHER | TERMINAL_01 | 2.055 | 4 | 78.57142857142857 | true |
| medianNormalizedProminence | HIGHER | TERMINAL_02 | 2.055 | 4 | 78.57142857142857 | true |
| medianNormalizedProminence | HIGHER | TERMINAL_03 | 2.055 | 4 | 78.57142857142857 | true |
| medianNormalizedProminence | HIGHER | TERMINAL_04 | 2.055 | 4 | 78.57142857142857 | true |
| medianNormalizedProminence | HIGHER | TERMINAL_05 | 2.055 | 4 | 78.57142857142857 | true |
| medianNormalizedProminence | HIGHER | TERMINAL_06 | 2.055 | 4 | 78.57142857142857 | true |
| medianNormalizedProminence | HIGHER | TERMINAL_11 | 2.055 | 4 | 78.57142857142857 | true |
| medianNormalizedProminence | HIGHER | TERMINAL_07 | 1.906 | 11 | 28.57142857142857 | true |
| medianNormalizedProminence | HIGHER | TERMINAL_08 | 1.906 | 11 | 28.57142857142857 | true |
| medianNormalizedProminence | HIGHER | TERMINAL_09 | 1.906 | 11 | 28.57142857142857 | true |
| medianNormalizedProminence | HIGHER | TERMINAL_10 | 1.906 | 11 | 28.57142857142857 | true |
| medianNormalizedProminence | HIGHER | TERMINAL_12 | 1.906 | 11 | 28.57142857142857 | true |
| medianNormalizedProminence | HIGHER | TERMINAL_13 | 1.906 | 11 | 28.57142857142857 | true |
| medianNormalizedProminence | HIGHER | TERMINAL_14 | 1.906 | 11 | 28.57142857142857 | true |
| medianNormalizedProminence | HIGHER | GROUND_TRUTH_REFERENCE | 0.583 | 15 | 0 | false |
| meanProminenceToNoiseRatio | HIGHER | TERMINAL_02 | 5.29450621133692 | 1 | 100 | false |
| meanProminenceToNoiseRatio | HIGHER | TERMINAL_01 | 4.9477222432960755 | 2 | 92.85714285714286 | false |
| meanProminenceToNoiseRatio | HIGHER | TERMINAL_04 | 4.946053965427037 | 3 | 85.71428571428571 | false |
| meanProminenceToNoiseRatio | HIGHER | TERMINAL_03 | 4.939206127126494 | 4 | 78.57142857142857 | false |
| meanProminenceToNoiseRatio | HIGHER | TERMINAL_06 | 4.890538040650238 | 5 | 71.42857142857143 | false |
| meanProminenceToNoiseRatio | HIGHER | TERMINAL_05 | 4.845328767364325 | 6 | 64.28571428571429 | false |
| meanProminenceToNoiseRatio | HIGHER | TERMINAL_11 | 4.684738717517495 | 7 | 57.14285714285714 | false |
| meanProminenceToNoiseRatio | HIGHER | TERMINAL_09 | 4.574383175991834 | 8 | 50 | false |
| meanProminenceToNoiseRatio | HIGHER | TERMINAL_07 | 4.573321494371417 | 9 | 42.857142857142854 | false |
| meanProminenceToNoiseRatio | HIGHER | TERMINAL_08 | 4.5214985043787195 | 10 | 35.714285714285715 | false |
| meanProminenceToNoiseRatio | HIGHER | TERMINAL_10 | 4.455426423848808 | 11 | 28.57142857142857 | false |
| meanProminenceToNoiseRatio | HIGHER | TERMINAL_12 | 4.1709368083503655 | 12 | 21.428571428571427 | false |
| meanProminenceToNoiseRatio | HIGHER | TERMINAL_13 | 4.131174982874255 | 13 | 14.285714285714285 | false |
| meanProminenceToNoiseRatio | HIGHER | TERMINAL_14 | 3.892770530184088 | 14 | 7.142857142857142 | false |
| meanProminenceToNoiseRatio | HIGHER | GROUND_TRUTH_REFERENCE | 2.079655455478551 | 15 | 0 | false |
| fullRepDurationCV | LOWER | GROUND_TRUTH_REFERENCE | 0.050892406693221676 | 1 | 100 | false |
| fullRepDurationCV | LOWER | TERMINAL_13 | 0.1678267063708412 | 2 | 92.85714285714286 | false |
| fullRepDurationCV | LOWER | TERMINAL_14 | 0.16932349921083945 | 3 | 85.71428571428571 | false |
| fullRepDurationCV | LOWER | TERMINAL_12 | 0.1845304631374105 | 4 | 78.57142857142857 | false |
| fullRepDurationCV | LOWER | TERMINAL_03 | 0.20684254581056685 | 5 | 71.42857142857143 | false |
| fullRepDurationCV | LOWER | TERMINAL_04 | 0.20974936998768712 | 6 | 64.28571428571429 | false |
| fullRepDurationCV | LOWER | TERMINAL_08 | 0.22697784405120772 | 7 | 57.14285714285714 | false |
| fullRepDurationCV | LOWER | TERMINAL_05 | 0.22885810682134736 | 8 | 50 | false |
| fullRepDurationCV | LOWER | TERMINAL_10 | 0.23140739555176143 | 9 | 42.857142857142854 | false |
| fullRepDurationCV | LOWER | TERMINAL_11 | 0.2326689616684605 | 10 | 35.714285714285715 | false |
| fullRepDurationCV | LOWER | TERMINAL_01 | 0.2373544300422121 | 11 | 28.57142857142857 | false |
| fullRepDurationCV | LOWER | TERMINAL_07 | 0.2624865804753511 | 12 | 21.428571428571427 | false |
| fullRepDurationCV | LOWER | TERMINAL_02 | 0.30669888439317916 | 13 | 14.285714285714285 | false |
| fullRepDurationCV | LOWER | TERMINAL_06 | 0.3526341138710543 | 14 | 7.142857142857142 | false |
| fullRepDurationCV | LOWER | TERMINAL_09 | 0.4010860397539707 | 15 | 0 | false |
| fullRepDurationMAD | LOWER | TERMINAL_12 | 2 | 1.5 | 96.42857142857143 | true |
| fullRepDurationMAD | LOWER | GROUND_TRUTH_REFERENCE | 2 | 1.5 | 96.42857142857143 | true |
| fullRepDurationMAD | LOWER | TERMINAL_14 | 7 | 3 | 85.71428571428571 | false |
| fullRepDurationMAD | LOWER | TERMINAL_01 | 12 | 6 | 64.28571428571429 | true |
| fullRepDurationMAD | LOWER | TERMINAL_06 | 12 | 6 | 64.28571428571429 | true |
| fullRepDurationMAD | LOWER | TERMINAL_07 | 12 | 6 | 64.28571428571429 | true |
| fullRepDurationMAD | LOWER | TERMINAL_09 | 12 | 6 | 64.28571428571429 | true |
| fullRepDurationMAD | LOWER | TERMINAL_13 | 12 | 6 | 64.28571428571429 | true |
| fullRepDurationMAD | LOWER | TERMINAL_03 | 14 | 9 | 42.857142857142854 | false |
| fullRepDurationMAD | LOWER | TERMINAL_04 | 17 | 10.5 | 32.142857142857146 | true |
| fullRepDurationMAD | LOWER | TERMINAL_05 | 17 | 10.5 | 32.142857142857146 | true |
| fullRepDurationMAD | LOWER | TERMINAL_08 | 18 | 12.5 | 17.857142857142858 | true |
| fullRepDurationMAD | LOWER | TERMINAL_10 | 18 | 12.5 | 17.857142857142858 | true |
| fullRepDurationMAD | LOWER | TERMINAL_11 | 19 | 14 | 7.142857142857142 | false |
| fullRepDurationMAD | LOWER | TERMINAL_02 | 21 | 15 | 0 | false |
| bottomToTopDurationCV | LOWER | GROUND_TRUTH_REFERENCE | 0.016663195529137267 | 1 | 100 | false |
| bottomToTopDurationCV | LOWER | TERMINAL_12 | 0.35475724056609936 | 3 | 85.71428571428571 | true |
| bottomToTopDurationCV | LOWER | TERMINAL_13 | 0.35475724056609936 | 3 | 85.71428571428571 | true |
| bottomToTopDurationCV | LOWER | TERMINAL_14 | 0.35475724056609936 | 3 | 85.71428571428571 | true |
| bottomToTopDurationCV | LOWER | TERMINAL_06 | 0.42025309457021054 | 6 | 64.28571428571429 | true |
| bottomToTopDurationCV | LOWER | TERMINAL_07 | 0.42025309457021054 | 6 | 64.28571428571429 | true |
| bottomToTopDurationCV | LOWER | TERMINAL_09 | 0.42025309457021054 | 6 | 64.28571428571429 | true |
| bottomToTopDurationCV | LOWER | TERMINAL_08 | 0.44091492497762075 | 8.5 | 46.42857142857143 | true |
| bottomToTopDurationCV | LOWER | TERMINAL_10 | 0.44091492497762075 | 8.5 | 46.42857142857143 | true |
| bottomToTopDurationCV | LOWER | TERMINAL_01 | 0.5893297391275264 | 12.5 | 17.857142857142858 | true |
| bottomToTopDurationCV | LOWER | TERMINAL_02 | 0.5893297391275264 | 12.5 | 17.857142857142858 | true |
| bottomToTopDurationCV | LOWER | TERMINAL_03 | 0.5893297391275264 | 12.5 | 17.857142857142858 | true |
| bottomToTopDurationCV | LOWER | TERMINAL_04 | 0.5893297391275264 | 12.5 | 17.857142857142858 | true |
| bottomToTopDurationCV | LOWER | TERMINAL_05 | 0.5893297391275264 | 12.5 | 17.857142857142858 | true |
| bottomToTopDurationCV | LOWER | TERMINAL_11 | 0.5893297391275264 | 12.5 | 17.857142857142858 | true |
| topToBottomDurationCV | LOWER | GROUND_TRUTH_REFERENCE | 0.07029302153670414 | 1 | 100 | false |
| topToBottomDurationCV | LOWER | TERMINAL_01 | 0.483831637915188 | 2 | 92.85714285714286 | false |
| topToBottomDurationCV | LOWER | TERMINAL_14 | 0.5103859590158156 | 3 | 85.71428571428571 | false |
| topToBottomDurationCV | LOWER | TERMINAL_12 | 0.5232301385688787 | 4 | 78.57142857142857 | false |
| topToBottomDurationCV | LOWER | TERMINAL_13 | 0.5273673705210673 | 5 | 71.42857142857143 | false |
| topToBottomDurationCV | LOWER | TERMINAL_06 | 0.5508524527044841 | 6 | 64.28571428571429 | false |
| topToBottomDurationCV | LOWER | TERMINAL_07 | 0.5566742639821778 | 7 | 57.14285714285714 | false |
| topToBottomDurationCV | LOWER | TERMINAL_03 | 0.5616158402956649 | 8 | 50 | false |
| topToBottomDurationCV | LOWER | TERMINAL_04 | 0.6065809171548976 | 9 | 42.857142857142854 | false |
| topToBottomDurationCV | LOWER | TERMINAL_09 | 0.6370126560492673 | 10 | 35.714285714285715 | false |
| topToBottomDurationCV | LOWER | TERMINAL_08 | 0.6702281112200468 | 11 | 28.57142857142857 | false |
| topToBottomDurationCV | LOWER | TERMINAL_05 | 0.6706154111907331 | 12 | 21.428571428571427 | false |
| topToBottomDurationCV | LOWER | TERMINAL_10 | 0.677850407826289 | 13 | 14.285714285714285 | false |
| topToBottomDurationCV | LOWER | TERMINAL_11 | 0.6796618600388917 | 14 | 7.142857142857142 | false |
| topToBottomDurationCV | LOWER | TERMINAL_02 | 0.8075736255586162 | 15 | 0 | false |
| fullRepDurationRange | LOWER | GROUND_TRUTH_REFERENCE | 11 | 1 | 100 | false |
| fullRepDurationRange | LOWER | TERMINAL_12 | 26 | 3 | 85.71428571428571 | true |
| fullRepDurationRange | LOWER | TERMINAL_13 | 26 | 3 | 85.71428571428571 | true |
| fullRepDurationRange | LOWER | TERMINAL_14 | 26 | 3 | 85.71428571428571 | true |
| fullRepDurationRange | LOWER | TERMINAL_08 | 42 | 5 | 71.42857142857143 | false |
| fullRepDurationRange | LOWER | TERMINAL_10 | 43 | 6 | 64.28571428571429 | false |
| fullRepDurationRange | LOWER | TERMINAL_07 | 44 | 7 | 57.14285714285714 | false |
| fullRepDurationRange | LOWER | TERMINAL_01 | 50 | 9.5 | 39.285714285714285 | true |
| fullRepDurationRange | LOWER | TERMINAL_03 | 50 | 9.5 | 39.285714285714285 | true |
| fullRepDurationRange | LOWER | TERMINAL_04 | 50 | 9.5 | 39.285714285714285 | true |
| fullRepDurationRange | LOWER | TERMINAL_05 | 50 | 9.5 | 39.285714285714285 | true |
| fullRepDurationRange | LOWER | TERMINAL_11 | 52 | 12 | 21.428571428571427 | false |
| fullRepDurationRange | LOWER | TERMINAL_06 | 64 | 13 | 14.285714285714285 | false |
| fullRepDurationRange | LOWER | TERMINAL_09 | 75 | 14 | 7.142857142857142 | false |
| fullRepDurationRange | LOWER | TERMINAL_02 | 82 | 15 | 0 | false |
| bottomToTopDurationRange | LOWER | GROUND_TRUTH_REFERENCE | 1 | 1 | 100 | false |
| bottomToTopDurationRange | LOWER | TERMINAL_12 | 37 | 3 | 85.71428571428571 | true |
| bottomToTopDurationRange | LOWER | TERMINAL_13 | 37 | 3 | 85.71428571428571 | true |
| bottomToTopDurationRange | LOWER | TERMINAL_14 | 37 | 3 | 85.71428571428571 | true |
| bottomToTopDurationRange | LOWER | TERMINAL_06 | 50 | 7 | 57.14285714285714 | true |
| bottomToTopDurationRange | LOWER | TERMINAL_07 | 50 | 7 | 57.14285714285714 | true |
| bottomToTopDurationRange | LOWER | TERMINAL_08 | 50 | 7 | 57.14285714285714 | true |
| bottomToTopDurationRange | LOWER | TERMINAL_09 | 50 | 7 | 57.14285714285714 | true |
| bottomToTopDurationRange | LOWER | TERMINAL_10 | 50 | 7 | 57.14285714285714 | true |
| bottomToTopDurationRange | LOWER | TERMINAL_01 | 67 | 12.5 | 17.857142857142858 | true |
| bottomToTopDurationRange | LOWER | TERMINAL_02 | 67 | 12.5 | 17.857142857142858 | true |
| bottomToTopDurationRange | LOWER | TERMINAL_03 | 67 | 12.5 | 17.857142857142858 | true |
| bottomToTopDurationRange | LOWER | TERMINAL_04 | 67 | 12.5 | 17.857142857142858 | true |
| bottomToTopDurationRange | LOWER | TERMINAL_05 | 67 | 12.5 | 17.857142857142858 | true |
| bottomToTopDurationRange | LOWER | TERMINAL_11 | 67 | 12.5 | 17.857142857142858 | true |
| topToBottomDurationRange | LOWER | GROUND_TRUTH_REFERENCE | 10 | 1 | 100 | false |
| topToBottomDurationRange | LOWER | TERMINAL_06 | 25 | 4 | 78.57142857142857 | true |
| topToBottomDurationRange | LOWER | TERMINAL_07 | 25 | 4 | 78.57142857142857 | true |
| topToBottomDurationRange | LOWER | TERMINAL_12 | 25 | 4 | 78.57142857142857 | true |
| topToBottomDurationRange | LOWER | TERMINAL_13 | 25 | 4 | 78.57142857142857 | true |
| topToBottomDurationRange | LOWER | TERMINAL_14 | 25 | 4 | 78.57142857142857 | true |
| topToBottomDurationRange | LOWER | TERMINAL_09 | 36 | 7 | 57.14285714285714 | false |
| topToBottomDurationRange | LOWER | TERMINAL_01 | 50 | 9 | 42.857142857142854 | true |
| topToBottomDurationRange | LOWER | TERMINAL_08 | 50 | 9 | 42.857142857142854 | true |
| topToBottomDurationRange | LOWER | TERMINAL_10 | 50 | 9 | 42.857142857142854 | true |
| topToBottomDurationRange | LOWER | TERMINAL_03 | 68 | 11 | 28.57142857142857 | false |
| topToBottomDurationRange | LOWER | TERMINAL_04 | 78 | 12 | 21.428571428571427 | false |
| topToBottomDurationRange | LOWER | TERMINAL_05 | 92 | 13 | 14.285714285714285 | false |
| topToBottomDurationRange | LOWER | TERMINAL_11 | 94 | 14 | 7.142857142857142 | false |
| topToBottomDurationRange | LOWER | TERMINAL_02 | 124 | 15 | 0 | false |
| cycleAmplitudeCV | LOWER | TERMINAL_12 | 0.1378614727277771 | 1 | 100 | false |
| cycleAmplitudeCV | LOWER | TERMINAL_13 | 0.13924127087968033 | 2 | 92.85714285714286 | false |
| cycleAmplitudeCV | LOWER | TERMINAL_14 | 0.15648123232999164 | 3 | 85.71428571428571 | false |
| cycleAmplitudeCV | LOWER | TERMINAL_09 | 0.17034523456876893 | 4 | 78.57142857142857 | false |
| cycleAmplitudeCV | LOWER | TERMINAL_01 | 0.17549304885475642 | 5 | 71.42857142857143 | false |
| cycleAmplitudeCV | LOWER | TERMINAL_02 | 0.17560868910555072 | 6 | 64.28571428571429 | false |
| cycleAmplitudeCV | LOWER | TERMINAL_07 | 0.18240131093697326 | 7 | 57.14285714285714 | false |
| cycleAmplitudeCV | LOWER | TERMINAL_03 | 0.18646121756122322 | 8 | 50 | false |
| cycleAmplitudeCV | LOWER | TERMINAL_04 | 0.18773166808104425 | 9 | 42.857142857142854 | false |
| cycleAmplitudeCV | LOWER | TERMINAL_06 | 0.19191150350714709 | 10 | 35.714285714285715 | false |
| cycleAmplitudeCV | LOWER | TERMINAL_05 | 0.21058104258080423 | 11 | 28.57142857142857 | false |
| cycleAmplitudeCV | LOWER | TERMINAL_08 | 0.23104002022962772 | 12 | 21.428571428571427 | false |
| cycleAmplitudeCV | LOWER | TERMINAL_10 | 0.23502372517705009 | 13 | 14.285714285714285 | false |
| cycleAmplitudeCV | LOWER | TERMINAL_11 | 0.2433779527242253 | 14 | 7.142857142857142 | false |
| cycleAmplitudeCV | LOWER | GROUND_TRUTH_REFERENCE | 0.6965827797809451 | 15 | 0 | false |
| cycleAmplitudeMAD | LOWER | TERMINAL_12 | 340 | 2 | 92.85714285714286 | true |
| cycleAmplitudeMAD | LOWER | TERMINAL_13 | 340 | 2 | 92.85714285714286 | true |
| cycleAmplitudeMAD | LOWER | TERMINAL_14 | 340 | 2 | 92.85714285714286 | true |
| cycleAmplitudeMAD | LOWER | TERMINAL_06 | 614 | 5 | 71.42857142857143 | true |
| cycleAmplitudeMAD | LOWER | TERMINAL_07 | 614 | 5 | 71.42857142857143 | true |
| cycleAmplitudeMAD | LOWER | TERMINAL_09 | 614 | 5 | 71.42857142857143 | true |
| cycleAmplitudeMAD | LOWER | GROUND_TRUTH_REFERENCE | 1090 | 7 | 57.14285714285714 | false |
| cycleAmplitudeMAD | LOWER | TERMINAL_08 | 1926 | 8.5 | 46.42857142857143 | true |
| cycleAmplitudeMAD | LOWER | TERMINAL_10 | 1926 | 8.5 | 46.42857142857143 | true |
| cycleAmplitudeMAD | LOWER | TERMINAL_01 | 2306 | 12.5 | 17.857142857142858 | true |
| cycleAmplitudeMAD | LOWER | TERMINAL_02 | 2306 | 12.5 | 17.857142857142858 | true |
| cycleAmplitudeMAD | LOWER | TERMINAL_03 | 2306 | 12.5 | 17.857142857142858 | true |
| cycleAmplitudeMAD | LOWER | TERMINAL_04 | 2306 | 12.5 | 17.857142857142858 | true |
| cycleAmplitudeMAD | LOWER | TERMINAL_05 | 2306 | 12.5 | 17.857142857142858 | true |
| cycleAmplitudeMAD | LOWER | TERMINAL_11 | 2306 | 12.5 | 17.857142857142858 | true |
| meanBottomDrift | LOWER | GROUND_TRUTH_REFERENCE | 1703.2 | 1 | 100 | false |
| meanBottomDrift | LOWER | TERMINAL_01 | 1752 | 2 | 92.85714285714286 | false |
| meanBottomDrift | LOWER | TERMINAL_02 | 1754.4 | 3 | 85.71428571428571 | false |
| meanBottomDrift | LOWER | TERMINAL_03 | 1965.6 | 4 | 78.57142857142857 | false |
| meanBottomDrift | LOWER | TERMINAL_04 | 1988.8 | 5 | 71.42857142857143 | false |
| meanBottomDrift | LOWER | TERMINAL_05 | 2369.6 | 6 | 64.28571428571429 | false |
| meanBottomDrift | LOWER | TERMINAL_08 | 2604.8 | 7 | 57.14285714285714 | false |
| meanBottomDrift | LOWER | TERMINAL_10 | 2658.4 | 8 | 50 | false |
| meanBottomDrift | LOWER | TERMINAL_11 | 2840.8 | 9 | 42.857142857142854 | false |
| meanBottomDrift | LOWER | TERMINAL_06 | 3819.2 | 10 | 35.714285714285715 | false |
| meanBottomDrift | LOWER | TERMINAL_07 | 3971.2 | 11 | 28.57142857142857 | false |
| meanBottomDrift | LOWER | TERMINAL_09 | 4168.8 | 12 | 21.428571428571427 | false |
| meanBottomDrift | LOWER | TERMINAL_12 | 4868.8 | 13 | 14.285714285714285 | false |
| meanBottomDrift | LOWER | TERMINAL_13 | 4893.6 | 14 | 7.142857142857142 | false |
| meanBottomDrift | LOWER | TERMINAL_14 | 5166.4 | 15 | 0 | false |
| maxBottomDrift | LOWER | TERMINAL_01 | 2920 | 2.5 | 89.28571428571429 | true |
| maxBottomDrift | LOWER | TERMINAL_02 | 2920 | 2.5 | 89.28571428571429 | true |
| maxBottomDrift | LOWER | TERMINAL_03 | 2920 | 2.5 | 89.28571428571429 | true |
| maxBottomDrift | LOWER | TERMINAL_04 | 2920 | 2.5 | 89.28571428571429 | true |
| maxBottomDrift | LOWER | GROUND_TRUTH_REFERENCE | 3368 | 5 | 71.42857142857143 | false |
| maxBottomDrift | LOWER | TERMINAL_05 | 3968 | 6 | 64.28571428571429 | false |
| maxBottomDrift | LOWER | TERMINAL_08 | 4384 | 7 | 57.14285714285714 | false |
| maxBottomDrift | LOWER | TERMINAL_10 | 4652 | 8 | 50 | false |
| maxBottomDrift | LOWER | TERMINAL_11 | 6324 | 9 | 42.857142857142854 | false |
| maxBottomDrift | LOWER | TERMINAL_06 | 7640 | 11 | 28.57142857142857 | true |
| maxBottomDrift | LOWER | TERMINAL_07 | 7640 | 11 | 28.57142857142857 | true |
| maxBottomDrift | LOWER | TERMINAL_09 | 7640 | 11 | 28.57142857142857 | true |
| maxBottomDrift | LOWER | TERMINAL_12 | 8168 | 13 | 14.285714285714285 | false |
| maxBottomDrift | LOWER | TERMINAL_13 | 8292 | 14 | 7.142857142857142 | false |
| maxBottomDrift | LOWER | TERMINAL_14 | 9656 | 15 | 0 | false |
| coverageRatio | HIGHER | TERMINAL_02 | 1 | 1 | 100 | false |
| coverageRatio | HIGHER | TERMINAL_11 | 0.9364406779661016 | 2.5 | 89.28571428571429 | true |
| coverageRatio | HIGHER | GROUND_TRUTH_REFERENCE | 0.9364406779661016 | 2.5 | 89.28571428571429 | true |
| coverageRatio | HIGHER | TERMINAL_05 | 0.9322033898305084 | 4 | 78.57142857142857 | false |
| coverageRatio | HIGHER | TERMINAL_04 | 0.902542372881356 | 5 | 71.42857142857143 | false |
| coverageRatio | HIGHER | TERMINAL_03 | 0.8813559322033898 | 6 | 64.28571428571429 | false |
| coverageRatio | HIGHER | TERMINAL_01 | 0.836864406779661 | 7 | 57.14285714285714 | false |
| coverageRatio | HIGHER | TERMINAL_08 | 0.7648305084745762 | 8 | 50 | false |
| coverageRatio | HIGHER | TERMINAL_10 | 0.7627118644067796 | 9 | 42.857142857142854 | false |
| coverageRatio | HIGHER | TERMINAL_09 | 0.7245762711864406 | 10 | 35.714285714285715 | false |
| coverageRatio | HIGHER | TERMINAL_06 | 0.701271186440678 | 11 | 28.57142857142857 | false |
| coverageRatio | HIGHER | TERMINAL_07 | 0.6588983050847458 | 12 | 21.428571428571427 | false |
| coverageRatio | HIGHER | TERMINAL_13 | 0.5953389830508474 | 13 | 14.285714285714285 | false |
| coverageRatio | HIGHER | TERMINAL_14 | 0.5847457627118644 | 14 | 7.142857142857142 | false |
| coverageRatio | HIGHER | TERMINAL_12 | 0.5699152542372882 | 15 | 0 | false |
| unselectedPrefixSamples | LOWER | TERMINAL_01 | 0 | 8 | 50 | true |
| unselectedPrefixSamples | LOWER | TERMINAL_02 | 0 | 8 | 50 | true |
| unselectedPrefixSamples | LOWER | TERMINAL_03 | 0 | 8 | 50 | true |
| unselectedPrefixSamples | LOWER | TERMINAL_04 | 0 | 8 | 50 | true |
| unselectedPrefixSamples | LOWER | TERMINAL_05 | 0 | 8 | 50 | true |
| unselectedPrefixSamples | LOWER | TERMINAL_06 | 0 | 8 | 50 | true |
| unselectedPrefixSamples | LOWER | TERMINAL_07 | 0 | 8 | 50 | true |
| unselectedPrefixSamples | LOWER | TERMINAL_08 | 0 | 8 | 50 | true |
| unselectedPrefixSamples | LOWER | TERMINAL_09 | 0 | 8 | 50 | true |
| unselectedPrefixSamples | LOWER | TERMINAL_10 | 0 | 8 | 50 | true |
| unselectedPrefixSamples | LOWER | TERMINAL_11 | 0 | 8 | 50 | true |
| unselectedPrefixSamples | LOWER | TERMINAL_12 | 0 | 8 | 50 | true |
| unselectedPrefixSamples | LOWER | TERMINAL_13 | 0 | 8 | 50 | true |
| unselectedPrefixSamples | LOWER | TERMINAL_14 | 0 | 8 | 50 | true |
| unselectedPrefixSamples | LOWER | GROUND_TRUTH_REFERENCE | 0 | 8 | 50 | true |
| unselectedSuffixSamples | LOWER | TERMINAL_02 | 0 | 1 | 100 | false |
| unselectedSuffixSamples | LOWER | TERMINAL_11 | 30 | 2.5 | 89.28571428571429 | true |
| unselectedSuffixSamples | LOWER | GROUND_TRUTH_REFERENCE | 30 | 2.5 | 89.28571428571429 | true |
| unselectedSuffixSamples | LOWER | TERMINAL_05 | 32 | 4 | 78.57142857142857 | false |
| unselectedSuffixSamples | LOWER | TERMINAL_04 | 46 | 5 | 71.42857142857143 | false |
| unselectedSuffixSamples | LOWER | TERMINAL_03 | 56 | 6 | 64.28571428571429 | false |
| unselectedSuffixSamples | LOWER | TERMINAL_01 | 77 | 7 | 57.14285714285714 | false |
| unselectedSuffixSamples | LOWER | TERMINAL_08 | 111 | 8 | 50 | false |
| unselectedSuffixSamples | LOWER | TERMINAL_10 | 112 | 9 | 42.857142857142854 | false |
| unselectedSuffixSamples | LOWER | TERMINAL_09 | 130 | 10 | 35.714285714285715 | false |
| unselectedSuffixSamples | LOWER | TERMINAL_06 | 141 | 11 | 28.57142857142857 | false |
| unselectedSuffixSamples | LOWER | TERMINAL_07 | 161 | 12 | 21.428571428571427 | false |
| unselectedSuffixSamples | LOWER | TERMINAL_13 | 191 | 13 | 14.285714285714285 | false |
| unselectedSuffixSamples | LOWER | TERMINAL_14 | 196 | 14 | 7.142857142857142 | false |
| unselectedSuffixSamples | LOWER | TERMINAL_12 | 203 | 15 | 0 | false |
| selectedSpanSamples | HIGHER | TERMINAL_02 | 472 | 1 | 100 | false |
| selectedSpanSamples | HIGHER | TERMINAL_11 | 442 | 2.5 | 89.28571428571429 | true |
| selectedSpanSamples | HIGHER | GROUND_TRUTH_REFERENCE | 442 | 2.5 | 89.28571428571429 | true |
| selectedSpanSamples | HIGHER | TERMINAL_05 | 440 | 4 | 78.57142857142857 | false |
| selectedSpanSamples | HIGHER | TERMINAL_04 | 426 | 5 | 71.42857142857143 | false |
| selectedSpanSamples | HIGHER | TERMINAL_03 | 416 | 6 | 64.28571428571429 | false |
| selectedSpanSamples | HIGHER | TERMINAL_01 | 395 | 7 | 57.14285714285714 | false |
| selectedSpanSamples | HIGHER | TERMINAL_08 | 361 | 8 | 50 | false |
| selectedSpanSamples | HIGHER | TERMINAL_10 | 360 | 9 | 42.857142857142854 | false |
| selectedSpanSamples | HIGHER | TERMINAL_09 | 342 | 10 | 35.714285714285715 | false |
| selectedSpanSamples | HIGHER | TERMINAL_06 | 331 | 11 | 28.57142857142857 | false |
| selectedSpanSamples | HIGHER | TERMINAL_07 | 311 | 12 | 21.428571428571427 | false |
| selectedSpanSamples | HIGHER | TERMINAL_13 | 281 | 13 | 14.285714285714285 | false |
| selectedSpanSamples | HIGHER | TERMINAL_14 | 276 | 14 | 7.142857142857142 | false |
| selectedSpanSamples | HIGHER | TERMINAL_12 | 269 | 15 | 0 | false |
| meanCycleCorrelation | HIGHER | GROUND_TRUTH_REFERENCE | 0.6293649964149314 | 1 | 100 | false |
| meanCycleCorrelation | HIGHER | TERMINAL_08 | 0.6248389339390704 | 2 | 92.85714285714286 | false |
| meanCycleCorrelation | HIGHER | TERMINAL_10 | 0.6191674509560225 | 3 | 85.71428571428571 | false |
| meanCycleCorrelation | HIGHER | TERMINAL_02 | 0.5639277857262279 | 4 | 78.57142857142857 | false |
| meanCycleCorrelation | HIGHER | TERMINAL_04 | 0.5575372093298652 | 5 | 71.42857142857143 | false |
| meanCycleCorrelation | HIGHER | TERMINAL_01 | 0.5516053268020519 | 6 | 64.28571428571429 | false |
| meanCycleCorrelation | HIGHER | TERMINAL_07 | 0.541683997072175 | 7 | 57.14285714285714 | false |
| meanCycleCorrelation | HIGHER | TERMINAL_05 | 0.5416462918579489 | 8 | 50 | false |
| meanCycleCorrelation | HIGHER | TERMINAL_03 | 0.5383371438660822 | 9 | 42.857142857142854 | false |
| meanCycleCorrelation | HIGHER | TERMINAL_06 | 0.5372218477537309 | 10 | 35.714285714285715 | false |
| meanCycleCorrelation | HIGHER | TERMINAL_12 | 0.5309323938238732 | 11 | 28.57142857142857 | false |
| meanCycleCorrelation | HIGHER | TERMINAL_13 | 0.519426582714779 | 12 | 21.428571428571427 | false |
| meanCycleCorrelation | HIGHER | TERMINAL_11 | 0.5174499994249252 | 13 | 14.285714285714285 | false |
| meanCycleCorrelation | HIGHER | TERMINAL_09 | 0.5088793126022342 | 14 | 7.142857142857142 | false |
| meanCycleCorrelation | HIGHER | TERMINAL_14 | 0.49486385079096007 | 15 | 0 | false |
| medianCycleCorrelation | HIGHER | TERMINAL_10 | 0.6571146171845793 | 1 | 100 | false |
| medianCycleCorrelation | HIGHER | GROUND_TRUTH_REFERENCE | 0.6466210043910802 | 2 | 92.85714285714286 | false |
| medianCycleCorrelation | HIGHER | TERMINAL_08 | 0.6444495836299561 | 3 | 85.71428571428571 | false |
| medianCycleCorrelation | HIGHER | TERMINAL_06 | 0.590688534377716 | 4 | 78.57142857142857 | false |
| medianCycleCorrelation | HIGHER | TERMINAL_07 | 0.586427279121851 | 5 | 71.42857142857143 | false |
| medianCycleCorrelation | HIGHER | TERMINAL_01 | 0.5573188619576567 | 6 | 64.28571428571429 | false |
| medianCycleCorrelation | HIGHER | TERMINAL_05 | 0.5538097474774246 | 7 | 57.14285714285714 | false |
| medianCycleCorrelation | HIGHER | TERMINAL_12 | 0.5537918719873582 | 8 | 50 | false |
| medianCycleCorrelation | HIGHER | TERMINAL_09 | 0.5521688099568459 | 9 | 42.857142857142854 | false |
| medianCycleCorrelation | HIGHER | TERMINAL_02 | 0.5511421409439108 | 10 | 35.714285714285715 | false |
| medianCycleCorrelation | HIGHER | TERMINAL_03 | 0.5482080328388506 | 11 | 28.57142857142857 | false |
| medianCycleCorrelation | HIGHER | TERMINAL_04 | 0.5344629478405013 | 12 | 21.428571428571427 | false |
| medianCycleCorrelation | HIGHER | TERMINAL_11 | 0.5294010837040158 | 13 | 14.285714285714285 | false |
| medianCycleCorrelation | HIGHER | TERMINAL_13 | 0.5274144825739021 | 14 | 7.142857142857142 | false |
| medianCycleCorrelation | HIGHER | TERMINAL_14 | 0.4594473591983646 | 15 | 0 | false |
| minCycleCorrelation | HIGHER | GROUND_TRUTH_REFERENCE | 0.5127806575493022 | 1 | 100 | false |
| minCycleCorrelation | HIGHER | TERMINAL_02 | 0.46847210414247237 | 2 | 92.85714285714286 | false |
| minCycleCorrelation | HIGHER | TERMINAL_04 | 0.4514070183525438 | 3 | 85.71428571428571 | false |
| minCycleCorrelation | HIGHER | TERMINAL_05 | 0.40251204616216707 | 4 | 78.57142857142857 | false |
| minCycleCorrelation | HIGHER | TERMINAL_08 | 0.3847881259862153 | 5 | 71.42857142857143 | false |
| minCycleCorrelation | HIGHER | TERMINAL_10 | 0.3629658012292609 | 6 | 64.28571428571429 | false |
| minCycleCorrelation | HIGHER | TERMINAL_03 | 0.35749690583205834 | 7 | 57.14285714285714 | false |
| minCycleCorrelation | HIGHER | TERMINAL_13 | 0.33399195093019646 | 8 | 50 | false |
| minCycleCorrelation | HIGHER | TERMINAL_07 | 0.3301330248661952 | 9 | 42.857142857142854 | false |
| minCycleCorrelation | HIGHER | TERMINAL_11 | 0.3265474726424586 | 10 | 35.714285714285715 | false |
| minCycleCorrelation | HIGHER | TERMINAL_09 | 0.32490559718286705 | 11 | 28.57142857142857 | false |
| minCycleCorrelation | HIGHER | TERMINAL_01 | 0.3127284371247655 | 12 | 21.428571428571427 | false |
| minCycleCorrelation | HIGHER | TERMINAL_14 | 0.31237161273850306 | 13 | 14.285714285714285 | false |
| minCycleCorrelation | HIGHER | TERMINAL_12 | 0.2504119191009703 | 14 | 7.142857142857142 | false |
| minCycleCorrelation | HIGHER | TERMINAL_06 | 0.20605303312654658 | 15 | 0 | false |
| cycleCorrelationStd | LOWER | GROUND_TRUTH_REFERENCE | 0.06501870282566592 | 1 | 100 | false |
| cycleCorrelationStd | LOWER | TERMINAL_02 | 0.09282431694904339 | 2 | 92.85714285714286 | false |
| cycleCorrelationStd | LOWER | TERMINAL_04 | 0.09291043314872222 | 3 | 85.71428571428571 | false |
| cycleCorrelationStd | LOWER | TERMINAL_05 | 0.09964503263037651 | 4 | 78.57142857142857 | false |
| cycleCorrelationStd | LOWER | TERMINAL_09 | 0.10013632960005919 | 5 | 71.42857142857143 | false |
| cycleCorrelationStd | LOWER | TERMINAL_13 | 0.11168051810161293 | 6 | 64.28571428571429 | false |
| cycleCorrelationStd | LOWER | TERMINAL_03 | 0.11584165126074751 | 7 | 57.14285714285714 | false |
| cycleCorrelationStd | LOWER | TERMINAL_14 | 0.11782522115113866 | 8 | 50 | false |
| cycleCorrelationStd | LOWER | TERMINAL_11 | 0.13854834568812988 | 9 | 42.857142857142854 | false |
| cycleCorrelationStd | LOWER | TERMINAL_07 | 0.1460355860797914 | 10 | 35.714285714285715 | false |
| cycleCorrelationStd | LOWER | TERMINAL_01 | 0.1519612538123109 | 11 | 28.57142857142857 | false |
| cycleCorrelationStd | LOWER | TERMINAL_12 | 0.16041361411484514 | 12 | 21.428571428571427 | false |
| cycleCorrelationStd | LOWER | TERMINAL_08 | 0.16163070879248106 | 13 | 14.285714285714285 | false |
| cycleCorrelationStd | LOWER | TERMINAL_10 | 0.1681730579850045 | 14 | 7.142857142857142 | false |
| cycleCorrelationStd | LOWER | TERMINAL_06 | 0.17463942141928632 | 15 | 0 | false |

## Classement par famille — résumé

| familyName | groundTruthRank | winnerRank | bestPathId | groundTruthFamilyScore | winnerFamilyScore | topFivePaths | groundTruthTop1 | groundTruthTop3 | groundTruthTop5 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| LOCAL_QUALITY_SCORE | 15 | 4 | TERMINAL_02 | -3 | 1.0140310493584126 | TERMINAL_02, TERMINAL_04, TERMINAL_03, TERMINAL_01, TERMINAL_06 | false | false | false |
| TEMPORAL_CONSISTENCY_SCORE | 1 | 6 | GROUND_TRUTH_REFERENCE | 2.75 | -0.2358958933658472 | GROUND_TRUTH_REFERENCE, TERMINAL_12, TERMINAL_14, TERMINAL_13, TERMINAL_07 | true | true | true |
| AMPLITUDE_CONSISTENCY_SCORE | 9 | 7 | TERMINAL_12 | 0.08461312150632543 | 0.15157888718184587 | TERMINAL_12, TERMINAL_13, TERMINAL_09, TERMINAL_07, TERMINAL_06 | false | false | false |
| COVERAGE_SCORE | 2.5 | 7 | TERMINAL_02 | 0.8307692307692305 | 0.34871794871794864 | TERMINAL_02, TERMINAL_11, GROUND_TRUTH_REFERENCE, TERMINAL_05, TERMINAL_04 | false | true | true |
| SHAPE_SIMILARITY_SCORE | 1 | 11 | GROUND_TRUTH_REFERENCE | 2.7040614464528994 | -0.5503570109021135 | GROUND_TRUTH_REFERENCE, TERMINAL_02, TERMINAL_04, TERMINAL_05, TERMINAL_08 | true | true | true |

## Scores complets par famille

| familyName | pathId | score | rank |
| --- | --- | --- | --- |
| LOCAL_QUALITY_SCORE | TERMINAL_02 | 1.3246324307040658 | 1 |
| LOCAL_QUALITY_SCORE | TERMINAL_04 | 1.0854234352163115 | 2 |
| LOCAL_QUALITY_SCORE | TERMINAL_03 | 1.0732142857142868 | 3 |
| LOCAL_QUALITY_SCORE | TERMINAL_01 | 1.0140310493584126 | 4 |
| LOCAL_QUALITY_SCORE | TERMINAL_06 | 0.8135684036583806 | 5 |
| LOCAL_QUALITY_SCORE | TERMINAL_05 | 0.8061899309026397 | 6 |
| LOCAL_QUALITY_SCORE | TERMINAL_11 | 0.43416355904732856 | 7 |
| LOCAL_QUALITY_SCORE | TERMINAL_09 | 0.08898809523809403 | 8 |
| LOCAL_QUALITY_SCORE | TERMINAL_07 | -0.07091051898074503 | 9 |
| LOCAL_QUALITY_SCORE | TERMINAL_08 | -0.2340342278018429 | 10 |
| LOCAL_QUALITY_SCORE | TERMINAL_10 | -0.3143437865152405 | 11 |
| LOCAL_QUALITY_SCORE | TERMINAL_12 | -0.8013610728465341 | 12 |
| LOCAL_QUALITY_SCORE | TERMINAL_13 | -0.9742980074126368 | 13 |
| LOCAL_QUALITY_SCORE | TERMINAL_14 | -1.268612724165534 | 14 |
| LOCAL_QUALITY_SCORE | GROUND_TRUTH_REFERENCE | -3 | 15 |
| TEMPORAL_CONSISTENCY_SCORE | GROUND_TRUTH_REFERENCE | 2.75 | 1 |
| TEMPORAL_CONSISTENCY_SCORE | TERMINAL_12 | 1.2068184376841704 | 2 |
| TEMPORAL_CONSISTENCY_SCORE | TERMINAL_14 | 1.1124582884754992 | 3 |
| TEMPORAL_CONSISTENCY_SCORE | TERMINAL_13 | 0.8172789175315291 | 4 |
| TEMPORAL_CONSISTENCY_SCORE | TERMINAL_07 | -0.17366123787561327 | 5 |
| TEMPORAL_CONSISTENCY_SCORE | TERMINAL_01 | -0.2358958933658472 | 6 |
| TEMPORAL_CONSISTENCY_SCORE | TERMINAL_03 | -0.3669812408749678 | 7 |
| TEMPORAL_CONSISTENCY_SCORE | TERMINAL_08 | -0.6461572658847279 | 8 |
| TEMPORAL_CONSISTENCY_SCORE | TERMINAL_06 | -0.6543573348542994 | 9 |
| TEMPORAL_CONSISTENCY_SCORE | TERMINAL_04 | -0.6876858317238104 | 10 |
| TEMPORAL_CONSISTENCY_SCORE | TERMINAL_10 | -0.7043612665117147 | 11 |
| TEMPORAL_CONSISTENCY_SCORE | TERMINAL_09 | -0.9400464666949452 | 12 |
| TEMPORAL_CONSISTENCY_SCORE | TERMINAL_05 | -1.0420684776008466 | 13 |
| TEMPORAL_CONSISTENCY_SCORE | TERMINAL_11 | -1.200395167880494 | 14 |
| TEMPORAL_CONSISTENCY_SCORE | TERMINAL_02 | -2.2093308610957143 | 15 |
| AMPLITUDE_CONSISTENCY_SCORE | TERMINAL_12 | 0.8587569942008324 | 1 |
| AMPLITUDE_CONSISTENCY_SCORE | TERMINAL_13 | 0.8305680057392922 | 2 |
| AMPLITUDE_CONSISTENCY_SCORE | TERMINAL_09 | 0.6672636278706833 | 3 |
| AMPLITUDE_CONSISTENCY_SCORE | TERMINAL_07 | 0.5733184081512496 | 4 |
| AMPLITUDE_CONSISTENCY_SCORE | TERMINAL_06 | 0.49778738484519885 | 5 |
| AMPLITUDE_CONSISTENCY_SCORE | TERMINAL_14 | 0.4919900069058188 | 6 |
| AMPLITUDE_CONSISTENCY_SCORE | TERMINAL_01 | 0.15157888718184587 | 7 |
| AMPLITUDE_CONSISTENCY_SCORE | TERMINAL_02 | 0.14909813908045608 | 8 |
| AMPLITUDE_CONSISTENCY_SCORE | GROUND_TRUTH_REFERENCE | 0.08461312150632543 | 9 |
| AMPLITUDE_CONSISTENCY_SCORE | TERMINAL_03 | -0.07855251544571928 | 10 |
| AMPLITUDE_CONSISTENCY_SCORE | TERMINAL_04 | -0.1046419232832196 | 11 |
| AMPLITUDE_CONSISTENCY_SCORE | TERMINAL_05 | -0.560458958517211 | 12 |
| AMPLITUDE_CONSISTENCY_SCORE | TERMINAL_08 | -0.5963624780702007 | 13 |
| AMPLITUDE_CONSISTENCY_SCORE | TERMINAL_10 | -0.6711285229253354 | 14 |
| AMPLITUDE_CONSISTENCY_SCORE | TERMINAL_11 | -1.1869949161540128 | 15 |
| COVERAGE_SCORE | TERMINAL_02 | 1.1384615384615382 | 1 |
| COVERAGE_SCORE | TERMINAL_11 | 0.8307692307692305 | 2.5 |
| COVERAGE_SCORE | GROUND_TRUTH_REFERENCE | 0.8307692307692305 | 2.5 |
| COVERAGE_SCORE | TERMINAL_05 | 0.81025641025641 | 4 |
| COVERAGE_SCORE | TERMINAL_04 | 0.6666666666666666 | 5 |
| COVERAGE_SCORE | TERMINAL_03 | 0.564102564102564 | 6 |
| COVERAGE_SCORE | TERMINAL_01 | 0.34871794871794864 | 7 |
| COVERAGE_SCORE | TERMINAL_08 | 0 | 8 |
| COVERAGE_SCORE | TERMINAL_10 | -0.01025641025641024 | 9 |
| COVERAGE_SCORE | TERMINAL_09 | -0.19487179487179485 | 10 |
| COVERAGE_SCORE | TERMINAL_06 | -0.3076923076923075 | 11 |
| COVERAGE_SCORE | TERMINAL_07 | -0.5128205128205126 | 12 |
| COVERAGE_SCORE | TERMINAL_13 | -0.8205128205128203 | 13 |
| COVERAGE_SCORE | TERMINAL_14 | -0.8717948717948714 | 14 |
| COVERAGE_SCORE | TERMINAL_12 | -0.9435897435897432 | 15 |
| SHAPE_SIMILARITY_SCORE | GROUND_TRUTH_REFERENCE | 2.7040614464528994 | 1 |
| SHAPE_SIMILARITY_SCORE | TERMINAL_02 | 1.66759354236234 | 2 |
| SHAPE_SIMILARITY_SCORE | TERMINAL_04 | 1.570575880206394 | 3 |
| SHAPE_SIMILARITY_SCORE | TERMINAL_05 | 1.0306918675237813 | 4 |
| SHAPE_SIMILARITY_SCORE | TERMINAL_08 | 1.000338990071027 | 5 |
| SHAPE_SIMILARITY_SCORE | TERMINAL_10 | 0.6620531211340976 | 6 |
| SHAPE_SIMILARITY_SCORE | TERMINAL_03 | 0.2472195411284811 | 7 |
| SHAPE_SIMILARITY_SCORE | TERMINAL_13 | -0.2514069224609517 | 8 |
| SHAPE_SIMILARITY_SCORE | TERMINAL_09 | -0.3602520297560326 | 9 |
| SHAPE_SIMILARITY_SCORE | TERMINAL_07 | -0.4199544572015566 | 10 |
| SHAPE_SIMILARITY_SCORE | TERMINAL_01 | -0.5503570109021135 | 11 |
| SHAPE_SIMILARITY_SCORE | TERMINAL_11 | -0.724929714056112 | 12 |
| SHAPE_SIMILARITY_SCORE | TERMINAL_14 | -0.9505499045647867 | 13 |
| SHAPE_SIMILARITY_SCORE | TERMINAL_12 | -1.6901084195701968 | 14 |
| SHAPE_SIMILARITY_SCORE | TERMINAL_06 | -1.8238694408115876 | 15 |

## Combinaisons — résumé

| comboName | groundTruthRank | legacyWinnerRank | winningPathId | groundTruthScore | winningScore | groundTruthGapToBest | pathsAheadOfGroundTruth | groundTruthTop1 | groundTruthTop3 | groundTruthTop5 | pathsAheadDetails |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| COMBO_A_TEMPORAL_ONLY | 1 | 6 | GROUND_TRUTH_REFERENCE | 2.75 | 2.75 | 0 | 0 | true | true | true |  |
| COMBO_B_SHAPE_ONLY | 1 | 11 | GROUND_TRUTH_REFERENCE | 2.7040614464528994 | 2.7040614464528994 | 0 | 0 | true | true | true |  |
| COMBO_C_TEMPORAL_SHAPE_EQUAL | 1 | 12 | GROUND_TRUTH_REFERENCE | 2.7270307232264495 | 2.7270307232264495 | 0 | 0 | true | true | true |  |
| COMBO_D_TEMPORAL_SHAPE_LOCAL | 1 | 8 | GROUND_TRUTH_REFERENCE | 1.5839215062585148 | 1.5839215062585148 | 0 | 0 | true | true | true |  |
| COMBO_E_TEMPORAL_SHAPE_COVERAGE | 1 | 10 | GROUND_TRUTH_REFERENCE | 2.350075352412361 | 2.350075352412361 | 0 | 0 | true | true | true |  |
| COMBO_F_BALANCED_WITHOUT_AMPLITUDE | 1 | 7 | GROUND_TRUTH_REFERENCE | 1.298333818551254 | 1.298333818551254 | 0 | 0 | true | true | true |  |
| COMBO_G_BALANCED_ALL_FAMILIES | 1 | 6 | GROUND_TRUTH_REFERENCE | 1.034092058379242 | 1.034092058379242 | 0 | 0 | true | true | true |  |
| COMBO_H_LEGACY_PLUS_GLOBAL_FEATURES | 1 | 7 | GROUND_TRUTH_REFERENCE | 1.298333818551254 | 1.298333818551254 | 0 | 0 | true | true | true |  |

## Classements complets des combinaisons

| comboName | pathId | score | rank | fullPath |
| --- | --- | --- | --- | --- |
| COMBO_A_TEMPORAL_ONLY | GROUND_TRUTH_REFERENCE | 2.75 | 1 | B(169) -> T(199) -> B(262) -> T(291) -> B(353) -> T(383) -> B(445) -> T(474) -> B(529) -> T(558) -> B(611) |
| COMBO_A_TEMPORAL_ONLY | TERMINAL_12 | 1.2068184376841704 | 2 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(438) |
| COMBO_A_TEMPORAL_ONLY | TERMINAL_14 | 1.1124582884754992 | 3 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(445) |
| COMBO_A_TEMPORAL_ONLY | TERMINAL_13 | 0.8172789175315291 | 4 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(450) |
| COMBO_A_TEMPORAL_ONLY | TERMINAL_07 | -0.17366123787561327 | 5 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(480) |
| COMBO_A_TEMPORAL_ONLY | TERMINAL_01 | -0.2358958933658472 | 6 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(564) |
| COMBO_A_TEMPORAL_ONLY | TERMINAL_03 | -0.3669812408749678 | 7 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(585) |
| COMBO_A_TEMPORAL_ONLY | TERMINAL_08 | -0.6461572658847279 | 8 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(530) |
| COMBO_A_TEMPORAL_ONLY | TERMINAL_06 | -0.6543573348542994 | 9 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(500) |
| COMBO_A_TEMPORAL_ONLY | TERMINAL_04 | -0.6876858317238104 | 10 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(595) |
| COMBO_A_TEMPORAL_ONLY | TERMINAL_10 | -0.7043612665117147 | 11 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(529) |
| COMBO_A_TEMPORAL_ONLY | TERMINAL_09 | -0.9400464666949452 | 12 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(511) |
| COMBO_A_TEMPORAL_ONLY | TERMINAL_05 | -1.0420684776008466 | 13 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(609) |
| COMBO_A_TEMPORAL_ONLY | TERMINAL_11 | -1.200395167880494 | 14 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(611) |
| COMBO_A_TEMPORAL_ONLY | TERMINAL_02 | -2.2093308610957143 | 15 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(641) |
| COMBO_B_SHAPE_ONLY | GROUND_TRUTH_REFERENCE | 2.7040614464528994 | 1 | B(169) -> T(199) -> B(262) -> T(291) -> B(353) -> T(383) -> B(445) -> T(474) -> B(529) -> T(558) -> B(611) |
| COMBO_B_SHAPE_ONLY | TERMINAL_02 | 1.66759354236234 | 2 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(641) |
| COMBO_B_SHAPE_ONLY | TERMINAL_04 | 1.570575880206394 | 3 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(595) |
| COMBO_B_SHAPE_ONLY | TERMINAL_05 | 1.0306918675237813 | 4 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(609) |
| COMBO_B_SHAPE_ONLY | TERMINAL_08 | 1.000338990071027 | 5 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(530) |
| COMBO_B_SHAPE_ONLY | TERMINAL_10 | 0.6620531211340976 | 6 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(529) |
| COMBO_B_SHAPE_ONLY | TERMINAL_03 | 0.2472195411284811 | 7 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(585) |
| COMBO_B_SHAPE_ONLY | TERMINAL_13 | -0.2514069224609517 | 8 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(450) |
| COMBO_B_SHAPE_ONLY | TERMINAL_09 | -0.3602520297560326 | 9 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(511) |
| COMBO_B_SHAPE_ONLY | TERMINAL_07 | -0.4199544572015566 | 10 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(480) |
| COMBO_B_SHAPE_ONLY | TERMINAL_01 | -0.5503570109021135 | 11 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(564) |
| COMBO_B_SHAPE_ONLY | TERMINAL_11 | -0.724929714056112 | 12 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(611) |
| COMBO_B_SHAPE_ONLY | TERMINAL_14 | -0.9505499045647867 | 13 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(445) |
| COMBO_B_SHAPE_ONLY | TERMINAL_12 | -1.6901084195701968 | 14 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(438) |
| COMBO_B_SHAPE_ONLY | TERMINAL_06 | -1.8238694408115876 | 15 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(500) |
| COMBO_C_TEMPORAL_SHAPE_EQUAL | GROUND_TRUTH_REFERENCE | 2.7270307232264495 | 1 | B(169) -> T(199) -> B(262) -> T(291) -> B(353) -> T(383) -> B(445) -> T(474) -> B(529) -> T(558) -> B(611) |
| COMBO_C_TEMPORAL_SHAPE_EQUAL | TERMINAL_04 | 0.44144502424129184 | 2 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(595) |
| COMBO_C_TEMPORAL_SHAPE_EQUAL | TERMINAL_13 | 0.28293599753528875 | 3 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(450) |
| COMBO_C_TEMPORAL_SHAPE_EQUAL | TERMINAL_08 | 0.1770908620931495 | 4 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(530) |
| COMBO_C_TEMPORAL_SHAPE_EQUAL | TERMINAL_14 | 0.08095419195535625 | 5 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(445) |
| COMBO_C_TEMPORAL_SHAPE_EQUAL | TERMINAL_05 | -0.005688305038532682 | 6 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(609) |
| COMBO_C_TEMPORAL_SHAPE_EQUAL | TERMINAL_10 | -0.021154072688808534 | 7 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(529) |
| COMBO_C_TEMPORAL_SHAPE_EQUAL | TERMINAL_03 | -0.05988084987324335 | 8 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(585) |
| COMBO_C_TEMPORAL_SHAPE_EQUAL | TERMINAL_12 | -0.24164499094301317 | 9 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(438) |
| COMBO_C_TEMPORAL_SHAPE_EQUAL | TERMINAL_02 | -0.27086865936668714 | 10 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(641) |
| COMBO_C_TEMPORAL_SHAPE_EQUAL | TERMINAL_07 | -0.2968078475385849 | 11 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(480) |
| COMBO_C_TEMPORAL_SHAPE_EQUAL | TERMINAL_01 | -0.39312645213398034 | 12 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(564) |
| COMBO_C_TEMPORAL_SHAPE_EQUAL | TERMINAL_09 | -0.6501492482254889 | 13 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(511) |
| COMBO_C_TEMPORAL_SHAPE_EQUAL | TERMINAL_11 | -0.962662440968303 | 14 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(611) |
| COMBO_C_TEMPORAL_SHAPE_EQUAL | TERMINAL_06 | -1.2391133878329434 | 15 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(500) |
| COMBO_D_TEMPORAL_SHAPE_LOCAL | GROUND_TRUTH_REFERENCE | 1.5839215062585148 | 1 | B(169) -> T(199) -> B(262) -> T(291) -> B(353) -> T(383) -> B(445) -> T(474) -> B(529) -> T(558) -> B(611) |
| COMBO_D_TEMPORAL_SHAPE_LOCAL | TERMINAL_04 | 0.4573276208397855 | 2 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(595) |
| COMBO_D_TEMPORAL_SHAPE_LOCAL | TERMINAL_03 | 0.13602813814409023 | 3 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(585) |
| COMBO_D_TEMPORAL_SHAPE_LOCAL | TERMINAL_13 | 0.08492348854532769 | 4 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(450) |
| COMBO_D_TEMPORAL_SHAPE_LOCAL | TERMINAL_05 | 0.053049324893470334 | 5 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(609) |
| COMBO_D_TEMPORAL_SHAPE_LOCAL | TERMINAL_08 | 0.01254103131636329 | 6 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(530) |
| COMBO_D_TEMPORAL_SHAPE_LOCAL | TERMINAL_14 | -0.0858087816168075 | 7 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(445) |
| COMBO_D_TEMPORAL_SHAPE_LOCAL | TERMINAL_01 | -0.09597189595868844 | 8 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(564) |
| COMBO_D_TEMPORAL_SHAPE_LOCAL | TERMINAL_02 | -0.14561466152543934 | 9 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(641) |
| COMBO_D_TEMPORAL_SHAPE_LOCAL | TERMINAL_10 | -0.14811273483638554 | 10 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(529) |
| COMBO_D_TEMPORAL_SHAPE_LOCAL | TERMINAL_12 | -0.20874186446099896 | 11 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(438) |
| COMBO_D_TEMPORAL_SHAPE_LOCAL | TERMINAL_07 | -0.2393137208607198 | 12 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(480) |
| COMBO_D_TEMPORAL_SHAPE_LOCAL | TERMINAL_09 | -0.5313115013797179 | 13 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(511) |
| COMBO_D_TEMPORAL_SHAPE_LOCAL | TERMINAL_11 | -0.7070705136563957 | 14 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(611) |
| COMBO_D_TEMPORAL_SHAPE_LOCAL | TERMINAL_06 | -0.7701014242368142 | 15 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(500) |
| COMBO_E_TEMPORAL_SHAPE_COVERAGE | GROUND_TRUTH_REFERENCE | 2.350075352412361 | 1 | B(169) -> T(199) -> B(262) -> T(291) -> B(353) -> T(383) -> B(445) -> T(474) -> B(529) -> T(558) -> B(611) |
| COMBO_E_TEMPORAL_SHAPE_COVERAGE | TERMINAL_04 | 0.3735762671298565 | 2 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(595) |
| COMBO_E_TEMPORAL_SHAPE_COVERAGE | TERMINAL_13 | 0.11568052592529099 | 3 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(450) |
| COMBO_E_TEMPORAL_SHAPE_COVERAGE | TERMINAL_08 | 0.059347876876731875 | 4 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(530) |
| COMBO_E_TEMPORAL_SHAPE_COVERAGE | TERMINAL_05 | 0.053862620764224406 | 5 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(609) |
| COMBO_E_TEMPORAL_SHAPE_COVERAGE | TERMINAL_03 | 0.034205793821745684 | 6 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(585) |
| COMBO_E_TEMPORAL_SHAPE_COVERAGE | TERMINAL_14 | -0.006445211142674989 | 7 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(445) |
| COMBO_E_TEMPORAL_SHAPE_COVERAGE | TERMINAL_10 | -0.0872952595846195 | 8 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(529) |
| COMBO_E_TEMPORAL_SHAPE_COVERAGE | TERMINAL_02 | -0.18284883997394485 | 9 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(641) |
| COMBO_E_TEMPORAL_SHAPE_COVERAGE | TERMINAL_01 | -0.22903451608678121 | 10 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(564) |
| COMBO_E_TEMPORAL_SHAPE_COVERAGE | TERMINAL_12 | -0.23718759860964078 | 11 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(438) |
| COMBO_E_TEMPORAL_SHAPE_COVERAGE | TERMINAL_07 | -0.32769571962867333 | 12 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(480) |
| COMBO_E_TEMPORAL_SHAPE_COVERAGE | TERMINAL_09 | -0.5880834794016957 | 13 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(511) |
| COMBO_E_TEMPORAL_SHAPE_COVERAGE | TERMINAL_11 | -0.6277493793120154 | 14 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(611) |
| COMBO_E_TEMPORAL_SHAPE_COVERAGE | TERMINAL_06 | -0.9943535665069518 | 15 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(500) |
| COMBO_F_BALANCED_WITHOUT_AMPLITUDE | GROUND_TRUTH_REFERENCE | 1.298333818551254 | 1 | B(169) -> T(199) -> B(262) -> T(291) -> B(353) -> T(383) -> B(445) -> T(474) -> B(529) -> T(558) -> B(611) |
| COMBO_F_BALANCED_WITHOUT_AMPLITUDE | TERMINAL_04 | 0.5475674100018469 | 2 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(595) |
| COMBO_F_BALANCED_WITHOUT_AMPLITUDE | TERMINAL_03 | 0.24498066979054756 | 3 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(585) |
| COMBO_F_BALANCED_WITHOUT_AMPLITUDE | TERMINAL_05 | 0.2272600408158275 | 4 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(609) |
| COMBO_F_BALANCED_WITHOUT_AMPLITUDE | TERMINAL_02 | 0.1627079782352459 | 5 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(641) |
| COMBO_F_BALANCED_WITHOUT_AMPLITUDE | TERMINAL_08 | 0.02713980840128473 | 6 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(530) |
| COMBO_F_BALANCED_WITHOUT_AMPLITUDE | TERMINAL_01 | 0.007443236230694254 | 7 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(564) |
| COMBO_F_BALANCED_WITHOUT_AMPLITUDE | TERMINAL_13 | -0.10731098016170074 | 8 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(450) |
| COMBO_F_BALANCED_WITHOUT_AMPLITUDE | TERMINAL_10 | -0.11231772578038049 | 9 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(529) |
| COMBO_F_BALANCED_WITHOUT_AMPLITUDE | TERMINAL_07 | -0.2778729511361575 | 10 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(480) |
| COMBO_F_BALANCED_WITHOUT_AMPLITUDE | TERMINAL_14 | -0.2802963460053488 | 11 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(445) |
| COMBO_F_BALANCED_WITHOUT_AMPLITUDE | TERMINAL_12 | -0.38645674878936764 | 12 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(438) |
| COMBO_F_BALANCED_WITHOUT_AMPLITUDE | TERMINAL_11 | -0.42616912655015615 | 13 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(611) |
| COMBO_F_BALANCED_WITHOUT_AMPLITUDE | TERMINAL_09 | -0.44852502245319104 | 14 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(511) |
| COMBO_F_BALANCED_WITHOUT_AMPLITUDE | TERMINAL_06 | -0.6596260648646509 | 15 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(500) |
| COMBO_G_BALANCED_ALL_FAMILIES | GROUND_TRUTH_REFERENCE | 1.034092058379242 | 1 | B(169) -> T(199) -> B(262) -> T(291) -> B(353) -> T(383) -> B(445) -> T(474) -> B(529) -> T(558) -> B(611) |
| COMBO_G_BALANCED_ALL_FAMILIES | TERMINAL_04 | 0.4929587152493957 | 2 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(595) |
| COMBO_G_BALANCED_ALL_FAMILIES | TERMINAL_03 | 0.24311350323329997 | 3 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(585) |
| COMBO_G_BALANCED_ALL_FAMILIES | TERMINAL_02 | 0.20470465807996027 | 4 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(641) |
| COMBO_G_BALANCED_ALL_FAMILIES | TERMINAL_05 | 0.17178297546795973 | 5 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(609) |
| COMBO_G_BALANCED_ALL_FAMILIES | TERMINAL_01 | 0.06191377016227687 | 6 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(564) |
| COMBO_G_BALANCED_ALL_FAMILIES | TERMINAL_08 | -0.05020552561505028 | 7 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(530) |
| COMBO_G_BALANCED_ALL_FAMILIES | TERMINAL_13 | -0.052547779341300366 | 8 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(450) |
| COMBO_G_BALANCED_ALL_FAMILIES | TERMINAL_10 | -0.17731517080403314 | 9 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(529) |
| COMBO_G_BALANCED_ALL_FAMILIES | TERMINAL_07 | -0.19086032556717406 | 10 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(480) |
| COMBO_G_BALANCED_ALL_FAMILIES | TERMINAL_14 | -0.23919276451030255 | 11 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(445) |
| COMBO_G_BALANCED_ALL_FAMILIES | TERMINAL_12 | -0.27641655027498313 | 12 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(438) |
| COMBO_G_BALANCED_ALL_FAMILIES | TERMINAL_09 | -0.3167837348435738 | 13 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(511) |
| COMBO_G_BALANCED_ALL_FAMILIES | TERMINAL_11 | -0.44860237406872716 | 14 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(611) |
| COMBO_G_BALANCED_ALL_FAMILIES | TERMINAL_06 | -0.48593598759683676 | 15 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(500) |
| COMBO_H_LEGACY_PLUS_GLOBAL_FEATURES | GROUND_TRUTH_REFERENCE | 1.298333818551254 | 1 | B(169) -> T(199) -> B(262) -> T(291) -> B(353) -> T(383) -> B(445) -> T(474) -> B(529) -> T(558) -> B(611) |
| COMBO_H_LEGACY_PLUS_GLOBAL_FEATURES | TERMINAL_04 | 0.5304827229585846 | 2 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(595) |
| COMBO_H_LEGACY_PLUS_GLOBAL_FEATURES | TERMINAL_03 | 0.23637947931435688 | 3 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(585) |
| COMBO_H_LEGACY_PLUS_GLOBAL_FEATURES | TERMINAL_05 | 0.16685538796863286 | 4 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(609) |
| COMBO_H_LEGACY_PLUS_GLOBAL_FEATURES | TERMINAL_02 | 0.15882315876109948 | 5 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(641) |
| COMBO_H_LEGACY_PLUS_GLOBAL_FEATURES | TERMINAL_08 | 0.07394665396165331 | 6 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(530) |
| COMBO_H_LEGACY_PLUS_GLOBAL_FEATURES | TERMINAL_01 | 0.0663036930256784 | 7 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(564) |
| COMBO_H_LEGACY_PLUS_GLOBAL_FEATURES | TERMINAL_10 | -0.06340730181066571 | 8 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(529) |
| COMBO_H_LEGACY_PLUS_GLOBAL_FEATURES | TERMINAL_07 | -0.21369084734000848 | 9 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(480) |
| COMBO_H_LEGACY_PLUS_GLOBAL_FEATURES | TERMINAL_13 | -0.30328471201250673 | 10 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(450) |
| COMBO_H_LEGACY_PLUS_GLOBAL_FEATURES | TERMINAL_09 | -0.46778097483414316 | 11 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(511) |
| COMBO_H_LEGACY_PLUS_GLOBAL_FEATURES | TERMINAL_14 | -0.48844880117224204 | 12 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(445) |
| COMBO_H_LEGACY_PLUS_GLOBAL_FEATURES | TERMINAL_11 | -0.5348768383596219 | 13 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(611) |
| COMBO_H_LEGACY_PLUS_GLOBAL_FEATURES | TERMINAL_12 | -0.6105595342200608 | 14 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(438) |
| COMBO_H_LEGACY_PLUS_GLOBAL_FEATURES | TERMINAL_06 | -0.7327564122629937 | 15 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(500) |

## Sensibilité limitée

| comboName | testedVariantCount | groundTruthBestRank | groundTruthWorstRank | groundTruthMedianRank | top1Count | top3Count | outsideTop5Count |
| --- | --- | --- | --- | --- | --- | --- | --- |
| COMBO_C_TEMPORAL_SHAPE_EQUAL | 4 | 1 | 1 | 1 | 4 | 4 | 0 |
| COMBO_D_TEMPORAL_SHAPE_LOCAL | 6 | 1 | 1 | 1 | 6 | 6 | 0 |
| COMBO_E_TEMPORAL_SHAPE_COVERAGE | 6 | 1 | 1 | 1 | 6 | 6 | 0 |
| COMBO_F_BALANCED_WITHOUT_AMPLITUDE | 8 | 1 | 1 | 1 | 8 | 8 | 0 |

## Redondance des métriques — Spearman |r| >= 0.85

| metricA | metricB | spearmanCorrelation | absoluteCorrelation |
| --- | --- | --- | --- |
| meanNormalizedProminence | medianNormalizedProminence | 0.8664763412811685 | 0.8664763412811685 |
| meanNormalizedProminence | meanProminenceToNoiseRatio | 0.9607142857142857 | 0.9607142857142857 |
| meanNormalizedProminence | bottomToTopDurationCV | 0.8557343539947815 | 0.8557343539947815 |
| meanNormalizedProminence | bottomToTopDurationRange | 0.9043210435225024 | 0.9043210435225024 |
| medianNormalizedProminence | meanProminenceToNoiseRatio | 0.8944271909999159 | 0.8944271909999159 |
| medianNormalizedProminence | bottomToTopDurationRange | 0.8865258844007743 | 0.8865258844007743 |
| meanProminenceToNoiseRatio | bottomToTopDurationCV | 0.8557343539947815 | 0.8557343539947815 |
| meanProminenceToNoiseRatio | bottomToTopDurationRange | 0.9043210435225024 | 0.9043210435225024 |
| fullRepDurationMAD | topToBottomDurationCV | 0.9117774519261347 | 0.9117774519261347 |
| fullRepDurationMAD | topToBottomDurationRange | 0.8760488427065733 | 0.8760488427065733 |
| bottomToTopDurationCV | bottomToTopDurationRange | 0.9853579210409482 | 0.9853579210409482 |
| bottomToTopDurationCV | topToBottomDurationRange | 0.9317273293552678 | 0.9317273293552678 |
| bottomToTopDurationCV | cycleAmplitudeMAD | 0.9186046511627907 | 0.9186046511627907 |
| bottomToTopDurationRange | topToBottomDurationRange | 0.8992587222765045 | 0.8992587222765045 |
| bottomToTopDurationRange | cycleAmplitudeMAD | 0.8909523717196598 | 0.8909523717196598 |
| topToBottomDurationRange | cycleAmplitudeMAD | 0.8518649868391021 | 0.8518649868391021 |
| cycleAmplitudeMAD | maxBottomDrift | -0.889243760266593 | 0.889243760266593 |
| cycleAmplitudeMAD | coverageRatio | 0.8574304049679377 | 0.8574304049679377 |
| cycleAmplitudeMAD | unselectedSuffixSamples | -0.8574304049679377 | 0.8574304049679377 |
| cycleAmplitudeMAD | selectedSpanSamples | 0.8574304049679377 | 0.8574304049679377 |
| meanBottomDrift | maxBottomDrift | 0.9512516197964441 | 0.9512516197964441 |
| coverageRatio | unselectedSuffixSamples | -1 | 1 |
| coverageRatio | selectedSpanSamples | 1 | 1 |
| unselectedSuffixSamples | selectedSpanSamples | -1 | 1 |

## Chaînes devant la Ground Truth

| comboName | pathsAheadOfGroundTruth | details |
| --- | --- | --- |
| COMBO_A_TEMPORAL_ONLY | 0 |  |
| COMBO_B_SHAPE_ONLY | 0 |  |
| COMBO_C_TEMPORAL_SHAPE_EQUAL | 0 |  |
| COMBO_D_TEMPORAL_SHAPE_LOCAL | 0 |  |
| COMBO_E_TEMPORAL_SHAPE_COVERAGE | 0 |  |
| COMBO_F_BALANCED_WITHOUT_AMPLITUDE | 0 |  |
| COMBO_G_BALANCED_ALL_FAMILIES | 0 |  |
| COMBO_H_LEGACY_PLUS_GLOBAL_FEATURES | 0 |  |

## Graphiques

- C:\dev\RepMotion-core\RepMotion\tools\ground-truth\output\dp-v2-path-ranking-analysis\metric_ground_truth_ranks.png
- C:\dev\RepMotion-core\RepMotion\tools\ground-truth\output\dp-v2-path-ranking-analysis\family_score_ranking.png
- C:\dev\RepMotion-core\RepMotion\tools\ground-truth\output\dp-v2-path-ranking-analysis\combination_ground_truth_ranks.png
- C:\dev\RepMotion-core\RepMotion\tools\ground-truth\output\dp-v2-path-ranking-analysis\top_paths_temporal_vs_shape.png
- C:\dev\RepMotion-core\RepMotion\tools\ground-truth\output\dp-v2-path-ranking-analysis\feature_correlation_matrix.png
- C:\dev\RepMotion-core\RepMotion\tools\ground-truth\output\dp-v2-path-ranking-analysis\combination_sensitivity.png

## Limites

- Une seule vidéo annotée.
- Ground Truth utilisée pour l'analyse.
- Poids non généralisables.
- Aucun score de production validé.
- Aucune conclusion biomécanique universelle.

## Décision humaine pour DP V2
