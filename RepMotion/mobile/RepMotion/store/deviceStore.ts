// imports
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
// constants
import { 
    WS_HOST,
    WS_PORT,
} from "../models/motionConstants";


export type WsStatus =
    | "idle"
    | "connecting"
    | "connected"
    | "disconnected"
    | "error";

type DeviceStore = {
    // ----------------------------
    // Persisted config
    // ----------------------------
    networkName: string;
    esp32Ip: string;
    port: number;
    autoConnect: boolean;
    deviceLabel: string | null;

    // ----------------------------
    // Runtime state
    // ----------------------------
    isConnected: boolean;
    status: WsStatus;
    error: string | null;
    lastConnectedAt: number | null;
    lastMessageAt: number | null;

    // ----------------------------
    // Derived
    // ----------------------------
    wsUrl: () => string;

    // ----------------------------
    // Config actions
    // ----------------------------
    setNetworkName: (name: string) => void;
    setEsp32Ip: (ip: string) => void;
    setPort: (port: number) => void;
    setAutoConnect: (value: boolean) => void;
    setDeviceLabel: (label: string | null) => void;

    setDeviceConfig: (payload: {
        networkName?: string;
        esp32Ip?: string;
        port?: number;
        autoConnect?: boolean;
        deviceLabel?: string | null;
    }) => void;

    // ----------------------------
    // Runtime actions
    // ----------------------------
    setConnecting: () => void;
    setConnected: () => void;
    setDisconnected: () => void;
    setError: (message: string | null) => void;
    setLastMessageAt: (ts?: number) => void;

    // ----------------------------
    // Utils
    // ----------------------------
    resetRuntimeState: () => void;
    resetAllDeviceState: () => void;
};

export const useDeviceStore = create<DeviceStore>()(
    persist(
        (set, get) => ({
            // ----------------------------
            // Persisted config defaults
            // ----------------------------
            networkName: "",
            esp32Ip: WS_HOST,
            port: WS_PORT,
            autoConnect: false,
            deviceLabel: null,

            // ----------------------------
            // Runtime defaults
            // ----------------------------
            isConnected: false,
            status: "idle",
            error: null,
            lastConnectedAt: null,
            lastMessageAt: null,

            // ----------------------------
            // Derived
            // ----------------------------
            wsUrl: () => {
                const { esp32Ip, port } = get();
                return `ws://${esp32Ip}:${port}`;
            },

            // ----------------------------
            // Config actions
            // ----------------------------
            setNetworkName: (name) =>
                set({
                    networkName: name.trim(),
                }),

            setEsp32Ip: (ip) =>
                set({
                    esp32Ip: ip.trim(),
                }),

            setPort: (port) =>
                set({
                    port,
                }),

            setAutoConnect: (value) =>
                set({
                    autoConnect: value,
                }),

            setDeviceLabel: (label) =>
                set({
                    deviceLabel: label?.trim() || null,
                }),

            setDeviceConfig: (payload) =>
                set((state) => ({
                    networkName: payload.networkName?.trim() ?? state.networkName,
                    esp32Ip: payload.esp32Ip?.trim() ?? state.esp32Ip,
                    port: payload.port ?? state.port,
                    autoConnect: payload.autoConnect ?? state.autoConnect,
                    deviceLabel:
                        payload.deviceLabel !== undefined
                            ? payload.deviceLabel?.trim() || null
                            : state.deviceLabel,
                })),

            // ----------------------------
            // Runtime actions
            // ----------------------------
            setConnecting: () =>
                set({
                    status: "connecting",
                    isConnected: false,
                    error: null,
                }),

            setConnected: () =>
                set({
                    status: "connected",
                    isConnected: true,
                    error: null,
                    lastConnectedAt: Date.now(),
                }),

            setDisconnected: () =>
                set({
                    status: "disconnected",
                    isConnected: false,
                }),

            setError: (message) =>
                set({
                    status: "error",
                    isConnected: false,
                    error: message,
                }),

            setLastMessageAt: (ts) =>
                set({
                    lastMessageAt: ts ?? Date.now(),
                }),

            // ----------------------------
            // Utils
            // ----------------------------
            resetRuntimeState: () =>
                set({
                    isConnected: false,
                    status: "idle",
                    error: null,
                    lastMessageAt: null,
                }),

            resetAllDeviceState: () =>
                set({
                    networkName: "",
                    esp32Ip: WS_HOST,
                    port: WS_PORT,
                    autoConnect: false,
                    deviceLabel: null,
                    isConnected: false,
                    status: "idle",
                    error: null,
                    lastConnectedAt: null,
                    lastMessageAt: null,
                }),
        }),
        {
            name: "device-storage",
            storage: createJSONStorage(() => AsyncStorage),

            // persist only real config + maybe useful timestamps
            partialize: (state) => ({
                networkName: state.networkName,
                esp32Ip: state.esp32Ip,
                port: state.port,
                autoConnect: state.autoConnect,
                deviceLabel: state.deviceLabel,
                lastConnectedAt: state.lastConnectedAt,
            }),

            // kill fake runtime state after rehydrate
            onRehydrateStorage: () => (state) => {
                state?.resetRuntimeState();
            },
        }
    )
);
