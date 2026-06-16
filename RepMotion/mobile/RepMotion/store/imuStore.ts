import { create } from "zustand";
import type { ImuData } from "../services/ble/bleService";

type ImuStore = {
  imuData: ImuData | null;
  setImuData: (data: ImuData) => void;
  resetImuData: () => void;
};

export const useImuStore = create<ImuStore>((set) => ({
  imuData: null,

  setImuData: (data) => {
    set({ imuData: data });
  },

  resetImuData: () => {
    set({ imuData: null });
  },
}));