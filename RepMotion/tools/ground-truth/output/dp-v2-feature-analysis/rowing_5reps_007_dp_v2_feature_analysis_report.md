# Rowing 5 reps 007 — DP V2 feature analysis

## Contexte et chaînes comparées

- CURRENT_DP_WINNER: B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(564)
- GROUND_TRUTH_PATH: B(169) -> T(199) -> B(262) -> T(291) -> B(353) -> T(383) -> B(445) -> T(474) -> B(529) -> T(558) -> B(611)

## Définitions

- Axe brut: az.
- robustSignalRange: 4000, valeur instrumentée par calibration.
- Prominence réelle: diagnostic PROMINENCE de calibration lorsqu'il existe.
- Prominence injectée: DESCRIPTIVE_RECOMPUTATION sur la fenêtre future de 8 samples; elle n'est pas présentée comme une valeur interne officielle.
- Bruit local: médiane des différences absolues consécutives dans la fenêtre ±8 samples.
- Écart-type: population.
- Zone active descriptive: étendue min–max de tous les candidats réels admissibles entrant dans le DP; aucun détecteur d'activité supplémentaire.
- Cycles: interpolation linéaire à 100 points, profil médian point par point, corrélation de Pearson.
- Changements brusques: écart à la médiane des différences successives supérieur à 3 × MAD; mesure descriptive uniquement.

## Tableau A — Événements

