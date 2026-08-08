# Criteria Ground Truth Characterization

## Protocole reproduit exactement

- Dataset: `rowing_5reps_007`.
- 46 candidats DP réels + 9 injections Ground Truth individuelles = 55 candidats.
- Même replay `reconstructAllDpFinalPaths`: 1207 états et 14 chaînes terminales.
- Même population historique de classement: 14 terminales + `GROUND_TRUTH_REFERENCE` = 15 chaînes.
- Même Ground Truth, mêmes contraintes, mêmes valeurs du signal et même runner.
- Même méthode de classement: direction HIGHER/LOWER, rangs avec ex æquo et percentile `(15-rang)/(15-1)*100`.
- Même normalisation historique: z robuste médiane/MAD, fallback moyenne/écart-type population, orientation, puis clipping `[-3,+3]`.
- Aucun score combiné ni pondération entre critères.

## Disponibilité et définitions exactes

| criterion | availability | scoreUsedForRanking | definition |
| --- | --- | --- | --- |
| Temporal | AVAILABLE_IN_EXPERIMENTAL_RUNNER | existing family score TEMPORAL_CONSISTENCY_SCORE | mean of oriented normalized fullRepDurationCV, fullRepDurationMAD, bottomToTopDurationCV and topToBottomDurationCV |
| Shape | AVAILABLE_IN_EXPERIMENTAL_RUNNER | existing family score SHAPE_SIMILARITY_SCORE | mean of oriented normalized meanCycleCorrelation, minCycleCorrelation and cycleCorrelationStd |
| Local Quality | AVAILABLE_IN_EXPERIMENTAL_RUNNER | existing family score LOCAL_QUALITY_SCORE | mean of oriented normalized mean/median prominence and prominence-to-noise ratio |
| Cohérence des phases | AVAILABLE_IN_EXPERIMENTAL_RUNNER | historically normalized/oriented phaseRatioCV | oriented normalized phaseRatioCV; lower raw CV is better |
| Ratio concentrique / excentrique | AVAILABLE_IN_EXPERIMENTAL_RUNNER | historically normalized/oriented phaseBalanceLogDeviation | oriented normalized abs(log(mean phase ratio)); lower raw deviation from 1 is better |
| ROM / amplitude proxy | AVAILABLE_IN_EXPERIMENTAL_RUNNER | existing family score AMPLITUDE_CONSISTENCY_SCORE | existing amplitude consistency family; signal amplitude proxy, not physical ROM |
| Vitesse proxy | AVAILABLE_IN_EXPERIMENTAL_RUNNER | historically normalized/oriented velocityProxyCycleCV | oriented normalized CV of per-cycle mean absolute first difference; lower is better |
| Qualité du passage par zéro | AVAILABLE_IN_EXPERIMENTAL_RUNNER | historically normalized/oriented meanPivotVelocityProxyMagnitude | oriented normalized mean absolute first difference at pivots; lower is better; proximity proxy only |
| Jerk | AVAILABLE_IN_EXPERIMENTAL_RUNNER | historically normalized/oriented jerkProxyRms | oriented normalized mean cycle RMS first difference of selected-axis acceleration; lower is better |
| Énergie | AVAILABLE_IN_EXPERIMENTAL_RUNNER | historically normalized/oriented cycleEnergyCV | oriented normalized CV of per-cycle demeaned signal energy; lower is better |
| Stabilité inter-cycles | AVAILABLE_IN_EXPERIMENTAL_RUNNER | historically normalized/oriented meanPointwiseInterCycleStd | oriented normalized mean pointwise population std across resampled cycles; lower is better |

### Précisions sur les nouveaux proxies

- `ROM / amplitude proxy` reste une amplitude du signal d'accélération sélectionné, pas un déplacement physique ni un vrai ROM.
- `Vitesse proxy` reprend la convention existante du runner/calibrateur: première différence du signal sélectionné. Ce n'est pas une vitesse mécanique intégrée.
- `Qualité du passage par zéro` n'est pas disponible comme mesure physique graduelle. La valeur classée est explicitement une proximité proxy: moyenne de la magnitude de la première différence aux pivots; plus faible est préférable. Elle ne prouve pas un franchissement exact de zéro.
- `Jerk` est un jerk proxy dans le domaine de l'accélération: RMS de la première différence, moyenné sur les cycles. Il reste sensible à l'échelle et au bruit.
- `Énergie` désigne la stabilité inter-cycles de l'énergie du signal décentré, pas une énergie mécanique.

## Résumé comparable Temporal / Shape / Local Quality / nouveaux critères

