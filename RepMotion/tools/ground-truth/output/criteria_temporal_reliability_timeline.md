# Criteria Temporal Reliability Timeline

## 1. Question scientifique

À partir de combien de cycles chaque critère commence-t-il à préférer la Ground Truth BOTTOM:262 à l'actif BOTTOM:260, et quand plusieurs critères convergent-ils simultanément ?

## 2. Méthodologie

Exécution réelle du même cas contrôlé et de la même logique expérimentale que le diagnostic ayant établi Temporal=4 cycles et Shape=5 cycles. Les deux préfixes sont identiques sauf BOTTOM:260 versus BOTTOM:262. Les préfixes B-T-B sont étendus jusqu'à cinq cycles. Chaque critère est calculé séparément, sans moyenne entre critères, pondération ou score combiné. L'assertion de parité Temporal=4 et Shape=5 doit réussir pour produire ce rapport.

## 3. Tableau complet des critères

| criterion | cycle1 | cycle2 | cycle3 | cycle4 | cycle5 | firstGroundTruthCycle |
| --- | --- | --- | --- | --- | --- | --- |
| Temporal | N/C | ❌ B260 | ❌ B260 | ✅ GT | ✅ GT | 4 |
| Shape | N/C | ❌ B260 | ❌ B260 | ❌ B260 | ✅ GT | 5 |
| Cohérence des phases | N/C | ❌ B260 | ❌ B260 | ❌ B260 | ❌ B260 | jamais |
| Ratio concentrique / excentrique | ❌ B260 | ❌ B260 | ❌ B260 | ❌ B260 | ❌ B260 | jamais |
| Vitesse proxy | N/C | ❌ B260 | ❌ B260 | ❌ B260 | ❌ B260 | jamais |
| Proximité du passage par zéro | ✅ GT | ✅ GT | ✅ GT | ✅ GT | ✅ GT | 1 |
| Stabilité inter-cycles | N/C | ❌ B260 | ❌ B260 | ❌ B260 | ❌ B260 | jamais |
| Jerk proxy | ✅ GT | ✅ GT | ✅ GT | ✅ GT | ✅ GT | 1 |
| Amplitude proxy | N/C | ❌ B260 | ✅ GT | ✅ GT | ✅ GT | 3 |
| Énergie | N/C | ❌ B260 | ❌ B260 | ❌ B260 | ❌ B260 | jamais |
| Local Quality | ❌ B260 | ❌ B260 | ❌ B260 | ❌ B260 | ❌ B260 | jamais |

## 4. Chronologie de chaque critère

