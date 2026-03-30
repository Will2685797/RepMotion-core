// models
import type {
    FusedSample,
    StillSegment,
    CalibrationBlock,
    CalibrationWindowStats,
    MotionCalibrationDebug,
    MotionCalibrationPhase1Result,
} from "../models/motionCalibration";
// constants
import { MotionCalibrationConfig } from "../models/motionCalibrationConfig";
import { DEFAULT_MOTION_CALIBRATION_CONFIG } from "../models/motionCalibrationConfig";
// utils
import {
    std,
    min,
    max,
    mean,
    range,
    clamp,
    median,
    clamp01,
} from "../utils/utils";


export class MotionCalibrator {
    private readonly cfg: MotionCalibrationConfig;

    constructor(config?: Partial<MotionCalibrationConfig>) {
        this.cfg = {
            ...DEFAULT_MOTION_CALIBRATION_CONFIG,
            ...config,
            scoreWeights: {
                ...DEFAULT_MOTION_CALIBRATION_CONFIG.scoreWeights,
                ...(config?.scoreWeights ?? {}),
            },
        };
    }

    public runPhase1(samples: FusedSample[]): MotionCalibrationPhase1Result {
        if (samples.length === 0) {
            return this.emptyResult([], "No samples provided.");
        }

        if (samples.length < 3) {
            return this.emptyResult(samples, "Not enough samples for stillness detection.");
        }

        const sortedSamples = this.ensureSortedByTime(samples);
        const dtMedianMs = this.estimateMedianDtMs(sortedSamples);
        const sampleHz = this.estimateSampleHz(dtMedianMs);
        const gravityReference = this.estimateGravityReference(sortedSamples);

        const detectionWindowSamples = this.msToOddWindowSamples(
            this.cfg.detectionWindowMs,
            dtMedianMs,
        );
        const minStillSamples = this.msToMinSamples(
            this.cfg.minStillDurationMs,
            dtMedianMs,
        );
        const gapMergeSamples = this.msToGapSamples(
            this.cfg.maxMergeGapMs,
            dtMedianMs,
        );

        const windowStats = this.computeWindowStats(
            sortedSamples,
            detectionWindowSamples,
            gravityReference,
        );

        const rawStillFlags = windowStats.map((w) => w.isStillCandidate);
        const mergedStillFlags = this.mergeShortFalseGaps(rawStillFlags, gapMergeSamples);

        const segments = this.extractSegments(
            sortedSamples,
            mergedStillFlags,
            minStillSamples,
            gravityReference,
        );

        const chosenBlock = this.chooseBestCalibrationBlock(segments);

        const annotatedSamples = sortedSamples.map((sample, index) => ({
            ...sample,
            still: mergedStillFlags[index] ?? false,
        }));

        const debug: MotionCalibrationDebug = {
            sampleHz,
            dtMedianMs,
            gravityReference,
            detectionWindowSamples,
            minStillSamples,
            gapMergeSamples,
            windowStats,
            rawStillFlags,
            mergedStillFlags,
            segments,
            chosenBlock,
        };

        if (!chosenBlock) {
            return {
                samples: annotatedSamples,
                calibrationBlock: null,
                debug,
                success: false,
                reason: "No valid still calibration block found.",
            };
        }

        return {
            samples: annotatedSamples,
            calibrationBlock: chosenBlock,
            debug,
            success: true,
            reason: null,
        };
    }

    // ---------------------------------------------------------------------------
    // Detection
    // ---------------------------------------------------------------------------

    private computeWindowStats(
        samples: FusedSample[],
        windowSamples: number,
        gravityReference: number,
    ): CalibrationWindowStats[] {
        const half = Math.floor(windowSamples / 2);

        return samples.map((sample, index) => {
            const start = Math.max(0, index - half);
            const end = Math.min(samples.length - 1, index + half);
            const win = samples.slice(start, end + 1);

            const gyroValues = win.map((s) => s.gyro_magnitude);
            const accelValues = win.map((s) => s.accel_magnitude);

            const gyroMean = mean(gyroValues);
            const gyroMedian = median(gyroValues);
            const gyroStd = std(gyroValues);
            const gyroMax = max(gyroValues);

            const accelMean = mean(accelValues);
            const accelMedian = median(accelValues);
            const accelStd = std(accelValues);
            const accelRange = range(accelValues);

            const gravityError = Math.abs(accelMean - gravityReference);

            const isStillCandidate =
                gyroMean <= this.cfg.maxStillGyroMean &&
                gyroMedian <= this.cfg.maxStillGyroMedian &&
                gyroStd <= this.cfg.maxStillGyroStd &&
                gyroMax <= this.cfg.maxStillGyroPeak &&
                accelStd <= this.cfg.maxAccelStd &&
                accelRange <= this.cfg.maxAccelRange &&
                gravityError <= this.cfg.maxGravityError;

            return {
                index,
                t_ms: sample.t_ms,

                gyroMean,
                gyroMedian,
                gyroStd,
                gyroMax,

                accelMean,
                accelMedian,
                accelStd,
                accelRange,

                gravityError,

                isStillCandidate,
            };
        });
    }

