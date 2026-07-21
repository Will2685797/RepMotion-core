# Calibration V2.5 — Infrastructure MinDistanceStrategy et test reset_on_opposite

## Contexte
Suite au benchmark end-to-end du 18 juillet (avgSimulatedReps = 3.1/5 avec
la meilleure configuration disponible), l'hypothèse retenue est que
MIN_DISTANCE lui-même — pas la génération RAW — est le vrai levier à
expérimenter, puisque tous les candidats RAW (peu importe leur stratégie de
génération) passent par le même MIN_DISTANCE en aval.

Décision : construire une infrastructure de stratégies pour MIN_DISTANCE,
sur le même principe que RAW_DETECTION_STRATEGY, pour pouvoir tester des
variantes sans risquer de casser le comportement actuel.

## Partie 1 — Infrastructure MinDistanceStrategy (neutre)

Ajouts dans calibration.ts :
- `export type MinDistanceStrategy = "current";`
- `minDistanceStrategy?: MinDistanceStrategy` dans CalibrationParameaters
- `DEFAULT_MIN_DISTANCE_STRATEGY = "current"` : aucun appel existant à
  modifier
- Logique actuelle extraite dans `filterByMinimumDistanceCurrent(...)`,
  strictement identique (mêmes conditions, ordre, remplacements, debug
  events)
- Dispatcher `filterByMinimumDistance(...)` branché dans
  `validateCalibrationEvents()`

### Validation de parité (obligatoire avant de continuer)
- Comparaison stricte candidat par candidat sur les 10 datasets
  (selectedBottomIndexes, selectedTopIndexes, simulatedReps,
  cycleAnalyzerStatus, tous les filterDebugEvents MIN_DISTANCE) : **passée,
  aucune différence**.
- Benchmark end-to-end relancé, agrégats identiques à la baseline du 18
  juillet :
  - totalRepDifference = 19
  - datasetsExactRepCount = 1
  - datasetsMissing = 9
  - datasetsTooMany = 0
  - totalAlternationBreaks = 20
  - totalSelectedCountScore = 9
  - avgSimulatedReps = 3.1

Fichier ajouté : minDistanceStrategyVerifier.ts (vérificateur dédié de
non-régression).

Conclusion : l'infrastructure est prête à recevoir une stratégie
expérimentale sans risque pour l'existant.

## Partie 2 — Hypothèse expérimentale : reset_on_opposite

### Origine de l'hypothèse
Depuis la séance H1 (16 juillet), une question restait ouverte : dans les
cas où un conflit MIN_DISTANCE traverse un événement confirmé du type
opposé sans casser l'alternance (103 cas true/false), 82/103 (79,6%) ont un
"voisin protecteur" — un événement du type opposé immédiatement adjacent
dans la séquence finale. Hypothèse : l'absence de ce voisin protecteur
pourrait être ce qui distingue un conflit anodin d'un conflit qui casse
vraiment l'alternance.

### Problème de circularité identifié avant codage
Une première formulation de la règle ("vérifier si un événement opposé est
déjà confirmé dans les Selected finaux") a été rejetée : au moment où
MIN_DISTANCE traite les Tops, les Bottoms n'ont pas encore fini leur propre
validation (PROMINENCE, DIRECTION_CHANGE) — la règle demandait de connaître
un résultat qui n'existe pas encore à ce stade du pipeline.

### Reformulation retenue : reset_on_opposite
Pipeline expérimental :
```
RAW → PROMINENCE → DIRECTION_CHANGE → fusion chronologique Bottom/Top
    → MIN_DISTANCE avec reset sur changement de type → Selected
```
Un événement opposé "admissible" (ayant déjà passé PROMINENCE et
DIRECTION_CHANGE) ferme le groupe de compétition MIN_DISTANCE en cours.
Le candidat suivant du type initial démarre un nouveau groupe au lieu de
concourir contre un survivant d'avant l'événement opposé.

La branche "current" reste strictement inchangée ; reset_on_opposite est
isolée dans le pipeline expérimental.

### Risque anticipé avant implémentation
Signalé avant codage : dès qu'un reset se produit, le candidat suivant du
même type est automatiquement gardé (kept=true), peu importe sa proximité
temporelle avec le survivant d'avant le reset — risque de réintroduire des
doublons rapprochés que MIN_DISTANCE est censé filtrer normalement.

Question restée sans réponse explicite : PROMINENCE dépend-il actuellement
des survivants de MIN_DISTANCE ? Le déplacer avant MIN_DISTANCE pourrait
changer sa sémantique. À vérifier avant une prochaine itération.

## Résultat du test sentinelle (avant benchmark complet)

Comparaison current vs reset_on_opposite, avec les paramètres de référence
exacts du benchmark, sur les deux datasets critiques :

| Dataset | Stratégie | simulatedReps | status |
|---|---|---|---|
| rowing_5reps_005 | current | 2 | MISSING |
| rowing_5reps_005 | reset_on_opposite | 7 | TOO_MANY |
| rowing_5reps_002 | current | 5 | OK |
| rowing_5reps_002 | reset_on_opposite | 6 | TOO_MANY |

## Conclusion
Le risque anticipé s'est confirmé : reset_on_opposite v1 sur-corrige
massivement. rowing_002, qui comptait parfaitement (5/5), passe à 6/6
TOO_MANY — la condition d'autorisation du benchmark complet (rowing_002 ne
doit pas régresser) n'est pas remplie. Codex a correctement arrêté avant de
lancer le benchmark complet sur les 10 datasets.

**reset_on_opposite v1 est réfutée telle quelle.** Ce n'est pas un échec de
la démarche : le test sentinelle a rempli son rôle en évitant de lancer
588×2 configurations sur une hypothèse déjà invalidée à petite échelle.

## Prochaine étape
Avant de raffiner une v2 de reset_on_opposite, obtenir un diff précis sur
rowing_5reps_002 : quels candidats exacts sont gardés en trop, à quel
index, à quelle distance du survivant précédent du même type, et quel
événement opposé a déclenché le reset juste avant chacun. Objectif :
déterminer si le problème est généralisé au concept (le reset lui-même est
une mauvaise idée) ou localisé à un pattern précis (ex. deux resets trop
rapprochés) qui pourrait être contraint spécifiquement.

Question technique en suspens à trancher : la sémantique de PROMINENCE
change-t-elle en le calculant avant MIN_DISTANCE plutôt qu'après ?
