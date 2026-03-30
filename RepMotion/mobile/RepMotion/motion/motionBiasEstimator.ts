// models
import type {
    Vec3,
    AccelBiasEstimate,
    AxisRobustStats,
    BiasBlockStatistics,
    BiasEstimationWarning,
    BiasQualityMetrics,
    MotionBiasEstimationDebug,
    MotionBiasEstimationResult,
    MotionBiasEstimatorInput,
    OrientationStabilityStats,
} from "../models/motionBiasEstimation";
import { FusedSample } from "../models/motionCalibration";
import { CalibrationBlock } from "../models/motionCalibration";
import { MotionBiasEstimationConfig } from "../models/motionBiasEstimationConfig";
import { DEFAULT_MOTION_BIAS_ESTIMATION_CONFIG } from "../models/motionBiasEstimationConfig";


export class MotionBiasEstimator {
    private readonly cfg: MotionBiasEstimationConfig;

    constructor(config?: Partial<MotionBiasEstimationConfig>) {
        this.cfg = {
            ...DEFAULT_MOTION_BIAS_ESTIMATION_CONFIG,
            ...config,
            confidenceWeights: {
                ...DEFAULT_MOTION_BIAS_ESTIMATION_CONFIG.confidenceWeights,
                ...(config?.confidenceWeights ?? {}),
            },
        };
    }