    private mergeShortFalseGaps(flags: boolean[], maxGapSamples: number): boolean[] {
        if (flags.length === 0 || maxGapSamples <= 0) {
            return [...flags];
        }

        const out = [...flags];
        let i = 0;

        while (i < out.length) {
            if (out[i]) {
                i += 1;
                continue;
            }

            const gapStart = i;
            while (i < out.length && !out[i]) {
                i += 1;
            }
            const gapEnd = i - 1;
            const gapLen = gapEnd - gapStart + 1;

            const leftStill = gapStart - 1 >= 0 ? out[gapStart - 1] : false;
            const rightStill = i < out.length ? out[i] : false;

            if (leftStill && rightStill && gapLen <= maxGapSamples) {
                for (let j = gapStart; j <= gapEnd; j += 1) {
                    out[j] = true;
                }
            }
        }

        return out;
    }

    private extractSegments(
        samples: FusedSample[],
        stillFlags: boolean[],
        minStillSamples: number,
        gravityReference: number,
    ): StillSegment[] {
        const segments: StillSegment[] = [];
        let i = 0;

        while (i < stillFlags.length) {
            if (!stillFlags[i]) {
                i += 1;
                continue;
            }

            const startIndex = i;
            while (i < stillFlags.length && stillFlags[i]) {
                i += 1;
            }
            const endIndex = i - 1;

            const segSamples = samples.slice(startIndex, endIndex + 1);
            const gyroValues = segSamples.map((s) => s.gyro_magnitude);
            const accelValues = segSamples.map((s) => s.accel_magnitude);

            const startMs = segSamples[0].t_ms;
            const endMs = segSamples[segSamples.length - 1].t_ms;
            const durationMs = Math.max(0, endMs - startMs);
            const sampleCount = segSamples.length;

            const meanGyro = mean(gyroValues);
            const medianGyro = median(gyroValues);
            const maxGyro = max(gyroValues);

            const meanAccelMag = mean(accelValues);
            const accelStd = std(accelValues);
            const accelRange = range(accelValues);
            const gravityError = Math.abs(meanAccelMag - gravityReference);

            const rejectReasons: string[] = [];

            if (sampleCount < minStillSamples) {
                rejectReasons.push("segment_too_short");
            }
            if (meanGyro > this.cfg.maxStillGyroMean) {
                rejectReasons.push("gyro_mean_too_high");
            }
            if (medianGyro > this.cfg.maxStillGyroMedian) {
                rejectReasons.push("gyro_median_too_high");
            }
            if (maxGyro > this.cfg.maxStillGyroPeak) {
                rejectReasons.push("gyro_peak_too_high");
            }
            if (accelStd > this.cfg.maxAccelStd) {
                rejectReasons.push("accel_std_too_high");
            }
            if (accelRange > this.cfg.maxAccelRange) {
                rejectReasons.push("accel_range_too_high");
            }
            if (gravityError > this.cfg.maxGravityError) {
                rejectReasons.push("gravity_error_too_high");
            }

            const accepted = rejectReasons.length === 0;

            const score = this.scoreSegment({
                durationMs,
                meanGyro,
                accelStd,
                gravityError,
            });

            segments.push({
                startIndex,
                endIndex,
                startMs,
                endMs,
                durationMs,
                sampleCount,

                meanGyro,
                medianGyro,
                maxGyro,

                meanAccelMag,
                accelStd,
                accelRange,

                gravityError,

                score,
                accepted,
                rejectReasons,
            });
        }

        return segments;
    }

