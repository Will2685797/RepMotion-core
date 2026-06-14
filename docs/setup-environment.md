# Configuration de l'environnement

## Objectif

Ce document décrit l'environnement de développement utilisé pour RepMotion.

---

# Architecture de développement

Le projet utilise deux environnements distincts :

```text
Windows
│
├── React Native
├── Expo Development Build
├── Android
├── Metro Bundler
└── VS Code

WSL Ubuntu
│
├── Firmware ESP32-C3
├── PlatformIO
└── Outils Linux
```

---

# Structure du projet

```text
RepMotion-Core/
│
├── README.md
├── docs/
│
└── RepMotion/
    ├── api/
    ├── firmware/
    ├── mobile/
    ├── SQLRepMotion/
    └── devis/
```

---

# Outils requis

## Windows

Installer :

- Git
- VS Code
- Node.js LTS
- Android Studio
- Android SDK
- ADB
- Expo CLI

Validation :

```powershell
node -v
npm -v
adb version
```

---

# WSL

Distribution :

```text
Ubuntu 24.04
```

Validation :

```bash
uname -a
```

---

# Firmware

Technologies :

- ESP32-C3
- Arduino Framework
- PlatformIO
- MPU6050

Validation :

```bash
pio --version
```

---

# Mobile

Technologies :

- React Native
- Expo Development Build
- TypeScript
- react-native-ble-plx

Validation :

```powershell
npx expo --version
```

---

# Backend

Technologies :

- FastAPI
- SQLAlchemy
- SQLite
- PostgreSQL
- JWT

Validation :

```bash
python --version
pip --version
```

---

# Dépôts Git

Le projet principal :

```text
RepMotion-Core
```

Branche de référence :

```text
main
```

Workflow :

```text
main
↓
feature/*
↓
Pull Request
↓
Merge
↓
main
```

---

# Configuration Android

Activer :

```text
Options développeur
↓
Débogage USB
```

Validation :

```powershell
adb devices
```

Résultat attendu :

```text
XXXXXXXXXXXX device
```

---

# Configuration ESP32

Connexion via USB :

```powershell
usbipd list
usbipd attach --wsl --busid <BUSID>
```

Validation :

```bash
ls /dev/tty*
```

Résultat attendu :

```text
/dev/ttyACM0
```

---

# Documentation associée

Voir également :

- mobile-development.md
- firmware-development.md
- ble-architecture.md