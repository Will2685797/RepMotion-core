export type MotionBiasEstimationConfig = {
    debug: boolean;

    // Gyro estimation
    gyroTrimFraction: number;

    // Confidence / warnings
    minBlockSamples: number;
    idealBlockSamples: number;

    warnGyroSigmaMadPerAxis: number;
    warnGyroMeanMedianDeltaPerAxis: number;
    warnGyroBiasNorm: number;

    // Optional accel residual estimation
    estimateAccelBias: boolean;
    accelBiasGravityReferenceMode: "constant" | "block_median";
    gravityReferenceMps2: number;

    warnOrientationStdRad: number;
    warnAccelResidualSigmaMadPerAxis: number;

    // Confidence weights
    confidenceWeights: {
        gyroSpread: number;
        gyroConsistency: number;
        blockSize: number;
        orientationStability: number;
        accelResidual: number;
    };
};

export const DEFAULT_MOTION_BIAS_ESTIMATION_CONFIG: MotionBiasEstimationConfig = {
    debug: true,

    /*
      At ~10 Hz, still blocks are usually short.
      Trimmed mean is useful as debug, but median remains the estimator.
    */
    gyroTrimFraction: 0.2,

    /*
      If Phase 1 accepted a block shorter than this, that is already suspicious.
      12 samples at 10 Hz ~= 1.2 s.
    */
    minBlockSamples: 12,

    /*
      Confidence saturates around ~25 samples ~= 2.5 s at 10 Hz.
    */
    idealBlockSamples: 25,

    /*
      Units: rad/s.
      These are warning thresholds, not hard rejection thresholds.
      They are intentionally wider than ideal lab conditions because
      phone+ESP32+low-rate real-world data is messy.
    */
    warnGyroSigmaMadPerAxis: 0.03,
    warnGyroMeanMedianDeltaPerAxis: 0.015,
    warnGyroBiasNorm: 0.18,

    /*
      Conservative default:
      structure accel bias estimation, but do not turn it on by default.
    */
    estimateAccelBias: false,
    accelBiasGravityReferenceMode: "block_median",
    gravityReferenceMps2: 9.80665,

    /*
      Orientation stability matters if you want a credible accel residual estimate.
      ~0.10 rad ~= 5.7 degrees.
    */
    warnOrientationStdRad: 0.10,
    warnAccelResidualSigmaMadPerAxis: 0.22,

    confidenceWeights: {
        gyroSpread: 0.35,
        gyroConsistency: 0.25,
        blockSize: 0.20,
        orientationStability: 0.10,
        accelResidual: 0.10,
    },
};
