export type MotionCalibrationConfig = {
    debug: boolean;

    // Windowing
    detectionWindowMs: number;

    // Stillness thresholds
    maxStillGyroMean: number;
    maxStillGyroMedian: number;
    maxStillGyroStd: number;
    maxStillGyroPeak: number;

    maxAccelStd: number;
    maxAccelRange: number;
    maxGravityError: number;

    // Segment rules
    minStillDurationMs: number;
    maxMergeGapMs: number;

    // Selection scoring
    scoreWeights: {
        duration: number;
        gyro: number;
        accelStd: number;
        gravity: number;
    };

    // Safety clamps for inferred sample rate
    minSampleHz: number;
    maxSampleHz: number;
};

export const DEFAULT_MOTION_CALIBRATION_CONFIG: MotionCalibrationConfig = {
    debug: true,

    /*
      10 Hz means ~100 ms per sample.
      A 700 ms window = ~7 samples.
      That is enough to stabilize estimates without becoming too laggy.
    */
    detectionWindowMs: 700,

    /*
      Keep these moderate. At 10 Hz you cannot set micro-thresholds like a high-rate IMU.
      These should catch "human still" not "lab-grade still".
      Assumes gyro is in rad/s and accel magnitude is in m/s^2.
    */
    maxStillGyroMean: 0.10,
    maxStillGyroMedian: 0.08,
    maxStillGyroStd: 0.05,
    maxStillGyroPeak: 0.20,

    /*
      accel_magnitude should hover near gravity even while still.
      At low sample rate, use std/range over a short window, not sample-to-sample diff alone.
    */
    maxAccelStd: 0.18,
    maxAccelRange: 0.55,
    maxGravityError: 0.35,

    /*
      Need a real block, not a random quiet blip.
      At 10 Hz, 1500 ms = ~15 samples.
    */
    minStillDurationMs: 2000,
    maxMergeGapMs: 250,

    scoreWeights: {
        duration: 1.0,
        gyro: 2.0,
        accelStd: 1.5,
        gravity: 1.25,
    },

    minSampleHz: 5,
    maxSampleHz: 50,
};