| cycles | criterion | definition | activeScore | groundTruthScore | orientedGap | preference |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Temporal | calculatePartialTemporalScore existant |  |  |  | NOT_COMPARABLE |
| 1 | Shape | score Shape expérimental existant sur la paire de préfixes |  |  |  | NOT_COMPARABLE |
| 1 | Cohérence des phases | CV inter-cycles du ratio (B-T)/(T-B) |  |  |  | NOT_COMPARABLE |
| 1 | Ratio concentrique / excentrique | abs(log(moyenne du ratio (B-T)/(T-B))) | 0.7096764825111559 | 0.7419373447293773 | -0.03226086221822144 | ACTIVE_B260 |
| 1 | Vitesse proxy | CV inter-cycles de la moyenne absolue de la première différence |  |  |  | NOT_COMPARABLE |
| 1 | Proximité du passage par zéro | moyenne de la magnitude de première différence aux pivots | 3096 | 2826.6666666666665 | 269.3333333333335 | GROUND_TRUTH_B262 |
| 1 | Stabilité inter-cycles | moyenne des écarts-types point par point entre cycles rééchantillonnés |  |  |  | NOT_COMPARABLE |
| 1 | Jerk proxy | moyenne du RMS de la première différence par cycle | 2835.164774171564 | 2826.974947685018 | 8.18982648654628 | GROUND_TRUTH_B262 |
| 1 | Amplitude proxy | famille historique de cohérence d'amplitude, normalisée sur la même paire contrôlée |  |  |  | NOT_COMPARABLE |
| 1 | Énergie | CV inter-cycles de l'énergie moyenne du signal décentré |  |  |  | NOT_COMPARABLE |
| 1 | Local Quality | famille historique prominence médiane/moyenne et prominence/bruit | 0.6666666666666661 | -0.6666666666666673 | -1.3333333333333335 | ACTIVE_B260 |
| 2 | Temporal | calculatePartialTemporalScore existant | -0.011797696380385045 | -0.01193957258658806 | -0.00014187620620301558 | ACTIVE_B260 |
| 2 | Shape | score Shape expérimental existant sur la paire de préfixes | 0.3333333333333333 | -0.3333333333333333 | -0.6666666666666666 | ACTIVE_B260 |
| 2 | Cohérence des phases | CV inter-cycles du ratio (B-T)/(T-B) | 0.008264462809917364 | 0.008950366151342556 | -0.0006859033414251918 | ACTIVE_B260 |
| 2 | Ratio concentrique / excentrique | abs(log(moyenne du ratio (B-T)/(T-B))) | 0.7013776796964608 | 0.7508478937624251 | -0.0494702140659643 | ACTIVE_B260 |
| 2 | Vitesse proxy | CV inter-cycles de la moyenne absolue de la première différence | 0.020517914293907206 | 0.024709611224057796 | -0.00419169693015059 | ACTIVE_B260 |
| 2 | Proximité du passage par zéro | moyenne de la magnitude de première différence aux pivots | 2843.2 | 2681.6 | 161.5999999999999 | GROUND_TRUTH_B262 |
| 2 | Stabilité inter-cycles | moyenne des écarts-types point par point entre cycles rééchantillonnés | 765.9290909090918 | 777.9355555555552 | -12.006464646463428 | ACTIVE_B260 |
| 2 | Jerk proxy | moyenne du RMS de la première différence par cycle | 2792.2805553261564 | 2791.5335822594507 | 0.7469730667057775 | GROUND_TRUTH_B262 |
| 2 | Amplitude proxy | famille historique de cohérence d'amplitude, normalisée sur la même paire contrôlée | 0.3333333333333333 | -0.3333333333333333 | -0.6666666666666666 | ACTIVE_B260 |
| 2 | Énergie | CV inter-cycles de l'énergie moyenne du signal décentré | 0.07512235960860204 | 0.08795374585071712 | -0.012831386242115078 | ACTIVE_B260 |
| 2 | Local Quality | famille historique prominence médiane/moyenne et prominence/bruit | 0.6666666666666671 | -0.6666666666666662 | -1.3333333333333333 | ACTIVE_B260 |
| 3 | Temporal | calculatePartialTemporalScore existant | -0.010686722949448807 | -0.01077588074460468 | -0.00008915779515587287 | ACTIVE_B260 |
| 3 | Shape | score Shape expérimental existant sur la paire de préfixes | 0.9999999999999972 | -1.0000000000000029 | -2 | ACTIVE_B260 |
| 3 | Cohérence des phases | CV inter-cycles du ratio (B-T)/(T-B) | 0.01338698860014537 | 0.013840430694210478 | -0.0004534420940651082 | ACTIVE_B260 |
| 3 | Ratio concentrique / excentrique | abs(log(moyenne du ratio (B-T)/(T-B))) | 0.7094972870980788 | 0.7424751237151802 | -0.03297783661710141 | ACTIVE_B260 |
| 3 | Vitesse proxy | CV inter-cycles de la moyenne absolue de la première différence | 0.048334838281795495 | 0.04950298183264622 | -0.0011681435508507226 | ACTIVE_B260 |
| 3 | Proximité du passage par zéro | moyenne de la magnitude de première différence aux pivots | 2232.5714285714284 | 2117.1428571428573 | 115.4285714285711 | GROUND_TRUTH_B262 |
| 3 | Stabilité inter-cycles | moyenne des écarts-types point par point entre cycles rééchantillonnés | 943.4504958871319 | 974.2537406617203 | -30.803244774588393 | ACTIVE_B260 |
| 3 | Jerk proxy | moyenne du RMS de la première différence par cycle | 2762.496780981683 | 2761.998798937213 | 0.49798204447006356 | GROUND_TRUTH_B262 |
| 3 | Amplitude proxy | famille historique de cohérence d'amplitude, normalisée sur la même paire contrôlée | -0.6666666666666666 | 0.6666666666666666 | 1.3333333333333333 | GROUND_TRUTH_B262 |
| 3 | Énergie | CV inter-cycles de l'énergie moyenne du signal décentré | 0.0772279261559878 | 0.08600709387138797 | -0.008779167715400174 | ACTIVE_B260 |
| 3 | Local Quality | famille historique prominence médiane/moyenne et prominence/bruit | 0.6666666666666666 | -0.6666666666666666 | -1.3333333333333333 | ACTIVE_B260 |
| 4 | Temporal | calculatePartialTemporalScore existant | -0.03714840063194947 | -0.0363837482452788 | 0.0007646523866706723 | GROUND_TRUTH_B262 |
| 4 | Shape | score Shape expérimental existant sur la paire de préfixes | 0.3333333333333084 | -0.3333333333333583 | -0.6666666666666667 | ACTIVE_B260 |
| 4 | Cohérence des phases | CV inter-cycles du ratio (B-T)/(T-B) | 0.03264688585665223 | 0.04695552331640052 | -0.014308637459748294 | ACTIVE_B260 |
| 4 | Ratio concentrique / excentrique | abs(log(moyenne du ratio (B-T)/(T-B))) | 0.6916747782248859 | 0.7158652391875948 | -0.024190460962708937 | ACTIVE_B260 |
| 4 | Vitesse proxy | CV inter-cycles de la moyenne absolue de la première différence | 0.04186581950911223 | 0.042879074906972965 | -0.001013255397860735 | ACTIVE_B260 |
| 4 | Proximité du passage par zéro | moyenne de la magnitude de première différence aux pivots | 2021.7777777777778 | 1932 | 89.77777777777783 | GROUND_TRUTH_B262 |
| 4 | Stabilité inter-cycles | moyenne des écarts-types point par point entre cycles rééchantillonnés | 1073.974141266127 | 1083.0740080855728 | -9.099866819445879 | ACTIVE_B260 |
| 4 | Jerk proxy | moyenne du RMS de la première différence par cycle | 2723.6484473708615 | 2723.274960837509 | 0.37348653335266135 | GROUND_TRUTH_B262 |
| 4 | Amplitude proxy | famille historique de cohérence d'amplitude, normalisée sur la même paire contrôlée | -0.6666666666666647 | 0.6666666666666686 | 1.3333333333333335 | GROUND_TRUTH_B262 |
| 4 | Énergie | CV inter-cycles de l'énergie moyenne du signal décentré | 0.07498078321151021 | 0.0819133995111026 | -0.006932616299592395 | ACTIVE_B260 |
| 4 | Local Quality | famille historique prominence médiane/moyenne et prominence/bruit | 1 | -1 | -2 | ACTIVE_B260 |
| 5 | Temporal | calculatePartialTemporalScore existant | -0.04709938274364084 | -0.04594954125302103 | 0.0011498414906198073 | GROUND_TRUTH_B262 |
| 5 | Shape | score Shape expérimental existant sur la paire de préfixes | -0.3333333333333391 | 0.3333333333333276 | 0.6666666666666667 | GROUND_TRUTH_B262 |
| 5 | Cohérence des phases | CV inter-cycles du ratio (B-T)/(T-B) | 0.04634698847184648 | 0.06214003224246294 | -0.015793043770616466 | ACTIVE_B260 |
| 5 | Ratio concentrique / excentrique | abs(log(moyenne du ratio (B-T)/(T-B))) | 0.6732987562638593 | 0.692249216646339 | -0.018950460382479717 | ACTIVE_B260 |
| 5 | Vitesse proxy | CV inter-cycles de la moyenne absolue de la première différence | 0.041376824552556764 | 0.04217140040523795 | -0.0007945758526811883 | ACTIVE_B260 |
| 5 | Proximité du passage par zéro | moyenne de la magnitude de première différence aux pivots | 1864.7272727272727 | 1791.2727272727273 | 73.4545454545455 | GROUND_TRUTH_B262 |
| 5 | Stabilité inter-cycles | moyenne des écarts-types point par point entre cycles rééchantillonnés | 1117.6682987653078 | 1123.270249093678 | -5.601950328370322 | ACTIVE_B260 |
| 5 | Jerk proxy | moyenne du RMS de la première différence par cycle | 2688.6361391782066 | 2688.3373499515246 | 0.2987892266819472 | GROUND_TRUTH_B262 |
| 5 | Amplitude proxy | famille historique de cohérence d'amplitude, normalisée sur la même paire contrôlée | -0.6666666666666666 | 0.6666666666666666 | 1.3333333333333333 | GROUND_TRUTH_B262 |
| 5 | Énergie | CV inter-cycles de l'énergie moyenne du signal décentré | 0.12262515799704778 | 0.1260972321472044 | -0.003472074150156615 | ACTIVE_B260 |
| 5 | Local Quality | famille historique prominence médiane/moyenne et prominence/bruit | 0.9999999999999997 | -1.0000000000000002 | -2 | ACTIVE_B260 |

