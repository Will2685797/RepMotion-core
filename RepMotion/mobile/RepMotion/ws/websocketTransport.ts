// imports
import { parseFusedSample } from "../utils/utils";
// env
import {
    WS_URL as DEFAULT_WS_URL,
    WS_CONNECT_TIMEOUT_MS,
    WS_HEARTBEAT_TIMEOUT_MS,
    WS_RECONNECT_BASE_DELAY_MS,
    WS_RECONNECT_MAX_DELAY_MS,
} from "../models/motionConstants";
// models
import type {
    FusedSample,
    MotionTransport,
    MotionDeviceState,
} from "../models/motionTypes";


type StateListener = (state: MotionDeviceState) => void;
type SampleListener = (sample: FusedSample) => void;

class WebSocketMotionTransport implements MotionTransport {
    private socket: WebSocket | null = null;
    private stateListeners = new Set<StateListener>();
    private sampleListeners = new Set<SampleListener>();

    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private connectTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
    private heartbeatTimer: ReturnType<typeof setTimeout> | null = null;

    private shouldReconnect = true;
    private reconnectAttempts = 0;
    private manualDisconnect = false;

    private currentUrl: string = DEFAULT_WS_URL;

    private state: MotionDeviceState = {
        status: "idle",
        isConnected: false,
        latestSample: null,
        sampleCount: 0,
        lastPacketAt: null,
        error: null,
    };

    getState(): MotionDeviceState {
        return this.state;
    }

    subscribeState(cb: StateListener): () => void {
        this.stateListeners.add(cb);
        cb(this.state);
        return () => {
            this.stateListeners.delete(cb);
        };
    }

    subscribeSample(cb: SampleListener): () => void {
        this.sampleListeners.add(cb);
        return () => {
            this.sampleListeners.delete(cb);
        };
    }

    send(data: string): void {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return;
        this.socket.send(data);
    }

    async connect(url?: string): Promise<void> {
        if (url?.trim()) {
            this.currentUrl = url.trim();
        }

        if (this.socket && this.state.isConnected) return;
        if (this.socket && this.state.status === "connecting") return;
        if (this.socket && this.state.status === "reconnecting") return;

        this.manualDisconnect = false;
        this.shouldReconnect = true;

        await this.openSocket();
    }

    async disconnect(): Promise<void> {
        this.manualDisconnect = true;
        this.shouldReconnect = false;
        this.reconnectAttempts = 0;

        this.clearReconnect();
        this.clearConnectTimeout();
        this.clearHeartbeat();

        const socket = this.socket;
        this.socket = null;

        if (socket) {
            try {
                socket.close();
            } catch { }
        }

        this.emitState({
            status: "disconnected",
            isConnected: false,
            error: null,
        });
    }

    private emitState(patch: Partial<MotionDeviceState>) {
        this.state = { ...this.state, ...patch };
        for (const cb of this.stateListeners) cb(this.state);
    }

    private emitSample(sample: FusedSample) {
        // private emitSample(sample: MotionSample) {
        for (const cb of this.sampleListeners) cb(sample);
    }

    private async openSocket(): Promise<void> {
        this.clearReconnect();
        this.clearConnectTimeout();

        this.emitState({
            status: this.reconnectAttempts > 0 ? "reconnecting" : "connecting",
            isConnected: false,
            error: null,
        });

        const socket = new WebSocket(this.currentUrl);
        this.socket = socket;

        this.connectTimeoutTimer = setTimeout(() => {
            if (this.socket !== socket) return;

            this.emitState({
                status: "error",
                isConnected: false,
                error: "WebSocket connection timeout.",
            });

            try {
                socket.close();
            } catch { }
        }, WS_CONNECT_TIMEOUT_MS);

        socket.onopen = () => {
            if (this.socket !== socket) return;

            this.clearConnectTimeout();
            this.reconnectAttempts = 0;

            this.emitState({
                status: "connected",
                isConnected: true,
                error: null,
                sampleCount: 0,
                latestSample: null,
                lastPacketAt: null,
            });

            this.refreshHeartbeat(socket);
        };

        socket.onmessage = (event) => {
            if (this.socket !== socket) return;

            this.refreshHeartbeat(socket);

            const raw =
                typeof event.data === "string" ? event.data : String(event.data ?? "");

            // console.log("[WS RAW]", raw);

            const sample = parseFusedSample(raw);

            if (!sample) {
                // console.log("[WS PARSE FAIL]", raw);
                this.emitState({
                    error: "Incoming packet could not be parsed.",
                });
                return;
            }

            // console.log("[WS SAMPLE OK]", sample);

            this.emitState({
                latestSample: sample,
                sampleCount: this.state.sampleCount + 1,
                lastPacketAt: Date.now(),
                error: null,
            });

            this.emitSample(sample);
        };

        socket.onerror = () => {
            if (this.socket !== socket) return;

            this.emitState({
                status: "error",
                isConnected: false,
                error: "WebSocket error.",
            });
        };

        socket.onclose = () => {
            if (this.socket !== socket) return;

            this.clearConnectTimeout();
            this.clearHeartbeat();
            this.socket = null;

            const reconnecting = !this.manualDisconnect && this.shouldReconnect;

            this.emitState({
                isConnected: false,
                status: reconnecting ? "reconnecting" : "disconnected",
            });

            if (reconnecting) {
                this.scheduleReconnect();
            }
        };
    }

    private scheduleReconnect() {
        this.clearReconnect();

        const delay = Math.min(
            WS_RECONNECT_BASE_DELAY_MS * Math.max(1, this.reconnectAttempts + 1),
            WS_RECONNECT_MAX_DELAY_MS
        );

        this.reconnectAttempts += 1;

        this.reconnectTimer = setTimeout(() => {
            this.openSocket().catch(() => {
                this.emitState({
                    status: "error",
                    isConnected: false,
                    error: "Reconnect failed.",
                });
            });
        }, delay);
    }

    private refreshHeartbeat(socket: WebSocket) {
        this.clearHeartbeat();

        this.heartbeatTimer = setTimeout(() => {
            if (this.socket !== socket) return;

            this.emitState({
                status: "error",
                isConnected: false,
                error: "No packets received within heartbeat timeout.",
            });

            try {
                socket.close();
            } catch { }
        }, WS_HEARTBEAT_TIMEOUT_MS);
    }

    private clearReconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    private clearConnectTimeout() {
        if (this.connectTimeoutTimer) {
            clearTimeout(this.connectTimeoutTimer);
            this.connectTimeoutTimer = null;
        }
    }

    private clearHeartbeat() {
        if (this.heartbeatTimer) {
            clearTimeout(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }
}
export const websocketMotionTransport = new WebSocketMotionTransport();
