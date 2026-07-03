# RepMotion — Vision Long Terme de la Calibration

## Pourquoi documenter cette vision

Pendant le développement de RepMotion, plusieurs versions de calibration vont être construites.

L'objectif n'est pas de réécrire le système à chaque fois.

Chaque version doit être une évolution de la précédente vers la vision finale du produit.

Ce document sert à conserver cette direction.

---

# Vision finale

L'utilisateur ne devrait idéalement jamais avoir à comprendre la calibration.

Le workflow final recherché est :

```txt
Clip le capteur
↓
Ouvre l'application
↓
Choisis l'exercice
↓
Commence ton échauffement
↓
RepMotion comprend automatiquement le mouvement
↓
Analyse la séance
```

L'utilisateur ne devrait pas avoir à :

- comprendre les seuils
- comprendre les axes
- comprendre l'IMU
- lancer manuellement plusieurs étapes complexes

RepMotion doit être capable de s'adapter automatiquement.

---

# V2.2 — Calibration manuelle (version actuelle)

## Objectif

Remplacer les seuils hardcodés.

Ancien système :

```txt
bottomThreshold = 17000
topThreshold = 19000
```

Ces valeurs fonctionnaient sur certains exercices mais n'étaient pas généralisables.

La calibration permet maintenant :

```txt
Choisir exercice
↓
Calibration
↓
Effectuer plusieurs répétitions
↓
Calcul automatique des seuils
↓
Sauvegarde par exercice
```

---

# V2.2.1 — Calibration robuste

Objectif :

Améliorer la stabilité de la calibration.

Problèmes identifiés :

- Bench Press différent du Rowing
- Certains exercices commencent en position haute
- Certains exercices commencent en position basse
- Les tops peuvent former des plateaux
- Les bottoms peuvent former des plateaux
- L'utilisateur ne reproduit jamais exactement la même amplitude

Pistes :

- Détection multi-reps
- Moyenne des tops
- Moyenne des bottoms
- Seuils plus tolérants
- Validation sur plusieurs exercices

Exercices de validation minimum :

- Rowing
- Bench Press
- Squat

---

# V2.2.2 — Calibration Auto-Stop

Objectif :

Retirer le bouton "Arrêter calibration".

Workflow :

```txt
Calibration
↓
RepMotion détecte automatiquement 5 cycles complets
↓
Calibration terminée automatiquement
```

Avantages :

- Moins d'erreurs utilisateur
- Calibration standardisée
- UX améliorée

---

# V2.2.3 — Calibration Auto-Start

Objectif :

Éliminer le problème des exercices comme le Bench Press.

Workflow :

```txt
Choisir exercice
↓
Calibration
↓
L'utilisateur se place
↓
RepMotion attend
↓
Premier vrai mouvement détecté
↓
Calibration démarre automatiquement
```

Avantages :

- Compatible Bench Press
- Compatible Squat
- Compatible Shoulder Press
- Expérience plus professionnelle

---

# V3 — Calibration intelligente

Objectif :

Réduire progressivement la nécessité de calibrer.

Workflow :

```txt
Première utilisation
↓
Calibration initiale
↓
RepMotion enregistre les données
↓
RepMotion affine les seuils automatiquement
```

Le système commence à apprendre :

- amplitudes habituelles
- positions habituelles
- profils de mouvement

---

# V4 — Calibration adaptative continue

Objectif :

Faire évoluer les seuils automatiquement.

Exemple :

```txt
Séance 1
↓
Calibration
↓
Seuils initiaux
```

Puis :

```txt
Séance 20
↓
RepMotion connaît le mouvement
↓
RepMotion ajuste automatiquement les seuils
```

Le système devient plus robuste :

- fatigue
- changement de charge
- variation technique
- variation d'amplitude

---

# Vision Produit Finale

Workflow final idéal :

```txt
Clip la barre
↓
Connecte le capteur
↓
Choisis l'exercice
↓
Fais quelques répétitions d'échauffement
↓
RepMotion comprend automatiquement ton mouvement
↓
Analyse en temps réel
```

Aucune calibration manuelle.

Aucun réglage technique.

Aucune compréhension nécessaire des capteurs.

RepMotion doit devenir un système qui apprend naturellement à partir des séances de l'utilisateur.

---

# Principe fondamental

La calibration n'est pas une fonctionnalité.

La calibration est une étape temporaire vers un système capable de comprendre automatiquement le mouvement de l'utilisateur.



---

# V2.3 — Validation biomécanique

## Objectif

Valider objectivement que les événements détectés par la calibration permettent de reconstruire correctement les répétitions.

La Calibration ne détecte plus directement des répétitions.

Elle détecte uniquement les meilleurs événements Bottom et Top.

Ces événements sont ensuite utilisés par le futur Rep Detector.

Pipeline recherché :

Signal IMU

↓

Calibration

↓

Bottom / Top

↓

Rep Detector

↓

Rep Count

↓

Temps sous tension

↓

ROM

↓

Velocity

↓

Sticking Point

Cette séparation des responsabilités permet d'améliorer indépendamment :

- la détection des événements (Calibration)
- la reconstruction des répétitions (Rep Detector)

Les deux composants pourront évoluer séparément.