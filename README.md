# RepMotion-Core

RepMotion est un système d'analyse biomécanique en temps réel pour la musculation.

Le système utilise un ESP32-C3 et un capteur IMU afin de mesurer :

- Nombre de répétitions
- Amplitude (ROM)
- Vitesse
- Temps sous tension (TUT)
- Phases concentrique / excentrique
- Sticking point
- Stabilité de la barre

---

# Architecture

RepMotion est composé de trois parties :

## Mobile

Application React Native.

Responsabilités :

- Connexion Bluetooth avec l'ESP32
- Affichage temps réel
- Historique des entraînements
- Visualisation des métriques

---

## Backend

API FastAPI.

Responsabilités :

- Authentification JWT
- Gestion des utilisateurs
- Synchronisation des entraînements
- Analyse avancée
- Stockage des données

---

## Firmware

ESP32-C3 + MPU6050.

Responsabilités :

- Acquisition des données IMU
- Prétraitement
- Transmission Bluetooth
- Temps réel

---

# Firmware

## Environnement

- ESP32-C3
- Framework Arduino
- PlatformIO
- WSL Ubuntu 24.04

## Connexion ESP32 à WSL

Dans PowerShell Administrateur :

```powershell
usbipd list
usbipd attach --wsl --busid <BUSID>

## Structure

```text
firmware/
├── include/
├── lib/
├── src/
│   └── main.cpp
├── test/
└── platformio.ini
```

## Configuration actuelle

```ini
[env:esp32-c3-devkitm-1]
platform = espressif32
board = esp32-c3-devkitm-1
framework = arduino
```

---

# Workflow Firmware

## Compilation

Compile le code C++ :

```bash
pio run
```

Transformation :

```text
main.cpp
↓
Compilation
↓
firmware.bin
```

Le fichier firmware.bin contient le programme machine destiné à l'ESP32.

---

## Upload

Envoie le firmware dans la mémoire Flash de l'ESP32 :

```bash
pio run --target upload --upload-port /dev/ttyACM0
```

Exemple :

```text
Firmware
↓
Flash ESP32
↓
Redémarrage
↓
Exécution
```

---

## Monitor Série

Lecture des messages envoyés par l'ESP32 :

```bash
pio device monitor --port /dev/ttyACM0 --baud 115200 --rts 0 --dtr 0
```

Important :

Sous ESP32-C3 USB natif, il est parfois nécessaire de désactiver RTS et DTR pour éviter les resets continus.

---

# Mémoire ESP32

## Flash

Mémoire persistante.

Contient :

- firmware.bin

Conserve les données même lorsque l'alimentation est coupée.

---

## RAM

Mémoire temporaire utilisée pendant l'exécution.

Perdue lorsque l'ESP32 est redémarré ou éteint.

---

# Cycle d'exécution Arduino

Au démarrage :

```cpp
setup();
```

Exécuté une seule fois.

Puis :

```cpp
loop();
```

Exécuté en boucle infinie.

Conceptuellement :

```cpp
while(true)
{
    loop();
}
```

---

# Première validation matérielle

Validation réalisée le 7 juin 2026.

Succès :

- Création projet PlatformIO
- Compilation firmware
- Upload firmware ESP32-C3
- Détection USB sous WSL
- Communication série fonctionnelle

Sortie observée :

```text
RepMotion firmware boot
ESP32 ready
RepMotion heartbeat
RepMotion heartbeat
RepMotion heartbeat
...
```

---

# Prochaine étape

Intégration du MPU6050 :

Objectif :

```text
MPU6050
↓
Lecture Accéléromètre
↓
Lecture Gyroscope
↓
Affichage Série
↓
Validation données temps réel
```
