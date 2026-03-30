// models
import type {
    AppliedAccelBias,
    AppliedGyroBias,
    FusedSample,
    MotionCalibrationApplyDebug,
    MotionCalibrationApplyInput,
    MotionCalibrationApplyResult,
    MotionCalibrationApplyWarning,
} from "../models/motionCalibrationApply";
import {
    MotionCalibrationApplyConfig,
    DEFAULT_MOTION_CALIBRATION_APPLY_CONFIG
} from "../models/motionCalibrationApply.";


export class MotionCalibrationApplier {
    private readonly cfg: MotionCalibrationApplyConfig;

    constructor(config?: Partial<MotionCalibrationApplyConfig>) {
        this.cfg = {
            ...DEFAULT_MOTION_CALIBRATION_APPLY_CONFIG,
            ...config,
        };
    }

    public apply(input: MotionCalibrationApplyInput): MotionCalibrationApplyResult {
        const samples = [...input.samples];
        const warnings: MotionCalibrationApplyWarning[] = [];

        const sourceWarnings = input.biasEstimate?.warnings ?? [];
        const confidence = input.biasEstimate?.quality?.overallConfidence ?? null;

        const gyroBias = this.resolveGyroBias(input);
        const accelBias = this.resolveAccelBias(input);

        const canApplyGyro = this.canApplyGyroBias({
            gyroBias,
            confidence,
            warnings,
        });

        const canApplyAccel = this.canApplyAccelBias({
            accelBias,
            confidence,
            warnings,
        });

        const calibratedSamples = samples.map((sample) => {
            let next: FusedSample = { ...sample };

            if (canApplyGyro && gyroBias) {
                next = this.applyGyroToSample(next, gyroBias);
            }

            if (canApplyAccel && accelBias) {
                next = this.applyAccelToSample(next, accelBias);
            }

            return next;
        });

        const debug: MotionCalibrationApplyDebug | null = this.cfg.debug
            ? {
                gyroAppliedSampleCount: canApplyGyro ? calibratedSamples.length : 0,
                accelAppliedSampleCount: canApplyAccel ? calibratedSamples.length : 0,

                firstSampleBefore: samples.length > 0 ? { ...samples[0] } : null,
                firstSampleAfter: calibratedSamples.length > 0 ? { ...calibratedSamples[0] } : null,

                meanGyroMagnitudeBefore: mean(samples.map((s) => s.gyro_magnitude)),
                meanGyroMagnitudeAfter: mean(calibratedSamples.map((s) => s.gyro_magnitude)),

                meanAccelMagnitudeBefore: mean(samples.map((s) => s.accel_magnitude)),
                meanAccelMagnitudeAfter: mean(calibratedSamples.map((s) => s.accel_magnitude)),

                appliedGyroBias: canApplyGyro ? gyroBias : null,
                appliedAccelBias: canApplyAccel ? accelBias : null,
            }
            : null;

        return {
            samples: calibratedSamples,
            applied: {
                gyro: canApplyGyro,
                accel: canApplyAccel,
            },
            appliedBias: {
                gyro: canApplyGyro ? gyroBias : null,
                accel: canApplyAccel ? accelBias : null,
            },
            source: {
                source: "phase2_bias_estimation",
                hasGyroBias: gyroBias !== null,
                hasAccelBias: accelBias !== null,
                confidence: confidence == null ? null : { overallConfidence: confidence },
                warnings: sourceWarnings,
            },
            warnings: uniqueWarnings(warnings),
            debug,
        };
    }

    // ---------------------------------------------------------------------------
    // Safety / gating
    // ---------------------------------------------------------------------------

