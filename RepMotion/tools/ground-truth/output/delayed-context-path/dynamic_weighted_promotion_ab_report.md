# Dynamic Weighted Promotion A/B/C

## 1. Executive summary

A, B et C Top-1/3/5 ont été exécutés sans adaptation. C centrale=Top-3. GT disponibles: A=3/11, B=4/11, C=11/11. Verdict: **DYNAMIC_WEIGHTED_PROMOTION_IMPROVES_GT_RECALL_WITH_ACCEPTABLE_COST**.

## 2. Architecture

A=`SYSTEM_B` avec promotion veto actuelle. B=`SYSTEM_B_COUPLED`. C=`DYNAMIC_WEIGHTED_PROMOTION`, qui remplace uniquement la décision de promotion normale et conserve séparément la capacité conditionnelle couplée de B. Reconstruction, validation et sélection finale restent identiques.

## 3. Preuves historiques et poids par cycle

| criterion | cycle | historicalEvidence | derivedWeight | derivation |
| --- | --- | --- | --- | --- |
| ZERO_PROXY | 1 | GT rank 1/15: zero-crossing quality characterization | 1 | 1 / historical GT rank 1 |
| JERK_PROXY | 1 | GT rank 4/15 | 0.25 | 1 / historical GT rank 4 |
| ZERO_PROXY | 2 | GT rank 1/15: zero-crossing quality characterization | 1 | 1 / historical GT rank 1 |
| JERK_PROXY | 2 | GT rank 4/15 | 0.25 | 1 / historical GT rank 4 |
| ZERO_PROXY | 3 | GT rank 1/15: zero-crossing quality characterization | 1 | 1 / historical GT rank 1 |
| JERK_PROXY | 3 | GT rank 4/15 | 0.25 | 1 / historical GT rank 4 |
| AMPLITUDE_PROXY | 3 | GT rank 9/15 | 0.1111111111111111 | 1 / historical GT rank 9 |
| ZERO_PROXY | 4 | GT rank 1/15: zero-crossing quality characterization | 1 | 1 / historical GT rank 1 |
| JERK_PROXY | 4 | GT rank 4/15 | 0.25 | 1 / historical GT rank 4 |
| AMPLITUDE_PROXY | 4 | GT rank 9/15 | 0.1111111111111111 | 1 / historical GT rank 9 |
| TEMPORAL | 4 | TEMPORAL GT rank 1/15 | 1 | 1 / historical GT rank 1 |
| ZERO_PROXY | 5 | GT rank 1/15: zero-crossing quality characterization | 1 | 1 / historical GT rank 1 |
| JERK_PROXY | 5 | GT rank 4/15 | 0.25 | 1 / historical GT rank 4 |
| AMPLITUDE_PROXY | 5 | GT rank 9/15 | 0.1111111111111111 | 1 / historical GT rank 9 |
| TEMPORAL | 5 | TEMPORAL GT rank 1/15 | 1 | 1 / historical GT rank 1 |
| SHAPE | 5 | SHAPE GT rank 1/15 | 1 | 1 / historical GT rank 1 |

## 4. Formules

Normalisation locale: pour chaque composante orientée et la population `{active + candidats structurellement comparables}`, `n=2*(x-min)/(max-min)-1`; si la plage est nulle, `n=0`. Pour un critère vectoriel, moyenne des composantes.

Confiance locale par composante: `confidence = range / (range + MAD autour de la médiane)`; zéro si range=0, puis moyenne des composantes. Elle est bornée dans [0,1] et ne consulte ni GT ni futur.

Score: `Σ normalizedContribution × (1/historicalGroundTruthRank) × localConfidence`. Aucun veto WORSE/CONFLICT.

Règle centrale: Top-3 par position et cycle, tri décroissant du score puis index/candidateId pour les égalités. La constante n’étant pas empiriquement identifiée (`WEIGHT_NOT_EMPIRICALLY_IDENTIFIED` pour la borne), Top-1 et Top-5 sont exécutés comme sensibilité prédéfinie; aucun résultat GT ne choisit Top-3 après coup.

## 5. Tableau global A/B/C

