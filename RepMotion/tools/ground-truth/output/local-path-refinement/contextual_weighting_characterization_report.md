# Local Path Refinement – Caractérisation de la pondération contextuelle

## 1. Question exacte

Une pondération de Temporal et Shape évoluant selon le nombre de cycles permet-elle de choisir correctement les remplacements locaux, notamment `BOTTOM:260 → BOTTOM:262`, avant la chaîne complète ?

L'expérience est arrêtée à l'audit de normalisation prévu par le protocole. Aucun score contextuel n'est calculé.

## 2. Contexte déjà prouvé

Dans la comparaison contrôlée B260/B262 :

- Temporal préfère B262 à partir de quatre cycles ;
- Shape préfère B260 à quatre cycles ;
- les deux préfèrent B262 à cinq cycles ;
- le remplacement unique reconstruit la Ground Truth exacte ;
- la génération ciblée coûte cinq états.

Ces résultats utilisent les métriques séparément. Ils ne définissent pas une population de normalisation commune pour un score pondéré progressif.

## 3. Audit des échelles Temporal et Shape

### Temporal

Le score Temporal partiel existant est calculé par `calculatePartialTemporalScore` :

`-mean(CV population B-B, CV population B-T, CV population T-B disponibles)`

Il est calculable à partir de deux cycles. Une valeur plus grande est meilleure : un score proche de zéro correspond à des durées plus régulières. Son échelle brute est celle de coefficients de variation négatifs.

### Shape

Les composantes Shape brutes sont :

- corrélation moyenne au profil médian, à maximiser ;
- corrélation minimale au profil médian, à maximiser ;
- écart-type population des corrélations, à minimiser.

Le profil médian est construit point par point à partir des cycles rééchantillonnés à 100 points. Il n'existe pas un score Shape brut scalaire indépendant de la population. `finalShapeScore` est produit seulement après normalisation robuste des trois composantes relativement à une population de chaînes.

Temporal brut et Shape final ne sont donc ni sur la même échelle ni définis au même niveau de dépendance à la population.

## 4. Population de normalisation

La normalisation existante de `normalizeCompleteSequenceFeatures` procède, métrique par métrique, par médiane et MAD ; elle utilise l'écart-type lorsque la MAD est nulle, borne les valeurs normalisées dans `[-3, 3]`, inverse les métriques à minimiser, puis moyenne les composantes de chaque famille.

Cette normalisation est relative au tableau `featureRows` fourni lors de l'appel. Dans le rerank final existant, cette population est constituée des chaînes terminales ayant survécu à une exécution de `searchSequencePossibilitiesV2`.

Cette population ne peut pas servir de référence stable à l'expérience demandée :

1. elle dépend de K ; le diagnostic DP V2 exécute K = 5, 10, 20, 30 et 50 ;
2. elle dépend des évictions antérieures de DP V2 ;
3. elle ne contient que des chaînes de cinq cycles ;
4. il n'existe pas de population Shape conservée pour deux, trois ou quatre cycles ;
5. l'exploration exhaustive destinée à produire toutes les populations de préfixes a atteint le garde-fou à 300 000 états avant complétion ;
6. normaliser uniquement la paire B260/B262 est explicitement interdit et avait effectivement produit des scores dépendant de la paire ;
7. construire une population avec « toutes les variantes locales » nécessiterait de décider quelle chaîne initiale, quels pivots, quels K et quelles itérations y entrent. Cette décision n'est définie par aucune logique existante.

Il n'existe donc pas de population de normalisation fixe, complète et réutilisable pour comparer identiquement les politiques A–D aux quatre stades.

## 5. Politiques testées

Les poids des politiques A, B, C et D sont entièrement spécifiés, mais aucune n'est exécutée. Appliquer ces poids à des scores normalisés sur une population inventée mesurerait autant le choix de cette population que l'effet des pondérations.

## 6. Résultats à 2 cycles

Non calculés : aucune population de normalisation Shape stable n'existe à deux cycles.

## 7. Résultats à 3 cycles

Non calculés : aucune population de normalisation Shape stable n'existe à trois cycles.