    public estimate(input: MotionBiasEstimatorInput): MotionBiasEstimationResult {
        const { samples, calibrationBlock } = input;

        const warnings: BiasEstimationWarning[] = [];

        const blockSamples = this.extractBlockSamples(samples, calibrationBlock);
        if (blockSamples.length === 0) {
            return this.buildFailureResult(
                calibrationBlock,
                "empty_block",
            );
        }

        if (blockSamples.length < this.cfg.minBlockSamples) {
            warnings.push("block_too_short");
        }

        const dtMedianMs = estimateMedianDtMs(blockSamples);
        const sampleHz = dtMedianMs > 0 ? 1000 / dtMedianMs : 0;

        const gyroX = blockSamples.map((s) => s.gx);
        const gyroY = blockSamples.map((s) => s.gy);
        const gyroZ = blockSamples.map((s) => s.gz);

        const gyroStatsX = computeAxisRobustStats(gyroX, this.cfg.gyroTrimFraction);
        const gyroStatsY = computeAxisRobustStats(gyroY, this.cfg.gyroTrimFraction);
        const gyroStatsZ = computeAxisRobustStats(gyroZ, this.cfg.gyroTrimFraction);

        const gyroBias = {
            gx_bias: gyroStatsX.median,
            gy_bias: gyroStatsY.median,
            gz_bias: gyroStatsZ.median,
            norm: vecNorm({
                x: gyroStatsX.median,
                y: gyroStatsY.median,
                z: gyroStatsZ.median,
            }),
            method: "median" as const,
        };

        const gyroMeanVsMedianAbsDelta = {
            gx: Math.abs(gyroStatsX.mean - gyroStatsX.median),
            gy: Math.abs(gyroStatsY.mean - gyroStatsY.median),
            gz: Math.abs(gyroStatsZ.mean - gyroStatsZ.median),
        };

        if (
            gyroStatsX.sigmaMad > this.cfg.warnGyroSigmaMadPerAxis ||
            gyroStatsY.sigmaMad > this.cfg.warnGyroSigmaMadPerAxis ||
            gyroStatsZ.sigmaMad > this.cfg.warnGyroSigmaMadPerAxis
        ) {
            warnings.push("gyro_spread_high");
        }

        if (
            gyroMeanVsMedianAbsDelta.gx > this.cfg.warnGyroMeanMedianDeltaPerAxis ||
            gyroMeanVsMedianAbsDelta.gy > this.cfg.warnGyroMeanMedianDeltaPerAxis ||
            gyroMeanVsMedianAbsDelta.gz > this.cfg.warnGyroMeanMedianDeltaPerAxis
        ) {
            warnings.push("gyro_axis_disagreement_high");
        }

        if (gyroBias.norm > this.cfg.warnGyroBiasNorm) {
            warnings.push("gyro_bias_norm_high");
        }

        const orientationStats = this.computeOrientationStabilityStats(blockSamples);
        const blockStats = this.buildBlockStatistics(
            calibrationBlock,
            blockSamples,
            dtMedianMs,
            sampleHz,
            orientationStats,
        );

        let accelBias: AccelBiasEstimate | null = null;
        let accelResidualAxisStats: MotionBiasEstimationDebug["accelResidualAxisStats"] = null;
        let accelResidualBlock: MotionBiasEstimationDebug["accelResidualBlock"] = null;
        let expectedGravityBody: Vec3[] | null = null;
        let measuredAccelBody: Vec3[] | null = null;
        let gravityReferenceUsed: number | null = null;

        if (!this.cfg.estimateAccelBias) {
            warnings.push("accel_bias_estimation_disabled");
        } else {
            const orientationStableEnough =
                orientationStats.rollStd <= this.cfg.warnOrientationStdRad &&
                orientationStats.pitchStd <= this.cfg.warnOrientationStdRad;

            if (!orientationStableEnough) {
                warnings.push("orientation_unstable_for_accel_bias");
                warnings.push("accel_bias_estimation_skipped");
            } else {
                gravityReferenceUsed = this.resolveGravityReference(blockSamples);

                const accelResidual = this.computeAccelResiduals(
                    blockSamples,
                    gravityReferenceUsed,
                );

                expectedGravityBody = accelResidual.expectedGravityBody;
                measuredAccelBody = accelResidual.measuredAccelBody;
                accelResidualBlock = {
                    ax_residual: accelResidual.residualX,
                    ay_residual: accelResidual.residualY,
                    az_residual: accelResidual.residualZ,
                };

                const accelStatsX = computeAxisRobustStats(accelResidual.residualX, this.cfg.gyroTrimFraction);
                const accelStatsY = computeAxisRobustStats(accelResidual.residualY, this.cfg.gyroTrimFraction);
                const accelStatsZ = computeAxisRobustStats(accelResidual.residualZ, this.cfg.gyroTrimFraction);

                accelResidualAxisStats = {
                    ax: accelStatsX,
                    ay: accelStatsY,
                    az: accelStatsZ,
                };

                accelBias = {
                    ax_bias: accelStatsX.median,
                    ay_bias: accelStatsY.median,
                    az_bias: accelStatsZ.median,
                    norm: vecNorm({
                        x: accelStatsX.median,
                        y: accelStatsY.median,
                        z: accelStatsZ.median,
                    }),
                    method: "gravity_residual_body_frame",
                    gravityReference: gravityReferenceUsed,
                    caution: [
                        "estimate_only_not_applied",
                        "depends_on_orientation_quality",
                        "can_be_partly_circular_if_orientation_fusion_uses_accel_heavily",
                    ],
                };

                if (
                    accelStatsX.sigmaMad > this.cfg.warnAccelResidualSigmaMadPerAxis ||
                    accelStatsY.sigmaMad > this.cfg.warnAccelResidualSigmaMadPerAxis ||
                    accelStatsZ.sigmaMad > this.cfg.warnAccelResidualSigmaMadPerAxis
                ) {
                    warnings.push("accel_residual_spread_high");
                }
            }
        }

        const quality = this.computeQualityMetrics({
            sampleCount: blockSamples.length,
            orientationStats,
            gyroStatsX,
            gyroStatsY,
            gyroStatsZ,
            gyroMeanVsMedianAbsDelta,
            accelResidualAxisStats,
        });

        const debug: MotionBiasEstimationDebug | null = this.cfg.debug
            ? {
                gyroBlock: {
                    gx: gyroX,
                    gy: gyroY,
                    gz: gyroZ,
                },
                gyroAxisStats: {
                    gx: gyroStatsX,
                    gy: gyroStatsY,
                    gz: gyroStatsZ,
                },
                gyroMeanVsMedianAbsDelta,
                accelResidualBlock,
                accelResidualAxisStats,
                expectedGravityBody,
                measuredAccelBody,
                gravityReferenceUsed,
            }
            : null;

        return {
            success: true,
            warnings: uniqueWarnings(warnings),
            calibrationBlock,
            blockStats,
            gyro_bias: gyroBias,
            accel_bias: accelBias,
            quality,
            debug,
        };
    }

