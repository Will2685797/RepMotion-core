# Développement Mobile

## Environnement

Le développement mobile de RepMotion est réalisé sous Windows.

Technologies utilisées :

- React Native
- Expo Development Build
- TypeScript
- Android
- react-native-ble-plx

Architecture actuelle :

```text
Windows
│
├── React Native
├── Metro Bundler
├── Android Development Build
└── VS Code
```

---

# Démarrage de l'environnement mobile

## 1. Vérifier que le téléphone Android est détecté

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices
```

Résultat attendu :

```text
List of devices attached
XXXXXXXXXXXX    device
```

---

## 2. Rediriger le port Metro

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" reverse tcp:8081 tcp:8081
```

Cette commande permet à l'application Android de communiquer avec Metro exécuté sur Windows.

---

## 3. Se positionner dans le projet mobile

```powershell
cd C:\dev\RepMotion-core\RepMotion\mobile\RepMotion
```

---

## 4. Démarrer Metro

```powershell
npx expo start --dev-client --clear
```

Résultat attendu :

```text
Metro waiting on http://localhost:8081
```

---

## 5. Ouvrir l'application RepMotion

Lancer l'application RepMotion installée sur le téléphone Android.

Les logs React Native doivent apparaître dans le terminal Metro.

---

# Rechargement rapide

Depuis le terminal Metro :

```text
r
```

Recharge l'application.

---

# Validation BLE

Procédure actuelle de validation :

```text
Appareil
↓
Connecter
↓
Scan BLE
↓
Détection RepMotion
↓
Connexion BLE
↓
Découverte des services
↓
Découverte des caractéristiques
```

Les logs BLE doivent apparaître dans Metro.

---

# Commandes utiles

## Vérifier les appareils Android connectés

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" devices
```

## Redémarrer ADB

```powershell
& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" kill-server

& "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe" start-server
```

## Nettoyer le cache Metro

```powershell
npx expo start --dev-client --clear
```

## Vérifier le statut Git

```powershell
git status
```