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
    roll: number;
    pitch: number;
    yaw: number;
    qw: number;
    qx: number;
    qy: number;
    qz: number;
    temp_c?: number;
    still?: boolean;
};

export type AppliedGyroBias = {
    gx_bias: number;
    gy_bias: number;
    gz_bias: number;
    norm: number;
};

export type AppliedAccelBias = {
    ax_bias: number;
    ay_bias: number;
    az_bias: number;
    norm: number;
};

export type CalibrationQualitySnapshot = {
    overallConfidence: number;
};

export type CalibrationSourceMetadata = {
    source: "phase2_bias_estimation";
    hasGyroBias: boolean;
    hasAccelBias: boolean;
    confidence: CalibrationQualitySnapshot | null;
    warnings: string[];
};

export type MotionCalibrationApplyInput = {
    samples: FusedSample[];

    biasEstimate: {
        gyro_bias?: {
            gx_bias: number;
            gy_bias: number;
            gz_bias: number;
            norm?: number;
        } | null;

        accel_bias?: {
            ax_bias: number;
            ay_bias: number;
            az_bias: number;
            norm?: number;
        } | null;

        quality?: {
            overallConfidence: number;
        } | null;

        warnings?: string[] | null;
    } | null;
};

export type MotionCalibrationApplyWarning =
    | "missing_bias_estimate"
    | "missing_gyro_bias"
    | "gyro_confidence_below_threshold"
    | "gyro_application_disabled"
    | "gyro_application_skipped"
    | "accel_application_disabled"
    | "missing_accel_bias"
    | "accel_confidence_below_threshold"
    | "accel_application_skipped"
    | "accel_magnitude_recomputed_after_accel_apply";

export type MotionCalibrationApplyDebug = {
    gyroAppliedSampleCount: number;
    accelAppliedSampleCount: number;

    firstSampleBefore: FusedSample | null;
    firstSampleAfter: FusedSample | null;

    meanGyroMagnitudeBefore: number;
    meanGyroMagnitudeAfter: number;

    meanAccelMagnitudeBefore: number;
    meanAccelMagnitudeAfter: number;

    appliedGyroBias: AppliedGyroBias | null;
    appliedAccelBias: AppliedAccelBias | null;
};

export type MotionCalibrationApplyResult = {
    samples: FusedSample[];

    applied: {
        gyro: boolean;
        accel: boolean;
    };

    appliedBias: {
        gyro: AppliedGyroBias | null;
        accel: AppliedAccelBias | null;
    };

    source: CalibrationSourceMetadata;
    warnings: MotionCalibrationApplyWarning[];

    debug: MotionCalibrationApplyDebug | null;
};
