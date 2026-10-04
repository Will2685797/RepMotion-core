# Plan Beast — Étape 0B : identification rétroactive du gyro

**GYRO RANGE 011–020 : NON IDENTIFIABLE. Aucun range retenu pour une normalisation certifiée.**

## 1. Méthode

Benchmark offline sans dépendance externe. Baseline = sync.baseline (positions de tableau inclusives, pas sampleIndex embarqué). Bias raw = moyenne gx/gy/gz. Direction initiale = normalize(meanAccelXYZ), assignée au dernier timestamp de baseline. Cette approximation suppose la baseline statique. La baseline est exclue des scores.

Intégration continue jusqu’à la fin, sans réinitialisation aux fenêtres : dg/dt = −ω × g dans le repère capteur. Moyenne trapézoïdale des vitesses aux deux extrémités du dt réel, rotation de Rodrigues exacte pour cette vitesse moyenne ; renormalisation numérique seulement. Axes et signes du payload conservés. Aucun Mahony, gain, correction accel ou orientation GT.

Une référence de fenêtre vaut normalize(meanAccelXYZ). La prédiction vaut la moyenne vectorielle normalisée des directions gyro aux mêmes timestamps. Erreur = acos(clamp(dot(predicted,measured),−1,1)) en degrés. Statistiques non pondérées par fenêtre ; agrégat secondaire à poids égal par dataset. Les fenêtres ne sont pas des expériences statistiquement indépendantes.

Dérive cumulée rapportée = erreur à la dernière fenêtre depuis l’initialisation baseline ; ce n’est ni une dérive yaw observable ni une somme d’erreurs angulaires. Croissance = dernière erreur moins première erreur. Cohérence successive = erreur absolue entre angles inter-fenêtres prédits et mesurés ; aucun recalage.

## 2. Sensibilités testées

| Range °/s | Counts/(°/s) | Facteur rotation |
| --- | --- | --- |
| 250 | 131 | 1.0000 |
| 500 | 65.5 | 2.0000 |
| 1000 | 32.8 | 3.9939 |
| 2000 | 16.4 | 7.9878 |

Conversion : ω = (raw − bias) × π / (180 × sensibilité). Les constantes candidates sont celles de la demande. Aucun paramètre ajusté aux GT ou aux scores.

## 3. Fenêtres statiques

Sélection indépendante des candidats et des événements GT : blocs chronologiques disjoints à partir du premier sample après baseline. Le premier sample atteignant la durée minimale clôt le bloc. Le reliquat final trop court est ignoré. Critères fixés avant la première exécution : CV des normes, angle maximal à la direction moyenne, écart de norme moyenne à la baseline ; tout rail accel est exclu de la comparaison, jamais de l’intégration. Aucun dataset rejeté.

| Profil | Durée min ms | CV max | Angle max ° | Écart norme max |
| --- | --- | --- | --- | --- |
| primary | 500 | 0.01 | 2 | 0.05 |
| strict | 750 | 0.005 | 1 | 0.03 |
| relaxed | 300 | 0.02 | 3 | 0.08 |

Les profils strict et relaxed sont des contrôles de sensibilité prédéfinis, pas un tuning. La stabilité accel ne prouve ni absence d’accélération linéaire constante ni absence de rotation autour de g. Un gain scalaire accel s’annule dans la normalisation ; un offset ou des gains différents par axe ne s’annulent pas.

GT : sync.baseline fournit uniquement l’initialisation et le biais autorisés. Les événements ne servent qu’à étiqueter a posteriori les fenêtres entièrement incluses dans [arrivalSampleFloat, departureSampleFloat]. Pour BOTTOM final sans departure, l’étiquette s’étend à la fin de capture ; elle ne prouve pas une immobilité vidéo, les critères accel restent requis. Aucun événement ne modifie sélection ou intégration.