    private extractBlockSamples(
        samples: FusedSample[],
        calibrationBlock: CalibrationBlock,
    ): FusedSample[] {
        const startIndex = Math.max(0, calibrationBlock.startIndex);
        const endIndex = Math.min(samples.length - 1, calibrationBlock.endIndex);

        if (
            samples.length === 0 ||
            startIndex >= samples.length ||
            endIndex < startIndex
        ) {
            return [];
        }

        return samples.slice(startIndex, endIndex + 1);
    }

    private buildFailureResult(
        calibrationBlock: CalibrationBlock,
        warning: BiasEstimationWarning,
    ): MotionBiasEstimationResult {
        return {
            success: false,
            warnings: [warning],
            calibrationBlock,
            blockStats: {
                sampleCount: 0,
                durationMs: 0,
                dtMedianMs: 0,
                sampleHz: 0,
                blockMeanGyroMagnitude: 0,
                blockMedianGyroMagnitude: 0,
                blockMaxGyroMagnitude: 0,
                blockMeanAccelMagnitude: 0,
                blockMedianAccelMagnitude: 0,
                orientation: {
                    rollStd: 0,
                    pitchStd: 0,
                    yawStd: 0,
                    rollRange: 0,
                    pitchRange: 0,
                    yawRange: 0,
                },
            },
            gyro_bias: {
                gx_bias: 0,
                gy_bias: 0,
                gz_bias: 0,
                norm: 0,
                method: "median",
            },
            accel_bias: null,
            quality: {
                gyroSpreadScore: 0,
                gyroConsistencyScore: 0,
                blockSizeScore: 0,
                orientationStabilityScore: 0,
                accelResidualScore: null,
                overallConfidence: 0,
            },
            debug: this.cfg.debug
                ? {
                    gyroBlock: { gx: [], gy: [], gz: [] },
                    gyroAxisStats: {
                        gx: emptyAxisStats(),
                        gy: emptyAxisStats(),
                        gz: emptyAxisStats(),
                    },
                    gyroMeanVsMedianAbsDelta: { gx: 0, gy: 0, gz: 0 },
                    accelResidualBlock: null,
                    accelResidualAxisStats: null,
                    expectedGravityBody: null,
                    measuredAccelBody: null,
                    gravityReferenceUsed: null,
                }
                : null,
        };
    }

    private buildBlockStatistics(
        calibrationBlock: CalibrationBlock,
        blockSamples: FusedSample[],
        dtMedianMs: number,
        sampleHz: number,
        orientation: OrientationStabilityStats,
    ): BiasBlockStatistics {
        const gyroMag = blockSamples.map((s) => s.gyro_magnitude);
        const accelMag = blockSamples.map((s) => s.accel_magnitude);

        return {
            sampleCount: blockSamples.length,
            durationMs: calibrationBlock.durationMs,
            dtMedianMs,
            sampleHz,

            blockMeanGyroMagnitude: mean(gyroMag),
            blockMedianGyroMagnitude: median(gyroMag),
            blockMaxGyroMagnitude: max(gyroMag),

            blockMeanAccelMagnitude: mean(accelMag),
            blockMedianAccelMagnitude: median(accelMag),

            orientation,
        };
    }