## 8. Résultats à 4 cycles

Les observations brutes séparées restent valides — Temporal préfère B262 et Shape préfère B260 — mais aucun score contextuel n'est calculé sans population stable.

## 9. Résultats à 5 cycles

Temporal et Shape préfèrent séparément B262 dans le cas contrôlé. Le rerank terminal 50/50 existant ne peut pas être comparé objectivement aux stades précédents, car sa population terminale dépend de l'exécution DP V2 et de K.

## 10. Trace BOTTOM:260 / BOTTOM:262

| Cycles | Temporal brut | Shape séparé | Score contextuel A–D |
|---:|---|---|---|
| 1 | `NOT_COMPARABLE` | `NOT_COMPARABLE` | non applicable |
| 2 | préfère B260 | préfère B260 | non calculé |
| 3 | préfère B260 | préfère B260 | non calculé |
| 4 | préfère B262 | préfère B260 | non calculé |
| 5 | préfère B262 | préfère B262 | non calculé |

La Ground Truth n'entre dans aucun calcul. Cette trace reprend uniquement les observations diagnostiques antérieures.

## 11. Stabilité des décisions

Impossible à caractériser pour les politiques pondérées sans scores contextuels comparables. La stabilité des métriques séparées est connue : Temporal bascule à quatre cycles et conserve sa préférence à cinq ; Shape bascule seulement à cinq.

## 12. Autres remplacements locaux

Non évalués. Les inclure imposerait précisément de choisir s'ils appartiennent à la population de référence, choix qui doit être fixé avant le calcul et non déduit après observation.

## 13. Résultats agrégés par politique

Aucun agrégat n'est produit. Des comptes de décisions correctes basés sur des normalisations différentes entre stades ou politiques seraient invalides.

## 14. Faux remplacements

Non mesurés, puisqu'aucun remplacement n'est sélectionné ni appliqué.

## 15. Limites liées au dataset unique

Même après définition d'une population stable, un seul dataset et un cas B260/B262 ne permettraient pas de valider universellement une politique. Les traces B228/B262 et T195/T199 modifient plusieurs pivots ou durées et ne constituent pas automatiquement des réplications indépendantes du cas principal.

## 16. Verdict

**`UNDEFINED_NORMALIZATION_POPULATION`**

Le sens d'optimisation et la formule de normalisation existante sont connus. La population stable nécessaire à leur application progressive de deux à cinq cycles ne l'est pas. Le protocole demande explicitement de s'arrêter dans ce cas.

## 17. Prochaine décision soutenue uniquement par les résultats

Fixer avant toute nouvelle exécution une population de référence qui soit :

- indépendante de la politique A–D ;
- identique pour toutes les politiques à un stade donné ;
- définie pour deux, trois, quatre et cinq cycles ;
- indépendante de la Ground Truth ;
- complète malgré les garde-fous ;
- associée explicitement à une chaîne initiale et, si DP V2 est utilisé, à une valeur K.

Deux familles de protocoles pourraient ensuite être comparées séparément : une population locale figée à l'avance autour d'une chaîne initiale canonique, ou des paramètres de normalisation appris sur un corpus externe de datasets annotés sans utiliser la Ground Truth des cas évalués. Ce sont des décisions proposées, pas des comportements implémentés.

## Validation finale

- Aucune modification de DP V1, DP V2 ou `current_filters`.
- Aucun changement au pipeline de production.
- Aucun remplacement automatique et aucun moteur de backtracking complet.
- Aucune formule Temporal ou Shape modifiée.
- Aucun score contextuel calculé avec une population ad hoc.
- Aucun NMS, MHT ou gyroscope.

Fichier ajouté :

`RepMotion/tools/ground-truth/output/local-path-refinement/contextual_weighting_characterization_report.md`

Il n'existe volontairement pas de commande de simulation des politiques A–D avant définition de la population manquante. L'audit repose sur le runner et les rapports diagnostiques existants ; inventer une commande qui produit des scores contextuels contredirait le garde-fou `UNDEFINED_NORMALIZATION_POPULATION`.
