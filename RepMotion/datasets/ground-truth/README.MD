# Ground Truth Dataset

## Objectif

Le dossier `ground-truth` contient les annotations manuelles servant de référence indépendante pour évaluer les algorithmes de détection de RepMotion.

Contrairement aux datasets de calibration, ces fichiers ne sont pas générés automatiquement.

Ils sont créés à partir d'une revue manuelle de la vidéo afin de représenter le plus fidèlement possible le mouvement réel de la barre.

---

# Types d'annotations

Le projet utilise actuellement deux types de Ground Truth.

## 1. Point Annotations

Exemple :

```
rowing_5reps_007.annotations.json
```

Chaque événement est représenté par un instant unique.

Exemple :

```json
{
  "type": "BOTTOM",
  "videoTimeSeconds": 24.29
}
```

Ces annotations servent principalement à :

- comparer les événements détectés avec une référence ponctuelle ;
- mesurer l'erreur temporelle d'un algorithme ;
- comparer différentes stratégies de sélection.

---

## 2. Transition Annotations

Exemple :

```
rowing_5reps_007.transition-annotations.json
```

Chaque événement est représenté par une fenêtre biomécanique.

Exemple :

```json
{
  "type": "BOTTOM",
  "arrivalTimeSeconds": 24.21,
  "departureTimeSeconds": 24.37
}
```

Cette fenêtre correspond à :

- l'instant où la barre atteint complètement son extrémité ;
- l'instant où la première remontée (ou descente) devient visuellement perceptible.

Elle ne représente pas un point précis mais une période pendant laquelle le changement de direction biomécanique se produit.

---

# Méthode d'annotation

Les annotations sont réalisées manuellement en observant la vidéo image par image.

Pour chaque Bottom :

- noter le premier instant où la barre cesse complètement de descendre ;
- noter le premier instant où un mouvement de remontée devient visible.

Pour chaque Top :

- noter le premier instant où la barre cesse complètement de monter ;
- noter le premier instant où un mouvement de descente devient visible.

Les annotations sont réalisées indépendamment des données IMU.

Les graphiques du signal ne doivent jamais être utilisés pendant l'annotation afin de conserver une Ground Truth indépendante de l'algorithme.

---

# Synchronisation

Les fichiers contiennent également un bloc `sync`.

Ce bloc permet de synchroniser la vidéo avec le dataset IMU.

La synchronisation est déterminée indépendamment des événements de répétition à l'aide d'un repère visuel identifiable sur la vidéo.

Cette synchronisation sert uniquement à convertir les temps vidéo en indexes IMU.

Elle ne doit jamais être recalculée automatiquement lors des analyses.

---

# Objectif

Les Ground Truth servent à répondre objectivement à des questions telles que :

- Le détecteur RAW produit-il un candidat proche du mouvement réel ?
- À quelle étape du pipeline un événement disparaît-il ?
- Une nouvelle stratégie détecte-t-elle mieux les vrais pivots ?
- Une amélioration réduit-elle réellement l'erreur par rapport à la vidéo ?

L'objectif est de permettre le développement des futurs algorithmes de RepMotion à partir de preuves objectives plutôt que d'ajustements empiriques.