| strategy | topN | gtInitialActive | gtNormallyPromoted | gtConditional | gtTotalAvailable | gtPromotionRecall | falseCandidatesPromoted | promotionPrecision | totalPromisingAlternatives | maxPromisingAlternatives | meanPromisingAlternatives | reconstructionsGenerated | validReconstructions | bestGeneratedGt | finalActiveGt | states | guardReached | elapsedMs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A_CURRENT_PROMOTION |  | 2 | 1 | 0 | 3 | 0.2727272727272727 | 16 | 0.058823529411764705 | 17 | 17 | 12.8 | 1923 | 283 | 3/11 | 1/11 | 2848 | NON | 48.78550000000001 |
| B_COUPLED_CURRENT_PROMOTION |  | 2 | 1 | 1 | 4 | 0.36363636363636365 | 14 | 0.06666666666666667 | 15 | 15 | 12 | 4785 | 457 | 4/11 | 2/11 | 42572 | NON | 65.74680000000001 |
| C_DYNAMIC_TOP_1 | 1 | 2 | 5 | 2 | 9 | 0.8181818181818182 | 15 | 0.25 | 20 | 20 | 9.8 | 4739 | 1009 | 6/11 | 5/11 | 42472 | NON | 120.34859999999998 |
| C_DYNAMIC_TOP_3 | 3 | 2 | 8 | 2 | 11 | 1 | 30 | 0.21052631578947367 | 38 | 38 | 19.2 | 12293 | 2649 | 7/11 | 6/11 | 50026 | NON | 288.7352000000001 |
| C_DYNAMIC_TOP_5 | 5 | 2 | 8 | 2 | 11 | 1 | 44 | 0.15384615384615385 | 52 | 52 | 28.8 | 22093 | 3477 | 5/11 | 3/11 | 59772 | MAX_SEGMENTS | 299.4260999999999 |

## 6. Sensibilité C

| strategy | topN | gtInitialActive | gtNormallyPromoted | gtConditional | gtTotalAvailable | gtPromotionRecall | falseCandidatesPromoted | promotionPrecision | totalPromisingAlternatives | maxPromisingAlternatives | meanPromisingAlternatives | reconstructionsGenerated | validReconstructions | bestGeneratedGt | finalActiveGt | states | guardReached | elapsedMs |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| C_DYNAMIC_TOP_1 | 1 | 2 | 5 | 2 | 9 | 0.8181818181818182 | 15 | 0.25 | 20 | 20 | 9.8 | 4739 | 1009 | 6/11 | 5/11 | 42472 | NON | 120.34859999999998 |
| C_DYNAMIC_TOP_3 | 3 | 2 | 8 | 2 | 11 | 1 | 30 | 0.21052631578947367 | 38 | 38 | 19.2 | 12293 | 2649 | 7/11 | 6/11 | 50026 | NON | 288.7352000000001 |
| C_DYNAMIC_TOP_5 | 5 | 2 | 8 | 2 | 11 | 1 | 44 | 0.15384615384615385 | 52 | 52 | 28.8 | 22093 | 3477 | 5/11 | 3/11 | 59772 | MAX_SEGMENTS | 299.4260999999999 |

## 7. Les 11 GT — A

| gtPivot | position | initialActive | inExperimentalPool | structurallyEligible | promotionScore | rank | normallyPromoted | conditional | firstPromotionCycle | finalAvailabilityForReconstruction | exactReason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BOTTOM:169 | 0 | true | true | false | N/A_CURRENT_RULE | N/A_CURRENT_RULE | false | false |  | true | INITIAL_ACTIVE |
| TOP:199 | 1 | false | true | true | N/A_CURRENT_RULE | N/A_CURRENT_RULE | true | false | 1 | true | AT_LEAST_ONE_BETTER_AND_NONE_WORSE_OR_CONFLICT |
| BOTTOM:262 | 2 | false | true | true | N/A_CURRENT_RULE | N/A_CURRENT_RULE | false | false |  | false | STRUCTURAL_ELIGIBILITY_FAILURE |
| TOP:291 | 3 | true | true | true | N/A_CURRENT_RULE | N/A_CURRENT_RULE | false | false |  | true | INITIAL_ACTIVE |
| BOTTOM:353 | 4 | false | true | true | N/A_CURRENT_RULE | N/A_CURRENT_RULE | false | false |  | false | STRUCTURAL_ELIGIBILITY_FAILURE |
| TOP:383 | 5 | false | true | true | N/A_CURRENT_RULE | N/A_CURRENT_RULE | false | false |  | false | REJECTED_HAS_WORSE_CRITERION |
| BOTTOM:445 | 6 | false | true | true | N/A_CURRENT_RULE | N/A_CURRENT_RULE | false | false |  | false | REJECTED_HAS_WORSE_CRITERION |
| TOP:474 | 7 | false | true | true | N/A_CURRENT_RULE | N/A_CURRENT_RULE | false | false |  | false | REJECTED_HAS_WORSE_CRITERION |
| BOTTOM:529 | 8 | false | true | true | N/A_CURRENT_RULE | N/A_CURRENT_RULE | false | false |  | false | STRUCTURAL_ELIGIBILITY_FAILURE |
| TOP:558 | 9 | false | true | false | N/A_CURRENT_RULE | N/A_CURRENT_RULE | false | false |  | false | STRUCTURAL_ELIGIBILITY_FAILURE |
| BOTTOM:611 | 10 | false | true | true | N/A_CURRENT_RULE | N/A_CURRENT_RULE | false | false |  | false | REJECTED_HAS_WORSE_CRITERION |

