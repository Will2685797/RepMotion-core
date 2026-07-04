# Calibration V2 – Diagnostic Benchmark & Investigation des filtres

**Date :** 2026-07-04

---

# Objectif

L'objectif de cette journée n'était pas d'améliorer immédiatement les performances de la Calibration.

L'objectif était d'arrêter de modifier les paramètres "à l'intuition" et de commencer à comprendre objectivement pourquoi certains datasets produisent :

- TOO_MANY
- MISSING

dans le Cycle Analyzer.

L'objectif était donc de construire des outils permettant d'identifier précisément où la chaîne de traitement prend une mauvaise décision.

---

# État du pipeline

Le pipeline actuel est le suivant :

```text
IMU JSON
    ↓
detectBottomsAndTops()
    ↓
RAW Bottoms / RAW Tops
    ↓
validateCalibrationEvents()
    ├─ filterEventsByMinimumDistance()
    ├─ filterEventsByProminence()
    └─ filterEventsByDirectionChange()
    ↓
SELECTED Bottoms / Tops
    ↓
Cycle Analyzer
    ↓
Rep Count
```

---

# Validation précédente du Cycle Analyzer

Les travaux réalisés avant cette journée avaient déjà permis de démontrer que :

- les paramètres du Cycle Analyzer sont correctement transmis ;
- ils sont réellement utilisés ;
- le Cycle Analyzer reconstruit simplement les cycles à partir des événements qu'il reçoit.

La conclusion était donc que le Cycle Analyzer n'était probablement pas la cause principale des erreurs observées.

Les investigations ont donc été déplacées vers la Calibration.

---

# Création du Calibration Diagnostic Benchmark

Afin de pouvoir diagnostiquer objectivement la Calibration, un nouveau benchmark de diagnostic a été développé.

Contrairement au Calibration Runner historique, son objectif n'est pas uniquement d'afficher les résultats de la Calibration.

Il permet maintenant de comparer, pour chaque dataset :

- les Bottoms/Tops RAW ;
- les Bottoms/Tops sélectionnés ;
- la chaîne complète RAW ;
- la chaîne complète SELECTED ;
- la qualité de la segmentation ;
- les résultats du Cycle Analyzer ;
- les événements rejetés par chacun des filtres.

Ce benchmark devient maintenant l'outil principal de diagnostic de la Calibration V2.

---

# Instrumentation de la Calibration

Une nouvelle infrastructure de debug a été ajoutée.

Elle introduit :

- CalibrationDebugEvent
- debugEvents
- filterDebugEvents

Cette instrumentation ne modifie aucune logique métier.

Elle permet simplement d'enregistrer précisément chaque décision prise par les filtres.

---

# Étape 1 — Audit du filtre MIN_DISTANCE

Le premier filtre instrumenté est :

```text
filterEventsByMinimumDistance()
```

Les travaux précédents avaient déjà montré, grâce au Calibration Parameter Benchmark, que `minimumDistanceSamples` était le paramètre ayant le plus d'influence sur les résultats de la Calibration.

En augmentant cette valeur, le nombre de candidats sélectionnés diminuait fortement.

Cependant, à ce moment-là, nous ne savions pas quels événements étaient réellement supprimés.

L'objectif de cette instrumentation était donc de répondre à la question suivante :

> Les événements utilisés par le Cycle Analyzer sont-ils rejetés par MIN_DISTANCE ?

Résultat :

Le filtre élimine effectivement une grande quantité de candidats.

Exemple :

- environ 60 Bottoms RAW
- environ 60 Tops RAW

↓

- environ 28 Bottoms sélectionnés
- environ 30 Tops sélectionnés

Cependant, aucun événement utilisé par la chaîne finale du Cycle Analyzer n'est rejeté.

Autrement dit, MIN_DISTANCE élimine bien de nombreux candidats, mais pas ceux qui conduisent aux erreurs de comptage observées.

## Conclusion

Le Calibration Parameter Benchmark avait correctement montré que MIN_DISTANCE possède une forte influence sur la Calibration.

L'instrumentation réalisée aujourd'hui montre désormais sur quoi cette influence s'exerce.

MIN_DISTANCE réduit efficacement le bruit du signal, mais il n'est pas responsable des cas TOO_MANY observés.

---

# Étape 2 — Audit du filtre PROMINENCE

Le deuxième filtre instrumenté est :

```text
filterEventsByProminence()
```

Objectif :

Déterminer si les événements responsables des erreurs de segmentation étaient éliminés par ce filtre.

Résultat :

Sur le dataset critique :