| Dataset | Baseline | Fenêtres principales : positions inclusives (étiquette) |
| --- | --- | --- |
| 011 | 336–355 | 411–421 (hors GT); 873–883 (BOTTOM6); 906–916 (BOTTOM6); 917–927 (BOTTOM6) |
| 012 | 108–127 | 183–193 (hors GT); 194–204 (BOTTOM1); 590–600 (BOTTOM6); 634–644 (BOTTOM6); 645–655 (BOTTOM6) |
| 013 | 102–121 | 188–198 (hors GT); 573–583 (BOTTOM6); 584–594 (BOTTOM6); 628–638 (BOTTOM6); 639–649 (BOTTOM6) |
| 014 | 110–129 | 185–195 (BOTTOM1); 196–206 (BOTTOM1); 592–602 (BOTTOM6); 625–635 (BOTTOM6); 636–646 (BOTTOM6); 647–657 (BOTTOM6) |
| 015 | 105–124 | 191–201 (BOTTOM1); 202–212 (BOTTOM1); 631–641 (BOTTOM6); 642–652 (BOTTOM6); 686–696 (BOTTOM6); 697–707 (BOTTOM6); 708–718 (BOTTOM6) |
| 016 | 118–137 | 193–203 (hors GT); 204–214 (BOTTOM1); 215–225 (BOTTOM1); 622–632 (BOTTOM6); 655–665 (BOTTOM6); 677–687 (BOTTOM6) |
| 017 | 131–150 | 206–216 (BOTTOM1); 217–227 (BOTTOM1); 228–238 (BOTTOM1); 239–249 (BOTTOM1); 646–656 (BOTTOM6); 679–689 (BOTTOM6); 690–700 (BOTTOM6); 701–711 (BOTTOM6) |
| 018 | 79–98 | 154–164 (hors GT); 165–175 (BOTTOM1); 176–186 (BOTTOM1); 484–494 (hors GT); 572–582 (BOTTOM6); 616–626 (BOTTOM6); 627–637 (BOTTOM6) |
| 019 | 116–135 | 191–201 (BOTTOM1); 202–212 (BOTTOM1); 587–597 (BOTTOM6); 620–630 (BOTTOM6); 642–652 (BOTTOM6) |
| 020 | 93–112 | 168–178 (BOTTOM1); 179–189 (BOTTOM1); 190–200 (BOTTOM1); 564–574 (BOTTOM6); 575–585 (BOTTOM6); 619–629 (BOTTOM6); 630–640 (BOTTOM6); 641–651 (BOTTOM6); 652–662 (BOTTOM6); 663–673 (BOTTOM6); 674–684 (BOTTOM6) |

Toutes les fenêtres acceptées/rejetées, motifs, directions, timestamps, sampleIndex et biais sont conservés dans summary.json. Les fenêtres TOP ne satisfont pas les critères de durée/stabilité de ces profils : aucune comparaison BOTTOM→TOP→BOTTOM successive exploitable. Les métriques inter-fenêtres décrivent essentiellement des retours BOTTOM, pas une validation TOP.

## 4. Résultats par dataset — profil principal

Unités angulaires : degrés. N = fenêtres. Transition RMSE porte sur les différences d’amplitudes entre fenêtres successives.

