// models
import {
    LiveMotionSample,
    FusedSample,
    PreprocessorState,
} from "../models/motionTypes";
// constants
import { DEG2RAD } from "../models/motionConstants";
// utils
import {
    magnitude3,
    wrapAnglePi,
    eulerToQuaternion,
} from "../utils/utils";


export class MotionPreprocessor {
    private state: PreprocessorState = {
        prevTMs: null,
        yawRad: 0,
    };

    reset() {
        this.state = {
            prevTMs: null,
            yawRad: 0,
        };
    }

    process(sample: LiveMotionSample): FusedSample {
        const dt = this.computeDtSeconds(sample.t_ms);

        const roll =
            typeof sample.roll_deg === "number"
                ? sample.roll_deg * DEG2RAD
                : Math.atan2(sample.ay_mps2, -sample.az_mps2);

        const pitch =
            typeof sample.pitch_deg === "number"
                ? sample.pitch_deg * DEG2RAD
                : Math.atan2(
                    -sample.ax_mps2,
                    Math.sqrt(sample.ay_mps2 * sample.ay_mps2 + sample.az_mps2 * sample.az_mps2)
                );

        // No magnetometer in current payload.
        // Safe choice for now: integrate gz only.
        // This is drift-prone, but acceptable as temporary scaffolding.
        this.state.yawRad += sample.gz_rads * dt;
        const yaw = wrapAnglePi(this.state.yawRad);

        const accelMagnitude = magnitude3(
            sample.ax_mps2,
            sample.ay_mps2,
            sample.az_mps2
        );

        const gyroMagnitude = magnitude3(
            sample.gx_rads,
            sample.gy_rads,
            sample.gz_rads
        );

        const q = eulerToQuaternion(roll, pitch, yaw);

        return {
            t_ms: sample.t_ms,

            ax: sample.ax_mps2,
            ay: sample.ay_mps2,
            az: sample.az_mps2,

            gx: sample.gx_rads,
            gy: sample.gy_rads,
            gz: sample.gz_rads,

            accel_magnitude: accelMagnitude,
            gyro_magnitude: gyroMagnitude,

            roll,
            pitch,
            yaw,

            qw: q.w,
            qx: q.x,
            qy: q.y,
            qz: q.z,

            temp_c: sample.temp_c,
            still: sample.still,
        };
    }

    private computeDtSeconds(tMs: number): number {
        if (this.state.prevTMs == null) {
            this.state.prevTMs = tMs;
            return 0;
        }

        const dt = Math.max(0, (tMs - this.state.prevTMs) / 1000);
        this.state.prevTMs = tMs;
        return dt;
    }
}