| criterion | definition | availability | populationSize | groundTruthRank | groundTruthScore | groundTruthRawValue | bestScore | worstScore | groundTruthPercentile | top5 | comment |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Temporal | mean of oriented normalized fullRepDurationCV, fullRepDurationMAD, bottomToTopDurationCV and topToBottomDurationCV | AVAILABLE_IN_EXPERIMENTAL_RUNNER | 15 | 1 | 2.75 |  | 2.75 | -2.2093308610957143 | 100 | 1:GROUND_TRUTH_REFERENCE(2.75) ; 2:TERMINAL_12(1.2068184376841704) ; 3:TERMINAL_14(1.1124582884754992) ; 4:TERMINAL_13(0.8172789175315291) ; 5:TERMINAL_07(-0.17366123787561327) | Ground Truth classée première. |
| Shape | mean of oriented normalized meanCycleCorrelation, minCycleCorrelation and cycleCorrelationStd | AVAILABLE_IN_EXPERIMENTAL_RUNNER | 15 | 1 | 2.7040614464528994 |  | 2.7040614464528994 | -1.8238694408115876 | 100 | 1:GROUND_TRUTH_REFERENCE(2.7040614464528994) ; 2:TERMINAL_02(1.66759354236234) ; 3:TERMINAL_04(1.570575880206394) ; 4:TERMINAL_05(1.0306918675237813) ; 5:TERMINAL_08(1.000338990071027) | Ground Truth classée première. |
| Local Quality | mean of oriented normalized mean/median prominence and prominence-to-noise ratio | AVAILABLE_IN_EXPERIMENTAL_RUNNER | 15 | 15 | -3 |  | 1.3246324307040658 | -3 | 0 | 1:TERMINAL_02(1.3246324307040658) ; 2:TERMINAL_04(1.0854234352163115) ; 3:TERMINAL_03(1.0732142857142868) ; 4:TERMINAL_01(1.0140310493584126) ; 5:TERMINAL_06(0.8135684036583806) | 14 chaîne(s) classée(s) devant la Ground Truth. |
| Cohérence des phases | oriented normalized phaseRatioCV; lower raw CV is better | AVAILABLE_IN_EXPERIMENTAL_RUNNER | 15 | 1 | 3 | 0.06214003224246294 | 3 | -1.2724179809188008 | 100 | 1:GROUND_TRUTH_REFERENCE(3) ; 2:TERMINAL_07(1) ; 3:TERMINAL_06(0.624686908824655) ; 4:TERMINAL_12(0.4664070212687074) ; 5:TERMINAL_09(0.45420400435947345) | Ground Truth classée première. |
| Ratio concentrique / excentrique | oriented normalized abs(log(mean phase ratio)); lower raw deviation from 1 is better | AVAILABLE_IN_EXPERIMENTAL_RUNNER | 15 | 1 | 1.6337179971034765 | 0.692249216646339 | 1.6337179971034765 | -1.1031417711504765 | 100 | 1:GROUND_TRUTH_REFERENCE(1.6337179971034765) ; 2:TERMINAL_02(1.0325556238354274) ; 3:TERMINAL_11(1.025694073169913) ; 4:TERMINAL_05(1.0250908227007642) ; 5:TERMINAL_04(1.0200859690417496) | Ground Truth classée première. |
| ROM / amplitude proxy | existing amplitude consistency family; signal amplitude proxy, not physical ROM | AVAILABLE_IN_EXPERIMENTAL_RUNNER | 15 | 9 | 0.08461312150632543 |  | 0.8587569942008324 | -1.1869949161540128 | 42.857142857142854 | 1:TERMINAL_12(0.8587569942008324) ; 2:TERMINAL_13(0.8305680057392922) ; 3:TERMINAL_09(0.6672636278706833) ; 4:TERMINAL_07(0.5733184081512496) ; 5:TERMINAL_06(0.49778738484519885) | 8 chaîne(s) classée(s) devant la Ground Truth. |
| Vitesse proxy | oriented normalized CV of per-cycle mean absolute first difference; lower is better | AVAILABLE_IN_EXPERIMENTAL_RUNNER | 15 | 1 | 3 | 0.04217140040523795 | 3 | -1 | 100 | 1:GROUND_TRUTH_REFERENCE(3) ; 2:TERMINAL_01(2.7874284276350507) ; 3:TERMINAL_03(2.7662681118436634) ; 4:TERMINAL_04(2.6977190376764275) ; 5:TERMINAL_02(2.641669668109827) | Ground Truth classée première. |
| Qualité du passage par zéro | oriented normalized mean absolute first difference at pivots; lower is better; proximity proxy only | AVAILABLE_IN_EXPERIMENTAL_RUNNER | 15 | 1 | 3 | 1791.2727272727273 | 3 | -1.0803814713896442 | 100 | 1:GROUND_TRUTH_REFERENCE(3) ; 2:TERMINAL_08(1.4046321525885557) ; 3:TERMINAL_10(1.4019073569482279) ; 4:TERMINAL_11(1.3106267029972738) ; 5:TERMINAL_03(1.155313351498636) | Ground Truth classée première. |
| Jerk | oriented normalized mean cycle RMS first difference of selected-axis acceleration; lower is better | AVAILABLE_IN_EXPERIMENTAL_RUNNER | 15 | 4 | 1.4250588601453011 | 2688.3373499515246 | 2.3345889409101495 | -3 | 78.57142857142857 | 1:TERMINAL_02(2.3345889409101495) ; 2:TERMINAL_03(2.1968850041961856) ; 3:TERMINAL_01(1.510964925927849) ; 4:GROUND_TRUTH_REFERENCE(1.4250588601453011) ; 5:TERMINAL_04(0.8748358535272162) | 3 chaîne(s) classée(s) devant la Ground Truth. |
| Énergie | oriented normalized CV of per-cycle demeaned signal energy; lower is better | AVAILABLE_IN_EXPERIMENTAL_RUNNER | 15 | 8 | 0 | 0.1260972321472044 | 1.8829191831871992 | -3 | 50 | 1:TERMINAL_04(1.8829191831871992) ; 2:TERMINAL_08(1.7667087104777375) ; 3:TERMINAL_03(1.738083695389613) ; 4:TERMINAL_10(1.3774776616822983) ; 5:TERMINAL_05(0.9336619852370405) | 7 chaîne(s) classée(s) devant la Ground Truth. |
| Stabilité inter-cycles | oriented normalized mean pointwise population std across resampled cycles; lower is better | AVAILABLE_IN_EXPERIMENTAL_RUNNER | 15 | 1.5 | 3 | 1123.270249093678 | 3 | -2.1226454710923988 | 96.42857142857143 | 1.5:GROUND_TRUTH_REFERENCE(3) ; 1.5:TERMINAL_08(3) ; 3:TERMINAL_10(2.831817614420159) ; 4:TERMINAL_01(1.0162169571920525) ; 5:TERMINAL_02(1) | Ground Truth ex æquo au meilleur score après clipping. |

