// models
import { FusedSample } from "./motionTypes";

export type AxisName = "roll" | "pitch" | "yaw";
export type ExtremumKind = "peak" | "trough";

export type MotionAnalyzerConfig = {
    smoothingWindow: number;

    minExtremaPromDeg: number;

    // Time-based equivalents of the Python sample-count thresholds.
    minExtremaDistanceS: number;
    extremaProminenceLookS: number;
    minRepSamplesDurationS: number;

    minRepDurationS: number;
    maxRepDurationS: number;
    minRepRomDeg: number;
    minPeakVelocityDegS: number;
    maxOffAxisRatio: number;

    maxGapBetweenRepsS: number;

    // Default false for your current stack because yaw is gyro-integrated only.
    enableYawAxis: boolean;

    // Fallback when sample-rate estimation is impossible.
    fallbackSampleHz: number;
};

export type ResolvedAnalyzerConfig = MotionAnalyzerConfig & {
    estimatedSampleHz: number;
    minExtremaDistanceSamples: number;
    extremaProminenceLookSamples: number;
    minRepSamples: number;
};

export type Extremum = {
    index: number;
    valueDeg: number;
    kind: ExtremumKind;
};

export type RepCandidate = {
    rep_index: number;
    axis_name: AxisName;

    start_idx: number;
    mid_idx: number;
    end_idx: number;

    start_ms: number;
    mid_ms: number;
    end_ms: number;

    duration_s: number;
    rom_deg: number;
    peak_velocity_deg_s: number;
    mean_velocity_deg_s: number;
    shaking_score: number;
    off_axis_ratio: number;
    quality_score: number;
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
    dominant_axis: AxisName | null;
    kept_block_start_ms: number | null;
    kept_block_end_ms: number | null;
    mean_accel_magnitude: number;
    mean_gyro_magnitude: number;
    calibration_like_clean_block_found: boolean;
    estimated_sample_hz: number;
};

export type AnalysisResult = {
    rep_count: number;
    reps: RepMetric[];
    summary: AnalysisSummary;
};

export type DetectionResult = {
    axis_name: AxisName;
    candidate_reps: RepCandidate[];
    kept_reps: RepCandidate[];
    kept_start_idx: number | null;
    kept_end_idx: number | null;
    accepted_reps?: RepCandidate[];
};

export type AxisDetectionEval = {
    axis_name: AxisName;
    smoothed_deg: number[];
    extrema: Extremum[];
    candidate_reps: RepCandidate[];
    accepted_reps: RepCandidate[];
    kept_reps: RepCandidate[];
    score: [number, number, number, number, number];
};

export type AnalyzeOptions = {
    debug?: boolean;
};

export type AnalyzerDebugResult = {
    rep_count: number;
    reps: RepMetric[];
    summary: AnalysisSummary;
    detection: DetectionResult;
    axisEvals: AxisDetectionEval[];
    resolvedConfig: ResolvedAnalyzerConfig;
    fusedSamples: FusedSample[];
};
