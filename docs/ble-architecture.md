# Architecture BLE

## Objectif

Le Bluetooth Low Energy (BLE) permet la communication temps réel entre l'ESP32-C3 et l'application mobile RepMotion.

L'objectif est de transmettre les données du MPU6050 vers l'application mobile afin de permettre l'analyse biomécanique en temps réel.

---

# Architecture générale

```text
MPU6050
↓
ESP32-C3
↓
BLE Service
↓
BLE Characteristic
↓
Bluetooth Low Energy
↓
Application React Native
↓
Analyse des données
```

---

# Responsabilités

## Firmware

Le firmware est responsable de :

- Lire les données du MPU6050
- Préparer les données
- Exposer un service BLE
- Envoyer les données au téléphone

---

## Mobile

L'application mobile est responsable de :

- Scanner les périphériques BLE
- Détecter le module RepMotion
- Se connecter à l'ESP32
- Recevoir les données BLE
- Afficher les métriques temps réel

---

# Cycle de connexion

Le processus actuel est :

```text
ESP32 démarré
↓
Advertising BLE
↓
Application mobile
↓
Scan BLE
↓
Détection du périphérique RepMotion
↓
Connexion BLE
↓
Découverte des services
↓
Découverte des caractéristiques
↓
Communication active
```

---

# Périphérique BLE

Nom annoncé :

```text
RepMotion
```

L'application mobile recherche actuellement ce nom afin d'identifier le module RepMotion.

---

# Service BLE

UUID :

```text
7b7f0001-7c3a-4f6a-9f8e-1f2b3c4d5e6f
```

Responsabilité :

```text
Motion Service
```

Ce service regroupe les données liées au mouvement.

---

# Characteristic BLE

UUID :

```text
7b7f0002-7c3a-4f6a-9f8e-1f2b3c4d5e6f
```

Propriétés :

```text
READ
NOTIFY
```

Description :

- READ permet la lecture de la valeur actuelle
- NOTIFY permet l'envoi automatique des nouvelles données au téléphone

---

# État actuel

Validation réalisée :

```text
Scan BLE
✓

Connexion BLE
✓

Découverte Service
✓

Découverte Characteristic
✓

Déconnexion
✓

Reconnexion
✓
```

---

# Flux de données cible

Les données du MPU6050 seront envoyées via la characteristic BLE.

Exemple :

```text
ax=120
ay=55
az=980

gx=4
gy=1
gz=-2
```

Flux complet :

```text
MPU6050
↓
Lecture capteur
↓
ESP32
↓
Characteristic BLE
↓
Notify
↓
Application mobile
↓
Traitement
↓
Interface utilisateur
```

---

# Roadmap BLE

## Étape 1

Scan BLE

Statut :

```text
Terminé
```

---

## Étape 2

Connexion BLE

Statut :

```text
Terminé
```

---

## Étape 3

Réception des données IMU

Statut :

```text
À réaliser
```

Objectif :

```text
ESP32
↓
Notify
↓
React Native
↓
Affichage temps réel
```

---

## Étape 4

Analyse biomécanique

Statut :

```text
À réaliser
```

Objectifs :

- Détection des répétitions
- Vélocité
- ROM
- Temps sous tension
- Phases concentrique / excentrique
- Sticking point

---

## Vision finale

```text
MPU6050
↓
ESP32
↓
BLE
↓
Application mobile
↓
Analyse biomécanique temps réel
↓
Historique
↓
Backend
↓
Synchronisation cloud
```