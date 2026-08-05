# Local Path Refinement – Audit préalable

## 1. Question exacte

En partant d'une chaîne complète réellement sélectionnée par DP V1 ou DP V2, une passe de révision locale des pivots peut-elle récupérer la Ground Truth avec Temporal et Shape, sans explorer tout l'espace des chemins ?

## 2. Hypothèse

Une chaîne complète pourrait fournir assez de contexte pour réexaminer localement un pivot ambigu, notamment `BOTTOM:260` face à `BOTTOM:262`, à un coût très inférieur à l'exploration exhaustive.

## 3. Contexte déjà prouvé

Les diagnostics existants établissent que la Ground Truth est reconstructible, que le pruning DP V2 peut l'éliminer avant le rerank terminal, que Temporal et Shape convergent vers `BOTTOM:262` seulement à cinq cycles dans la comparaison contrôlée, et qu'un remplacement isolé de `BOTTOM:260` par `BOTTOM:262` reconstruit la chaîne Ground Truth exacte.

## 4. Données et pool contrôlé

Le pool existant de `rowing_5reps_007` contient 46 candidats RAW et 9 candidats Ground Truth injectés individuellement, soit 55 candidats avec les parasites conservés. La tolérance Ground Truth existante est de ±2 samples. Aucune chaîne Ground Truth complète n'est injectée.

## 5. Chaîne initiale DP V1

Une chaîne DP V1 réelle est disponible via le replay existant (`replayGlobalPathSelection`) et peut être utilisée sans ambiguïté comme point de départ.

Elle n'est pas raffinée dans cet audit, car aucune règle d'acceptation locale non ambiguë n'a été trouvée. Exécuter les remplacements puis en choisir certains malgré cette absence produirait un comportement de stratégie nouveau.

## 6. Chaîne initiale DP V2

Le runner ne possède pas une chaîne DP V2 sélectionnée unique. `runDpV2ExperimentalDiagnostic` exécute `searchSequencePossibilitiesV2` pour K = 5, 10, 20, 30 et 50, puis produit un gagnant distinct pour chaque expérience. DP V2 reste un prototype diagnostique et aucune valeur K canonique n'est définie comme sa sortie réelle.

Choisir silencieusement K=5, K=50 ou un autre gagnant modifierait matériellement la population de départ et le résultat du raffinement.

## 7. Méthode de recherche des alternatives

La génération elle-même est définissable sans nouvelle formule : candidats du même type dans le pool contrôlé, indices entre les voisins fixes, alternance conservée, transition minimale de 8 samples et durée B-B minimale de 45 samples. Elle correspond à la génération locale déjà mesurée dans le diagnostic de profondeur.

Le blocage ne porte donc pas sur la construction des variantes, mais sur leur acceptation.

## 8. Cas BOTTOM:260 / BOTTOM:262

Le diagnostic précédent fournit déjà les observations contrôlées suivantes :

| Cycles | Temporal préfère | Shape préfère |
|---:|---|---|
| 1 | non calculable | non calculable |
| 2 | `BOTTOM:260` | `BOTTOM:260` |
| 3 | `BOTTOM:260` | `BOTTOM:260` |
| 4 | `BOTTOM:262` | `BOTTOM:260` |
| 5 | `BOTTOM:262` | `BOTTOM:262` |

À cinq cycles, le remplacement unique récupère la Ground Truth exacte. La génération locale de niveau 1 avait produit 4 variantes valides pour 5 états explorés. Le remplacement ne peut cependant pas être marqué « accepté » dans la présente expérience sans règle d'acceptation explicite.

## 9. Résultats pivot par pivot

Non simulés. Les variantes pourraient être calculées, mais sélectionner une variante par pivot ferait déjà intervenir la règle manquante et influencerait tous les pivots suivants.

## 10. Passe chronologique

Non simulée : aucune règle existante ne dit qu'un remplacement doit être accepté lorsque Temporal et Shape divergent, ni comment traiter une quasi-égalité.

## 11. Meilleure amélioration locale

Non simulée : « améliore le plus les métriques disponibles » n'établit pas d'ordre total lorsque Temporal et Shape favorisent des variantes différentes.

## 12. Passe jusqu'à stabilité

Non simulée : sa trajectoire dépend directement de la règle d'acceptation non définie.

## 13. Influence de l'ordre

