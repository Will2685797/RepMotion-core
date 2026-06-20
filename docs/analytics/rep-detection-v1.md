# RepMotion – Architecture actuelle de détection des répétitions

## Date

Juin 2026

---

# Objectif

Documenter le fonctionnement actuel du pipeline IMU → BLE → Mobile → Rep Counter avant la mise en place de Rep Detection V2.

Cette documentation représente l'état réel du système après validation du payload BLE compact 3 axes.

---

# Architecture actuelle

```text
MPU6050
    ↓
ESP32-C3
    ↓
BLE Notification
    ↓
bleService.ts
    ↓
Rep Detector V1
    ↓
Zustand Store
    ↓
Accueil.tsx
    ↓
RepCounterRing
```

---

# Flux complet des données

## 1. Lecture MPU6050

Fichier :

```text
firmware/src/main.cpp
```

Le firmware lit les données brutes du MPU6050 à intervalle fixe.

Configuration actuelle :

```cpp
READ_INTERVAL_MS = 500
```

Ce qui donne environ :

```text
2 échantillons / seconde
```

À chaque lecture :

```cpp
readMpu6050Raw(data);
```

---

## 2. Envoi BLE

Fichier :

```text
firmware/src/ble/ble_service.cpp
```

Fonction :

```cpp
updateMotionDataCharacteristic()
```

Construction du payload :

```cpp
"%d,%d,%d"
```

Contenu :

```text
accelX,accelY,accelZ
```

Exemple :

```text
1450,2100,980
```

Puis :

```cpp
setValue(payload);
notify();
```

Le payload est envoyé au mobile via BLE.

---

## 3. Réception BLE côté mobile

Fichier :

```text
mobile/RepMotion/services/ble/bleService.ts
```

Fonction :

```ts
startMotionStream()
```

Le mobile :

1. reçoit la notification BLE
2. décode le Base64
3. récupère la chaîne texte

Exemple :

```text
1450,2100,980
```

---

## 4. Parsing du payload

Fonction :

```ts
parseMotionPayload()
```

Transformation :

```text
"1450,2100,980"
```

↓

```ts
{
  ax: 1450,
  ay: 2100,
  az: 980,
  gx: 0,
  gy: 0,
  gz: 0
}
```

Notes :

- seulement 3 axes actuellement
- gyro désactivé
- payload compact validé
- invalidSamples = 0

Le transport BLE est considéré comme fonctionnel.

---

# Détection des répétitions (V1)

## Emplacement

Fichier :

```text
mobile/RepMotion/services/ble/bleService.ts
```

Fonction :

```ts
updateRepDetector()
```

---

## Axe utilisé

Actuellement :

```ts
TEST_AXIS = "ay"
```

Seul l'axe Y est utilisé.

---

## Seuils

```ts
LOW_THRESHOLD = 800
HIGH_THRESHOLD = 2200
```

---

## Cooldown

```ts
MIN_REP_INTERVAL_MS = 700
```

---

## Logique actuelle

Machine à états simplifiée :

```text
AY < 800
↓
BOTTOM

AY > 2200
↓
REP++
↓
TOP
```

Pseudo-code :

```ts
if (ay < LOW_THRESHOLD)
{
    position = BOTTOM;
}

if (
    ay > HIGH_THRESHOLD &&
    position === BOTTOM &&
    elapsed > MIN_REP_INTERVAL_MS
)
{
    repCount++;
    position = TOP;
}
```

---

# Injection dans l'application

Toujours dans :

```text
bleService.ts
```

Après détection :

```ts
const reps = updateRepDetector(parsedData);

const dataWithReps = {
  ...parsedData,
  reps,
};
```

Puis :

```ts
onData(dataWithReps);
```

---

# Store global Zustand

Fichier :

```text
mobile/RepMotion/store/imuStore.ts
```

Responsabilité :

```text
Stockage seulement
Aucun calcul
```

Structure :

```ts
imuData
setImuData()
resetImuData()
```

Le store agit uniquement comme relais.

---

# Écran Appareil

Fichier :

```text
mobile/RepMotion/ecrans/Appareil.tsx
```

Réception :

```ts
setImuData(data);
setGlobalImuData(data);
```

Deux mises à jour :

1. état local Appareil
2. store global Zustand

---

# Écran Accueil

Fichier :

```text
mobile/RepMotion/ecrans/Accueil.tsx
```

Lecture :

```ts
const liveImuData = useImuStore(
  (state) => state.imuData
);
```

Puis :

```ts
const liveReps =
  liveImuData?.reps ?? reps;
```

Affichage :

```tsx
<RepCounterRing reps={liveReps} />
```

---

# Ce qui est validé

## BLE

✅ Connexion BLE

✅ Réception notifications

✅ Parsing

✅ Payload compact 3 axes

✅ invalidSamples = 0

---

## UI

✅ Mise à jour temps réel

✅ Store Zustand

✅ Affichage des répétitions

✅ AX / AY / AZ visibles

---

# Limites actuelles

## 1. Fréquence d'échantillonnage très faible

Actuellement :

```text
500 ms
=
2 Hz
```

Peut manquer plusieurs événements pendant une répétition.

---

## 2. Axe fixe

```ts
TEST_AXIS = "ay"
```

Aucune validation objective que AY soit réellement l'axe dominant.

---

## 3. Seuils fixes

```ts
800
2200
```

Ne s'adaptent pas :

- à l'utilisateur
- à l'exercice
- à l'orientation du capteur

---

## 4. Pas de calibration

Aucune étape :

```text
Position basse
Position haute
```

avant le comptage.

---

## 5. Machine à états minimale

Pas de :

- hystérésis
- validation d'échantillons
- confirmation de zone
- seuils dynamiques

---

# Problème observé

Exemple réel :

```text
15 répétitions réelles
↓
5 répétitions détectées
```

Le problème actuel est :

```text
Rep Detection V1
```

et non :

```text
BLE
Payload
Transport
UI
```

---

# Direction future : Rep Detection V2

Objectif :

```text
10-15 reps réelles
↓
10-15 reps détectées
```

Étapes prévues :

1. Diagnostic min/max AX AY AZ
2. Validation de l'axe dominant
3. Calibration MVP
4. Seuils dynamiques
5. Machine à états robuste
6. Validation Smith Machine

---

# Hors périmètre pour le moment

Non traité avant stabilisation du rep count :

- Velocity
- ROM
- TUT
- Sticking Point
- Form Score
- IA
- Multi-exercices
- Gyroscope
- Payload binaire
- PCB V2
- Hardware V2

Priorité absolue :

```text
Rep Count fiable
```