    private canApplyGyroBias(input: {
        gyroBias: AppliedGyroBias | null;
        confidence: number | null;
        warnings: MotionCalibrationApplyWarning[];
    }): boolean {
        if (!this.cfg.applyGyroBias) {
            input.warnings.push("gyro_application_disabled");
            input.warnings.push("gyro_application_skipped");
            return false;
        }

        if (!input.gyroBias) {
            input.warnings.push("missing_bias_estimate");
            input.warnings.push("missing_gyro_bias");
            input.warnings.push("gyro_application_skipped");
            return false;
        }

        if (this.cfg.requireConfidenceForGyroApply) {
            if (
                input.confidence == null ||
                input.confidence < this.cfg.minGyroConfidenceToApply
            ) {
                input.warnings.push("gyro_confidence_below_threshold");
                input.warnings.push("gyro_application_skipped");
                return false;
            }
        }

        return true;
    }

    private canApplyAccelBias(input: {
        accelBias: AppliedAccelBias | null;
        confidence: number | null;
        warnings: MotionCalibrationApplyWarning[];
    }): boolean {
        if (!this.cfg.applyAccelBias) {
            input.warnings.push("accel_application_disabled");
            input.warnings.push("accel_application_skipped");
            return false;
        }

        if (!input.accelBias) {
            input.warnings.push("missing_accel_bias");
            input.warnings.push("accel_application_skipped");
            return false;
        }

        if (this.cfg.requireConfidenceForAccelApply) {
            if (
                input.confidence == null ||
                input.confidence < this.cfg.minAccelConfidenceToApply
            ) {
                input.warnings.push("accel_confidence_below_threshold");
                input.warnings.push("accel_application_skipped");
                return false;
            }
        }

        return true;
    }

    private resolveGyroBias(input: MotionCalibrationApplyInput): AppliedGyroBias | null {
        const raw = input.biasEstimate?.gyro_bias;
        if (!raw) return null;

        const gx = finiteOrZero(raw.gx_bias);
        const gy = finiteOrZero(raw.gy_bias);
        const gz = finiteOrZero(raw.gz_bias);

        return {
            gx_bias: gx,
            gy_bias: gy,
            gz_bias: gz,
            norm: raw.norm ?? vecNorm3(gx, gy, gz),
        };
    }

    private resolveAccelBias(input: MotionCalibrationApplyInput): AppliedAccelBias | null {
        const raw = input.biasEstimate?.accel_bias;
        if (!raw) return null;

        const ax = finiteOrZero(raw.ax_bias);
        const ay = finiteOrZero(raw.ay_bias);
        const az = finiteOrZero(raw.az_bias);

        return {
            ax_bias: ax,
            ay_bias: ay,
            az_bias: az,
            norm: raw.norm ?? vecNorm3(ax, ay, az),
        };
    }

    // ---------------------------------------------------------------------------
    // Application logic
    // ---------------------------------------------------------------------------

    private applyGyroToSample(sample: FusedSample, bias: AppliedGyroBias): FusedSample {
        const gx = sample.gx - bias.gx_bias;
        const gy = sample.gy - bias.gy_bias;
        const gz = sample.gz - bias.gz_bias;

        return {
            ...sample,
            gx,
            gy,
            gz,
            gyro_magnitude: vecNorm3(gx, gy, gz),
        };
    }

    private applyAccelToSample(sample: FusedSample, bias: AppliedAccelBias): FusedSample {
        const ax = sample.ax - bias.ax_bias;
        const ay = sample.ay - bias.ay_bias;
        const az = sample.az - bias.az_bias;

        const next: FusedSample = {
            ...sample,
            ax,
            ay,
            az,
        };

        if (this.cfg.recomputeAccelMagnitudeIfAccelApplied) {
            next.accel_magnitude = vecNorm3(ax, ay, az);
        }

        return next;
    }
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
function mean(xs: number[]): number {
    if (xs.length === 0) return 0;
    let sum = 0;
    for (const x of xs) sum += x;
    return sum / xs.length;
}

function vecNorm3(x: number, y: number, z: number): number {
    return Math.sqrt(x * x + y * y + z * z);
}

function finiteOrZero(x: number): number {
    return Number.isFinite(x) ? x : 0;
}

function uniqueWarnings(xs: MotionCalibrationApplyWarning[]): MotionCalibrationApplyWarning[] {
    return Array.from(new Set(xs));
}
