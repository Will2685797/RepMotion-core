ur objectif de compter les répétitions.

Son rôle est de comprendre le mouvement de l'utilisateur afin de produire une calibration robuste qui servira ensuite au Rep Detector.

Elle doit être capable de fonctionner sur différents exercices, différentes amplitudes et différents utilisateurs sans utiliser de seuils fixes.

---

# Fonctionnement actuel

Aujourd'hui, la calibration réalise les étapes suivantes :

```text
Capture des samples IMU
        ↓
Détection de l'axe dominant
        ↓
Calcul des percentiles
        ↓
Détection des Bottoms / Tops
        ↓
Calcul des moyennes
        ↓
Calcul du Range
        ↓
Calcul des Thresholds
        ↓
Retour d'un CalibrationResult
```

Le résultat est ensuite utilisé par le Rep Detector.

---

# Améliorations déjà réalisées

## Axe dominant dynamique

L'axe utilisé est automatiquement sélectionné.

Exemple :

```text
AX Range = 2800
AY Range = 1900
AZ Range = 7600

↓

Axe choisi = AZ
```

---

## Range dynamique

Ancien système :

```ts
MIN_VALID_RANGE = 5000;
```

Nouveau système :

```text
robustRange = p90 - p10

↓

dynamicMinRange =
max(
1500,
robustRange * 0.25
)
```

Cette approche permet désormais de calibrer correctement des exercices comme :

- Rowing
- Overhead Press

sans utiliser un seuil fixe.

---

# Problème actuel

Aujourd'hui, les Bottoms et Tops sont définis comme :

```text
Dans la zone

+

Minimum / Maximum local
```

Cette méthode fonctionne mais reste sensible :

- bruit IMU
- vibrations
- plateaux
- petites oscillations

Elle peut produire plusieurs faux Bottoms ou faux Tops pendant une seule répétition.

---

# Vision V2.3

L'objectif n'est plus simplement de détecter des extrema.

L'objectif est de détecter des événements biomécaniques.

Un Bottom devrait être validé uniquement si :

```text
✓ dans Bottom Zone

✓ minimum local

✓ suffisamment éloigné du précédent Bottom

✓ suivi d'une vraie remontée

✓ prominence suffisante
```

Même principe pour le Top :

```text
✓ dans Top Zone

✓ maximum local

✓ suffisamment éloigné du précédent Top

✓ suivi d'une vraie descente

✓ prominence suffisante
```

---

# Notion de Prominence

Exemple valide :

```text
16000

↓

19000
```

La barre repart réellement.

↓

Bottom valide.

---

Exemple invalide :

```text
16000

↓

16150
```

Le mouvement est trop faible.

↓

Simple bruit.

↓

Bottom rejeté.

---

# Objectif

Obtenir une calibration capable de détecter uniquement les véritables événements du mouvement.

Le résultat attendu reste un :

```text
CalibrationResult
```

mais construit à partir d'événements beaucoup plus fiables.

---

# Rôle final de la calibration

La calibration doit uniquement répondre à la question :

> Où se trouvent les véritables Bottoms et Tops du mouvement ?

Elle ne compte pas les répétitions.

Elle prépare simplement toutes les informations nécessaires au Rep Detector.