| Dataset | Range | N | Moyenne | Médiane | RMSE | Max | Dérive finale | Croissance | Transition RMSE |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 011 | 250 | 4 | 4.9736 | 6.2401 | 5.5403 | 6.6539 | 6.6539 | 5.8935 | 3.0843 |
| 011 | 500 | 4 | 10.0625 | 12.7495 | 11.2754 | 13.4757 | 13.4757 | 12.2004 | 6.4896 |
| 011 | 1000 | 4 | 20.2131 | 25.7187 | 22.7047 | 27.0677 | 27.0677 | 24.7206 | 13.2711 |
| 011 | 2000 | 4 | 40.5038 | 51.6333 | 45.5445 | 54.2296 | 54.2296 | 49.7106 | 26.8008 |
| 012 | 250 | 5 | 2.5766 | 3.7371 | 2.9954 | 3.8736 | 3.8562 | 3.2422 | 1.4626 |
| 012 | 500 | 5 | 4.9745 | 7.1760 | 5.9164 | 7.8281 | 7.8281 | 6.8976 | 2.9979 |
| 012 | 1000 | 5 | 9.7569 | 14.0354 | 11.7508 | 15.7506 | 15.7506 | 14.1901 | 6.0692 |
| 012 | 2000 | 5 | 19.3354 | 27.7795 | 23.4426 | 31.6211 | 31.6211 | 28.8031 | 12.2281 |
| 013 | 250 | 5 | 2.7072 | 3.2740 | 2.9514 | 3.3814 | 3.3814 | 3.0229 | 1.4980 |
| 013 | 500 | 5 | 5.3074 | 6.4534 | 5.8486 | 6.7199 | 6.7199 | 6.3215 | 3.0351 |
| 013 | 1000 | 5 | 10.5130 | 12.7557 | 11.6395 | 13.3871 | 13.3871 | 12.8526 | 6.1102 |
| 013 | 2000 | 5 | 20.9803 | 25.5247 | 23.2646 | 26.7699 | 26.7699 | 25.8679 | 12.2811 |
| 014 | 250 | 6 | 0.9378 | 0.9846 | 0.9438 | 1.0494 | 1.0494 | 0.0459 | 0.6544 |
| 014 | 500 | 6 | 1.9835 | 2.0642 | 2.0078 | 2.2935 | 2.2935 | 0.1105 | 1.3665 |
| 014 | 1000 | 6 | 4.0675 | 4.3371 | 4.1353 | 4.7738 | 4.7738 | 0.2395 | 2.7993 |
| 014 | 2000 | 6 | 8.2233 | 8.8808 | 8.3848 | 9.7305 | 9.7305 | 0.4941 | 5.6656 |
| 015 | 250 | 7 | 6.1928 | 7.9423 | 6.9050 | 8.4055 | 8.2496 | 6.9066 | 2.6260 |
| 015 | 500 | 7 | 12.3546 | 15.7403 | 13.8328 | 16.8448 | 16.7935 | 14.3227 | 5.2756 |
| 015 | 1000 | 7 | 24.6031 | 31.2445 | 27.6012 | 33.7642 | 33.7642 | 29.0386 | 10.5413 |
| 015 | 2000 | 7 | 48.8850 | 62.0299 | 54.8808 | 67.3321 | 67.3321 | 58.0888 | 20.9642 |
| 016 | 250 | 6 | 3.7948 | 3.6203 | 4.7521 | 7.0949 | 7.0949 | 6.2423 | 2.2117 |
| 016 | 500 | 6 | 7.3363 | 6.8906 | 9.3389 | 14.0749 | 14.0749 | 12.7046 | 4.5338 |
| 016 | 1000 | 6 | 14.4166 | 13.4246 | 18.4980 | 28.0000 | 28.0000 | 25.5569 | 9.1798 |
| 016 | 2000 | 6 | 28.6254 | 26.5446 | 36.8625 | 55.9010 | 55.9010 | 51.2676 | 18.5140 |
| 017 | 250 | 8 | 2.9887 | 2.7483 | 3.5390 | 5.1679 | 5.1679 | 4.1014 | 1.1819 |
| 017 | 500 | 8 | 5.8753 | 5.2471 | 7.0536 | 10.4211 | 10.4211 | 8.5004 | 2.4094 |
| 017 | 1000 | 8 | 11.6404 | 10.2377 | 14.0731 | 20.9071 | 20.9071 | 17.2763 | 4.8663 |
| 017 | 2000 | 8 | 23.2027 | 20.2460 | 28.1494 | 41.9336 | 41.9336 | 34.8676 | 9.7945 |
| 018 | 250 | 7 | 1.2485 | 1.4180 | 1.4689 | 2.3849 | 2.3849 | 1.9500 | 0.5080 |
| 018 | 500 | 7 | 2.5069 | 2.6953 | 2.9935 | 4.8775 | 4.8775 | 4.0476 | 1.1367 |
| 018 | 1000 | 7 | 5.0261 | 5.2390 | 6.0400 | 9.8497 | 9.8497 | 8.2014 | 2.3923 |
| 018 | 2000 | 7 | 10.0679 | 10.3085 | 12.1308 | 19.7892 | 19.7892 | 16.4814 | 4.8698 |
| 019 | 250 | 5 | 2.8712 | 4.0448 | 3.2462 | 4.1969 | 4.1969 | 3.2078 | 1.4733 |
| 019 | 500 | 5 | 5.6604 | 7.9395 | 6.4390 | 8.5383 | 8.5383 | 6.6946 | 3.0204 |
| 019 | 1000 | 5 | 11.2638 | 15.6730 | 12.8485 | 17.2515 | 17.2515 | 13.6622 | 6.1446 |
| 019 | 2000 | 5 | 22.5861 | 31.2661 | 25.8037 | 34.8717 | 34.8717 | 27.7550 | 12.4950 |
| 020 | 250 | 11 | 1.8849 | 2.5309 | 2.1854 | 2.7402 | 2.6396 | 2.5923 | 0.6538 |
| 020 | 500 | 11 | 3.6934 | 4.9278 | 4.2846 | 5.3736 | 5.3541 | 5.0756 | 1.3712 |
| 020 | 1000 | 11 | 7.3947 | 9.7100 | 8.4823 | 10.7714 | 10.7714 | 9.8640 | 2.8060 |
| 020 | 2000 | 11 | 14.8023 | 19.2883 | 16.8942 | 21.6267 | 21.6267 | 19.4819 | 5.6714 |

