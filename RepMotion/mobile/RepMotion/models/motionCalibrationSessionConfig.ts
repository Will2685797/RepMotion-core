import type { MotionAnalyzerConfig } from "./motionAnalyzerTypes";

export type MotionCalibrationSessionConfig = {
    normalizePoints: number;
    smoothingWindow: number;

    minValidReps: number;
    minRepDurationS: number;
    maxRepDurationS: number;
    minRepRomDeg: number;
    maxOffAxisRatio: number;
    maxVelocityIrregularity: number;
    maxPathLengthRatio: number;

    maxGapBetweenRepsS: number;
    minAxisScoreMarginRatio: number;

    maxDurationCv: number;
    maxRomCv: number;
    maxWaveformMeanStd: number;

    qualityWeights: {
        axisClarity: number;
        repCount: number;
        durationConsistency: number;
        romConsistency: number;
        waveformConsistency: number;
        candidateQuality: number;
    };

    analyzer: Partial<MotionAnalyzerConfig>;
};

export const DEFAULT_MOTION_CALIBRATION_SESSION_CONFIG: MotionCalibrationSessionConfig = {
    // FIX FM-10: 80 normalisation points is fine — this is in signal-space, not Hz-dependent.
    normalizePoints: 80,

    // FIX FM-2: 5-sample smoothing window at 10 Hz = 500 ms.
    // Preserves rep envelope while attenuating per-sample noise.
    smoothingWindow: 5,

    minValidReps: 5,

    // FIX FM-4 / general: 1.0 s minimum rep duration. 1.20 s was rejecting fast-tempo reps
    // (e.g., cable pushdowns at a controlled but quick pace).
    minRepDurationS: 1.00,

    // FIX FM-6: 5.0 s maximum. Heavy slow lifts (RDLs, tempo squats) can exceed 3.5 s.
    maxRepDurationS: 7.50,

    minRepRomDeg: 10.0,

    // FIX FM-1/FM-4: relaxed to 0.85 to accommodate compound movements with natural
    // off-axis loading (e.g., unilateral DB press has lateral trunk lean).
    maxOffAxisRatio: 0.90,

    // FIX FM-7: 0.35 is too tight at 10 Hz. At this sample rate, finite-difference
    // velocity on a smooth rep naturally accumulates 2–3 sign changes from plateau
    // sampling alone. 0.55 still rejects genuinely shaky / compensatory reps while
    // passing controlled lifts.
    maxVelocityIrregularity: 0.60,

    // pathLengthRatio: fine — this is signal-domain, not Hz-dependent.
    maxPathLengthRatio: 2.00,

    // FIX FM-6: 2.5 s gap tolerance. Matches the analyzer config change.
    // Heavy lifters and pause-style reps routinely rest 1.5–2.0 s between reps.
    maxGapBetweenRepsS: 3.0,

    // Axis score margin: 0.20 is appropriate — keeps axis selection decisive.
    minAxisScoreMarginRatio: 0.20,

    // CV thresholds: 0.20 is correct for within-set consistency.
    // At 10 Hz, timing jitter of ±100 ms on a 2 s rep = 5% CV, well within 20%.
    maxDurationCv: 0.30,  // Slightly relaxed — 10 Hz timing quantisation inflates CV
    maxRomCv: 0.30,       // Slightly relaxed — ROM varies naturally set-to-set

    // Waveform consistency: 10° std is appropriate for signal-domain template building.
    maxWaveformMeanStd: 12.0,  // Slightly relaxed — 10 Hz smoothing adds template noise

    qualityWeights: {
        axisClarity: 0.20,
        repCount: 0.20,
        durationConsistency: 0.15,
        romConsistency: 0.15,
        waveformConsistency: 0.15,
        candidateQuality: 0.15,
    },

    analyzer: {
        smoothingWindow: 5,
        minExtremaPromDeg: 3.0,   // squats have large ROM, raise to avoid mid-rep noise
        minRepDurationS: 1.50,  // squat cycle floor (fast squats ~2s total)
        maxRepDurationS: 7.00,  // slow tempo squats can hit 5-6s; give headroom
        minRepRomDeg: 15.0,  // squats should be ≥15° on the dominant axis
        minPeakVelocityDegS: 4.0,   // slow controlled squats at 10 Hz; keep low
        maxOffAxisRatio: 0.90,  // squats have trunk lean, roll bleeds into pitch
        maxGapBetweenRepsS: 3.0,   // pause at top of squat between reps
        enableYawAxis: false,
    },
};

