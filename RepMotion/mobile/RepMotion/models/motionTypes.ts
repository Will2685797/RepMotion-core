// utils
import { magnitude3 } from "../utils/utils";


export type MotionSample = {
    t_ms: number;

    ax?: number;
    ay?: number;
    az?: number;

    gx?: number;
    gy?: number;
    gz?: number;

    mx?: number;
    my?: number;
    mz?: number;

    acc_mag_f?: number;
    gyro_mag_f?: number;

    roll_deg?: number;
    pitch_deg?: number;
    up_down?: string;
    // left_right?: string;
    // motion_state?: string;

    is_still?: boolean;
    temp_c?: number;
};

export type MotionConnectionStatus =
    | "idle"
    | "connecting"
    | "connected"
    | "disconnected"
    | "reconnecting"
    | "error";

export type MotionDeviceState = {
    status: MotionConnectionStatus;
    isConnected: boolean;
    latestSample: MotionSample | null;
    sampleCount: number;
    lastPacketAt: number | null;
    error: string | null;
};

export interface MotionTransport {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    send(data: string): void;
    subscribeState(cb: (state: MotionDeviceState) => void): () => void;
    subscribeSample(cb: (sample: MotionSample) => void): () => void;
    getState(): MotionDeviceState;
}

export type LiveMotionSample = {
    t_ms: number;
    temp_c?: number;

    ax_mps2: number;
    ay_mps2: number;
    az_mps2: number;

    gx_rads: number;
    gy_rads: number;
    gz_rads: number;

    roll_deg?: number;
    pitch_deg?: number;

    still?: boolean;
};

export type FusedSample = {
    t_ms: number;

    ax: number;
    ay: number;
    az: number;

    gx: number;
    gy: number;
    gz: number;

    accel_magnitude: number;
    gyro_magnitude: number;

    // radians
    roll: number;
    pitch: number;
    yaw: number;

    // quaternion (kept for parity with Python model)
    qw: number;
    qx: number;
    qy: number;
    qz: number;

    // passthrough
    temp_c?: number;
    still?: boolean;
};

export function buildFusedSample(input: {
    t_ms: number;

    ax: number;
    ay: number;
    az: number;

    gx: number;
    gy: number;
    gz: number;

    accel_magnitude?: number;
    gyro_magnitude?: number;

    roll?: number;
    pitch?: number;
    yaw?: number;

    qw?: number;
    qx?: number;
    qy?: number;
    qz?: number;

    temp_c?: number;
    still?: boolean;
}): FusedSample {
    return {
        t_ms: input.t_ms,

        ax: input.ax,
        ay: input.ay,
        az: input.az,

        gx: input.gx,
        gy: input.gy,
        gz: input.gz,

        accel_magnitude:
            input.accel_magnitude ?? magnitude3(input.ax, input.ay, input.az),

        gyro_magnitude:
            input.gyro_magnitude ?? magnitude3(input.gx, input.gy, input.gz),

        roll: input.roll ?? 0,
        pitch: input.pitch ?? 0,
        yaw: input.yaw ?? 0,

        qw: input.qw ?? 1,
        qx: input.qx ?? 0,
        qy: input.qy ?? 0,
        qz: input.qz ?? 0,

        temp_c: input.temp_c,
        still: input.still,
    };
}

export type PreprocessorState = {
    prevTMs: number | null;
    yawRad: number;
};

export type RepMetric = {
    rep_index: number;
    start_ms: number;
    end_ms: number;
    peak_velocity: number;
    mean_velocity: number;
    shaking_score: number;
    sticking_point_ms: number | null;
};

export type AnalysisSummary = {
    sample_count: number;
    duration_s: number;
    rep_count: number;
    candidate_rep_count: number;
    kept_rep_count: number;
    dominant_axis: "roll" | "pitch" | "yaw" | null;
    kept_block_start_ms: number | null;
    kept_block_end_ms: number | null;
    mean_accel_magnitude: number;
    mean_gyro_magnitude: number;
};

export type AnalysisResult = {
    rep_count: number;
    reps: RepMetric[];
    summary: AnalysisSummary;
};
