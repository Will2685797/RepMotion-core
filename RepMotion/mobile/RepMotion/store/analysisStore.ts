import { create } from "zustand";

import {
  calculateCalibration,
  createCalibrationDataset,
  CalibrationResult,
  MotionSample,
} from "../analytics/calibration";

const DATASET_WRITER_URL = "http://10.0.0.121:4000/datasets/calibration";

const CALIBRATION_EXPECTED_REPS = 5;
const CALIBRATION_PERFORMED_REPS = 5;
const CALIBRATION_SAMPLING_RATE_HZ = 20;

// Envoie le dataset de calibration au serveur local pour l'écrire en fichier JSON.
async function saveCalibrationDataset(dataset: unknown) {
  try {
    const response = await fetch(DATASET_WRITER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataset),
    });

    if (!response.ok) {
      console.warn("[CALIBRATION DATASET SAVE FAILED]", response.status);
      return;
    }

    const savedDataset = await response.json();

    console.log("[CALIBRATION DATASET SAVED]", savedDataset);
  } catch (error) {
    console.warn("[CALIBRATION DATASET SAVE ERROR]", error);
  }
}

type AnalysisState = {
  isRunning: boolean;
  setIsRunning: (value: boolean) => void;

  activeExerciseId: string | null;
  setActiveExerciseId: (exerciseId: string | null) => void;

  isCalibrating: boolean;
  calibrationSamples: MotionSample[];
  calibrationResult: CalibrationResult | null;
  calibrationsByKey: Record<string, CalibrationResult>;

  startCalibration: () => void;
  addCalibrationSample: (sample: MotionSample) => void;
  finishCalibration: () => CalibrationResult | null;
  resetCalibration: () => void;
  saveCalibration: (exerciseId: string, calibration: CalibrationResult) => void;
  getCalibration: (exerciseId: string) => CalibrationResult | null;
  hasCalibration: (exerciseId: string) => boolean;
};

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  isRunning: false,
  setIsRunning: (value) => set({ isRunning: value }),

  activeExerciseId: null,
  setActiveExerciseId: (exerciseId) => set({ activeExerciseId: exerciseId }),

  isCalibrating: false,
  calibrationSamples: [],
  calibrationResult: null,
  calibrationsByKey: {},

  startCalibration: () =>
    set({
      isCalibrating: true,
      calibrationSamples: [],
      calibrationResult: null,
    }),

  addCalibrationSample: (sample) => {
    if (!get().isCalibrating) return;

    set((state) => ({
      calibrationSamples: [...state.calibrationSamples, sample],
    }));
  },

  finishCalibration: () => {
    const samples = get().calibrationSamples;

    if (samples.length === 0) {
      set({ isCalibrating: false });
      return null;
    }

    const result = calculateCalibration(samples);

    const exerciseId = get().activeExerciseId;

    if (!exerciseId) {
      console.warn(
        "[CALIBRATION DATASET] No active exercise id. Dataset not saved.",
      );
    } else {
      const dataset = createCalibrationDataset(
        samples,
        exerciseId,
        CALIBRATION_EXPECTED_REPS,
        CALIBRATION_SAMPLING_RATE_HZ,
        CALIBRATION_PERFORMED_REPS,
        "manual calibration capture",
      );

      // Sauvegarde le dataset sans bloquer le résultat de calibration.
      void saveCalibrationDataset(dataset);
    }

    set({
      isCalibrating: false,
      calibrationResult: result,
    });

    console.log("[CALIBRATION RESULT]", result);

    return result;
  },

  resetCalibration: () =>
    set({
      isCalibrating: false,
      calibrationSamples: [],
      calibrationResult: null,
    }),

  saveCalibration: (exerciseId, calibration) => {
    const key = exerciseId;

    set((state) => ({
      calibrationsByKey: {
        ...state.calibrationsByKey,
        [key]: calibration,
      },
    }));
  },

  getCalibration: (exerciseId) => {
    const key = exerciseId;

    return get().calibrationsByKey[key] ?? null;
  },

  hasCalibration: (exerciseId) => {
    const key = exerciseId;

    return !!get().calibrationsByKey[key];
  },
}));
