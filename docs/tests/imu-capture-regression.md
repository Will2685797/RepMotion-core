# IMU Capture – Regression Baseline

## Objectif

Protéger le comportement actuel de la chaîne de capture IMU avant l’introduction de `Capture IMU V2`.

La chaîne concernée est :

```text
MPU6050
→ firmware ESP32
→ payload BLE
→ réception mobile
→ parser
→ ImuData
```

Cette baseline doit nous permettre de modifier progressivement le firmware et le BLE tout en détectant immédiatement une régression.

---

## Comportement actuel à protéger

### Lecture MPU6050

Le firmware lit actuellement les six axes :

```text
accelX
accelY
accelZ

gyroX
gyroY
gyroZ
```

Les valeurs sont des données brutes `int16`.

Le gyroscope est donc déjà lu côté firmware.

---

## Payload BLE actuel

Même si les six axes sont lus, le BLE transmet actuellement uniquement :

```text
ax,ay,az
```

sous forme de CSV texte.

Exemple :

```text
-276,-328,18624
```

Le comportement historique actuel doit rester identique tant que le protocole BLE V2 n’est pas volontairement introduit.

---

## Fréquence actuelle

Le firmware utilise actuellement :

```text
READ_INTERVAL_MS = 50
```

Ce qui correspond à une fréquence cible de :

```text
20 Hz
```

Cette fréquence ne doit pas changer pendant la création de la baseline.

---

## Parser mobile actuel

Le parser BLE mobile attend exactement trois valeurs :

```text
ax,ay,az
```

Après parsing, il construit actuellement un objet avec :

```text
ax = valeur reçue
ay = valeur reçue
az = valeur reçue

gx = 0
gy = 0
gz = 0
```

Les valeurs gyroscope du mobile ne représentent donc actuellement pas des mesures réelles.

---

## Tests à couvrir

La baseline doit couvrir au minimum les cas suivants.

### Payload firmware historique

Vérifier :

- génération d’un payload CSV valide
- valeurs positives
- valeurs négatives
- valeurs proches des limites `int16`
- présence uniquement de `ax,ay,az`
- absence de modification du format historique

Exemple attendu :

```text
123,-456,17890
```

---

## Parser mobile historique

Vérifier :

- parsing d’un payload CSV valide
- parsing de valeurs négatives
- rejet d’un payload vide
- rejet d’un payload mal formé
- rejet d’un nombre incorrect de champs
- rejet d’une valeur non numérique
- conservation de :

```text
gx = 0
gy = 0
gz = 0
```

dans le comportement V1 actuel.

---

## Cadence

Si cela peut être testé proprement sans créer un test fragile, protéger :

```text
READ_INTERVAL_MS = 50
```

Il ne faut pas ajouter un test qui lit simplement le code source sous forme de texte.

La priorité reste la qualité et la maintenabilité des tests.

---

## Ce que cette baseline ne doit pas encore tester

Ne pas introduire ici :

```text
sampleIndex
timestampMs
payload BLE binaire
gyro réel côté mobile
50 Hz
100 Hz
dataset V2
```

Ces éléments feront partie des nouveaux tests lorsque `Capture IMU V2` sera implémenté.

---

## Règle avant Capture IMU V2

Avant toute modification concernant :

```text
sampleIndex
timestampMs
gyro transmis
payload BLE
parser V2
fréquence d’acquisition
```

la baseline actuelle doit passer.

---

## Règle après chaque étape

Après chaque modification importante :

```text
ancienne baseline
→ toujours verte
```

Puis :

```text
nouveaux tests V2
→ ajoutés pour couvrir le nouveau comportement
```

Cette méthode doit permettre de distinguer clairement :

```text
régression
vs
changement volontaire
```

---

## Objectif de Capture IMU V2

La future chaîne cible sera :

```text
MPU6050
→ ax ay az gx gy gz
→ sampleIndex
→ timestampMs
→ payload BLE compact
→ mobile
→ dataset V2
```

Mais cette baseline documente uniquement le comportement stable existant avant cette migration.

---

## Statut

```text
À implémenter avant Capture IMU V2
```

## Commandes

Toutes les commandes ci-dessous sont données depuis :

```text
RepMotion/
```

### Tests du parser BLE mobile V1

```powershell
npm --prefix mobile/RepMotion run test:legacy-payload
```

Résultat de référence :

```text
tests 5
pass 5
fail 0
```

---

### Compilation du firmware de production

```powershell
pio run -d firmware -e esp32-c3-devkitm-1
```

Cette commande permet de vérifier que les changements de baseline n'empêchent pas le firmware ESP32 de compiler.

---

### Tests firmware

Avec l'ESP32 connecté :

```powershell
cd firmware
pio test -e esp32-c3-devkitm-1
cd ..
```

Les tests firmware couvrent notamment :

- génération du CSV historique `ax,ay,az`
- valeurs négatives
- bornes `int16`
- exactement trois champs accélération
- `READ_INTERVAL_MS == 50`

Sans ESP32 / port série disponible, PlatformIO peut compiler les tests mais ne peut pas terminer leur exécution sur le matériel.

---

## Baseline actuelle

Avant Capture IMU V2 :

```text
Mobile legacy payload
→ 5 / 5 tests passants

TypeScript
→ compilation réussie

Firmware production
→ compilation réussie

Firmware regression tests
→ compilation réussie
→ exécution hardware à confirmer avec ESP32 connecté
```

Ces commandes doivent être relancées après les modifications de Capture IMU V2 afin de détecter toute régression du comportement historique.

## Compilation du firmware sous Windows

Depuis le dossier :

```text
RepMotion/firmware
```

Utiliser :

```powershell
& "$env:USERPROFILE\.platformio\penv\Scripts\platformio.exe" run -e esp32-c3-devkitm-1
```

Cette commande utilise directement le PlatformIO Core installé par l’extension VS Code.

Résultat attendu :

```text
[SUCCESS]
```

Exemple de baseline actuelle :

```text
RAM   : 11.9 %
Flash : 76.9 %
Build : SUCCESS
```

Cette compilation doit réussir avant et après toute modification importante du firmware IMU.