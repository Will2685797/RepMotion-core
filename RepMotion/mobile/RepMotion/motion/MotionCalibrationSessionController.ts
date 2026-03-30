import { MotionCalibrator } from "./motionCalibrator";
import { MotionBiasEstimator } from "./motionBiasEstimator";
import { MotionCalibrationSessionRecorder } from "./motionCalibrationSessionRecorder";
import { MotionCalibrationSessionPipeline } from "./motionCalibrationSessionPipeline";
import { FusedSample } from "../models/motionTypes";
import { MotionCalibrationConfig } from "../models/motionCalibrationConfig";
import type { MotionCalibrationPhase1Result } from "../models/motionCalibration";
import { MotionBiasEstimationConfig } from "../models/motionBiasEstimationConfig";
import type { MotionBiasEstimationResult } from "../models/motionBiasEstimation";
import { CalibrationSessionRecording, CalibrationSessionResult } from "../models/motionCalibrationSessionTypes";
import type { MotionCalibrationSessionConfig } from "../models/motionCalibrationSessionConfig";




export type MotionCalibrationSessionControllerState =
    | "idle"
    | "waiting_for_stillness"
    | "ready_for_reps"
    | "recording_reps"
    | "processing"
    | "completed"
    | "failed";

export type MotionCalibrationSessionControllerConfig = {
    recentStillnessMaxSamples: number;
    nonStillSamplesToStartReps: number;

    phase1?: Partial<MotionCalibrationConfig>;
    phase2?: Partial<MotionBiasEstimationConfig>;
    sessionPipeline?: Partial<MotionCalibrationSessionConfig>;
};

export type MotionCalibrationSessionControllerSnapshot = {
    state: MotionCalibrationSessionControllerState;
    session_id: string | null;

    sample_count: number;
    duration_s: number;

    latest_sample_t_ms: number | null;

    stillness_locked: boolean;
    ready_for_reps: boolean;
    rep_start_detected: boolean;

    locked_stillness_start_ms: number | null;
    locked_stillness_end_ms: number | null;
    rep_start_ms: number | null;

    phase1: MotionCalibrationPhase1Result | null;
    phase2: MotionBiasEstimationResult | null;

    stop_reason: string | null;
    error: string | null;
};

export type MotionCalibrationSessionControllerStopResult = {
    snapshot: MotionCalibrationSessionControllerSnapshot;
    recording: CalibrationSessionRecording;
    result: CalibrationSessionResult;
};

const DEFAULT_CONTROLLER_CONFIG: MotionCalibrationSessionControllerConfig = {
    recentStillnessMaxSamples: 120,
    nonStillSamplesToStartReps: 2,
    phase1: {},
    phase2: {},
    sessionPipeline: {},
};

export class MotionCalibrationSessionController {
    private readonly cfg: MotionCalibrationSessionControllerConfig;
    private readonly recorder: MotionCalibrationSessionRecorder;
    private readonly phase1: MotionCalibrator;
    private readonly phase2: MotionBiasEstimator;
    private readonly pipeline: MotionCalibrationSessionPipeline;

    private state: MotionCalibrationSessionControllerState = "idle";
    private sessionId: string | null = null;
    private latestSampleTms: number | null = null;

    private recentSamples: FusedSample[] = [];

    private livePhase1: MotionCalibrationPhase1Result | null = null;
    private lockedPhase1: MotionCalibrationPhase1Result | null = null;
    private lockedBias: MotionBiasEstimationResult | null = null;

    private lockedStillnessStartMs: number | null = null;
    private lockedStillnessEndMs: number | null = null;
    private firstNonStillCandidateMs: number | null = null;
    private repStartMs: number | null = null;
    private consecutiveNonStillSamples = 0;

    private lastRecording: CalibrationSessionRecording | null = null;
    private lastResult: CalibrationSessionResult | null = null;
    private stopReason: string | null = null;
    private error: string | null = null;

    constructor(config?: Partial<MotionCalibrationSessionControllerConfig>) {
        this.cfg = {
            ...DEFAULT_CONTROLLER_CONFIG,
            ...config,
            phase1: {
                ...DEFAULT_CONTROLLER_CONFIG.phase1,
                ...(config?.phase1 ?? {}),
            },
            phase2: {
                ...DEFAULT_CONTROLLER_CONFIG.phase2,
                ...(config?.phase2 ?? {}),
            },
            sessionPipeline: {
                ...DEFAULT_CONTROLLER_CONFIG.sessionPipeline,
                ...(config?.sessionPipeline ?? {}),
            },
        };

        this.recorder = new MotionCalibrationSessionRecorder();
        this.phase1 = new MotionCalibrator(this.cfg.phase1);
        this.phase2 = new MotionBiasEstimator(this.cfg.phase2);
        this.pipeline = new MotionCalibrationSessionPipeline(this.cfg.sessionPipeline);
    }

    public start(sessionId?: string): MotionCalibrationSessionControllerSnapshot {
        this.resetInternal(false);
        this.recorder.start(sessionId);
        this.state = "waiting_for_stillness";
        this.sessionId = this.peekRecorderSessionId();
        return this.getSnapshot();
    }

    public push(sample: FusedSample): MotionCalibrationSessionControllerSnapshot {
        if (!this.isActiveState(this.state)) {
            return this.getSnapshot();
        }

        this.recorder.push(sample);
        this.latestSampleTms = sample.t_ms;
        this.pushRecent(sample);

        try {
            if (this.state === "waiting_for_stillness" || this.state === "ready_for_reps") {
                this.livePhase1 = this.phase1.runPhase1(this.recentSamples);
            }

            if (this.state === "waiting_for_stillness") {
                this.tryLockStillness();
            } else if (this.state === "ready_for_reps") {
                this.tryEnterRecordingReps();
            }
        } catch (err) {
            this.state = "failed";
            this.error = err instanceof Error ? err.message : String(err);
        }

        return this.getSnapshot();
    }