    private computeOrientationStabilityStats(
        blockSamples: FusedSample[],
    ): OrientationStabilityStats {
        const roll = unwrapRadians(blockSamples.map((s) => s.roll));
        const pitch = unwrapRadians(blockSamples.map((s) => s.pitch));
        const yaw = unwrapRadians(blockSamples.map((s) => s.yaw));

        return {
            rollStd: std(roll),
            pitchStd: std(pitch),
            yawStd: std(yaw),
            rollRange: range(roll),
            pitchRange: range(pitch),
            yawRange: range(yaw),
        };
    }

    private resolveGravityReference(blockSamples: FusedSample[]): number {
        if (this.cfg.accelBiasGravityReferenceMode === "constant") {
            return this.cfg.gravityReferenceMps2;
        }

        const mags = blockSamples
            .map((s) => s.accel_magnitude)
            .filter((v) => Number.isFinite(v) && v > 0);

        if (mags.length === 0) {
            return this.cfg.gravityReferenceMps2;
        }

        return median(mags);
    }

    private computeAccelResiduals(
        blockSamples: FusedSample[],
        gravityReference: number,
    ): {
        residualX: number[];
        residualY: number[];
        residualZ: number[];
        expectedGravityBody: Vec3[];
        measuredAccelBody: Vec3[];
    } {
        const gravityWorld: Vec3 = { x: 0, y: 0, z: -gravityReference };

        const expectedGravityBody: Vec3[] = [];
        const measuredAccelBody: Vec3[] = [];
        const residualX: number[] = [];
        const residualY: number[] = [];
        const residualZ: number[] = [];

        for (const s of blockSamples) {
            const q = normalizeQuaternion({
                w: s.qw,
                x: s.qx,
                y: s.qy,
                z: s.qz,
            });

            const expected = rotateWorldToBody(q, gravityWorld);
            const measured = { x: s.ax, y: s.ay, z: s.az };

            expectedGravityBody.push(expected);
            measuredAccelBody.push(measured);

            residualX.push(measured.x - expected.x);
            residualY.push(measured.y - expected.y);
            residualZ.push(measured.z - expected.z);
        }

        return {
            residualX,
            residualY,
            residualZ,
            expectedGravityBody,
            measuredAccelBody,
        };
    }

    private computeQualityMetrics(input: {
        sampleCount: number;
        orientationStats: OrientationStabilityStats;
        gyroStatsX: AxisRobustStats;
        gyroStatsY: AxisRobustStats;
        gyroStatsZ: AxisRobustStats;
        gyroMeanVsMedianAbsDelta: {
            gx: number;
            gy: number;
            gz: number;
        };
        accelResidualAxisStats: {
            ax: AxisRobustStats;
            ay: AxisRobustStats;
            az: AxisRobustStats;
        } | null;
    }): BiasQualityMetrics {
        const gyroSigmaWorst = max([
            input.gyroStatsX.sigmaMad,
            input.gyroStatsY.sigmaMad,
            input.gyroStatsZ.sigmaMad,
        ]);

        const gyroDeltaWorst = max([
            input.gyroMeanVsMedianAbsDelta.gx,
            input.gyroMeanVsMedianAbsDelta.gy,
            input.gyroMeanVsMedianAbsDelta.gz,
        ]);

        const gyroSpreadScore =
            1 - clamp01(gyroSigmaWorst / this.cfg.warnGyroSigmaMadPerAxis);

        const gyroConsistencyScore =
            1 - clamp01(gyroDeltaWorst / this.cfg.warnGyroMeanMedianDeltaPerAxis);

        const blockSizeScore = clamp01(
            (input.sampleCount - this.cfg.minBlockSamples) /
            Math.max(this.cfg.idealBlockSamples - this.cfg.minBlockSamples, 1),
        );

        const orientationWorstStd = max([
            input.orientationStats.rollStd,
            input.orientationStats.pitchStd,
        ]);

        const orientationStabilityScore =
            1 - clamp01(orientationWorstStd / this.cfg.warnOrientationStdRad);

        let accelResidualScore: number | null = null;

        if (input.accelResidualAxisStats) {
            const accelResidualWorst = max([
                input.accelResidualAxisStats.ax.sigmaMad,
                input.accelResidualAxisStats.ay.sigmaMad,
                input.accelResidualAxisStats.az.sigmaMad,
            ]);

            accelResidualScore =
                1 - clamp01(accelResidualWorst / this.cfg.warnAccelResidualSigmaMadPerAxis);
        }

        const w = this.cfg.confidenceWeights;

        const accelComponent =
            accelResidualScore == null
                ? 0
                : accelResidualScore * w.accelResidual;

        const effectiveWeight =
            w.gyroSpread +
            w.gyroConsistency +
            w.blockSize +
            w.orientationStability +
            (accelResidualScore == null ? 0 : w.accelResidual);

        const total =
            gyroSpreadScore * w.gyroSpread +
            gyroConsistencyScore * w.gyroConsistency +
            blockSizeScore * w.blockSize +
            orientationStabilityScore * w.orientationStability +
            accelComponent;

        const overallConfidence =
            effectiveWeight > 0 ? clamp01(total / effectiveWeight) : 0;

        return {
            gyroSpreadScore,
            gyroConsistencyScore,
            blockSizeScore,
            orientationStabilityScore,
            accelResidualScore,
            overallConfidence,
        };
    }
}




