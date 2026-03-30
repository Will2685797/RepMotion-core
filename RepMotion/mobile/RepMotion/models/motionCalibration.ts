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

export type CalibrationWindowStats = {
    index: number;
    t_ms: number;

    gyroMean: number;
    gyroMedian: number;
    gyroStd: number;
    gyroMax: number;

    accelMean: number;
    accelMedian: number;
    accelStd: number;
    accelRange: number;

    gravityError: number;

    isStillCandidate: boolean;
};

export type StillSegment = {
    startIndex: number;
    endIndex: number;
    startMs: number;
    endMs: number;
    durationMs: number;
    sampleCount: number;

    meanGyro: number;
    medianGyro: number;
    maxGyro: number;

    meanAccelMag: number;
    accelStd: number;
    accelRange: number;

    gravityError: number;

    score: number;
    accepted: boolean;
    rejectReasons: string[];
};

export type CalibrationBlock = {
    startIndex: number;
    endIndex: number;
    startMs: number;
    endMs: number;
    durationMs: number;
    sampleCount: number;

    meanGyro: number;
    medianGyro: number;
    maxGyro: number;

    meanAccelMag: number;
    accelStd: number;
    accelRange: number;

    gravityError: number;
    score: number;
};

export type MotionCalibrationDebug = {
    sampleHz: number;
    dtMedianMs: number;
    gravityReference: number;

    detectionWindowSamples: number;
    minStillSamples: number;
    gapMergeSamples: number;

    windowStats: CalibrationWindowStats[];
    rawStillFlags: boolean[];
    mergedStillFlags: boolean[];
    segments: StillSegment[];
    chosenBlock: CalibrationBlock | null;
};

export type MotionCalibrationPhase1Result = {
    samples: FusedSample[];
    calibrationBlock: CalibrationBlock | null;
    debug: MotionCalibrationDebug;
    success: boolean;
    reason: string | null;
};
