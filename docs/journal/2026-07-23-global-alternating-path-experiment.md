# Global Alternating Path – Changement de paradigme

**Date :** 2026-07-23

---

# Objectif

Depuis plusieurs séances, nous cherchions à améliorer la Calibration V2 en
modifiant le comportement de MIN_DISTANCE.

L'hypothèse était que certaines mauvaises décisions locales de MIN_DISTANCE
étaient responsables de la majorité des erreurs de comptage observées sur les
datasets de calibration.

Cette séance avait deux objectifs :

- déterminer si une autre stratégie de sélection pouvait produire de meilleurs
  résultats ;
- vérifier si le problème venait réellement de MIN_DISTANCE ou d'un choix
  d'architecture plus profond.

---

# Première expérimentation : reset_on_opposite

Une nouvelle stratégie expérimentale de MIN_DISTANCE a été implémentée :

```
reset_on_opposite
```

Principe :

- conserver PROMINENCE ;
- conserver DIRECTION_CHANGE ;
- réinitialiser MIN_DISTANCE lorsqu'un événement du type opposé est rencontré.

L'objectif était d'éviter que deux Bottoms appartenant à des répétitions
différentes se concurrencent directement.

---

# Résultat

Les datasets sentinelles ont immédiatement montré une forte régression.

Exemple :

```
rowing_5reps_002

current :
6 Bottoms
5 Tops
5 reps

reset_on_opposite :
20 Bottoms
20 Tops
6 reps
```

Cette stratégie supprimait pratiquement l'effet de MIN_DISTANCE.

La raison est maintenant comprise.

Les micro-oscillations naturelles alternent déjà :

Bottom
Top
Bottom
Top
...

Le reset était donc exécuté presque continuellement.

MIN_DISTANCE ne jouait alors presque plus son rôle de filtre.

---

# Conclusion

Le problème n'était pas uniquement la logique actuelle de MIN_DISTANCE.

La stratégie reset_on_opposite était trop globale.

Elle modifiait le comportement sur l'ensemble du signal alors que seules
quelques ruptures d'alternance étaient réellement problématiques.

Cette stratégie est conservée uniquement comme variante expérimentale.

---

# Changement de réflexion

L'analyse a conduit à une observation importante.

Toutes les stratégies testées jusqu'ici prenaient leurs décisions localement.

Autrement dit :

chaque candidat était comparé uniquement à quelques voisins.

Aucune stratégie ne cherchait explicitement la meilleure séquence complète.

Nous avons donc décidé d'explorer une approche totalement différente.

---

# Nouvelle stratégie expérimentale

Une nouvelle famille de stratégies a été introduite.

```
CalibrationSelectionStrategy
```

Elle est indépendante de :

```
MinDistanceStrategy
```

Deux stratégies existent désormais :

```
current_filters
```

Pipeline historique :

RAW

↓

MIN_DISTANCE

↓

PROMINENCE

↓

DIRECTION_CHANGE

↓

Selected

---

```
global_alternating_path
```

Pipeline expérimental :

RAW

↓

PROMINENCE

↓

DIRECTION_CHANGE

↓

Programmation dynamique

↓

Selected

Le principe est fondamentalement différent.

Au lieu de choisir les événements un par un, l'algorithme cherche directement
la meilleure chaîne alternée complète :

Bottom

↓

Top

↓

Bottom

↓

...

↓

Bottom

de longueur :

```
2 × expectedReps + 1
```

---

# Implémentation

Une première version du DP a été implémentée.

Contraintes :

- alternance stricte ;
- ordre chronologique ;
- durée concentrique minimale ;
- durée excentrique minimale ;
- durée minimale d'une répétition.

Score V1 :

```
BOTTOM = -value

TOP = +value
```

Aucun nouveau seuil n'a été ajouté.

---

# Validation sentinelle

Deux datasets ont été utilisés.

```
rowing_5reps_005

current :
2 reps

global :
5 reps
```

```
rowing_5reps_002

current :
5 reps

global :
5 reps
```

Le comportement attendu était bien obtenu.

