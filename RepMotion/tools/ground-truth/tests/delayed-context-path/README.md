# Delayed Regression Harness

Depuis la racine du dépôt :

```powershell
.\tools\calibration-runner\node_modules\.bin\tsx.cmd --test tools/ground-truth/tests/delayed-context-path/regression.test.ts
.\tools\calibration-runner\node_modules\.bin\tsc.cmd --project tools/ground-truth/tests/delayed-context-path/tsconfig.json
node --check tools/ground-truth/traceOracleLoss.cjs
```

Le harness exécute 007, 009 puis 010 dans des processus isolés. Il refuse les variables `DELAYED_CONTEXT_*` afin qu'un override de budget ne modifie pas silencieusement le protocole. Les rapports existants ne sont ni lus comme résultats attendus ni écrasés. Temps observé : environ 35 secondes pour la suite.

## Catégories

| Catégorie | Contrat |
| --- | --- |
| STRICT PROTOCOL / STRUCTURE / ORACLE V2 | Paramètres Calibration et expectedReps ; un seul véritable appel DP sur les candidats naturels admissibles ; ordre des appels ; aucun recalcul après GT ; bootstrap et valeurs conservés au vrai point d'entrée Delayed ; seul le pool est enrichi ; union exacte, tri, IDs et valeurs IMU ; segmentation ; discrétisation de toutes les fenêtres et égalités ; témoins valides ; structure de chaque reconstruction et chemin D. |
| HISTORICAL QUALITY REGRESSION | 007 : maximum de récupération exacte, par position, parmi les chemins réellement générés dans D, au moins 10/11. Le winner est mesuré séparément : actuellement 5/11. Ce maximum ne signifie pas qu'une chaîne complète 11/11 existe. |
| CHARACTERIZATION | Compteurs A/C/D, guards et winner exacts actuels. Ces attentes détectent une dérive non voulue ; elles sont révisables lors d'une modification volontaire de C. |
| EXPECTED TO IMPROVE | Erreurs et insideZone actuels de 009/010, absence actuelle des solutions oracle dans A/C/D, verrou de réparation d'un seul voisin et non-évaluation de 010 C au cycle 5. Ces résultats médiocres ne constituent pas un objectif à préserver. |

Les tests `EXPECTED TO IMPROVE` échoueront aussi en cas d'amélioration volontaire : revoir alors explicitement leurs attentes avec les résultats de C V2. Ne pas modifier automatiquement les invariants stricts ni abaisser le seuil historique de qualité pour rendre la suite verte.

## Réutilisation et observations réelles

`historical007Input.ts` fournit la Calibration et le bootstrap naturels. `historical007Injection.ts` contient la projection/injection historique extraite du runner, qui l'appelle également. `windowOracle.ts` fournit les ensembles V2 et la preuve d'existence. Le mode `--regression` de `traceOracleLoss.cjs` réutilise son pipeline et ne lit pas les anciens JSON de diagnostic.

La trace ajoute des observations en mémoire, sans écrire les sources de production : appels réels Calibration, sélection DP, entrée Delayed, A/C/D, admissions, classements et reconstructions. Chaque point d'instrumentation possède une ancre vérifiée : si le code change, l'absence d'ancre échoue explicitement plutôt que de produire une trace incomplète. Les snapshots des cartes sont des observations intermédiaires de l'exécution, pas des snapshots de fichiers utilisés comme oracle de test.

Le test unitaire minimal de réparation complète la trace sur les vrais datasets. Il teste directement `buildConditionalAlternatives` et `validatePath`, avec le contexte T507 B532 T527/528 B599 et la preuve multi-voisins valide. La preuve complète commence par BOTTOM, car `validatePath` impose cette alternance ; le suffixe T449 B501 T527 B578 ne doit pas lui être soumis comme s'il commençait à la position zéro.

## Parité historique séparée

```powershell
$env:GROUND_TRUTH_VALIDATION_MODE = 'GLOBAL_SEGMENT_COMPOSITION_TEMPORAL_SHAPE'
.\tools\calibration-runner\node_modules\.bin\tsx.cmd tools/ground-truth/groundTruthValidationRunner.ts
Remove-Item Env:GROUND_TRUTH_VALIDATION_MODE
```

Cette commande historique régénère son rapport habituel. Durant la validation initiale du harness, ce rapport a été sauvegardé puis restauré octet pour octet.

Le typecheck dédié couvre les nouveaux tests/helpers et leurs dépendances de production. Le gros runner historique possède 81 diagnostics stricts préexistants avec ES2021 ; une comparaison avant/après extraction du helper confirme zéro diagnostic supplémentaire. Ils ne sont pas masqués par le typecheck dédié et n'ont pas été corrigés hors périmètre.