## 5. Résultats globaux

| Profil | Range | N fenêtres | Moyenne | Médiane | RMSE | Max | Moyenne par dataset | Dérive finale moyenne | Datasets meilleur RMSE |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| primary | 250 | 64 | 2.9031 | 2.3946 | 3.7631 | 8.4055 | 3.0176 | 4.4675 | 10 |
| primary | 500 | 64 | 5.7428 | 4.7114 | 7.5119 | 16.8448 | 5.9755 | 9.0377 | 0 |
| primary | 1000 | 64 | 11.4265 | 9.5329 | 14.9869 | 33.7642 | 11.8895 | 18.1523 | 0 |
| primary | 2000 | 64 | 22.7927 | 19.1308 | 29.9080 | 67.3321 | 23.7212 | 36.3805 | 0 |
| strict | 250 | 10 | 4.3472 | 3.0256 | 5.0564 | 8.3807 | 3.7797 | 4.1829 | 5 |
| strict | 500 | 10 | 8.6320 | 6.0507 | 10.0978 | 16.8818 | 7.4995 | 8.3653 | 0 |
| strict | 1000 | 10 | 17.1657 | 12.0900 | 20.1294 | 33.7673 | 14.9194 | 16.7028 | 0 |
| strict | 2000 | 10 | 34.1602 | 24.2029 | 40.0535 | 67.1646 | 29.7488 | 33.3411 | 0 |
| relaxed | 250 | 186 | 3.0153 | 2.5059 | 3.8167 | 8.5643 | 2.9768 | 4.4976 | 10 |
| relaxed | 500 | 186 | 5.9148 | 4.8847 | 7.5633 | 16.8733 | 5.8406 | 9.1210 | 0 |
| relaxed | 1000 | 186 | 11.7180 | 9.7226 | 15.0402 | 33.8373 | 11.5711 | 18.3413 | 0 |
| relaxed | 2000 | 186 | 23.3343 | 19.3898 | 29.9781 | 67.5168 | 23.0415 | 36.7808 | 0 |

Le profil strict ne couvre que cinq datasets ; son absence de résultat ailleurs n’est pas un zéro. Les trois profils gardent le même classement sur tous les datasets couverts.

## 6. Facteurs ×1 / ×2 / ×4 / ×8 et observabilité

±250 °/s gagne 10/10 comparaisons principales. Mais des rotations plus grandes amplifient presque proportionnellement la dérive, alors que les directions statiques observées restent quasiment identiques. Un classement systématique ne fournit donc pas une identification positive.

Contrôle diagnostique supplémentaire, ajouté après constat des faibles excursions : direction baseline constante (aucune rotation). Ce n’est pas un cinquième range matériel ; il ne remplace ni ne corrige aucune trajectoire gyro. Il vérifie si les fenêtres apportent réellement une information sur l’échelle.