| pathName | positionInPath | eventLabel | type | index | rawSignalValue | localProminence | robustNormalizedProminence | localNoiseEstimate | prominenceToNoiseRatio | directionChangeMagnitude | directionChangeConfidence | snapDistanceSamples | candidateSource | prominenceSource |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CURRENT_DP_WINNER | 1 | B1 | BOTTOM | 169 | 14604 | 6360 | 1.59 | 896 | 7.098214285714286 | 3751 |  |  | REAL_CANDIDATE | CALIBRATION_DEBUG |
| CURRENT_DP_WINNER | 2 | T1 | TOP | 195 | 24256 | 7624 | 1.906 | 1366 | 5.581259150805271 | 5225.5 |  |  | REAL_CANDIDATE | CALIBRATION_DEBUG |
| CURRENT_DP_WINNER | 3 | B2 | BOTTOM | 228 | 14568 | 5612 | 1.403 | 2256 | 2.4875886524822697 | 4201.5 |  |  | REAL_CANDIDATE | CALIBRATION_DEBUG |
| CURRENT_DP_WINNER | 4 | T2 | TOP | 291 | 26248 | 9772 | 2.443 | 2418 | 4.041356492969396 | 7603.5 |  |  | REAL_CANDIDATE | CALIBRATION_DEBUG |
| CURRENT_DP_WINNER | 5 | B3 | BOTTOM | 299 | 11676 | 8220 | 2.055 | 2454 | 3.349633251833741 | 5259 |  |  | REAL_CANDIDATE | CALIBRATION_DEBUG |
| CURRENT_DP_WINNER | 6 | T3 | TOP | 333 | 24424 | 6684 | 1.671 | 1352 | 4.943786982248521 | 5640.5 |  |  | REAL_CANDIDATE | CALIBRATION_DEBUG |
| CURRENT_DP_WINNER | 7 | B4 | BOTTOM | 391 | 9644 | 8356 | 2.089 | 2108 | 3.9639468690702087 | 6765 |  |  | REAL_CANDIDATE | CALIBRATION_DEBUG |
| CURRENT_DP_WINNER | 8 | T4 | TOP | 467 | 26536 | 10880 | 2.72 | 1056 | 10.303030303030303 | 7161.5 |  |  | REAL_CANDIDATE | CALIBRATION_DEBUG |
| CURRENT_DP_WINNER | 9 | B5 | BOTTOM | 500 | 12564 | 8920 | 2.23 | 1524 | 5.853018372703412 | 7973 |  |  | REAL_CANDIDATE | CALIBRATION_DEBUG |
| CURRENT_DP_WINNER | 10 | T5 | TOP | 509 | 23212 | 8900 | 2.225 | 2654 | 3.353428786737001 | 4905 |  |  | REAL_CANDIDATE | CALIBRATION_DEBUG |
| CURRENT_DP_WINNER | 11 | B6 | BOTTOM | 564 | 13444 | 5416 | 1.354 | 1570 | 3.4496815286624205 | 3891.5 |  |  | REAL_CANDIDATE | CALIBRATION_DEBUG |
| GROUND_TRUTH_PATH | 1 | B1 | BOTTOM | 169 | 14604 | 6360 | 1.59 | 896 | 7.098214285714286 | 3751 |  |  | EXISTED_BEFORE_INJECTION | CALIBRATION_DEBUG |
| GROUND_TRUTH_PATH | 2 | T1 | TOP | 199 | 19844 | 4104 | 1.026 | 3196 | 1.2841051314142677 |  |  |  | INJECTED_GROUND_TRUTH | DESCRIPTIVE_RECOMPUTATION |
| GROUND_TRUTH_PATH | 3 | B2 | BOTTOM | 262 | 17972 | 1976 | 0.494 | 606 | 3.2607260726072607 |  |  |  | INJECTED_GROUND_TRUTH | DESCRIPTIVE_RECOMPUTATION |
| GROUND_TRUTH_PATH | 4 | T2 | TOP | 291 | 26248 | 9772 | 2.443 | 2418 | 4.041356492969396 | 7603.5 |  |  | EXISTED_BEFORE_INJECTION | CALIBRATION_DEBUG |
| GROUND_TRUTH_PATH | 5 | B3 | BOTTOM | 353 | 20092 | 0 | 0 | 886 | 0 |  |  |  | INJECTED_GROUND_TRUTH | DESCRIPTIVE_RECOMPUTATION |
| GROUND_TRUTH_PATH | 6 | T3 | TOP | 383 | 17804 | 3536 | 0.884 | 2912 | 1.2142857142857142 |  |  |  | INJECTED_GROUND_TRUTH | DESCRIPTIVE_RECOMPUTATION |
| GROUND_TRUTH_PATH | 7 | B4 | BOTTOM | 445 | 19300 | 0 | 0 | 820 | 0 |  |  |  | INJECTED_GROUND_TRUTH | DESCRIPTIVE_RECOMPUTATION |
| GROUND_TRUTH_PATH | 8 | T4 | TOP | 474 | 15656 | 2332 | 0.583 | 2254 | 1.0346051464063886 |  |  |  | INJECTED_GROUND_TRUTH | DESCRIPTIVE_RECOMPUTATION |
| GROUND_TRUTH_PATH | 9 | B5 | BOTTOM | 529 | 17976 | 1600 | 0.4 | 1050 | 1.5238095238095237 |  |  |  | INJECTED_GROUND_TRUTH | DESCRIPTIVE_RECOMPUTATION |
| GROUND_TRUTH_PATH | 10 | T5 | TOP | 558 | 17932 | 4488 | 1.122 | 1568 | 2.8622448979591835 |  |  |  | INJECTED_GROUND_TRUTH | DESCRIPTIVE_RECOMPUTATION |
| GROUND_TRUTH_PATH | 11 | B6 | BOTTOM | 611 | 18888 | 852 | 0.213 | 1530 | 0.5568627450980392 |  |  |  | INJECTED_GROUND_TRUTH | DESCRIPTIVE_RECOMPUTATION |

## Tableau B — Répétitions