## Classement complet de toutes les chaînes pour chaque critère

| criterion | rank | pathId | isGroundTruth | score | rawValue | percentile | fullPath |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Temporal | 1 | GROUND_TRUTH_REFERENCE | true | 2.75 |  | 100 | B(169) -> T(199) -> B(262) -> T(291) -> B(353) -> T(383) -> B(445) -> T(474) -> B(529) -> T(558) -> B(611) |
| Temporal | 2 | TERMINAL_12 | false | 1.2068184376841704 |  | 92.85714285714286 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(438) |
| Temporal | 3 | TERMINAL_14 | false | 1.1124582884754992 |  | 85.71428571428571 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(445) |
| Temporal | 4 | TERMINAL_13 | false | 0.8172789175315291 |  | 78.57142857142857 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(450) |
| Temporal | 5 | TERMINAL_07 | false | -0.17366123787561327 |  | 71.42857142857143 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(480) |
| Temporal | 6 | TERMINAL_01 | false | -0.2358958933658472 |  | 64.28571428571429 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(564) |
| Temporal | 7 | TERMINAL_03 | false | -0.3669812408749678 |  | 57.14285714285714 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(585) |
| Temporal | 8 | TERMINAL_08 | false | -0.6461572658847279 |  | 50 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(530) |
| Temporal | 9 | TERMINAL_06 | false | -0.6543573348542994 |  | 42.857142857142854 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(500) |
| Temporal | 10 | TERMINAL_04 | false | -0.6876858317238104 |  | 35.714285714285715 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(595) |
| Temporal | 11 | TERMINAL_10 | false | -0.7043612665117147 |  | 28.57142857142857 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(529) |
| Temporal | 12 | TERMINAL_09 | false | -0.9400464666949452 |  | 21.428571428571427 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(511) |
| Temporal | 13 | TERMINAL_05 | false | -1.0420684776008466 |  | 14.285714285714285 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(609) |
| Temporal | 14 | TERMINAL_11 | false | -1.200395167880494 |  | 7.142857142857142 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(611) |
| Temporal | 15 | TERMINAL_02 | false | -2.2093308610957143 |  | 0 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(641) |
| Shape | 1 | GROUND_TRUTH_REFERENCE | true | 2.7040614464528994 |  | 100 | B(169) -> T(199) -> B(262) -> T(291) -> B(353) -> T(383) -> B(445) -> T(474) -> B(529) -> T(558) -> B(611) |
| Shape | 2 | TERMINAL_02 | false | 1.66759354236234 |  | 92.85714285714286 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(641) |
| Shape | 3 | TERMINAL_04 | false | 1.570575880206394 |  | 85.71428571428571 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(595) |
| Shape | 4 | TERMINAL_05 | false | 1.0306918675237813 |  | 78.57142857142857 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(609) |
| Shape | 5 | TERMINAL_08 | false | 1.000338990071027 |  | 71.42857142857143 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(530) |
| Shape | 6 | TERMINAL_10 | false | 0.6620531211340976 |  | 64.28571428571429 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(529) |
| Shape | 7 | TERMINAL_03 | false | 0.2472195411284811 |  | 57.14285714285714 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(585) |
| Shape | 8 | TERMINAL_13 | false | -0.2514069224609517 |  | 50 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(450) |
| Shape | 9 | TERMINAL_09 | false | -0.3602520297560326 |  | 42.857142857142854 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(511) |
| Shape | 10 | TERMINAL_07 | false | -0.4199544572015566 |  | 35.714285714285715 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(480) |
| Shape | 11 | TERMINAL_01 | false | -0.5503570109021135 |  | 28.57142857142857 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(564) |
| Shape | 12 | TERMINAL_11 | false | -0.724929714056112 |  | 21.428571428571427 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(611) |
| Shape | 13 | TERMINAL_14 | false | -0.9505499045647867 |  | 14.285714285714285 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(445) |
| Shape | 14 | TERMINAL_12 | false | -1.6901084195701968 |  | 7.142857142857142 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(438) |
| Shape | 15 | TERMINAL_06 | false | -1.8238694408115876 |  | 0 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(500) |
| Local Quality | 1 | TERMINAL_02 | false | 1.3246324307040658 |  | 100 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(641) |
| Local Quality | 2 | TERMINAL_04 | false | 1.0854234352163115 |  | 92.85714285714286 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(595) |
| Local Quality | 3 | TERMINAL_03 | false | 1.0732142857142868 |  | 85.71428571428571 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(585) |
| Local Quality | 4 | TERMINAL_01 | false | 1.0140310493584126 |  | 78.57142857142857 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(564) |
| Local Quality | 5 | TERMINAL_06 | false | 0.8135684036583806 |  | 71.42857142857143 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(500) |
| Local Quality | 6 | TERMINAL_05 | false | 0.8061899309026397 |  | 64.28571428571429 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(609) |
| Local Quality | 7 | TERMINAL_11 | false | 0.43416355904732856 |  | 57.14285714285714 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(611) |
| Local Quality | 8 | TERMINAL_09 | false | 0.08898809523809403 |  | 50 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(511) |
| Local Quality | 9 | TERMINAL_07 | false | -0.07091051898074503 |  | 42.857142857142854 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(480) |
| Local Quality | 10 | TERMINAL_08 | false | -0.2340342278018429 |  | 35.714285714285715 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(530) |
| Local Quality | 11 | TERMINAL_10 | false | -0.3143437865152405 |  | 28.57142857142857 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(529) |
| Local Quality | 12 | TERMINAL_12 | false | -0.8013610728465341 |  | 21.428571428571427 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(438) |
| Local Quality | 13 | TERMINAL_13 | false | -0.9742980074126368 |  | 14.285714285714285 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(450) |
| Local Quality | 14 | TERMINAL_14 | false | -1.268612724165534 |  | 7.142857142857142 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(445) |
| Local Quality | 15 | GROUND_TRUTH_REFERENCE | true | -3 |  | 0 | B(169) -> T(199) -> B(262) -> T(291) -> B(353) -> T(383) -> B(445) -> T(474) -> B(529) -> T(558) -> B(611) |
| Cohérence des phases | 1 | GROUND_TRUTH_REFERENCE | true | 3 | 0.06214003224246294 | 100 | B(169) -> T(199) -> B(262) -> T(291) -> B(353) -> T(383) -> B(445) -> T(474) -> B(529) -> T(558) -> B(611) |
| Cohérence des phases | 2 | TERMINAL_07 | false | 1 | 0.6386174960251282 | 92.85714285714286 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(480) |
| Cohérence des phases | 3 | TERMINAL_06 | false | 0.624686908824655 | 0.7373431411238294 | 85.71428571428571 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(500) |
| Cohérence des phases | 4 | TERMINAL_12 | false | 0.4664070212687074 | 0.7789784700599316 | 78.57142857142857 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(438) |
| Cohérence des phases | 5 | TERMINAL_09 | false | 0.45420400435947345 | 0.7821884585864219 | 71.42857142857143 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(511) |
| Cohérence des phases | 6 | TERMINAL_14 | false | 0.2844759332691284 | 0.8268352180620299 | 64.28571428571429 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(445) |
| Cohérence des phases | 7 | TERMINAL_13 | false | 0.19902956052086065 | 0.8493117808818854 | 57.14285714285714 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(450) |
| Cohérence des phases | 8 | TERMINAL_10 | false | 0 | 0.9016662609630315 | 50 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(529) |
| Cohérence des phases | 9 | TERMINAL_08 | false | -0.02442416241284713 | 0.9080910067203737 | 42.857142857142854 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(530) |
| Cohérence des phases | 10 | TERMINAL_01 | false | -1.2101562043095735 | 1.2199963558886058 | 35.714285714285715 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(564) |
| Cohérence des phases | 11 | TERMINAL_03 | false | -1.2394338399648341 | 1.227697801788024 | 28.57142857142857 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(585) |
| Cohérence des phases | 12 | TERMINAL_04 | false | -1.2484266828694082 | 1.2300633580073528 | 21.428571428571427 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(595) |
| Cohérence des phases | 13 | TERMINAL_05 | false | -1.258034532578439 | 1.2325906910070223 | 14.285714285714285 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(609) |
| Cohérence des phases | 14 | TERMINAL_11 | false | -1.2591945314522626 | 1.232895827278111 | 7.142857142857142 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(611) |
| Cohérence des phases | 15 | TERMINAL_02 | false | -1.2724179809188008 | 1.2363742393285027 | 0 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(641) |
| Ratio concentrique / excentrique | 1 | GROUND_TRUTH_REFERENCE | true | 1.6337179971034765 | 0.692249216646339 | 100 | B(169) -> T(199) -> B(262) -> T(291) -> B(353) -> T(383) -> B(445) -> T(474) -> B(529) -> T(558) -> B(611) |
| Ratio concentrique / excentrique | 2 | TERMINAL_02 | false | 1.0325556238354274 | 0.843315467374046 | 92.85714285714286 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(641) |
| Ratio concentrique / excentrique | 3 | TERMINAL_11 | false | 1.025694073169913 | 0.8450397082435843 | 85.71428571428571 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(611) |
| Ratio concentrique / excentrique | 4 | TERMINAL_05 | false | 1.0250908227007642 | 0.8451912992124745 | 78.57142857142857 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(609) |
| Ratio concentrique / excentrique | 5 | TERMINAL_04 | false | 1.0200859690417496 | 0.8464489702034217 | 71.42857142857143 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(595) |
| Ratio concentrique / excentrique | 6 | TERMINAL_03 | false | 1.0153878902188378 | 0.8476295516652027 | 64.28571428571429 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(585) |
| Ratio concentrique / excentrique | 7 | TERMINAL_01 | false | 1 | 0.851496378641303 | 57.14285714285714 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(564) |
| Ratio concentrique / excentrique | 8 | TERMINAL_13 | false | 0 | 1.102786641380932 | 50 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(450) |
| Ratio concentrique / excentrique | 9 | TERMINAL_14 | false | -0.05653450989599259 | 1.116993213226552 | 42.857142857142854 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(445) |
| Ratio concentrique / excentrique | 10 | TERMINAL_09 | false | -0.1789454535806111 | 1.1477538914272658 | 35.714285714285715 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(511) |
| Ratio concentrique / excentrique | 11 | TERMINAL_12 | false | -0.18838893614468402 | 1.1501269466419688 | 28.57142857142857 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(438) |
| Ratio concentrique / excentrique | 12 | TERMINAL_06 | false | -0.3217736008690573 | 1.1836452140859939 | 21.428571428571427 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(500) |
| Ratio concentrique / excentrique | 13 | TERMINAL_08 | false | -0.3569253725067321 | 1.1924785120165886 | 14.285714285714285 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(530) |
| Ratio concentrique / excentrique | 14 | TERMINAL_10 | false | -0.3735674592054346 | 1.1966605063556413 | 7.142857142857142 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(529) |
| Ratio concentrique / excentrique | 15 | TERMINAL_07 | false | -1.1031417711504765 | 1.3799954268923948 | 0 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(480) |
| ROM / amplitude proxy | 1 | TERMINAL_12 | false | 0.8587569942008324 |  | 100 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(438) |
| ROM / amplitude proxy | 2 | TERMINAL_13 | false | 0.8305680057392922 |  | 92.85714285714286 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(450) |
| ROM / amplitude proxy | 3 | TERMINAL_09 | false | 0.6672636278706833 |  | 85.71428571428571 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(511) |
| ROM / amplitude proxy | 4 | TERMINAL_07 | false | 0.5733184081512496 |  | 78.57142857142857 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(480) |
| ROM / amplitude proxy | 5 | TERMINAL_06 | false | 0.49778738484519885 |  | 71.42857142857143 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(500) |
| ROM / amplitude proxy | 6 | TERMINAL_14 | false | 0.4919900069058188 |  | 64.28571428571429 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(445) |
| ROM / amplitude proxy | 7 | TERMINAL_01 | false | 0.15157888718184587 |  | 57.14285714285714 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(564) |
| ROM / amplitude proxy | 8 | TERMINAL_02 | false | 0.14909813908045608 |  | 50 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(641) |
| ROM / amplitude proxy | 9 | GROUND_TRUTH_REFERENCE | true | 0.08461312150632543 |  | 42.857142857142854 | B(169) -> T(199) -> B(262) -> T(291) -> B(353) -> T(383) -> B(445) -> T(474) -> B(529) -> T(558) -> B(611) |
| ROM / amplitude proxy | 10 | TERMINAL_03 | false | -0.07855251544571928 |  | 35.714285714285715 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(585) |
| ROM / amplitude proxy | 11 | TERMINAL_04 | false | -0.1046419232832196 |  | 28.57142857142857 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(595) |
| ROM / amplitude proxy | 12 | TERMINAL_05 | false | -0.560458958517211 |  | 21.428571428571427 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(609) |
| ROM / amplitude proxy | 13 | TERMINAL_08 | false | -0.5963624780702007 |  | 14.285714285714285 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(530) |
| ROM / amplitude proxy | 14 | TERMINAL_10 | false | -0.6711285229253354 |  | 7.142857142857142 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(529) |
| ROM / amplitude proxy | 15 | TERMINAL_11 | false | -1.1869949161540128 |  | 0 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(611) |
| Vitesse proxy | 1 | GROUND_TRUTH_REFERENCE | true | 3 | 0.04217140040523795 | 100 | B(169) -> T(199) -> B(262) -> T(291) -> B(353) -> T(383) -> B(445) -> T(474) -> B(529) -> T(558) -> B(611) |
| Vitesse proxy | 2 | TERMINAL_01 | false | 2.7874284276350507 | 0.050279164636071426 | 92.85714285714286 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(564) |
| Vitesse proxy | 3 | TERMINAL_03 | false | 2.7662681118436634 | 0.05075978864506193 | 85.71428571428571 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(585) |
| Vitesse proxy | 4 | TERMINAL_04 | false | 2.6977190376764275 | 0.0523167753726538 | 78.57142857142857 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(595) |
| Vitesse proxy | 5 | TERMINAL_02 | false | 2.641669668109827 | 0.05358985054639263 | 71.42857142857143 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(641) |
| Vitesse proxy | 6 | TERMINAL_05 | false | 2.5698941457654967 | 0.05522012107905448 | 64.28571428571429 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(609) |
| Vitesse proxy | 7 | TERMINAL_11 | false | 2.5173165219306726 | 0.056414340891264105 | 57.14285714285714 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(611) |
| Vitesse proxy | 8 | TERMINAL_08 | false | 0 | 0.11359131171703737 | 50 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(530) |
| Vitesse proxy | 9 | TERMINAL_12 | false | -0.10547510579738575 | 0.11598701642658941 | 42.857142857142854 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(438) |
| Vitesse proxy | 10 | TERMINAL_14 | false | -0.2609601749242255 | 0.11951862049141726 | 35.714285714285715 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(445) |
| Vitesse proxy | 11 | TERMINAL_09 | false | -0.26617731656651356 | 0.1196371198350144 | 28.57142857142857 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(511) |
| Vitesse proxy | 12 | TERMINAL_10 | false | -0.29174522489024196 | 0.1202178555254077 | 21.428571428571427 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(529) |
| Vitesse proxy | 13 | TERMINAL_06 | false | -0.5666150189510628 | 0.12646109989256746 | 14.285714285714285 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(500) |
| Vitesse proxy | 14 | TERMINAL_13 | false | -0.6014746716413301 | 0.12725288325691742 | 7.142857142857142 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(450) |
| Vitesse proxy | 15 | TERMINAL_07 | false | -1 | 0.13630477278863953 | 0 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(480) |
| Qualité du passage par zéro | 1 | GROUND_TRUTH_REFERENCE | true | 3 | 1791.2727272727273 | 100 | B(169) -> T(199) -> B(262) -> T(291) -> B(353) -> T(383) -> B(445) -> T(474) -> B(529) -> T(558) -> B(611) |
| Qualité du passage par zéro | 2 | TERMINAL_08 | false | 1.4046321525885557 | 4030.181818181818 | 92.85714285714286 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(530) |
| Qualité du passage par zéro | 3 | TERMINAL_10 | false | 1.4019073569482279 | 4030.909090909091 | 85.71428571428571 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(529) |
| Qualité du passage par zéro | 4 | TERMINAL_11 | false | 1.3106267029972738 | 4055.2727272727275 | 78.57142857142857 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(611) |
| Qualité du passage par zéro | 5 | TERMINAL_03 | false | 1.155313351498636 | 4096.727272727273 | 71.42857142857143 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(585) |
| Qualité du passage par zéro | 6 | TERMINAL_05 | false | 1.0681198910081737 | 4120 | 64.28571428571429 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(609) |
| Qualité du passage par zéro | 7 | TERMINAL_14 | false | 0.23433242506811797 | 4342.545454545455 | 57.14285714285714 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(445) |
| Qualité du passage par zéro | 8 | TERMINAL_13 | false | 0 | 4405.090909090909 | 50 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(450) |
| Qualité du passage par zéro | 9 | TERMINAL_06 | false | -0.013623978201636112 | 4408.727272727273 | 42.857142857142854 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(500) |
| Qualité du passage par zéro | 10 | TERMINAL_12 | false | -0.23433242506812138 | 4467.636363636364 | 35.714285714285715 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(438) |
| Qualité du passage par zéro | 11 | TERMINAL_07 | false | -0.3474114441416902 | 4497.818181818182 | 28.57142857142857 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(480) |
| Qualité du passage par zéro | 12 | TERMINAL_02 | false | -0.8092643051771115 | 4621.090909090909 | 21.428571428571427 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(641) |
| Qualité du passage par zéro | 13 | TERMINAL_04 | false | -0.8392370572207082 | 4629.090909090909 | 14.285714285714285 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(595) |
| Qualité du passage par zéro | 14 | TERMINAL_09 | false | -1 | 4672 | 7.142857142857142 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(511) |
| Qualité du passage par zéro | 15 | TERMINAL_01 | false | -1.0803814713896442 | 4693.454545454545 | 0 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(564) |
| Jerk | 1 | TERMINAL_02 | false | 2.3345889409101495 | 2667.11663244474 | 100 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(641) |
| Jerk | 2 | TERMINAL_03 | false | 2.1968850041961856 | 2670.3294743313127 | 92.85714285714286 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(585) |
| Jerk | 3 | TERMINAL_01 | false | 1.510964925927849 | 2686.333031026132 | 85.71428571428571 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(564) |
| Jerk | 4 | GROUND_TRUTH_REFERENCE | true | 1.4250588601453011 | 2688.3373499515246 | 78.57142857142857 | B(169) -> T(199) -> B(262) -> T(291) -> B(353) -> T(383) -> B(445) -> T(474) -> B(529) -> T(558) -> B(611) |
| Jerk | 5 | TERMINAL_04 | false | 0.8748358535272162 | 2701.1748879682523 | 71.42857142857143 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(595) |
| Jerk | 6 | TERMINAL_05 | false | 0.8718563088866944 | 2701.2444052678475 | 64.28571428571429 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(609) |
| Jerk | 7 | TERMINAL_11 | false | 0.8320202827597631 | 2702.173840230924 | 57.14285714285714 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(611) |
| Jerk | 8 | TERMINAL_07 | false | 0 | 2721.5861364856146 | 50 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(480) |
| Jerk | 9 | TERMINAL_06 | false | -0.5282210575118603 | 2733.9103356293836 | 42.857142857142854 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(500) |
| Jerk | 10 | TERMINAL_08 | false | -0.5450121133026467 | 2734.302096450837 | 35.714285714285715 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(530) |
| Jerk | 11 | TERMINAL_10 | false | -0.7976791264337786 | 2740.197201431235 | 28.57142857142857 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(529) |
| Jerk | 12 | TERMINAL_13 | false | -1 | 2744.917654547051 | 21.428571428571427 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(450) |
| Jerk | 13 | TERMINAL_09 | false | -1.6155753129674233 | 2759.2799610797247 | 14.285714285714285 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(511) |
| Jerk | 14 | TERMINAL_14 | false | -1.9034354567634624 | 2765.9961752238696 | 7.142857142857142 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(445) |
| Jerk | 15 | TERMINAL_12 | false | -3 | 2794.384616141621 | 0 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(438) |
| Énergie | 1 | TERMINAL_04 | false | 1.8829191831871992 | 0.11029875625800144 | 100 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(595) |
| Énergie | 2 | TERMINAL_08 | false | 1.7667087104777375 | 0.11127381050757662 | 92.85714285714286 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(530) |
| Énergie | 3 | TERMINAL_03 | false | 1.738083695389613 | 0.11151398630202167 | 85.71428571428571 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(585) |
| Énergie | 4 | TERMINAL_10 | false | 1.3774776616822983 | 0.11453962106101478 | 78.57142857142857 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(529) |
| Énergie | 5 | TERMINAL_05 | false | 0.9336619852370405 | 0.11826341936642172 | 71.42857142857143 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(609) |
| Énergie | 6 | TERMINAL_11 | false | 0.6409900792317645 | 0.12071905851002257 | 64.28571428571429 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(611) |
| Énergie | 7 | TERMINAL_13 | false | 0.5311039334473477 | 0.12164104902360053 | 57.14285714285714 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(450) |
| Énergie | 8 | GROUND_TRUTH_REFERENCE | true | 0 | 0.1260972321472044 | 50 | B(169) -> T(199) -> B(262) -> T(291) -> B(353) -> T(383) -> B(445) -> T(474) -> B(529) -> T(558) -> B(611) |
| Énergie | 9 | TERMINAL_06 | false | -0.05382060726422378 | 0.12654880945004265 | 42.857142857142854 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(500) |
| Énergie | 10 | TERMINAL_01 | false | -0.055480773691861024 | 0.126562738937571 | 35.714285714285715 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(564) |
| Énergie | 11 | TERMINAL_07 | false | -0.26467884345155573 | 0.12831799784123354 | 28.57142857142857 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(480) |
| Énergie | 12 | TERMINAL_09 | false | -1 | 0.13448764849128828 | 21.428571428571427 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(511) |
| Énergie | 13 | TERMINAL_14 | false | -1.1520789272136474 | 0.1357636540077724 | 14.285714285714285 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(445) |
| Énergie | 14.5 | TERMINAL_02 | false | -3 | 0.15169028192687958 | 3.571428571428571 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(641) |
| Énergie | 14.5 | TERMINAL_12 | false | -3 | 0.16036436005845206 | 3.571428571428571 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(438) |
| Stabilité inter-cycles | 1.5 | GROUND_TRUTH_REFERENCE | true | 3 | 1123.270249093678 | 96.42857142857143 | B(169) -> T(199) -> B(262) -> T(291) -> B(353) -> T(383) -> B(445) -> T(474) -> B(529) -> T(558) -> B(611) |
| Stabilité inter-cycles | 1.5 | TERMINAL_08 | false | 3 | 1333.9324453495801 | 96.42857142857143 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(530) |
| Stabilité inter-cycles | 3 | TERMINAL_10 | false | 2.831817614420159 | 1347.0463025594001 | 85.71428571428571 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(480) -> T(509) -> B(529) |
| Stabilité inter-cycles | 4 | TERMINAL_01 | false | 1.0162169571920525 | 1395.530851837215 | 78.57142857142857 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(564) |
| Stabilité inter-cycles | 5 | TERMINAL_02 | false | 1 | 1395.9639161550672 | 71.42857142857143 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(641) |
| Stabilité inter-cycles | 6 | TERMINAL_03 | false | 0.835028208399722 | 1400.3693909644367 | 64.28571428571429 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(585) |
| Stabilité inter-cycles | 7 | TERMINAL_04 | false | 0.4553117106221254 | 1410.5094970361124 | 57.14285714285714 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(595) |
| Stabilité inter-cycles | 8 | TERMINAL_07 | false | 0 | 1422.668328870932 | 50 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(480) |
| Stabilité inter-cycles | 9 | TERMINAL_05 | false | -0.09567208307068144 | 1425.223195662638 | 42.857142857142854 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(609) |
| Stabilité inter-cycles | 10 | TERMINAL_06 | false | -0.45360947301989557 | 1434.7817034502814 | 35.714285714285715 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(500) |
| Stabilité inter-cycles | 11 | TERMINAL_13 | false | -0.6938877039826928 | 1441.1981924965498 | 28.57142857142857 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(450) |
| Stabilité inter-cycles | 12 | TERMINAL_11 | false | -0.7484673593453997 | 1442.6557101392452 | 21.428571428571427 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(391) -> T(467) -> B(500) -> T(509) -> B(611) |
| Stabilité inter-cycles | 13 | TERMINAL_09 | false | -1.0149970706597577 | 1449.7732295512242 | 14.285714285714285 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(467) -> B(511) |
| Stabilité inter-cycles | 14 | TERMINAL_12 | false | -1.5286514840864533 | 1463.4900690006962 | 7.142857142857142 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(438) |
| Stabilité inter-cycles | 15 | TERMINAL_14 | false | -2.1226454710923988 | 1479.352329580445 | 0 | B(169) -> T(195) -> B(228) -> T(291) -> B(299) -> T(333) -> B(346) -> T(379) -> B(391) -> T(421) -> B(445) |

