import type { AxisName } from "./motionAnalyzerTypes";
import type { FusedSample } from "./motionTypes";
import type { MotionCalibrationPhase1Result } from "./motionCalibration";
import type { MotionBiasEstimationResult } from "./motionBiasEstimation";
import type { MotionCalibrationApplyResult } from "./motionCalibrationApply";

export type CalibrationSessionRecorderState = "idle" | "recording" | "stopped";

export type CalibrationSessionRecording = {
    session_id: string;
    started_at_ms: number | null;
    stopped_at_ms: number | null;
    sample_count: number;
    duration_s: number;
    samples: FusedSample[];
};

export type CalibrationAxisScore = {
    axis_name: AxisName;
    structured_score: number;
    candidate_count: number;
    accepted_count: number;
    kept_count: number;
    total_quality_score: number;
    total_rom_deg: number;
};

export type CalibrationRepCandidate = {
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
    symmetry_score: number;
    off_axis_ratio: number;
    velocity_irregularity: number;
    path_length_ratio: number;
    quality_score: number;

    accepted: boolean;
    reject_reasons: string[];
};

export type NormalizedRepWaveform = {
    rep_index: number;
    axis_name: AxisName;
    angle: number[];
    velocity: number[];
};

export type CalibrationTemplate = {
    axis_name: AxisName;
    normalize_points: number;
    angle_mean: number[];
    angle_std: number[];
    angle_upper: number[];
    angle_lower: number[];
    velocity_mean: number[];
    velocity_std: number[];
};

export type CalibrationSessionStats = {
    sample_count: number;
    duration_s: number;
    estimated_sample_hz: number;

    valid_rep_count: number;
    candidate_rep_count: number;

    mean_duration_s: number;
    std_duration_s: number;
    cv_duration: number;

    mean_rom_deg: number;
    std_rom_deg: number;
    cv_rom: number;

    mean_peak_velocity_deg_s: number;
    std_peak_velocity_deg_s: number;

    mean_mean_velocity_deg_s: number;
    std_mean_velocity_deg_s: number;

    mean_symmetry_score: number;
    mean_off_axis_ratio: number;
    mean_velocity_irregularity: number;
};

export type CalibrationSessionQuality = {
    axis_clarity_score: number;
    rep_count_score: number;
    duration_consistency_score: number;
    rom_consistency_score: number;
    waveform_consistency_score: number;
    mean_candidate_quality_score: number;
    overall_score: number;
};

export type CalibrationSessionDebug = {
    phase1: MotionCalibrationPhase1Result | null;
    phase2: MotionBiasEstimationResult | null;
    phase3: MotionCalibrationApplyResult | null;

    axis_scores: CalibrationAxisScore[];
    dominant_axis_margin_ratio: number | null;

    selected_signal_deg: number[];
    selected_velocity_deg_s: number[];
    selected_gyro_mag: number[];

    all_candidates: CalibrationRepCandidate[];
    accepted_candidates: CalibrationRepCandidate[];
    kept_candidates: CalibrationRepCandidate[];
};

export type CalibrationSessionResult = {
    success: boolean;
    dominant_axis: AxisName | null;

    recording: CalibrationSessionRecording;
    reps: CalibrationRepCandidate[];
    normalized_reps: NormalizedRepWaveform[];
    template: CalibrationTemplate | null;
    stats: CalibrationSessionStats | null;
    quality: CalibrationSessionQuality | null;

    rejection_reasons: string[];
    debug: CalibrationSessionDebug;
};