| pathName | repNumber | bottomStartIndex | topIndex | bottomEndIndex | bottomToTopDurationSamples | topToBottomDurationSamples | fullRepDurationSamples | bottomToTopDurationMilliseconds | topToBottomDurationMilliseconds | fullRepDurationMilliseconds | phaseDurationRatio | startBottomValue | topValue | endBottomValue | upwardAmplitude | downwardAmplitude | meanCycleAmplitude | normalizedCycleAmplitude | bottomDrift | correlationToMedianCycle |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CURRENT_DP_WINNER | 1 | 169 | 195 | 228 | 26 | 33 | 59 | 1300 | 1650 | 2950 | 0.7878787878787878 | 14604 | 24256 | 14568 | 9652 | 9688 | 9670 | 2.4175 | 36 | 0.3127284371247655 |
| CURRENT_DP_WINNER | 2 | 228 | 291 | 299 | 63 | 8 | 71 | 3150 | 400 | 3550 | 7.875 | 14568 | 26248 | 11676 | 11680 | 14572 | 13126 | 3.2815 | 2892 | 0.5810435499764516 |
| CURRENT_DP_WINNER | 3 | 299 | 333 | 391 | 34 | 58 | 92 | 1700 | 2900 | 4600 | 0.5862068965517241 | 11676 | 24424 | 9644 | 12748 | 14780 | 13764 | 3.441 | 2032 | 0.78901811719015 |
| CURRENT_DP_WINNER | 4 | 391 | 467 | 500 | 76 | 33 | 109 | 3800 | 1650 | 5450 | 2.303030303030303 | 9644 | 26536 | 12564 | 16892 | 13972 | 15432 | 3.858 | 2920 | 0.5179176677612356 |
| CURRENT_DP_WINNER | 5 | 500 | 509 | 564 | 9 | 55 | 64 | 450 | 2750 | 3200 | 0.16363636363636364 | 12564 | 23212 | 13444 | 10648 | 9768 | 10208 | 2.552 | 880 | 0.5573188619576567 |
| GROUND_TRUTH_PATH | 1 | 169 | 199 | 262 | 30 | 63 | 93 | 1500 | 3150 | 4650 | 0.47619047619047616 | 14604 | 19844 | 17972 | 5240 | 1872 | 3556 | 0.889 | 3368 | 0.5127806575493022 |
| GROUND_TRUTH_PATH | 2 | 262 | 291 | 353 | 29 | 62 | 91 | 1450 | 3100 | 4550 | 0.46774193548387094 | 17972 | 26248 | 20092 | 8276 | 6156 | 7216 | 1.804 | 2120 | 0.711417829986251 |
| GROUND_TRUTH_PATH | 3 | 353 | 383 | 445 | 30 | 62 | 92 | 1500 | 3100 | 4600 | 0.4838709677419355 | 20092 | 17804 | 19300 | 2288 | 1496 | 1892 | 0.473 | 792 | 0.6466210043910802 |
| GROUND_TRUTH_PATH | 4 | 445 | 474 | 529 | 29 | 55 | 84 | 1450 | 2750 | 4200 | 0.5272727272727272 | 19300 | 15656 | 17976 | 3644 | 2320 | 2982 | 0.7455 | 1324 | 0.6515229485631417 |
| GROUND_TRUTH_PATH | 5 | 529 | 558 | 611 | 29 | 53 | 82 | 1450 | 2650 | 4100 | 0.5471698113207547 | 17976 | 17932 | 18888 | 44 | 956 | 500 | 0.125 | 912 | 0.6244825415848818 |

## Tableau C — Synthèse

| pathName | finalLegacyDpScore | meanNormalizedProminence | medianNormalizedProminence | meanProminenceToNoiseRatio | meanBottomToTopDuration | medianBottomToTopDuration | stdBottomToTopDurationPopulation | bottomToTopDurationCV | meanTopToBottomDuration | medianTopToBottomDuration | stdTopToBottomDurationPopulation | topToBottomDurationCV | meanFullRepDuration | medianFullRepDuration | stdFullRepDurationPopulation | fullRepDurationCV | fullRepDurationMAD | minFullRepDuration | maxFullRepDuration | fullRepDurationRange | meanCycleAmplitude | medianCycleAmplitude | stdCycleAmplitudePopulation | cycleAmplitudeCV | cycleAmplitudeMAD | minCycleAmplitude | maxCycleAmplitude | cycleAmplitudeRange | meanBottomDrift | maxBottomDrift | firstSelectedIndex | lastSelectedIndex | selectedSpanSamples | selectedSpanMilliseconds | activeRegionStartIndex | activeRegionEndIndex | activeRegionSpanSamples | coverageRatio | unselectedPrefixSamples | unselectedSuffixSamples | largestGapBetweenSelectedEvents | meanGapBetweenSelectedEvents | numberOfLargeUnexplainedOscillations | meanCycleCorrelation | medianCycleCorrelation | minCycleCorrelation | cycleCorrelationStdPopulation |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CURRENT_DP_WINNER | 48176 | 1.9714545454545453 | 2.055 | 4.9477222432960755 | 41.6 | 34 | 24.5161171477051 | 0.5893297391275264 | 37.4 | 33 | 18.095303258028032 | 0.483831637915188 | 79 | 71 | 18.750999973334757 | 0.2373544300422121 | 12 | 59 | 109 | 50 | 12440 | 13126 | 2183.13352775317 | 0.17549304885475642 | 2306 | 9670 | 15432 | 5762 | 1752 | 2920 | 169 | 564 | 395 | 19750 | 169 | 641 | 472 | 0.836864406779661 | 0 | 77 | 76 | 39.5 | ACTIVITY_REGION_DIAGNOSTIC_UNAVAILABLE | 0.5516053268020519 | 0.5573188619576567 | 0.3127284371247655 | 0.1519612538123109 |
| GROUND_TRUTH_PATH | -11348 | 0.795909090909091 | 0.583 | 2.079655455478551 | 29.4 | 29 | 0.4898979485566356 | 0.016663195529137267 | 59 | 62 | 4.147288270665544 | 0.07029302153670414 | 88.4 | 91 | 4.498888751680797 | 0.050892406693221676 | 2 | 82 | 93 | 11 | 3229.2 | 2982 | 2249.4051124686275 | 0.6965827797809451 | 1090 | 500 | 7216 | 6716 | 1703.2 | 3368 | 169 | 611 | 442 | 22100 | 169 | 641 | 472 | 0.9364406779661016 | 0 | 30 | 63 | 44.2 | ACTIVITY_REGION_DIAGNOSTIC_UNAVAILABLE | 0.6293649964149314 | 0.6466210043910802 | 0.5127806575493022 | 0.06501870282566592 |