## Population complète

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

## Commentaires

### Temporal

Définition: mean of oriented normalized fullRepDurationCV, fullRepDurationMAD, bottomToTopDurationCV and topToBottomDurationCV. Disponibilité: AVAILABLE_IN_EXPERIMENTAL_RUNNER. Rang GT: 1/15; score GT: 2.75; meilleur: 2.75; pire: -2.2093308610957143; percentile: 100. Ground Truth classée première.

### Shape

Définition: mean of oriented normalized meanCycleCorrelation, minCycleCorrelation and cycleCorrelationStd. Disponibilité: AVAILABLE_IN_EXPERIMENTAL_RUNNER. Rang GT: 1/15; score GT: 2.7040614464528994; meilleur: 2.7040614464528994; pire: -1.8238694408115876; percentile: 100. Ground Truth classée première.

### Local Quality

Définition: mean of oriented normalized mean/median prominence and prominence-to-noise ratio. Disponibilité: AVAILABLE_IN_EXPERIMENTAL_RUNNER. Rang GT: 15/15; score GT: -3; meilleur: 1.3246324307040658; pire: -3; percentile: 0. 14 chaîne(s) classée(s) devant la Ground Truth.

### Cohérence des phases

Définition: oriented normalized phaseRatioCV; lower raw CV is better. Disponibilité: AVAILABLE_IN_EXPERIMENTAL_RUNNER. Rang GT: 1/15; score GT: 3; meilleur: 3; pire: -1.2724179809188008; percentile: 100. Ground Truth classée première.

