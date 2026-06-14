import { BleManager, Device } from "react-native-ble-plx";

// =====================================================
// CONFIGURATION
// =====================================================

// Nom du module BLE que nous recherchons.
// L'ESP32 annonce actuellement "RepMotion".
const REPMOTION_DEVICE_NAME = "RepMotion";

// =====================================================
// BLE MANAGER
// =====================================================

// BleManager est fourni par la librairie react-native-ble-plx.
//
// C'est lui qui gère tout le Bluetooth :
// - scan
// - connexion
// - lecture
// - écriture
// - notifications
//
// On crée UNE seule instance et on la réutilise partout.
const bleManager = new BleManager();
let connectedRepMotionDevice: Device | null = null;

// =====================================================
// SCAN BLE
// =====================================================

/**
 * Recherche un appareil BLE nommé RepMotion.
 *
 * Quand l'appareil est trouvé :
 * - le scan est arrêté
 * - on retourne le Device trouvé
 */
export function scanForRepMotion(
  onDeviceFound: (device: Device) => void,
  onError?: (error: unknown) => void,
): void {
  console.log("[BLE] Starting scan...");

  // Sécurité :
  // avant de démarrer un nouveau scan, on arrête tout scan déjà actif.
  // Ça évite d'avoir plusieurs scans BLE en parallèle si l'utilisateur
  // clique plusieurs fois sur le bouton Connecter.
  bleManager.stopDeviceScan();

  // Démarre un scan BLE.
  //
  // null, null = aucun filtre.
  // On écoute tous les appareils BLE autour.
  bleManager.startDeviceScan(null, null, (error, device) => {
    // Gestion d'erreur
    if (error) {
      console.log("[BLE] Scan error:", error);
      onError?.(error);
      return;
    }

    // Sécurité
    if (!device) return;

    // Debug complet
    console.log("[BLE] Device found:", {
      id: device.id,
      name: device.name,
      localName: device.localName,
      rssi: device.rssi,
    });

    // Certains appareils utilisent name
    // d'autres localName.
    const name = device.name ?? device.localName ?? "";

    // Vérifie si c'est notre module RepMotion.
    if (name.includes(REPMOTION_DEVICE_NAME)) {
      console.log("[BLE] RepMotion device found:", name);

      // On arrête immédiatement le scan.
      bleManager.stopDeviceScan();

      // On retourne l'appareil trouvé.
      onDeviceFound(device);
    }
  });
}

// =====================================================
// CONNEXION BLE
// =====================================================

/**
 * Établit une connexion réelle avec l'ESP32.
 *
 * Étapes :
 * 1. Connexion
 * 2. Découverte des services
 * 3. Découverte des caractéristiques
 * 4. Affichage des UUID dans les logs
 */
export async function connectToRepMotionDevice(
  device: Device,
): Promise<Device> {
  console.log("[BLE] Connecting to device...", {
    id: device.id,
    name: device.name,
    localName: device.localName,
  });

  // ---------------------------------------------------
  // ÉTAPE 1 : Connexion BLE
  // ---------------------------------------------------

  const connectedDevice = await device.connect();

  console.log("[BLE] Connected:", {
    id: connectedDevice.id,
    name: connectedDevice.name,
  });

  // ---------------------------------------------------
  // ÉTAPE 2 : Discovery
  // ---------------------------------------------------

  // Le téléphone demande :
  //
  // "Quels services exposes-tu ?"
  //
  // "Quelles caractéristiques exposes-tu ?"
  //
  // Sans cette étape, on ne peut généralement
  // pas lire ou écouter les données BLE.
  const discoveredDevice =
    await connectedDevice.discoverAllServicesAndCharacteristics();

  console.log("[BLE] Services and characteristics discovered");

  // ---------------------------------------------------
  // ÉTAPE 3 : Liste des services
  // ---------------------------------------------------

  const services = await discoveredDevice.services();

  for (const service of services) {
    console.log("[BLE] Service:", service.uuid);

    // -------------------------------------------------
    // ÉTAPE 4 : Liste des caractéristiques
    // -------------------------------------------------

    const characteristics = await service.characteristics();

    for (const characteristic of characteristics) {
      console.log("[BLE] Characteristic:", {
        serviceUUID: service.uuid,
        characteristicUUID: characteristic.uuid,

        // Peut être lue ?
        isReadable: characteristic.isReadable,

        // Peut être écrite avec confirmation ?
        isWritableWithResponse: characteristic.isWritableWithResponse,

        // Peut être écrite sans confirmation ?
        isWritableWithoutResponse: characteristic.isWritableWithoutResponse,

        // Peut envoyer des notifications ?
        isNotifiable: characteristic.isNotifiable,

        // Peut envoyer des indications ?
        isIndicatable: characteristic.isIndicatable,
      });
    }
  }
  connectedRepMotionDevice = discoveredDevice;

  // Retourne le device complètement connecté.
  return discoveredDevice;
}

// =====================================================
// ARRÊT DU SCAN
// =====================================================


export async function disconnectRepMotionDevice(): Promise<void> {
  console.log("[BLE] Disconnecting RepMotion device...");

  if (!connectedRepMotionDevice) {
    console.log("[BLE] No connected RepMotion device to disconnect");
    return;
  }

  await connectedRepMotionDevice.cancelConnection();

  console.log("[BLE] RepMotion device disconnected");

  connectedRepMotionDevice = null;
}

/**
 * Arrête un scan BLE en cours.
 */
export function stopBleScan(): void {
  console.log("[BLE] Stopping scan...");
  bleManager.stopDeviceScan();
}
