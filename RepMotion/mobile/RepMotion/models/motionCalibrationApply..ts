export type MotionCalibrationApplyConfig = {
    debug: boolean;

    applyGyroBias: boolean;
    applyAccelBias: boolean;

    /*
      If true, correction is only applied when Phase 2 confidence exists
      and meets the threshold.
    */
    requireConfidenceForGyroApply: boolean;
    minGyroConfidenceToApply: number;

    requireConfidenceForAccelApply: boolean;
    minAccelConfidenceToApply: number;

    /*
      Safety option:
      if accel correction is applied, recompute accel_magnitude so the sample
      remains internally consistent.
      This should stay true if accel correction is enabled.
    */
    recomputeAccelMagnitudeIfAccelApplied: boolean;
};

export const DEFAULT_MOTION_CALIBRATION_APPLY_CONFIG: MotionCalibrationApplyConfig = {
    debug: true,

    /*
      Recommended default:
      apply gyro only.
    */
    applyGyroBias: true,
    applyAccelBias: false,

    /*
      Conservative confidence gating.
      0.60 is a reasonable default for a real-world 10 Hz IMU pipeline.
    */
    requireConfidenceForGyroApply: true,
    minGyroConfidenceToApply: 0.45,

    /*
      Accel correction is riskier because upstream fusion/orientation may already
      depend on accel. Keep this stricter.
    */
    requireConfidenceForAccelApply: true,
    minAccelConfidenceToApply: 0.75,

    recomputeAccelMagnitudeIfAccelApplied: true,
};