// -----------------------------------------------------------------------------
// Math / stats helpers
// -----------------------------------------------------------------------------
function computeAxisRobustStats(
    xs: number[],
    trimFraction: number,
): AxisRobustStats {
    if (xs.length === 0) {
        return emptyAxisStats();
    }

    const sorted = [...xs].sort((a, b) => a - b);
    const med = median(sorted);
    const absDev = sorted.map((x) => Math.abs(x - med));
    const mad = median(absDev);
    const sigmaMad = 1.4826 * mad;

    return {
        count: sorted.length,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        range: sorted[sorted.length - 1] - sorted[0],

        mean: mean(sorted),
        median: med,
        trimmedMean: trimmedMean(sorted, trimFraction),

        mad,
        sigmaMad,

        q25: quantileSorted(sorted, 0.25),
        q75: quantileSorted(sorted, 0.75),
        iqr: quantileSorted(sorted, 0.75) - quantileSorted(sorted, 0.25),

        p10: quantileSorted(sorted, 0.10),
        p90: quantileSorted(sorted, 0.90),
    };
}

function emptyAxisStats(): AxisRobustStats {
    return {
        count: 0,
        min: 0,
        max: 0,
        range: 0,

        mean: 0,
        median: 0,
        trimmedMean: 0,

        mad: 0,
        sigmaMad: 0,

        q25: 0,
        q75: 0,
        iqr: 0,

        p10: 0,
        p90: 0,
    };
}

function estimateMedianDtMs(samples: FusedSample[]): number {
    const dts: number[] = [];

    for (let i = 1; i < samples.length; i += 1) {
        const dt = samples[i].t_ms - samples[i - 1].t_ms;
        if (Number.isFinite(dt) && dt > 0) {
            dts.push(dt);
        }
    }

    return dts.length > 0 ? median(dts) : 0;
}

function mean(xs: number[]): number {
    if (xs.length === 0) return 0;
    let s = 0;
    for (const x of xs) s += x;
    return s / xs.length;
}

function median(xs: number[]): number {
    if (xs.length === 0) return 0;
    const sorted = [...xs].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
        ? 0.5 * (sorted[mid - 1] + sorted[mid])
        : sorted[mid];
}

