# Delayed Context Path – Investigation C Multi-Neighbor

**Date approximative :** 2026-09-01

---

# Objectif

Cette investigation avait pour objectif d’améliorer le `Delayed Context Path`, principalement le **System C**.

Le problème observé était que certaines corrections ne pouvaient pas être réalisées en remplaçant seulement un candidat local.

Dans plusieurs cas, obtenir une séquence correcte nécessitait de modifier plusieurs candidats voisins simultanément.

L’idée testée était donc :

```text
System C actuel
→ correction locale / un voisin

vs

System C Multi-Neighbor
→ correction coordonnée de plusieurs voisins
```

---

# Travail réalisé

Pour faciliter l’analyse, Delayed a été restructuré plus clairement en systèmes :

```text
System A
→ reconstruction locale

System C
→ corrections / substitutions

System D
→ composition globale des segments
```

Une stratégie expérimentale `multi-neighbor` a ensuite été ajoutée dans System C.

Des diagnostics détaillés ont été réalisés sur les datasets :

```text
007
009
010
```

L’objectif était de comprendre précisément :

- pourquoi certaines Ground Truth disparaissaient
- si plusieurs voisins devaient être modifiés ensemble
- quand les bonnes branches étaient éliminées
- quels budgets ou limites empêchaient certaines corrections

---

# Résultats principaux

L’investigation a confirmé que le problème multi-neighbor existe réellement.

Sur plusieurs positions importantes, une correction valide nécessitait plusieurs changements coordonnés.

Cependant, l’implémentation expérimentale n’a pas apporté une amélioration suffisamment robuste.

Plusieurs limites ont été identifiées :

```text
- budget d’expansion consommé trop tôt
- ordering des candidats peu favorable
- beaucoup d’expansions dépensées sur des positions peu utiles
- fenêtres de correction trop petites
- certaines corrections nécessitaient jusqu’à 5 positions modifiées
```

Dans certains cas, System C épuisait son budget avant même d’atteindre les candidats importants.

Augmenter simplement le budget n’était donc pas une vraie solution.

---

# Conclusion sur Delayed

L’investigation a permis de conclure que Delayed est :

```text
viable
mais fragile
```

Le système est capable de construire de très bonnes séquences.

Sur 007, une reconstruction atteignant :

```text
10 / 11 pivots corrects
```

a notamment été générée.

Cela montre que l’architecture globale de Delayed possède un réel potentiel.

Cependant, plusieurs problèmes restent présents :

```text
- corrections multi-neighbor difficiles
- budgets
- fenêtres limitées
- ordering
- guards dans C / D
- ranking final
```

Continuer à ajouter des mécanismes dans System C risquait donc de rendre Delayed de plus en plus complexe.

---

# Décision

La stratégie `C Multi-Neighbor` n’est pas retenue.

La branche expérimentale ne doit pas être mergée dans `main`.

Delayed reste conservé comme :

```text
baseline historique
+
méthode globale de reconstruction
+
référence pour les benchmarks
```

La priorité est déplacée vers une meilleure représentation physique du mouvement en amont :

```text
IMU
→ meilleure information de mouvement
→ velocity / phases
→ blocs
```

plutôt que de continuer à complexifier Delayed.

---

# Statut de la branche

Branche concernée :

```text
feature/delayed-c-multineighbor
```

Cette branche contenait :

```text
- refactor A / C / D
- expérimentation multi-neighbor
- instrumentation
- audits
- preuves diagnostiques
```

L’expérience est considérée comme terminée et non retenue.

Les conclusions importantes ont été documentées.

La branche peut donc être supprimée localement et sur GitHub afin d’éviter de la confondre avec une feature encore active.