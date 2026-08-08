# Dataset Workflow

## Objectif

Construire une bibliothèque de signaux réutilisables afin de tester objectivement les algorithmes de RepMotion.

Les datasets permettent de comparer plusieurs versions d'un algorithme sur exactement les mêmes données, sans devoir refaire un test physique à chaque modification.

---

## Architecture

```
ESP32
    ↓
BLE
    ↓
Application mobile
    ↓
calculateCalibration()
    ↓
createCalibrationDataset()
    ↓
saveCalibrationDataset()
    ↓
HTTP POST
    ↓
tools/dataset-writer
    ↓
datasets/calibration/<exercise>/
```

---

## Utilisation

### 1. Démarrer le Dataset Writer

```bash
cd RepMotion/tools/dataset-writer
npm start
```

Le serveur écoute sur :

```
http://localhost:4000
```

---

### 2. Lancer une calibration

Depuis l'application mobile :

- Choisir un exercice
- Démarrer la calibration
- Effectuer les répétitions
- Arrêter la calibration

Le dataset est automatiquement envoyé au Dataset Writer.

---

### 3. Résultat

Le fichier est automatiquement créé dans :

```
datasets/
    calibration/
        <exercise>/
```

Exemple :

```
datasets/
    calibration/
        overhead_press/
            overhead_press_5reps_001.json
```

Les dossiers sont créés automatiquement si nécessaire.

---

## Nomenclature

```
<exercise>_<reps>reps_<numero>.json
```

Exemple :

```
overhead_press_5reps_001.json
overhead_press_5reps_002.json
rowing_5reps_001.json
```

---

## Limitations actuelles

Pour l'instant :

- `expectedReps` est fixé à **5**.
- `performedReps` est fixé à **5**.
- `samplingRateHz` est fixé à **20 Hz**.

Ces valeurs deviendront configurables dans une future version.

---

## Objectif final

Construire une bibliothèque de datasets qui servira à valider tous les futurs algorithmes de RepMotion :

- Calibration
- Rep Detector
- TUT
- ROM
- Velocity
- Sticking Point