function trimmedMean(xsSorted: number[], trimFraction: number): number {
    if (xsSorted.length === 0) return 0;
    const n = xsSorted.length;
    const k = Math.floor(n * clamp01(trimFraction) * 0.5);

    const start = k;
    const end = n - k;

    if (end <= start) {
        return mean(xsSorted);
    }

    return mean(xsSorted.slice(start, end));
}

function quantileSorted(xsSorted: number[], q: number): number {
    if (xsSorted.length === 0) return 0;
    if (xsSorted.length === 1) return xsSorted[0];

    const qq = clamp01(q);
    const pos = qq * (xsSorted.length - 1);
    const lo = Math.floor(pos);
    const hi = Math.ceil(pos);

    if (lo === hi) return xsSorted[lo];

    const w = pos - lo;
    return xsSorted[lo] * (1 - w) + xsSorted[hi] * w;
}

function std(xs: number[]): number {
    if (xs.length <= 1) return 0;
    const mu = mean(xs);
    let s = 0;
    for (const x of xs) {
        const d = x - mu;
        s += d * d;
    }
    return Math.sqrt(s / xs.length);
}

function range(xs: number[]): number {
    if (xs.length === 0) return 0;
    return max(xs) - min(xs);
}

function min(xs: number[]): number {
    if (xs.length === 0) return 0;
    let m = xs[0];
    for (let i = 1; i < xs.length; i += 1) {
        if (xs[i] < m) m = xs[i];
    }
    return m;
}

function max(xs: number[]): number;
function max(xs: number[][]): number;
function max(xs: number[] | number[][]): number {
    const flat = Array.isArray(xs[0]) ? (xs as number[][]).flat() : (xs as number[]);
    if (flat.length === 0) return 0;
    let m = flat[0];
    for (let i = 1; i < flat.length; i += 1) {
        if (flat[i] > m) m = flat[i];
    }
    return m;
}

function clamp01(x: number): number {
    return Math.max(0, Math.min(1, x));
}

function vecNorm(v: Vec3): number {
    return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

function uniqueWarnings(xs: BiasEstimationWarning[]): BiasEstimationWarning[] {
    return Array.from(new Set(xs));
}

function unwrapRadians(xs: number[]): number[] {
    if (xs.length === 0) return [];

    const out = [xs[0]];
    let offset = 0;

    for (let i = 1; i < xs.length; i += 1) {
        const cur = xs[i];
        const prev = xs[i - 1];
        const delta = cur - prev;

        if (delta > Math.PI) {
            offset -= 2 * Math.PI;
        } else if (delta < -Math.PI) {
            offset += 2 * Math.PI;
        }

        out.push(cur + offset);
    }

    return out;
}

// -----------------------------------------------------------------------------
// Quaternion helpers
// q represents body -> world
// body_vec = q_conj * world_vec * q
// -----------------------------------------------------------------------------
type Quaternion = {
    w: number;
    x: number;
    y: number;
    z: number;
};

function normalizeQuaternion(q: Quaternion): Quaternion {
    const n = Math.sqrt(q.w * q.w + q.x * q.x + q.y * q.y + q.z * q.z);
    if (!Number.isFinite(n) || n <= 1e-12) {
        return { w: 1, x: 0, y: 0, z: 0 };
    }

    return {
        w: q.w / n,
        x: q.x / n,
        y: q.y / n,
        z: q.z / n,
    };
}

function quatConjugate(q: Quaternion): Quaternion {
    return { w: q.w, x: -q.x, y: -q.y, z: -q.z };
}

function quatMul(a: Quaternion, b: Quaternion): Quaternion {
    return {
        w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
        x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
        y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
        z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
    };
}

function rotateWorldToBody(qBodyToWorld: Quaternion, vWorld: Vec3): Vec3 {
    const qv: Quaternion = { w: 0, x: vWorld.x, y: vWorld.y, z: vWorld.z };
    const out = quatMul(quatMul(quatConjugate(qBodyToWorld), qv), qBodyToWorld);

    return { x: out.x, y: out.y, z: out.z };
}