    public stop(): MotionCalibrationSessionControllerStopResult {
        if (!this.isActiveState(this.state)) {
            throw new Error(`Cannot stop calibration session from state '${this.state}'.`);
        }

        this.state = "processing";
        this.stopReason = null;
        this.error = null;

        const recording = this.recorder.stop();
        this.lastRecording = recording;

        let result: CalibrationSessionResult;

        if (!this.lockedPhase1 || !this.lockedBias) {
            this.stopReason = "stillness_not_captured";
            result = this.pipeline.buildControlledFailure({
                recording,
                dominantAxis: null,
                rejectionReasons: ["stillness_not_captured"],
                phase1: this.lockedPhase1 ?? this.livePhase1,
                phase2: this.lockedBias,
                phase3: null,
            });
            this.state = "failed";
        } else {
            result = this.pipeline.run({
                recording,
                repStartMs: this.repStartMs ?? this.lockedStillnessEndMs,
                phase1Override: this.lockedPhase1,
                biasEstimateOverride: this.lockedBias,
            });
            this.state = result.success ? "completed" : "failed";
            if (!result.success && this.repStartMs == null) {
                this.stopReason = "reps_not_detected_after_stillness";
            }
        }

        this.lastResult = result;

        return {
            snapshot: this.getSnapshot(),
            recording,
            result,
        };
    }

    public reset(): MotionCalibrationSessionControllerSnapshot {
        this.resetInternal(true);
        return this.getSnapshot();
    }

    public getSnapshot(): MotionCalibrationSessionControllerSnapshot {
        return {
            state: this.state,
            session_id: this.sessionId,
            sample_count: this.recorder.getSampleCount(),
            duration_s: this.recorder.getDurationSeconds(),
            latest_sample_t_ms: this.latestSampleTms,
            stillness_locked: this.lockedPhase1 !== null && this.lockedBias !== null,
            ready_for_reps: this.state === "ready_for_reps" || this.state === "recording_reps" || this.state === "processing" || this.state === "completed",
            rep_start_detected: this.repStartMs !== null,
            locked_stillness_start_ms: this.lockedStillnessStartMs,
            locked_stillness_end_ms: this.lockedStillnessEndMs,
            rep_start_ms: this.repStartMs,
            phase1: this.lockedPhase1 ?? this.livePhase1,
            phase2: this.lockedBias,
            stop_reason: this.stopReason,
            error: this.error,
        };
    }

    public getLastRecording(): CalibrationSessionRecording | null {
        return this.lastRecording;
    }

    public getLastResult(): CalibrationSessionResult | null {
        return this.lastResult;
    }

    private tryLockStillness(): void {
        const phase1 = this.livePhase1;
        if (!phase1?.success || !phase1.calibrationBlock) return;

        const bias = this.phase2.estimate({
            samples: phase1.samples,
            calibrationBlock: phase1.calibrationBlock,
        });

        if (!bias.success) return;

        this.lockedPhase1 = phase1;
        this.lockedBias = bias;
        this.lockedStillnessStartMs = phase1.calibrationBlock.startMs;
        this.lockedStillnessEndMs = phase1.calibrationBlock.endMs;
        this.consecutiveNonStillSamples = 0;
        this.firstNonStillCandidateMs = null;
        this.repStartMs = null;
        this.state = "ready_for_reps";
    }

    private tryEnterRecordingReps(): void {
        const phase1 = this.livePhase1;
        const latestStill = phase1?.samples[phase1.samples.length - 1]?.still ?? false;
        const latestTms = this.latestSampleTms;

        if (latestStill) {
            this.consecutiveNonStillSamples = 0;
            this.firstNonStillCandidateMs = null;
            return;
        }

        if (latestTms == null) return;

        if (this.firstNonStillCandidateMs == null) {
            this.firstNonStillCandidateMs = latestTms;
        }

        this.consecutiveNonStillSamples += 1;

        if (this.consecutiveNonStillSamples >= this.cfg.nonStillSamplesToStartReps) {
            this.repStartMs = this.firstNonStillCandidateMs;
            this.state = "recording_reps";
        }
    }

    private pushRecent(sample: FusedSample): void {
        this.recentSamples.push(sample);
        const maxN = Math.max(16, this.cfg.recentStillnessMaxSamples);
        if (this.recentSamples.length > maxN) {
            this.recentSamples = this.recentSamples.slice(-maxN);
        }
    }

    private resetInternal(includeRecorderReset: boolean): void {
        if (includeRecorderReset) {
            this.recorder.reset();
        }

        this.state = "idle";
        this.sessionId = null;
        this.latestSampleTms = null;
        this.recentSamples = [];
        this.livePhase1 = null;
        this.lockedPhase1 = null;
        this.lockedBias = null;
        this.lockedStillnessStartMs = null;
        this.lockedStillnessEndMs = null;
        this.firstNonStillCandidateMs = null;
        this.repStartMs = null;
        this.consecutiveNonStillSamples = 0;
        this.lastRecording = null;
        this.lastResult = null;
        this.stopReason = null;
        this.error = null;
    }

    private isActiveState(state: MotionCalibrationSessionControllerState): boolean {
        return (
            state === "waiting_for_stillness" ||
            state === "ready_for_reps" ||
            state === "recording_reps"
        );
    }

    private peekRecorderSessionId(): string | null {
        const internal = this.recorder as unknown as { sessionId?: string | null };
        return internal.sessionId ?? null;
    }
}