```text
overhead_press_5reps_004
```

aucun événement n'est rejeté.

Le benchmark montre également que ce filtre rejette très peu de candidats sur l'ensemble des datasets.

## Conclusion

Aucune preuve ne montre que PROMINENCE soit responsable des erreurs actuellement observées.

---

# Étape 3 — Audit du filtre DIRECTION_CHANGE

Le troisième filtre instrumenté est :

```text
filterEventsByDirectionChange()
```

Objectif :

Déterminer si ce filtre éliminait certains événements responsables des erreurs de segmentation.

Résultat :

Sur le dataset critique :

```text
WEAK_DIRECTION_CHANGE rejected events

0 événement
```

Plus important encore :

Sur les 10 datasets du benchmark :

```text
weakDirectionChangeRejectedTotal = 0
```

Le filtre ne rejette actuellement aucun candidat.

## Conclusion

Aucune preuve ne montre que DIRECTION_CHANGE participe aux erreurs de segmentation actuelles.

---

# Conclusion générale

Cette journée a permis d'éliminer méthodiquement plusieurs hypothèses.

Aujourd'hui, nous pouvons affirmer que :

- le Cycle Analyzer n'est probablement pas responsable ;
- aucune preuve ne montre que MIN_DISTANCE élimine les mauvais événements ;
- aucune preuve ne montre que PROMINENCE élimine les mauvais événements ;
- aucune preuve ne montre que DIRECTION_CHANGE élimine les mauvais événements.

Autrement dit :

Les événements responsables des cas :

- TOO_MANY
- MISSING

survivent à l'ensemble des filtres actuellement instrumentés.

---

# Nouvelle compréhension du problème

Le problème reste situé dans la Calibration.

En revanche, les résultats montrent qu'il ne provient probablement pas d'un filtre qui élimine un mauvais événement.

Le Calibration Parameter Benchmark a déjà exploré automatiquement les différentes combinaisons de paramètres de Calibration.

La meilleure combinaison trouvée est actuellement utilisée par le pipeline.

Le Calibration Parameter Benchmark a bien permis de réduire fortement le nombre de candidats sélectionnés.

Les tests sur `minimumDistanceSamples`, notamment autour de 80 et 85, ont montré que ce paramètre avait un impact majeur sur la réduction des Bottoms/Tops parasites.

Cependant, même après cette réduction importante et l'injection de la meilleure combinaison trouvée, la Calibration conserve encore trop de candidats pour produire une chaîne directement exploitable.

Exemple sur un dataset critique de 5 répétitions :

- environ 60 Bottoms RAW
- environ 61 Tops RAW

↓

après filtrage :

- environ 28 Bottoms sélectionnés
- environ 30 Tops sélectionnés
pour un dataset contenant seulement 5 répétitions.

Autrement dit, même avec les meilleurs paramètres actuellement connus, la Calibration conserve encore un grand nombre de candidats considérés comme valides.

Les résultats obtenus aujourd'hui suggèrent donc que les paramètres actuels améliorent clairement la situation, mais que le réglage des constantes ne suffit pas à lui seul à transformer le signal en une séquence propre de pivots biomécaniques.

La prochaine hypothèse à investiguer est que la logique de génération ou de sélection des candidats elle-même ne soit pas suffisamment discriminante pour distinguer les véritables pivots biomécaniques des nombreux extrema locaux présents dans le signal.

---

# Avancée méthodologique

La principale avancée de cette journée n'est pas l'amélioration de l'algorithme.

La véritable avancée est la mise en place d'une méthodologie de diagnostic reproductible.

Désormais, les hypothèses sont validées ou rejetées à partir de preuves produites par le benchmark plutôt qu'en ajustant les paramètres de manière empirique.

Cette approche permet désormais d'identifier précisément quelle étape de la Calibration est responsable d'un comportement observé avant d'envisager toute modification de l'algorithme.

Le Calibration Diagnostic Benchmark devient ainsi l'outil principal de recherche et développement pour les futures évolutions de la Calibration V2.

---

# Prochaine étape

La prochaine étape sera d'investiguer la partie amont de la Calibration.

Les prochaines analyses porteront principalement sur :

- `detectBottomsAndTops()`
- la stratégie globale de sélection des candidats ;
- les critères permettant de distinguer les véritables pivots biomécaniques des oscillations locales.

L'objectif sera de comprendre pourquoi la Calibration conserve encore près de 60 candidats considérés comme valides alors qu'environ 11 événements représentatifs devraient suffire pour reconstruire correctement une série de 5 répétitions.