## 8. Les 11 GT — B

| gtPivot | position | initialActive | inExperimentalPool | structurallyEligible | promotionScore | rank | normallyPromoted | conditional | firstPromotionCycle | finalAvailabilityForReconstruction | exactReason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BOTTOM:169 | 0 | true | true | false | N/A_CURRENT_RULE | N/A_CURRENT_RULE | false | false |  | true | INITIAL_ACTIVE |
| TOP:199 | 1 | false | true | true | N/A_CURRENT_RULE | N/A_CURRENT_RULE | true | false | 1 | true | AT_LEAST_ONE_BETTER_AND_NONE_WORSE_OR_CONFLICT |
| BOTTOM:262 | 2 | false | true | true | N/A_CURRENT_RULE | N/A_CURRENT_RULE | false | false |  | false | STRUCTURAL_ELIGIBILITY_FAILURE |
| TOP:291 | 3 | true | true | false | N/A_CURRENT_RULE | N/A_CURRENT_RULE | false | false |  | true | INITIAL_ACTIVE |
| BOTTOM:353 | 4 | false | true | true | N/A_CURRENT_RULE | N/A_CURRENT_RULE | false | false |  | false | REJECTED_HAS_WORSE_CRITERION |
| TOP:383 | 5 | false | true | true | N/A_CURRENT_RULE | N/A_CURRENT_RULE | false | false |  | false | REJECTED_HAS_WORSE_CRITERION |
| BOTTOM:445 | 6 | false | true | true | N/A_CURRENT_RULE | N/A_CURRENT_RULE | false | false |  | false | REJECTED_HAS_CONFLICTING_VECTOR_COMPONENTS |
| TOP:474 | 7 | false | true | true | N/A_CURRENT_RULE | N/A_CURRENT_RULE | false | false |  | false | REJECTED_HAS_WORSE_CRITERION |
| BOTTOM:529 | 8 | false | true | true | N/A_CURRENT_RULE | N/A_CURRENT_RULE | false | false |  | false | STRUCTURAL_ELIGIBILITY_FAILURE |
| TOP:558 | 9 | false | true | false | N/A_CURRENT_RULE | N/A_CURRENT_RULE | false | true |  | true | CONDITIONAL_STRUCTURAL_ALTERNATIVE |
| BOTTOM:611 | 10 | false | true | true | N/A_CURRENT_RULE | N/A_CURRENT_RULE | false | false |  | false | REJECTED_HAS_WORSE_CRITERION |

## 9. Les 11 GT — C Top-3

| gtPivot | position | initialActive | inExperimentalPool | structurallyEligible | promotionScore | rank | normallyPromoted | conditional | firstPromotionCycle | finalAvailabilityForReconstruction | exactReason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BOTTOM:169 | 0 | true | true | false | N/A_CURRENT_RULE | N/A_CURRENT_RULE | false | false |  | true | INITIAL_ACTIVE |
| TOP:199 | 1 | false | true | true | -0.41638225255972666 | 2/2 | true | false | 1 | true | DYNAMIC_TOP_3 |
| BOTTOM:262 | 2 | false | true | true | 0.37077967389403776 | 12/24 | false | true |  | true | CONDITIONAL_STRUCTURAL_ALTERNATIVE |
| TOP:291 | 3 | true | true | true | -0.14383121923868847 | 3/5 | true | false | 5 | true | INITIAL_ACTIVE |
| BOTTOM:353 | 4 | false | true | true | 0.7515916133364602 | 3/20 | true | false | 2 | true | DYNAMIC_TOP_3 |
| TOP:383 | 5 | false | true | true | 0.5685157814492106 | 3/5 | true | false | 3 | true | DYNAMIC_TOP_3 |
| BOTTOM:445 | 6 | false | true | true | 0.1337448559670782 | 1/1 | true | false | 4 | true | DYNAMIC_TOP_3 |
| TOP:474 | 7 | false | true | true | 1.3004115226337447 | 1/1 | true | false | 4 | true | DYNAMIC_TOP_3 |
| BOTTOM:529 | 8 | false | true | true | 1.0835607602715442 | 2/9 | true | false | 4 | true | DYNAMIC_TOP_3 |
| TOP:558 | 9 | false | true | false | N/A_CURRENT_RULE | N/A_CURRENT_RULE | false | true |  | true | CONDITIONAL_STRUCTURAL_ALTERNATIVE |
| BOTTOM:611 | 10 | false | true | true | 0.42182200985728546 | 3/5 | true | false | 5 | true | DYNAMIC_TOP_3 |