    private chooseBestCalibrationBlock(
        segments: StillSegment[],
    ): CalibrationBlock | null {
        const accepted = segments.filter((s) => s.accepted);
        if (accepted.length === 0) {
            return null;
        }

        const best = accepted.reduce((a, b) => {
            if (b.score > a.score) return b;
            if (b.score < a.score) return a;

            if (b.durationMs > a.durationMs) return b;
            if (b.durationMs < a.durationMs) return a;

            if (b.meanGyro < a.meanGyro) return b;
            return a;
        });

        return {
            startIndex: best.startIndex,
            endIndex: best.endIndex,
            startMs: best.startMs,
            endMs: best.endMs,
            durationMs: best.durationMs,
            sampleCount: best.sampleCount,

            meanGyro: best.meanGyro,
            medianGyro: best.medianGyro,
            maxGyro: best.maxGyro,

            meanAccelMag: best.meanAccelMag,
            accelStd: best.accelStd,
            accelRange: best.accelRange,

            gravityError: best.gravityError,
            score: best.score,
        };
    }

    // ---------------------------------------------------------------------------
    // Scoring
    // ---------------------------------------------------------------------------

    private scoreSegment(input: {
        durationMs: number;
        meanGyro: number;
        accelStd: number;
        gravityError: number;
    }): number {
        const durationNorm = clamp01(input.durationMs / Math.max(this.cfg.minStillDurationMs, 1));
        const gyroNorm = 1 - clamp01(input.meanGyro / Math.max(this.cfg.maxStillGyroMean, 1e-6));
        const accelNorm = 1 - clamp01(input.accelStd / Math.max(this.cfg.maxAccelStd, 1e-6));
        const gravityNorm = 1 - clamp01(input.gravityError / Math.max(this.cfg.maxGravityError, 1e-6));

        return (
            durationNorm * this.cfg.scoreWeights.duration +
            gyroNorm * this.cfg.scoreWeights.gyro +
            accelNorm * this.cfg.scoreWeights.accelStd +
            gravityNorm * this.cfg.scoreWeights.gravity
        );
    }

    // ---------------------------------------------------------------------------
    // Timing / scaling
    // ---------------------------------------------------------------------------

    private estimateMedianDtMs(samples: FusedSample[]): number {
        const dts: number[] = [];

        for (let i = 1; i < samples.length; i += 1) {
            const dt = samples[i].t_ms - samples[i - 1].t_ms;
            if (Number.isFinite(dt) && dt > 0) {
                dts.push(dt);
            }
        }

        if (dts.length === 0) {
            return 100;
        }

        return median(dts);
    }

    private estimateSampleHz(dtMedianMs: number): number {
        if (!Number.isFinite(dtMedianMs) || dtMedianMs <= 0) {
            return 10;
        }

        const hz = 1000 / dtMedianMs;
        return clamp(hz, this.cfg.minSampleHz, this.cfg.maxSampleHz);
    }

    private msToOddWindowSamples(windowMs: number, dtMedianMs: number): number {
        const raw = Math.max(3, Math.round(windowMs / Math.max(dtMedianMs, 1)));
        return raw % 2 === 1 ? raw : raw + 1;
    }

    private msToMinSamples(durationMs: number, dtMedianMs: number): number {
        return Math.max(3, Math.ceil(durationMs / Math.max(dtMedianMs, 1)));
    }

    private msToGapSamples(gapMs: number, dtMedianMs: number): number {
        return Math.max(0, Math.round(gapMs / Math.max(dtMedianMs, 1)));
    }

    private estimateGravityReference(samples: FusedSample[]): number {
        const mags = samples
            .map((s) => s.accel_magnitude)
            .filter((v) => Number.isFinite(v) && v > 0);

        if (mags.length === 0) {
            return 9.81;
        }

        return median(mags);
    }

    private ensureSortedByTime(samples: FusedSample[]): FusedSample[] {
        for (let i = 1; i < samples.length; i += 1) {
            if (samples[i].t_ms < samples[i - 1].t_ms) {
                return [...samples].sort((a, b) => a.t_ms - b.t_ms);
            }
        }
        return [...samples];
    }

    private emptyResult(samples: FusedSample[], reason: string): MotionCalibrationPhase1Result {
        return {
            samples: samples.map((s) => ({ ...s, still: false })),
            calibrationBlock: null,
            debug: {
                sampleHz: 0,
                dtMedianMs: 0,
                gravityReference: 9.81,
                detectionWindowSamples: 0,
                minStillSamples: 0,
                gapMergeSamples: 0,
                windowStats: [],
                rawStillFlags: [],
                mergedStillFlags: [],
                segments: [],
                chosenBlock: null,
            },
            success: false,
            reason,
        };
    }
}