Impossible à mesurer objectivement avant de fixer la règle d'acceptation. Comparer gauche→droite, droite→gauche et meilleure amélioration avec une règle inventée confondrait l'effet de l'ordre avec celui de cette nouvelle règle.

## 14. Ground Truth avant/après

Aucun état « après » n'est produit. Le cas contrôlé démontre seulement que la GT exacte appartient au voisinage à un pivot de la chaîne contenant `BOTTOM:260`. De plus, `BOTTOM:260` est déjà équivalent à `BOTTOM:262` dans la tolérance existante de ±2 samples ; le protocole doit préciser si l'objectif est la GT exacte ou l'équivalence tolérée lorsqu'elles conduisent à des décisions différentes.

## 15. Temporal avant/après

Les scores séparés sont calculables pour chaque variante complète. Ils ne définissent pas à eux seuls l'acceptation quand Shape se dégrade.

## 16. Shape avant/après

Les scores séparés sont calculables pour chaque variante complète. Ils ne définissent pas à eux seuls l'acceptation quand Temporal se dégrade.

## 17. Complexité

Aucune passe n'étant exécutée, aucune mesure de complexité artificielle n'est rapportée pour A/B/C. La génération locale déjà validée du cas B260/B262 coûte 5 états au niveau d'un pivot et 25 178 états pour l'ensemble des quatre profondeurs précédemment testées.

## 18. Comparaison avec l'exploration exhaustive

Le cas à un pivot (5 états) est très inférieur au garde-fou exhaustif atteint à 300 000 états. Cette observation confirme que le voisinage local est peu coûteux ; elle ne résout pas la décision d'acceptation.

## 19. Limites et décisions manquantes

Deux spécifications sont nécessaires avant de poursuivre :

1. **Chaîne DP V2 de départ** : définir une valeur K canonique ou demander de traiter chaque K comme une expérience distincte.
2. **Règle d'acceptation** : définir le comportement pour les quatre cas Temporal/Shape (tous deux meilleurs, compromis divergent, aucun meilleur, quasi-égalité).

Le rerank terminal existant ne suffit pas à lever la seconde ambiguïté sans décisions supplémentaires :

- il utilise une combinaison 50/50 après normalisation robuste ;
- ses scores dépendent de la population de chaînes terminales fournie ;
- le runner ne précise pas si cette population doit contenir la chaîne courante et les variantes d'un pivot, toutes les variantes de tous les pivots, ou les variantes cumulées de l'itération ;
- changer cette population peut changer les scores normalisés et rendre les passes dépendantes de l'ordre avant même l'effet biomécanique recherché.

Une spécification suffisante doit donc fixer la population de normalisation, le comparateur, les quasi-égalités, la condition d'acceptation et l'objectif GT exacte versus GT dans la tolérance.

## 20. Verdict final

**`UNDEFINED_REPLACEMENT_RULE`**

Le voisinage local est constructible et prometteur en coût, mais les trois stratégies de passe ne peuvent pas être simulées objectivement sans inventer une règle d'acceptation et, pour DP V2, une chaîne initiale canonique.

## 21. Prochaine décision soutenue uniquement par les résultats

Définir explicitement une politique d'acceptation. Les options à évaluer séparément pourraient être une dominance de Pareto stricte (Temporal et Shape non dégradés, au moins un amélioré) ou la réutilisation explicite du rerank 50/50 avec une population de normalisation fixée. Ce sont des choix de protocole proposés, pas des règles implémentées dans cet audit.

## Validation finale

- Aucune modification de DP V1.
- Aucune modification de DP V2.
- Aucune modification de `current_filters`.
- Aucun changement au pipeline de production.
- Aucune nouvelle Selection Strategy officielle.
- Aucun score Temporal ou Shape modifié.
- Aucun NMS, MHT ou gyroscope.
- Aucun remplacement local automatiquement accepté.
- Aucun garde-fou supplémentaire nécessaire, puisque les passes ont volontairement été arrêtées avant simulation.

Fichier ajouté :

`RepMotion/tools/ground-truth/output/local-path-refinement/local_path_refinement_report.md`

Il n'existe pas encore de commande de simulation de `local_path_refinement`. Le rapport est un audit statique reproductible à partir du runner et des rapports diagnostiques existants ; fournir une commande qui simule A/B/C avant résolution des décisions manquantes serait trompeur.
