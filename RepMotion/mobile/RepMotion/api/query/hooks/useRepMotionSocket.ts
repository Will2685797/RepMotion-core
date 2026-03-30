// imports
import { useEffect, useMemo, useRef, useState } from "react";


export type ConnectionState = "idle" | "connecting" | "open" | "closed" | "error";
export type MotionSample = {
    t_ms: number;
    temp_c: number;

    ax_mps2: number;
    ay_mps2: number;
    az_mps2: number;

    gx_rads: number;
    gy_rads: number;
    gz_rads: number;

    roll_deg: number;
    pitch_deg: number;

    still: boolean;
};

export function useRepMotionSocket(esp32Ip: string) {
    const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
    const [sample, setSample] = useState<MotionSample | null>(null);
    const [lastMessageAt, setLastMessageAt] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const wsRef = useRef<WebSocket | null>(null);

    const wsUrl = useMemo(() => {
        const ip = esp32Ip.trim();
        if (!ip) return null;
        return `ws://${ip}:81`;
    }, [esp32Ip]);

    useEffect(() => {
        if (!wsUrl) {
            setConnectionState("idle");
            setError("Missing ESP32 IP");
            return;
        }

        setConnectionState("connecting");
        setError(null);

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            setConnectionState("open");
            setError(null);
            ws.send("hello-from-app");
        };

        ws.onmessage = (event) => {
            try {
                const parsed = JSON.parse(String(event.data));

                if (!isValidMotionSample(parsed)) {
                    setError("Invalid motion payload shape");
                    return;
                }

                setSample(parsed);
                setLastMessageAt(Date.now());
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to parse WebSocket message");
            }
        };

        ws.onerror = () => {
            setConnectionState("error");
            setError("WebSocket error");
        };

        ws.onclose = () => {
            setConnectionState("closed");
        };

        return () => {
            ws.close();
            wsRef.current = null;
        };
    }, [wsUrl]);

    const send = (message: string) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(message);
        }
    };

    return {
        connectionState,
        sample,
        lastMessageAt,
        error,
        send,
    };
}

function isValidMotionSample(x: unknown): x is MotionSample {
    if (!x || typeof x !== "object") return false;
    const v = x as Record<string, unknown>;

    return (
        typeof v.t_ms === "number" &&
        typeof v.temp_c === "number" &&
        typeof v.ax_mps2 === "number" &&
        typeof v.ay_mps2 === "number" &&
        typeof v.az_mps2 === "number" &&
        typeof v.gx_rads === "number" &&
        typeof v.gy_rads === "number" &&
        typeof v.gz_rads === "number" &&
        typeof v.roll_deg === "number" &&
        typeof v.pitch_deg === "number" &&
        typeof v.still === "boolean"
    );
}