---

# Benchmark complet

Un runner indépendant a été développé.

Les deux stratégies ont été comparées sur les 10 datasets.

Résultats :

## current_filters

```
totalRepDifference = 19

datasetsExactRepCount = 1

datasetsMissing = 9

datasetsTooMany = 0

avgSimulatedReps = 3.1
```

## global_alternating_path

```
totalRepDifference = 0

datasetsExactRepCount = 10

datasetsMissing = 0

datasetsTooMany = 0

avgSimulatedReps = 5
```

Comparaison :

```
9 datasets améliorés

1 inchangé

0 régression

0 GLOBAL_PATH_NOT_FOUND
```

---

# Interprétation

Cette séance ne démontre pas encore que les événements sélectionnés sont tous
les véritables pivots biomécaniques.

En revanche, elle démontre un point beaucoup plus important.

Il est possible de reconstruire une chaîne complète de répétitions cohérente
sur l'ensemble des datasets sans modifier les seuils historiques.

Autrement dit :

le problème principal semble davantage provenir de la stratégie de sélection
locale que de la qualité des candidats eux-mêmes.

---

# Prochaine étape

Ne pas modifier l'algorithme.

Avant toute amélioration du score du DP, il faut répondre à deux questions.

1.

Les événements choisis par global_alternating_path correspondent-ils réellement
aux grands pivots visibles sur le signal ?

2.

Le score V1 :

```
BOTTOM = -value

TOP = +value
```

est-il suffisant, ou faut-il intégrer des critères biomécaniques plus riches
(amplitude, prominence, régularité, etc.) ?

Cette validation se fera par comparaison graphique entre :

- current_filters ;
- global_alternating_path ;
- le signal brut.

Aucune conclusion biomécanique ne devra être tirée avant cette validation.


## Ce qui est prouvé, avec certitude :

global_alternating_path compte parfaitement sur les 10 datasets (0 erreur, contre 19 avec current)

Global est en accord avec current sur la majorité des événements (8 communs sur 11, dans le premier test)

L'architecture (plusieurs stratégies interchangeables) fonctionne bien et ne casse rien

Est-ce que Global compte correctement ?

✅ Oui.

On l'a démontré.

Est-ce que Global choisit une chaîne cohérente ?

✅ Oui.

On l'a démontré.

Est-ce que Global choisit exactement les bons pivots biomécaniques ?

❌ Pas encore démontré.







# Validation qualitative — Global Alternating Path

## Objectif

Vérifier si `global_alternating_path` choisit uniquement une chaîne donnant le bon nombre de répétitions ou s'il sélectionne également des pivots cohérents avec le signal.

## Observations

Les comparaisons visuelles ont été réalisées sur :

- rowing_5reps_002 (cas de référence)
- rowing_5reps_005 (cas difficile)
- overhead_press_5reps_003 (cas difficile)

Les observations montrent que :

- Global conserve la majorité des pivots importants déjà sélectionnés par `current_filters`.
- Les événements supprimés correspondent principalement à des oscillations secondaires ou à des événements en bordure de série.
- Les nouveaux événements ajoutés par Global restent alignés avec des creux et sommets visibles du signal.
- Aucune sélection manifestement aberrante n'a été observée lors de l'inspection des zooms.

Sur `rowing_5reps_005`, Global remplace quelques événements locaux (ex. autour des zones 415/442 et 557/601) afin de construire une chaîne complète alternée, ce qui permet d'obtenir les 5 répétitions attendues.

## Conclusion

L'inspection visuelle ne montre aucun indice indiquant que le DP "triche" pour obtenir le bon nombre de répétitions.

Au contraire, les événements sélectionnés restent cohérents avec les pivots visibles du signal tout en produisant une séquence complète Bottom → Top → Bottom.

Cette validation ne constitue pas encore une preuve biomécanique absolue (absence de vérité terrain externe), mais elle apporte une forte confiance que l'approche `global_alternating_path` est plus robuste que `current_filters` et constitue désormais la nouvelle base de travail pour les futures optimisations.