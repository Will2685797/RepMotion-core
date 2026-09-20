import { BleManager, Device, Subscription } from "react-native-ble-plx";
import { useAnalysisStore } from "../../store/analysisStore";
import type { ImuData, ImuSampleV2 } from "../../types/imu";
import { Buffer } from "buffer";
import {
  decodeImuSampleV2,
  IMU_SAMPLE_V2_PAYLOAD_SIZE,
} from "./imuSampleV2Payload";
import { parseLegacyMotionPayload } from "./motionPayload";

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
const MOTION_DATA_V2_CHARACTERISTIC_UUID =
  "7b7f0003-7c3a-4f6a-9f8e-1f2b3c4d5e6f";

export type { ImuData, ImuSampleV2 } from "../../types/imu";

type AxisName = "ax" | "ay" | "az";
type AxisRange = { min: number; max: number };
type RepDetectorState = "WAITING_BOTTOM" | "WAITING_TOP";

type RepThresholds = {
  bottomThreshold: number;
  topThreshold: number;
};

let repCount = 0;
let repState: RepDetectorState = "WAITING_BOTTOM";
let bottomSampleCount = 0;
let topSampleCount = 0;
let repLockedUntil = 0;

let receivedSamples = 0;
let validSamples = 0;
let invalidSamples = 0;
let invalidV2Samples = 0;
let previousV2SampleIndex: number | null = null;

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

function getRepThresholds(): RepThresholds | null {
  const analysisStore = useAnalysisStore.getState();

  if (!analysisStore.isRunning || !analysisStore.activeExerciseId) {
    return null;
  }

  const calibration = analysisStore.getCalibration(
    analysisStore.activeExerciseId,
  );

  if (!calibration?.isValid) {
    return null;
  }

  return {
    bottomThreshold: calibration.bottomThreshold,
    topThreshold: calibration.topThreshold,
  };
}

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

function logRepV2Diagnostics(
  value: number,
  thresholds: RepThresholds | null,
): void {
  if (validSamples % AXIS_DIAG_INTERVAL !== 0) {
    return;
  }

  console.log("[REP V2 DIAG]", {
    state: repState,
    reps: repCount,
    az: value,
    bottomThreshold: thresholds?.bottomThreshold ?? REP_BOTTOM_THRESHOLD,
    topThreshold: thresholds?.topThreshold ?? REP_TOP_THRESHOLD,
    isUsingCalibration: Boolean(thresholds),
  });
}

function updateRepDetector(data: ImuData): number {
  const value = data[REP_AXIS];
  const now = Date.now();
  const thresholds = getRepThresholds();

  logRepV2Diagnostics(value, thresholds);

  if (!thresholds) {
    return repCount;
  }

  const { bottomThreshold, topThreshold } = thresholds;

  if (now < repLockedUntil) {
    return repCount;
  }

  if (repState === "WAITING_BOTTOM") {
    topSampleCount = 0;

    if (value <= bottomThreshold) {
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

    if (value >= topThreshold) {
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
  const result = parseLegacyMotionPayload(payload);

  if ("data" in result) {
    return result.data;
  }

  if (result.error === "missing_fields") {
    console.log("[BLE] Invalid motion payload missing fields:", {
      payload,
      expectedFields: ["ax", "ay", "az"],
      receivedParts: result.receivedParts,
      reason: "expected compact accel payload: ax,ay,az",
    });
    return null;
  }

  console.log("[BLE] Invalid motion payload value:", {
    payload,
    axis: result.axis,
    rawValue: result.rawValue,
    reason: "value is not a finite number",
  });
  return null;
}

function startMotionCharacteristicMonitor(
  characteristicUuid: string,
  streamLabel: string,
  onValue: (base64Value: string) => void,
  onError?: (error: unknown) => void,
): void {
  if (!connectedRepMotionDevice) {
    const error = new Error("No connected RepMotion device.");
    console.log(`[BLE] ${streamLabel} error:`, error.message);
    onError?.(error);
    return;
  }

  console.log(`[BLE] Starting ${streamLabel}...`);

  motionStreamSubscription?.remove();

  motionStreamSubscription =
    connectedRepMotionDevice.monitorCharacteristicForService(
      MOTION_SERVICE_UUID,
      characteristicUuid,
      (error, characteristic) => {
        if (error) {
          console.log(`[BLE] ${streamLabel} error:`, error);
          onError?.(error);
          return;
        }

        if (characteristic?.value) {
          onValue(characteristic.value);
        }
      },
    );
}

function updateV2SampleContinuity(sample: ImuSampleV2): void {
  if (previousV2SampleIndex !== null) {
    const expectedSampleIndex = (previousV2SampleIndex + 1) >>> 0;

    if (sample.sampleIndex !== expectedSampleIndex) {
      console.warn("[BLE V2] Non-contiguous sampleIndex", {
        previousSampleIndex: previousV2SampleIndex,
        expectedSampleIndex,
        receivedSampleIndex: sample.sampleIndex,
      });
    }
  }

  previousV2SampleIndex = sample.sampleIndex;
}

export function startMotionStream(
  onData: (data: ImuData) => void,
  onError?: (error: unknown) => void,
): void {
  startMotionCharacteristicMonitor(
    MOTION_DATA_CHARACTERISTIC_UUID,
    "motion stream",
    (base64Value) => {
      const payload = Buffer.from(base64Value, "base64").toString("utf-8");

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
    onError,
  );
}

export function startMotionStreamV2(
  onData: (sample: ImuSampleV2) => void,
  onError?: (error: unknown) => void,
): void {
  previousV2SampleIndex = null;

  startMotionCharacteristicMonitor(
    MOTION_DATA_V2_CHARACTERISTIC_UUID,
    "motion stream V2",
    (base64Value) => {
      const bytes = Buffer.from(base64Value, "base64");
      const sample = decodeImuSampleV2(bytes);

      if (!sample) {
        invalidV2Samples += 1;
        console.warn("[BLE V2] Invalid payload size", {
          receivedBytes: bytes.byteLength,
          expectedBytes: IMU_SAMPLE_V2_PAYLOAD_SIZE,
          invalidV2Samples,
        });
        return;
      }

      updateV2SampleContinuity(sample);
      onData(sample);
    },
    onError,
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