Les critères de cohérence inter-cycles sont `N/C` avec un cycle parce qu'un CV ou une dispersion entre cycles exige au moins deux observations. Shape est également non comparable avec un seul cycle. Ratio de phases, proximité proxy au zéro, jerk proxy et Local Quality restent calculables sur un cycle car leurs formules utilisent respectivement les deux phases du cycle, les pivots, le segment du cycle ou les candidats locaux.

## 5. Chronologie de convergence

| cycles | groundTruthPreferredBy | criterionCount |
| --- | --- | --- |
| 1 | Proximité du passage par zéro, Jerk proxy | 2 |
| 2 | Proximité du passage par zéro, Jerk proxy | 2 |
| 3 | Proximité du passage par zéro, Jerk proxy, Amplitude proxy | 3 |
| 4 | Temporal, Proximité du passage par zéro, Jerk proxy, Amplitude proxy | 4 |
| 5 | Temporal, Shape, Proximité du passage par zéro, Jerk proxy, Amplitude proxy | 5 |

## 6. Observations importantes

Les préférences ci-dessus proviennent uniquement des valeurs calculées pendant cette exécution. `GROUND_TRUTH_B262` signifie un avantage strict supérieur à 1e-12 après orientation du critère; `ÉGALITÉ` signifie un écart inférieur ou égal à cette précision numérique. La proximité au passage par zéro, le jerk, l'énergie et l'amplitude restent les proxies définis et documentés dans le runner expérimental, pas des mesures biomécaniques physiques.