## 10. GT récupérés par C

| gtPivot | position | initialActive | inExperimentalPool | structurallyEligible | promotionScore | rank | normallyPromoted | conditional | firstPromotionCycle | finalAvailabilityForReconstruction | exactReason |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BOTTOM:262 | 2 | false | true | true | 0.37077967389403776 | 12/24 | false | true |  | true | CONDITIONAL_STRUCTURAL_ALTERNATIVE |
| BOTTOM:353 | 4 | false | true | true | 0.7515916133364602 | 3/20 | true | false | 2 | true | DYNAMIC_TOP_3 |
| TOP:383 | 5 | false | true | true | 0.5685157814492106 | 3/5 | true | false | 3 | true | DYNAMIC_TOP_3 |
| BOTTOM:445 | 6 | false | true | true | 0.1337448559670782 | 1/1 | true | false | 4 | true | DYNAMIC_TOP_3 |
| TOP:474 | 7 | false | true | true | 1.3004115226337447 | 1/1 | true | false | 4 | true | DYNAMIC_TOP_3 |
| BOTTOM:529 | 8 | false | true | true | 1.0835607602715442 | 2/9 | true | false | 4 | true | DYNAMIC_TOP_3 |
| BOTTOM:611 | 10 | false | true | true | 0.42182200985728546 | 3/5 | true | false | 5 | true | DYNAMIC_TOP_3 |

## 11. GT toujours manqués

Aucun.

## 12. Faux candidats, population et coût

| strategy | falsePromoted | totalPromising | maxPromising | meanPromising | states | elapsedMs | guard |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A_CURRENT_PROMOTION | 16 | 17 | 17 | 12.8 | 2848 | 48.78550000000001 | NON |
| B_COUPLED_CURRENT_PROMOTION | 14 | 15 | 15 | 12 | 42572 | 65.74680000000001 | NON |
| C_DYNAMIC_TOP_1 | 15 | 20 | 20 | 9.8 | 42472 | 120.34859999999998 | NON |
| C_DYNAMIC_TOP_3 | 30 | 38 | 38 | 19.2 | 50026 | 288.7352000000001 | NON |
| C_DYNAMIC_TOP_5 | 44 | 52 | 52 | 28.8 | 59772 | 299.4260999999999 | MAX_SEGMENTS |

## 13. Reconstruction/backtracking

| strategy | generated | valid | bestGt | finalGt |
| --- | --- | --- | --- | --- |
| A_CURRENT_PROMOTION | 1923 | 283 | 3/11 | 1/11 |
| B_COUPLED_CURRENT_PROMOTION | 4785 | 457 | 4/11 | 2/11 |
| C_DYNAMIC_TOP_1 | 4739 | 1009 | 6/11 | 5/11 |
| C_DYNAMIC_TOP_3 | 12293 | 2649 | 7/11 | 6/11 |
| C_DYNAMIC_TOP_5 | 22093 | 3477 | 5/11 | 3/11 |

## 14. Non-régression

| lostUsefulGt | top199Preserved | top558Conditional | finalStructuralConstraintsPreserved | guardReached | downstreamBestNonRegressive | downstreamFinalNonRegressive | nonRegression |
| --- | --- | --- | --- | --- | --- | --- | --- |
| aucun | true | true | true | NON | true | true | true |

## 15. Verdict

**DYNAMIC_WEIGHTED_PROMOTION_IMPROVES_GT_RECALL_WITH_ACCEPTABLE_COST**

## Validation

Exécutions réelles A/B/C sur la même entrée. Aucun changement production, RAW detector, DP V1, DP V2, ranking final, reconstruction, validation finale ou sélection; aucun ML et aucun tuning post-GT.

```powershell
$env:GROUND_TRUTH_VALIDATION_MODE='DYNAMIC_WEIGHTED_PROMOTION_AB'; npx tsx ../ground-truth/groundTruthValidationRunner.ts
```