### Ratio concentrique / excentrique

Définition: oriented normalized abs(log(mean phase ratio)); lower raw deviation from 1 is better. Disponibilité: AVAILABLE_IN_EXPERIMENTAL_RUNNER. Rang GT: 1/15; score GT: 1.6337179971034765; meilleur: 1.6337179971034765; pire: -1.1031417711504765; percentile: 100. Ground Truth classée première.

### ROM / amplitude proxy

Définition: existing amplitude consistency family; signal amplitude proxy, not physical ROM. Disponibilité: AVAILABLE_IN_EXPERIMENTAL_RUNNER. Rang GT: 9/15; score GT: 0.08461312150632543; meilleur: 0.8587569942008324; pire: -1.1869949161540128; percentile: 42.857142857142854. 8 chaîne(s) classée(s) devant la Ground Truth.

### Vitesse proxy

Définition: oriented normalized CV of per-cycle mean absolute first difference; lower is better. Disponibilité: AVAILABLE_IN_EXPERIMENTAL_RUNNER. Rang GT: 1/15; score GT: 3; meilleur: 3; pire: -1; percentile: 100. Ground Truth classée première.

### Qualité du passage par zéro

Définition: oriented normalized mean absolute first difference at pivots; lower is better; proximity proxy only. Disponibilité: AVAILABLE_IN_EXPERIMENTAL_RUNNER. Rang GT: 1/15; score GT: 3; meilleur: 3; pire: -1.0803814713896442; percentile: 100. Ground Truth classée première.