export const DEFAULT_MOTION_CALIBRATION_SESSION_CONFIG_v1: MotionCalibrationSessionConfig = {
    // FIX FM-10: 80 normalisation points is fine — this is in signal-space, not Hz-dependent.
    normalizePoints: 80,

    // FIX FM-2: 5-sample smoothing window at 10 Hz = 500 ms.
    // Preserves rep envelope while attenuating per-sample noise.
    smoothingWindow: 5,

    minValidReps: 5,

    // FIX FM-4 / general: 1.0 s minimum rep duration. 1.20 s was rejecting fast-tempo reps
    // (e.g., cable pushdowns at a controlled but quick pace).
    minRepDurationS: 1.00,

    // FIX FM-6: 5.0 s maximum. Heavy slow lifts (RDLs, tempo squats) can exceed 3.5 s.
    maxRepDurationS: 5.00,

    minRepRomDeg: 10.0,

    // FIX FM-1/FM-4: relaxed to 0.85 to accommodate compound movements with natural
    // off-axis loading (e.g., unilateral DB press has lateral trunk lean).
    maxOffAxisRatio: 0.85,

    // FIX FM-7: 0.35 is too tight at 10 Hz. At this sample rate, finite-difference
    // velocity on a smooth rep naturally accumulates 2–3 sign changes from plateau
    // sampling alone. 0.55 still rejects genuinely shaky / compensatory reps while
    // passing controlled lifts.
    maxVelocityIrregularity: 0.55,

    // pathLengthRatio: fine — this is signal-domain, not Hz-dependent.
    maxPathLengthRatio: 2.00,

    // FIX FM-6: 2.5 s gap tolerance. Matches the analyzer config change.
    // Heavy lifters and pause-style reps routinely rest 1.5–2.0 s between reps.
    maxGapBetweenRepsS: 2.5,

    // Axis score margin: 0.20 is appropriate — keeps axis selection decisive.
    minAxisScoreMarginRatio: 0.20,

    // CV thresholds: 0.20 is correct for within-set consistency.
    // At 10 Hz, timing jitter of ±100 ms on a 2 s rep = 5% CV, well within 20%.
    maxDurationCv: 0.25,  // Slightly relaxed — 10 Hz timing quantisation inflates CV
    maxRomCv: 0.25,       // Slightly relaxed — ROM varies naturally set-to-set

    // Waveform consistency: 10° std is appropriate for signal-domain template building.
    maxWaveformMeanStd: 12.0,  // Slightly relaxed — 10 Hz smoothing adds template noise

    qualityWeights: {
        axisClarity: 0.20,
        repCount: 0.20,
        durationConsistency: 0.15,
        romConsistency: 0.15,
        waveformConsistency: 0.15,
        candidateQuality: 0.15,
    },

    analyzer: {
        // All analyzer sub-config values mirror the fixes in motionAnalyzerConfig.fixed.ts
        smoothingWindow: 5,
        minExtremaPromDeg: 2.0,
        minRepDurationS: 1.00,
        maxRepDurationS: 5.00,
        minRepRomDeg: 10.0,
        // FIX FM-4: 5.0 deg/s is the corrected threshold for 10 Hz undersampled velocity.
        minPeakVelocityDegS: 5.0,
        maxOffAxisRatio: 0.85,
        maxGapBetweenRepsS: 2.5,
        enableYawAxis: false,
    },
};

// export const DEFAULT_MOTION_CALIBRATION_SESSION_CONFIG_v0: MotionCalibrationSessionConfig = {
//     normalizePoints: 80,
//     smoothingWindow: 3,

//     minValidReps: 5,
//     minRepDurationS: 1.20,
//     maxRepDurationS: 3.50,
//     minRepRomDeg: 10.0,
//     maxOffAxisRatio: 0.75,
//     maxVelocityIrregularity: 0.35,
//     maxPathLengthRatio: 2.00,

//     maxGapBetweenRepsS: 1.25,
//     minAxisScoreMarginRatio: 0.20,

//     maxDurationCv: 0.20,
//     maxRomCv: 0.20,
//     maxWaveformMeanStd: 10.0,

//     qualityWeights: {
//         axisClarity: 0.20,
//         repCount: 0.20,
//         durationConsistency: 0.15,
//         romConsistency: 0.15,
//         waveformConsistency: 0.15,
//         candidateQuality: 0.15,
//     },

//     analyzer: {
//         smoothingWindow: 3,
//         minExtremaPromDeg: 1.5,
//         minRepDurationS: 1.20,
//         maxRepDurationS: 3.50,
//         minRepRomDeg: 10.0,
//         minPeakVelocityDegS: 8.0,
//         maxOffAxisRatio: 0.75,
//         maxGapBetweenRepsS: 1.25,
//         enableYawAxis: false,
//     },
// };
