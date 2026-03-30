// imports
import { create } from "zustand";


type Unit = "KG" | "LB";

type WeightConfiguratorState = {
  selectedExercise: string | null;
  selectedWeightKg: number | null;
  selectedUnit: Unit;
  platesPerSide: number[];


  setSelection: (payload: {
    selectedExercise: string | null;
    selectedWeightKg: number;
    selectedUnit: Unit;
    platesPerSide: number[];
  }) => void;


  clearSelection: () => void;
};

export const useWeightConfiguratorStore = create<WeightConfiguratorState>((set) => ({
  selectedExercise: null,
  selectedWeightKg: null,
  selectedUnit: "KG",
  platesPerSide: [],


  setSelection: (payload) =>
    set({
      selectedExercise: payload.selectedExercise,
      selectedWeightKg: payload.selectedWeightKg,
      selectedUnit: payload.selectedUnit,
      platesPerSide: payload.platesPerSide,
    }),


  clearSelection: () =>
    set({
      selectedExercise: null,
      selectedWeightKg: null,
      selectedUnit: "KG",
      platesPerSide: [],

    }),
}));