## Régularité et tendances

| pathName | metric | differences | slope | residualError | abruptChangeThreshold | abruptChangeCount |
| --- | --- | --- | --- | --- | --- | --- |
| CURRENT_DP_WINNER | FULL_REP_DURATION | 12, 21, 17, -45 | 4.8 | 17.479130413152706 | 13.5 | 1 |
| GROUND_TRUTH_PATH | FULL_REP_DURATION | -2, 1, -8, -2 | -2.9 | 1.8493242008906943 | 4.5 | 1 |
| CURRENT_DP_WINNER | CYCLE_AMPLITUDE | 3456, 638, 1668, -5224 | 338.2 | 2130.0970682107427 | 4227 | 1 |
| GROUND_TRUTH_PATH | CYCLE_AMPLITUDE | 3660, -5324, 1090, -2482 | -1034.6 | 1708.5166197611306 | 9213 | 0 |

## Différences Winner vs Ground Truth

| metricName | family | currentWinnerValue | groundTruthValue | signedDelta | absoluteDelta | relativeDeltaPercent | preferredDirectionKnown |
| --- | --- | --- | --- | --- | --- | --- | --- |
| finalLegacyDpScore | LOCAL_CANDIDATE_QUALITY | 48176 | -11348 | -59524 | 59524 | -123.55529724344072 | NO_AUTOMATIC_PREFERENCE |
| meanNormalizedProminence | LOCAL_CANDIDATE_QUALITY | 1.9714545454545453 | 0.795909090909091 | -1.1755454545454542 | 1.1755454545454542 | -59.628331642534334 | HIGHER_IS_MORE_COHERENT |
| medianNormalizedProminence | LOCAL_CANDIDATE_QUALITY | 2.055 | 0.583 | -1.4720000000000002 | 1.4720000000000002 | -71.63017031630172 | HIGHER_IS_MORE_COHERENT |
| meanProminenceToNoiseRatio | LOCAL_CANDIDATE_QUALITY | 4.9477222432960755 | 2.079655455478551 | -2.8680667878175243 | 2.8680667878175243 | -57.96741706153 | HIGHER_IS_MORE_COHERENT |
| fullRepDurationCV | TEMPORAL_CONSISTENCY | 0.2373544300422121 | 0.050892406693221676 | -0.18646202334899042 | 0.18646202334899042 | -78.5584761640342 | LOWER_IS_MORE_REGULAR |
| fullRepDurationMAD | TEMPORAL_CONSISTENCY | 12 | 2 | -10 | 10 | -83.33333333333334 | LOWER_IS_MORE_REGULAR |
| bottomToTopDurationCV | TEMPORAL_CONSISTENCY | 0.5893297391275264 | 0.016663195529137267 | -0.5726665435983891 | 0.5726665435983891 | -97.17251745112908 | LOWER_IS_MORE_REGULAR |
| topToBottomDurationCV | TEMPORAL_CONSISTENCY | 0.483831637915188 | 0.07029302153670414 | -0.4135386163784839 | 0.4135386163784839 | -85.47159465643999 | LOWER_IS_MORE_REGULAR |
| cycleAmplitudeCV | AMPLITUDE_CONSISTENCY | 0.17549304885475642 | 0.6965827797809451 | 0.5210897309261886 | 0.5210897309261886 | 296.9289862628456 | LOWER_IS_MORE_REGULAR |
| cycleAmplitudeMAD | AMPLITUDE_CONSISTENCY | 2306 | 1090 | -1216 | 1216 | -52.73200346921075 | LOWER_IS_MORE_REGULAR |
| meanBottomDrift | AMPLITUDE_CONSISTENCY | 1752 | 1703.2 | -48.799999999999955 | 48.799999999999955 | -2.785388127853879 | LOWER_IS_MORE_REGULAR |
| coverageRatio | ACTIVITY_COVERAGE | 0.836864406779661 | 0.9364406779661016 | 0.09957627118644063 | 0.09957627118644063 | 11.898734177215186 | NO_AUTOMATIC_PREFERENCE |
| meanCycleCorrelation | CYCLE_SHAPE_SIMILARITY | 0.5516053268020519 | 0.6293649964149314 | 0.0777596696128795 | 0.0777596696128795 | 14.096975833009711 | HIGHER_IS_MORE_COHERENT |
| minCycleCorrelation | CYCLE_SHAPE_SIMILARITY | 0.3127284371247655 | 0.5127806575493022 | 0.20005222042453674 | 0.20005222042453674 | 63.96994858025153 | HIGHER_IS_MORE_COHERENT |

