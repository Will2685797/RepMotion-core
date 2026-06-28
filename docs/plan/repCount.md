# RepMotion — Vision du Rep Detector

# Vision

Le Rep Detector ne devrait pas chercher à comprendre le mouvement.

Son rôle est simplement d'utiliser les événements détectés par la calibration afin de compter les répétitions de manière déterministe.

---

# Fonctionnement actuel

Aujourd'hui :

```text
WAITING_BOTTOM

↓

Bottom confirmé

↓

WAITING_TOP

↓

Top confirmé

↓

Rep +1
```

Cette logique fonctionne relativement bien mais présente plusieurs limites.

---

# Problèmes identifiés

## 1. Axe hardcodé

La calibration choisit dynamiquement :

```text
AX
AY
AZ
```

Mais actuellement le Rep Detector lit encore un axe codé en dur.

Décision :

Le Rep Detector devra utiliser :

```text
CalibrationResult.axis
```

afin d'utiliser exactement le même axe que celui choisi pendant la calibration.

---

## 2. Définition actuelle d'une répétition

Aujourd'hui :

```text
Bottom

↓

Top

↓

Rep +1
```

Cette logique ne représente pas un cycle biomécanique complet.

---

# Nouvelle définition

Une répétition est :

```text
Bottom

↓

Phase concentrique

↓

Top

↓

Phase excentrique

↓

Bottom

↓

Rep +1
```

Autrement dit :

```text
Bottom → Top → Bottom
```

---

# Les répétitions sont liées

Les répétitions ne sont pas indépendantes.

Exemple :

```text
B1

↓

T1

↓

B2

↓

T2

↓

B3

↓

T3

↓

B4
```

Les répétitions deviennent :

```text
Rep 1

B1 → T1 → B2

Rep 2

B2 → T2 → B3

Rep 3

B3 → T3 → B4
```

Observation importante :

Le dernier Bottom d'une répétition devient automatiquement le premier Bottom de la suivante.

Le mouvement est donc continu.

---

# Nouvelle philosophie

Le Rep Detector ne devrait plus fonctionner comme une succession d'états indépendants.

Il devrait construire une chaîne continue d'événements :

```text
Bottom

↓

Top

↓

Bottom

↓

Top

↓

Bottom
```

Les répétitions seraient ensuite déduites de cette chaîne.

---

# Avantages

Cette architecture fournit naturellement :

Rep Count

```text
B → T → B
```

Temps sous tension

```text
Temps entre les événements.
```

Temps concentrique

```text
Bottom → Top
```

Temps excentrique

```text
Top → Bottom
```

ROM

```text
Amplitude Bottom ↔ Top
```

Velocity

```text
Variation entre Bottom et Top
sur la durée.
```

Sticking Point

```text
Analyse de la vitesse
pendant la phase concentrique.
```

---

# Vision finale

Le Rep Detector ne sera plus simplement un compteur.

Il deviendra un moteur de segmentation biomécanique.

Toutes les métriques de RepMotion découleront de la même chaîne d'événements :

```text
Bottom

↓

Top

↓

Bottom

↓

Top

↓

Bottom
```

Le Rep Count deviendra alors une simple conséquence de cette segmentation.