## 7. Conclusions

- Temporal: première préférence stricte pour la Ground Truth à 4 cycle(s).
- Shape: première préférence stricte pour la Ground Truth à 5 cycle(s).
- Cohérence des phases: première préférence stricte pour la Ground Truth à aucun cycle(s).
- Ratio concentrique / excentrique: première préférence stricte pour la Ground Truth à aucun cycle(s).
- Vitesse proxy: première préférence stricte pour la Ground Truth à aucun cycle(s).
- Proximité du passage par zéro: première préférence stricte pour la Ground Truth à 1 cycle(s).
- Stabilité inter-cycles: première préférence stricte pour la Ground Truth à aucun cycle(s).
- Jerk proxy: première préférence stricte pour la Ground Truth à 1 cycle(s).
- Amplitude proxy: première préférence stricte pour la Ground Truth à 3 cycle(s).
- Énergie: première préférence stricte pour la Ground Truth à aucun cycle(s).
- Local Quality: première préférence stricte pour la Ground Truth à aucun cycle(s).

## Validation

Expérience réellement exécutée. Aucun résultat théorique, aucune simulation papier et aucune conclusion reprise d'une expérience précédente. Tous les tableaux sont générés par les calculs de cette exécution après validation de la parité Temporal/Shape. Aucun changement à DP V1, DP V2, `current_filters` ou au pipeline; aucune nouvelle stratégie, MHT, NMS, pondération ou score combiné.

Commande depuis `RepMotion/tools/calibration-runner`:

```powershell
$env:GROUND_TRUTH_VALIDATION_MODE='CRITERIA_TEMPORAL_RELIABILITY_TIMELINE'; npx tsx ../ground-truth/groundTruthValidationRunner.ts
```