## Résumé par famille

| family | metricsIncluded | availableMetricCount | groundTruthFavoredMetricCount | winnerFavoredMetricCount | noPreferenceMetricCount | largestObservableStandardizedDifference | status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| LOCAL_CANDIDATE_QUALITY | finalLegacyDpScore, meanNormalizedProminence, medianNormalizedProminence, meanProminenceToNoiseRatio | 4 | 0 | 3 | 1 | 1.2355529724344072 | WINNER_MORE_REGULAR_ON_3_METRICS |
| TEMPORAL_CONSISTENCY | fullRepDurationCV, fullRepDurationMAD, bottomToTopDurationCV, topToBottomDurationCV | 4 | 4 | 0 | 0 | 0.9717251745112908 | GROUND_TRUTH_MORE_REGULAR_ON_4_METRICS |
| AMPLITUDE_CONSISTENCY | cycleAmplitudeCV, cycleAmplitudeMAD, meanBottomDrift | 3 | 2 | 1 | 0 | 0.7480657662683767 | MIXED_RESULTS |
| ACTIVITY_COVERAGE | coverageRatio | 1 | 0 | 0 | 1 | 0.10633484162895923 | NO_PREFERENCE_DEFINED |
| CYCLE_SHAPE_SIMILARITY | meanCycleCorrelation, minCycleCorrelation | 2 | 2 | 0 | 0 | 0.39013215003200924 | GROUND_TRUTH_MORE_REGULAR_ON_2_METRICS |

## Graphiques

- C:\dev\RepMotion-core\RepMotion\tools\ground-truth\output\dp-v2-feature-analysis\rep_durations_comparison.png
- C:\dev\RepMotion-core\RepMotion\tools\ground-truth\output\dp-v2-feature-analysis\phase_durations_comparison.png
- C:\dev\RepMotion-core\RepMotion\tools\ground-truth\output\dp-v2-feature-analysis\cycle_amplitudes_comparison.png
- C:\dev\RepMotion-core\RepMotion\tools\ground-truth\output\dp-v2-feature-analysis\cycle_shapes_comparison.png
- C:\dev\RepMotion-core\RepMotion\tools\ground-truth\output\dp-v2-feature-analysis\feature_summary_comparison.png

## Limites

- Une seule vidéo annotée.
- Aucune généralisation possible.
- Aucune pondération apprise.
- Aucune conclusion biomécanique automatique.

## Décision humaine sur les features à retenir
