// models
import { CalibrationBlock, FusedSample } from "./motionCalibration";


export type Vec3 = {
    x: number;
    y: number;
    z: number;
};

export type AxisRobustStats = {
    count: number;
    min: number;
    max: number;
    range: number;

    mean: number;
    median: number;
    trimmedMean: number;

    mad: number;
    sigmaMad: number;

    q25: number;
    q75: number;
    iqr: number;

    p10: number;
    p90: number;
};

export type OrientationStabilityStats = {
    rollStd: number;
    pitchStd: number;
    yawStd: number;

    rollRange: number;
    pitchRange: number;
    yawRange: number;
};

export type GyroBiasEstimate = {
    gx_bias: number;
    gy_bias: number;
    gz_bias: number;
    norm: number;
    method: "median";
};

export type AccelBiasEstimate = {
    ax_bias: number;
    ay_bias: number;
    az_bias: number;
    norm: number;

    method: "gravity_residual_body_frame";
    gravityReference: number;

    caution: string[];
};

export type BiasBlockStatistics = {
    sampleCount: number;
    durationMs: number;
    dtMedianMs: number;
    sampleHz: number;

    blockMeanGyroMagnitude: number;
    blockMedianGyroMagnitude: number;
    blockMaxGyroMagnitude: number;

    blockMeanAccelMagnitude: number;
    blockMedianAccelMagnitude: number;

    orientation: OrientationStabilityStats;
};

export type BiasQualityMetrics = {
    gyroSpreadScore: number;
    gyroConsistencyScore: number;
    blockSizeScore: number;
    orientationStabilityScore: number;
    accelResidualScore: number | null;

    overallConfidence: number;
};

export type BiasEstimationWarning =
    | "empty_block"
    | "block_too_short"
    | "block_not_in_bounds"
    | "gyro_spread_high"
    | "gyro_axis_disagreement_high"
    | "gyro_bias_norm_high"
    | "orientation_unstable_for_accel_bias"
    | "accel_residual_spread_high"
    | "accel_bias_estimation_disabled"
    | "accel_bias_estimation_skipped";

export type MotionBiasEstimationDebug = {
    gyroBlock: {
        gx: number[];
        gy: number[];
        gz: number[];
    };

    gyroAxisStats: {
        gx: AxisRobustStats;
        gy: AxisRobustStats;
        gz: AxisRobustStats;
    };

    gyroMeanVsMedianAbsDelta: {
        gx: number;
        gy: number;
        gz: number;
    };

    accelResidualBlock: {
        ax_residual: number[];
        ay_residual: number[];
        az_residual: number[];
    } | null;

    accelResidualAxisStats: {
        ax: AxisRobustStats;
        ay: AxisRobustStats;
        az: AxisRobustStats;
    } | null;

    expectedGravityBody: Vec3[] | null;
    measuredAccelBody: Vec3[] | null;

    gravityReferenceUsed: number | null;
};

export type MotionBiasEstimationResult = {
    success: boolean;
    warnings: BiasEstimationWarning[];

    calibrationBlock: CalibrationBlock;
    blockStats: BiasBlockStatistics;

    gyro_bias: GyroBiasEstimate;
    accel_bias: AccelBiasEstimate | null;

    quality: BiasQualityMetrics;
    debug: MotionBiasEstimationDebug | null;
};

export type MotionBiasEstimatorInput = {
    samples: FusedSample[];
    calibrationBlock: CalibrationBlock;
};
