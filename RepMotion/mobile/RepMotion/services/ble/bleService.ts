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

type AxisName = "ax" | "ay" | "az";
type AxisRange = { min: number; max: number };
type RepDetectorState = "WAITING_BOTTOM" | "WAITING_TOP";

let repCount = 0;
let repState: RepDetectorState = "WAITING_BOTTOM";
let bottomSampleCount = 0;
let topSampleCount = 0;
let repLockedUntil = 0;

let receivedSamples = 0;
let validSamples = 0;
let invalidSamples = 0;

const AXES: AxisName[] = ["ax", "ay", "az"];
const AXIS_DIAG_INTERVAL = 50;

const axisDiagnostics: Record<AxisName, AxisRange> = {
  ax: { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY },
  ay: { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY },
  az: { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY },
};

const REP_AXIS: AxisName = "az";
const REP_BOTTOM_THRESHOLD = 17000;
const REP_TOP_THRESHOLD = 19000;
const REP_REQUIRED_SAMPLES = 3;
const REP_LOCK_MS = 1200;

function getAxisStats(axis: AxisName) {
  const stats = axisDiagnostics[axis];

  return {
    min: stats.min,
    max: stats.max,
    amplitude: stats.max - stats.min,
  };
}

function updateAxisDiagnostics(data: ImuData): void {
  for (const axis of AXES) {
    const value = data[axis];
    const stats = axisDiagnostics[axis];

    stats.min = Math.min(stats.min, value);
    stats.max = Math.max(stats.max, value);
  }

  if (validSamples % AXIS_DIAG_INTERVAL !== 0) {
    return;
  }

  const axisStats = {
    ax: getAxisStats("ax"),
    ay: getAxisStats("ay"),
    az: getAxisStats("az"),
  };

  const dominantAxis = AXES.reduce((currentDominant, axis) =>
    axisStats[axis].amplitude > axisStats[currentDominant].amplitude
      ? axis
      : currentDominant,
  );

  console.log("[IMU AXIS DIAG]", {
    samples: validSamples,
    ...axisStats,
    dominantAxis,
  });
}

function logRepV2Diagnostics(value: number): void {
  if (validSamples % AXIS_DIAG_INTERVAL !== 0) {
    return;
  }

  console.log("[REP V2 DIAG]", {
    state: repState,
    reps: repCount,
    az: value,
    bottomThreshold: REP_BOTTOM_THRESHOLD,
    topThreshold: REP_TOP_THRESHOLD,
  });
}

function updateRepDetector(data: ImuData): number {
  const value = data[REP_AXIS];
  const now = Date.now();

  logRepV2Diagnostics(value);

  if (now < repLockedUntil) {
    return repCount;
  }

  if (repState === "WAITING_BOTTOM") {
    topSampleCount = 0;

    if (value <= REP_BOTTOM_THRESHOLD) {
      bottomSampleCount += 1;
    } else {
      bottomSampleCount = 0;
    }

    if (bottomSampleCount >= REP_REQUIRED_SAMPLES) {
      bottomSampleCount = 0;
      repState = "WAITING_TOP";
    }

    return repCount;
  }

  if (repState === "WAITING_TOP") {
    bottomSampleCount = 0;

    if (value >= REP_TOP_THRESHOLD) {
      topSampleCount += 1;
    } else {
      topSampleCount = 0;
    }

    if (topSampleCount >= REP_REQUIRED_SAMPLES) {
      repCount += 1;
      topSampleCount = 0;
      repState = "WAITING_BOTTOM";
      repLockedUntil = now + REP_LOCK_MS;
    }

    return repCount;
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
// PARSING PAYLOAD IMU
// =====================================================
function parseMotionPayload(payload: string): ImuData | null {
  const parts = payload.split(",");

  if (parts.length !== 3) {
    console.log("[BLE] Invalid motion payload missing fields:", {
      payload,
      expectedFields: ["ax", "ay", "az"],
      receivedParts: parts.length,
      reason: "expected compact accel payload: ax,ay,az",
    });
    return null;
  }

  const [rawAx, rawAy, rawAz] = parts;
  const rawValues = [rawAx, rawAy, rawAz];
  const axes = ["ax", "ay", "az"] as const;
  const values: Partial<Pick<ImuData, "ax" | "ay" | "az">> = {};

  for (let index = 0; index < rawValues.length; index += 1) {
    const rawValue = rawValues[index].trim();
    const axis = axes[index];
    const value = Number(rawValue);

    if (rawValue.length === 0 || !Number.isFinite(value)) {
      console.log("[BLE] Invalid motion payload value:", {
        payload,
        axis,
        rawValue,
        reason: "value is not a finite number",
      });
      return null;
    }

    values[axis] = value;
  }

  return {
    ax: values.ax ?? 0,
    ay: values.ay ?? 0,
    az: values.az ?? 0,
    gx: 0,
    gy: 0,
    gz: 0,
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

        receivedSamples += 1;

        const parsedData = parseMotionPayload(payload);

        if (!parsedData) {
          invalidSamples += 1;

          console.log("[BLE] Invalid motion payload:", {
            payload,
            length: payload.length,
          });

          if (receivedSamples % 20 === 0) {
            console.log("[BLE] Motion stream stats:", {
              receivedSamples,
              validSamples,
              invalidSamples,
            });
          }

          return;
        }

        validSamples += 1;

        updateAxisDiagnostics(parsedData);
        const reps = updateRepDetector(parsedData);

        const dataWithReps: ImuData = {
          ...parsedData,
          reps,
        };

        if (receivedSamples % 20 === 0) {
          console.log("[BLE] Motion stream stats:", {
            receivedSamples,
            validSamples,
            invalidSamples,
            repCount,
          });
        }
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