### Jerk

Définition: oriented normalized mean cycle RMS first difference of selected-axis acceleration; lower is better. Disponibilité: AVAILABLE_IN_EXPERIMENTAL_RUNNER. Rang GT: 4/15; score GT: 1.4250588601453011; meilleur: 2.3345889409101495; pire: -3; percentile: 78.57142857142857. 3 chaîne(s) classée(s) devant la Ground Truth.

### Énergie

Définition: oriented normalized CV of per-cycle demeaned signal energy; lower is better. Disponibilité: AVAILABLE_IN_EXPERIMENTAL_RUNNER. Rang GT: 8/15; score GT: 0; meilleur: 1.8829191831871992; pire: -3; percentile: 50. 7 chaîne(s) classée(s) devant la Ground Truth.

### Stabilité inter-cycles

Définition: oriented normalized mean pointwise population std across resampled cycles; lower is better. Disponibilité: AVAILABLE_IN_EXPERIMENTAL_RUNNER. Rang GT: 1.5/15; score GT: 3; meilleur: 3; pire: -2.1226454710923988; percentile: 96.42857142857143. Ground Truth ex æquo au meilleur score après clipping.

## Limites descriptives

Une seule vidéo annotée. La Ground Truth est ajoutée comme référence externe exactement comme dans l'expérience historique. Les directions des nouveaux critères sont documentées ci-dessus. Ce rapport ne combine aucun critère et ne formule aucune conclusion de roadmap ou de promotion précoce.

## Validation

Aucune modification de DP V1, DP V2, `current_filters` ou du pipeline. Aucun MHT, NMS, Delayed Context Path, score combiné ou pondération. Les nouveaux calculs existent uniquement dans ce mode expérimental opt-in.

Commande depuis `RepMotion/tools/calibration-runner`:

```powershell
$env:GROUND_TRUTH_VALIDATION_MODE='CRITERIA_GROUND_TRUTH_CHARACTERIZATION'; npx tsx ../ground-truth/groundTruthValidationRunner.ts
```
