# Développement Firmware

## Environnement

Le firmware de RepMotion est développé sous WSL Ubuntu.

Technologies utilisées :

- ESP32-C3
- MPU6050
- Arduino Framework
- PlatformIO
- WSL Ubuntu

Architecture actuelle :

```text
WSL Ubuntu
│
├── PlatformIO
├── Firmware ESP32-C3
└── MPU6050
```

---

# Connexion ESP32 à WSL

## 1. Vérifier le BUSID de l'ESP32

Depuis PowerShell Administrateur :

```powershell
usbipd list
```

Résultat attendu :

```text
BUSID  VID:PID    DEVICE
X-X    xxxx:xxxx  USB JTAG/serial debug unit
```

---

## 2. Attacher l'ESP32 à WSL

Depuis PowerShell Administrateur :

```powershell
usbipd attach --wsl --busid <BUSID>
```

Exemple :

```powershell
usbipd attach --wsl --busid 1-8
```

---

## 3. Vérifier que WSL détecte l'ESP32

Depuis WSL :

```bash
ls /dev/tty*
```

Résultat attendu :

```text
/dev/ttyACM0
```

---

# Structure Firmware

```text
firmware/
├── include/
├── lib/
├── src/
│   ├── ble/
│   ├── main.cpp
│   ├── mpu6050_reader.cpp
│   └── i2c_scanner.cpp
├── test/
└── platformio.ini
```

---

# Compilation

Compiler le firmware :

```bash
pio run
```

Transformation :

```text
Code C++
↓
Compilation
↓
firmware.bin
```

Le fichier firmware.bin contient le programme machine destiné à l'ESP32.

---

# Upload

Téléverser le firmware sur l'ESP32 :

```bash
pio run --target upload --upload-port /dev/ttyACM0
```

Transformation :

```text
firmware.bin
↓
Flash ESP32
↓
Redémarrage
↓
Exécution
```

---

# Monitor Série

Afficher les logs série de l'ESP32 :

```bash
pio device monitor --port /dev/ttyACM0 --baud 115200 --rts 0 --dtr 0
```

Important :

Sous ESP32-C3 USB natif, RTS et DTR sont désactivés afin d'éviter les redémarrages continus de la carte.

---

# Workflow Firmware

Cycle de travail habituel :

```text
Modifier le code
↓
Compilation
↓
Upload
↓
Monitor Série
↓
Validation
```

Commandes :

```bash
pio run

pio run --target upload --upload-port /dev/ttyACM0

pio device monitor --port /dev/ttyACM0 --baud 115200 --rts 0 --dtr 0
```

---

# Fonctionnalités validées

Validation réalisée :

- Configuration PlatformIO
- Compilation firmware
- Upload ESP32-C3
- Détection USB sous WSL
- Communication série
- Initialisation BLE
- Advertising BLE
- Service BLE personnalisé
- Characteristic BLE personnalisée
- Reconnexion BLE après déconnexion

---

# Architecture BLE actuelle

Nom du périphérique :

```text
RepMotion
```

Service BLE :

```text
7b7f0001-7c3a-4f6a-9f8e-1f2b3c4d5e6f
```

Characteristic BLE :

```text
7b7f0002-7c3a-4f6a-9f8e-1f2b3c4d5e6f
```

Capacités :

```text
READ
NOTIFY
```

---

# État actuel

Le firmware est capable de :

```text
ESP32
↓
Advertising BLE
↓
Connexion Android
↓
Découverte Service BLE
↓
Découverte Characteristic BLE
↓
Déconnexion
↓
Reconnexion
```

Le canal BLE entre l'ESP32 et l'application mobile est maintenant validé.

---

# Prochaine étape

Feature :

```text
feature/ble-motion-stream
```

Objectif :

```text
MPU6050
↓
Lecture IMU
↓
Characteristic BLE
↓
Notify
↓
Application mobile
↓
Réception temps réel
```

Premières données attendues :

```text
ax
ay
az

gx
gy
gz
```

Cette étape permettra de valider le flux temps réel entre le capteur et l'application mobile avant l'implémentation des métriques biomécaniques.