// imports
import { useEffect, useMemo, useRef, useState } from "react";
// ws
import { MotionPreprocessor } from "../../../motion/motionPreprocessor";
import { MotionSessionBuffer } from "../../../motion/motionSessionBuffer";
// hooks
import { useMotionDevice } from "./useMotionDevice";
// models
import { FusedSample, LiveMotionSample } from "../../../models/motionTypes";


export function useMotionAnalysisStream() {
    const device = useMotionDevice();

    const preprocessorRef = useRef(new MotionPreprocessor());
    const bufferRef = useRef(new MotionSessionBuffer());

    const [latestFused, setLatestFused] = useState<FusedSample | null>(null);
    const [fusedCount, setFusedCount] = useState(0);

    useEffect(() => {
        const unsub = device.subscribeSample((sample) => {
            if (!isLiveMotionSample(sample)) return;

            const fused = preprocessorRef.current.process(sample);
            bufferRef.current.push(fused);

            setLatestFused(fused);
            setFusedCount(bufferRef.current.size());
        });

        return () => {
            unsub();
        };
    }, [device]);

    const api = useMemo(() => {
        return {
            latestFused,
            fusedCount,
            getFusedSamples: () => bufferRef.current.getAll(),
            resetAnalysisStream: () => {
                preprocessorRef.current.reset();
                bufferRef.current.reset();
                setLatestFused(null);
                setFusedCount(0);
            },
        };
    }, [latestFused, fusedCount]);

    return {
        ...device,
        ...api,
    };
}

function isLiveMotionSample(x: any): x is LiveMotionSample {
    return (
        x &&
        typeof x.t_ms === "number" &&
        typeof x.ax_mps2 === "number" &&
        typeof x.ay_mps2 === "number" &&
        typeof x.az_mps2 === "number" &&
        typeof x.gx_rads === "number" &&
        typeof x.gy_rads === "number" &&
        typeof x.gz_rads === "number"
    );
}