| Dataset | Excursion mesurée max ° | RMSE direction constante ° | RMSE ±250 °/s | Excursion prédite ±250 °/s |
| --- | --- | --- | --- | --- |
| 011 | 0.3642 | 0.3190 | 5.5403 | 6.8265 |
| 012 | 0.4091 | 0.2785 | 2.9954 | 3.9730 |
| 013 | 0.3473 | 0.2273 | 2.9514 | 3.3346 |
| 014 | 0.2942 | 0.2003 | 0.9438 | 1.2465 |
| 015 | 0.3123 | 0.2262 | 6.9050 | 8.5604 |
| 016 | 0.4532 | 0.3268 | 4.7521 | 6.9764 |
| 017 | 0.2838 | 0.2017 | 3.5390 | 5.2480 |
| 018 | 0.2878 | 0.1719 | 1.4689 | 2.4915 |
| 019 | 0.3353 | 0.2634 | 3.2462 | 4.3213 |
| 020 | 0.4006 | 0.2525 | 2.1854 | 2.7131 |

Le contrôle constant bat le meilleur candidat sur les dix datasets. Les facteurs supérieurs produisent davantage de dérive, mais même ×1 ne démontre pas la rotation observée. Les rejeter comme configurations historiques serait excessif : biais résiduel/variable, référence accel imparfaite et mouvements non observés entre fenêtres restent confondus avec le facteur d’échelle. La direction de gravité n’observe pas le yaw.

## 7. Accel range

| Dataset | ±2 g (16384) | ±4 g (8192) | ±8 g (4096) | ±16 g (2048) |
| --- | --- | --- | --- | --- |
| 011 | 1.1364 | 2.2727 | 4.5454 | 9.0909 |
| 012 | 1.1318 | 2.2637 | 4.5273 | 9.0546 |
| 013 | 1.1302 | 2.2604 | 4.5207 | 9.0414 |
| 014 | 1.1272 | 2.2544 | 4.5087 | 9.0175 |
| 015 | 1.1263 | 2.2525 | 4.5050 | 9.0100 |
| 016 | 1.1267 | 2.2534 | 4.5069 | 9.0138 |
| 017 | 1.1276 | 2.2552 | 4.5104 | 9.0208 |
| 018 | 1.1259 | 2.2518 | 4.5035 | 9.0070 |
| 019 | 1.1255 | 2.2510 | 4.5021 | 9.0042 |
| 020 | 1.1270 | 2.2540 | 4.5080 | 9.0160 |

Normes moyennes au repos en g, sans recalibration. ±2 g est le seul candidat proche de 1 g, avec un excès de 12,55–13,64 %. Les autres impliquent environ 2,25 / 4,51 / 9,03 g au repos : incompatibles avec une simple mesure de gravité sous calibration nominale. ±2 g est fortement cohérent, sans certification des registres historiques ni explication de l’offset.

## 8. Conclusion gyro range

**NON IDENTIFIABLE.** Meilleur score : ±250 °/s / 131 counts/(°/s). Range retenu : aucun. Confiance élevée dans le classement descriptif, insuffisante pour identifier le range historique. L’absence de changements statiques de direction suffisamment informatifs et de références TOP interdit de transformer le minimum de score en preuve physique.

**Captures 011–020 utilisables pour normalisation Plan Beast avec échelle gyro établie : NON. Recapture nécessaire : NON DÉMONTRÉ.**

## Reproduction et intégrité

```powershell
node tools/benchmark/plan-beast/gyro-scale-identification/benchmark.mjs
node --test tools/benchmark/plan-beast/gyro-scale-identification/benchmark.test.mjs
```

SHA-256 des 20 fichiers sources avant/après identiques, enregistrés dans summary.json. Aucun fichier source, firmware, payload, GT, dataset, Phase Blocks ou ancien output modifié. Les seuls outputs écrits sont summary.md, summary.json et gyro-scale-results.csv dans ce dossier.
