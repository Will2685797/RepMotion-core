// imports
import { useCallback, useEffect, useState } from "react";
// models
import type { MotionDeviceState, FusedSample } from "../../../models/motionTypes";
import { websocketMotionTransport } from "../../../ws/websocketTransport";


export function useMotionDevice() {
    const [state, setState] = useState<MotionDeviceState>(
        websocketMotionTransport.getState()
    );

    useEffect(() => {
        const unsubState = websocketMotionTransport.subscribeState(setState);

        return () => {
            unsubState();
        };
    }, []);

    const connect = useCallback(async (url?: string) => {
        await websocketMotionTransport.connect(url);
    }, []);

    const disconnect = useCallback(async () => {
        await websocketMotionTransport.disconnect();
    }, []);

    const sendCommand = useCallback((payload: unknown) => {
        websocketMotionTransport.send(JSON.stringify(payload));
    }, []);

    const subscribeSample = useCallback((cb: (sample: FusedSample) => void) => {
        return websocketMotionTransport.subscribeSample(cb);
    }, []);

    return {
        ...state,
        connect,
        disconnect,
        sendCommand,
        subscribeSample,
    };
}