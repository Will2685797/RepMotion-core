import { create } from "zustand";

import {
  calculateCalibration,
  CalibrationResult,
  MotionSample,
} from "../analytics/calibration";

type AnalysisState = {
  isRunning: boolean;
  setIsRunning: (value: boolean) => void;

  isCalibrating: boolean;
  calibrationSamples: MotionSample[];
  calibrationResult: CalibrationResult | null;
  calibrationsByKey: Record<string, CalibrationResult>;

  startCalibration: () => void;
  addCalibrationSample: (sample: MotionSample) => void;
  finishCalibration: () => CalibrationResult | null;
  resetCalibration: () => void;
  saveCalibration: (
    exerciseId: string,
    calibration: CalibrationResult,
  ) => void;
  getCalibration: (exerciseId: string) => CalibrationResult | null;
  hasCalibration: (exerciseId: string) => boolean;
};

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  isRunning: false,
  setIsRunning: (value) => set({ isRunning: value }),

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
