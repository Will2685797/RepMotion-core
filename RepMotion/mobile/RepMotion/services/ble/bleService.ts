import { BleManager, Device, Subscription } from "react-native-ble-plx";
import { Buffer } from "buffer";

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

let motionStreamSubscription: Subscription | null = null;

const MOTION_SERVICE_UUID = "7b7f0001-7c3a-4f6a-9f8e-1f2b3c4d5e6f";
const MOTION_DATA_CHARACTERISTIC_UUID = "7b7f0002-7c3a-4f6a-9f8e-1f2b3c4d5e6f";

export type ImuData = {
  ax: number;
  ay: number;
  az: number;
  gx: number;
  gy: number;
  gz: number;
  reps?: number;
};

type RepPosition = "UNKNOWN" | "BOTTOM" | "TOP";

let repCount = 0;
let repPosition: RepPosition = "UNKNOWN";
let lastRepTimestamp = 0;

// On teste AY en premier.
// Ensuite on changera seulement cette ligne pour "ax" ou "az".
const TEST_AXIS: keyof Pick<ImuData, "ax" | "ay" | "az"> = "ay";

const LOW_THRESHOLD = 800;
const HIGH_THRESHOLD = 2200;
const MIN_REP_INTERVAL_MS = 700;

function updateRepDetector(data: ImuData): number {
  const value = data[TEST_AXIS];
  const now = Date.now();

  if (value < LOW_THRESHOLD) {
    repPosition = "BOTTOM";
  }

  const canCountNewRep = now - lastRepTimestamp > MIN_REP_INTERVAL_MS;

  if (value > HIGH_THRESHOLD && repPosition === "BOTTOM" && canCountNewRep) {
    repCount += 1;
    repPosition = "TOP";
    lastRepTimestamp = now;
  }

  return repCount;
}

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
function parseMotionPayload(payload: string): ImuData | null {
  const values: Partial<ImuData> = {};

  const parts = payload.split(",");

  for (const part of parts) {
    const [key, rawValue] = part.split("=");

    if (!key || rawValue === undefined) {
      return null;
    }

    const value = Number(rawValue);

    if (Number.isNaN(value)) {
      return null;
    }

    if (
      key === "ax" ||
      key === "ay" ||
      key === "az" ||
      key === "gx" ||
      key === "gy" ||
      key === "gz"
    ) {
      values[key] = value;
    }
  }

  return {
    ax: values.ax ?? 0,
    ay: values.ay ?? 0,
    az: values.az ?? 0,
    gx: values.gx ?? 0,
    gy: values.gy ?? 0,
    gz: values.gz ?? 0,
  };
}

export function startMotionStream(
  onData: (data: ImuData) => void,
  onError?: (error: unknown) => void,
): void {
  if (!connectedRepMotionDevice) {
    const error = new Error("No connected RepMotion device.");
    console.log("[BLE] Motion stream error:", error.message);
    onError?.(error);
    return;
  }

  console.log("[BLE] Starting motion stream...");

  motionStreamSubscription?.remove();

  motionStreamSubscription =
    connectedRepMotionDevice.monitorCharacteristicForService(
      MOTION_SERVICE_UUID,
      MOTION_DATA_CHARACTERISTIC_UUID,
      (error, characteristic) => {
        if (error) {
          console.log("[BLE] Motion stream error:", error);
          onError?.(error);
          return;
        }

        if (!characteristic?.value) {
          return;
        }

        const payload = Buffer.from(characteristic.value, "base64").toString(
          "utf-8",
        );

        console.log("[BLE] Motion payload:", payload);

        const parsedData = parseMotionPayload(payload);

        if (!parsedData) {
          console.log("[BLE] Invalid motion payload:", payload);
          return;
        }

        const reps = updateRepDetector(parsedData);

        const dataWithReps: ImuData = {
          ...parsedData,
          reps,
        };

        console.log("[REP DEBUG]", {
          axis: TEST_AXIS,
          value: parsedData[TEST_AXIS],
          position: repPosition,
          reps,
          ax: parsedData.ax,
          ay: parsedData.ay,
          az: parsedData.az,
        });
        onData(dataWithReps);
      },
    );
}

export function stopMotionStream(): void {
  console.log("[BLE] Stopping motion stream...");

  motionStreamSubscription?.remove();
  motionStreamSubscription = null;
}

export async function disconnectRepMotionDevice(): Promise<void> {
  console.log("[BLE] Disconnecting RepMotion device...");

  stopMotionStream();

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
