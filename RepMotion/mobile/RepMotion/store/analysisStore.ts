import { create } from "zustand";

type AnalysisState = {
  isRunning: boolean;
  setIsRunning: (value: boolean) => void;
};

export const useAnalysisStore = create<AnalysisState>((set) => ({
  isRunning: false,
  setIsRunning: (value) => set({ isRunning: value }),
}));