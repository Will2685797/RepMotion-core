// utils
import { median } from "../utils/utils";
// models
import type {
    MotionAnalyzerConfig,
    ResolvedAnalyzerConfig,
} from "./motionAnalyzerTypes";
import type { FusedSample } from "./motionTypes";


// ─── Safety clamps for Hz estimation ────────────────────────────────────────
const MIN_SAMPLE_HZ = 5;
const MAX_SAMPLE_HZ = 50;

export function createDefaultMotionAnalyzerConfig(): MotionAnalyzerConfig {
    return {
        // FIX FM-2/FM-10: wider smoothing window; 5 samples = 500 ms at 10 Hz.
        // Preserves rep-shape (rep duration 1–5 s) while reducing sample noise.
        smoothingWindow: 5,

        // FIX FM-1: raised from 1.5° to 2.0° — at 10 Hz with wide look window
        // noise peaks rarely exceed 2°; genuine rep extrema typically ≥ 10–30°.
        minExtremaPromDeg: 2.0,

        // FIX FM-9 / FM-1: All three timing parameters are converted to sample
        // counts inside resolveAnalyzerConfig. The look window is the most
        // critical — it must cover at least half the minimum rep duration so the
        // prominence reference baseline sees the full inter-rep valley/peak.
        //
        //   minExtremaDistanceS: 0.40 → 0.50 s  (5 samples at 10 Hz)
        //   extremaProminenceLookS: 0.30 → 0.80 s (8 samples — covers half a
        //       minimum-duration 1.6 s rep, so the reference baseline always
        //       contains the opposite extremum)
        //   minRepSamplesDurationS: 0.30 → 0.50 s (5 samples minimum)
        minExtremaDistanceS: 0.50,
        extremaProminenceLookS: 0.80,
        minRepSamplesDurationS: 0.50,

        minRepDurationS: 1.00,
        maxRepDurationS: 5.00,   // FIX: slow heavy lifts can take 4–5 s
        minRepRomDeg: 10.0,

        // FIX FM-4: 8.0 deg/s is unreachable at 10 Hz for moderate-speed lifts
        // because the peak velocity sample falls between two 100 ms intervals
        // and the moving-average further attenuates it. 5.0 deg/s is still
        // meaningful (rules out pure tremor) but passes genuine controlled reps.
        minPeakVelocityDegS: 5.0,

        // FIX FM-5 consideration: slight relaxation for compound movements
        maxOffAxisRatio: 0.85,

        // FIX FM-6: 1.25 s is too short for heavy lifters who pause 2–3 s
        // between reps. 2.5 s keeps a set together without merging separate sets.
        maxGapBetweenRepsS: 2.5,

        enableYawAxis: false,
        fallbackSampleHz: 10,
    };
}

export function resolveAnalyzerConfig(
    samples: FusedSample[],
    baseConfig: MotionAnalyzerConfig
): ResolvedAnalyzerConfig {
    // FIX FM-9: clamp the estimated Hz so BLE jitter bursts cannot inflate it
    // and cause all sample-count thresholds to be over-scaled.
    const estimatedSampleHz = estimateSampleHz(samples, baseConfig.fallbackSampleHz);

    // Ensure look window is at least large enough to span a half-rep.
    // At the estimated Hz, half of minRepDurationS gives the minimum useful window.
    const halfRepSamples = Math.ceil((baseConfig.minRepDurationS / 2) * estimatedSampleHz);
    const rawLookSamples = Math.round(baseConfig.extremaProminenceLookS * estimatedSampleHz);
    const extremaProminenceLookSamples = Math.max(halfRepSamples, rawLookSamples, 3);

    return {
        ...baseConfig,
        estimatedSampleHz,
        minExtremaDistanceSamples: Math.max(
            2,
            Math.round(baseConfig.minExtremaDistanceS * estimatedSampleHz)
        ),
        extremaProminenceLookSamples,
        minRepSamples: Math.max(
            3,
            Math.ceil(baseConfig.minRepSamplesDurationS * estimatedSampleHz)
        ),
    };
}

export function estimateSampleHz(
    samples: FusedSample[],
    fallbackHz: number
): number {
    if (samples.length < 3) return fallbackHz;

    const dtsMs: number[] = [];

    for (let i = 1; i < samples.length; i++) {
        const dt = samples[i].t_ms - samples[i - 1].t_ms;
        // FIX FM-9: exclude inter-packet gaps > 500 ms (reconnect events)
        // and zero/negative deltas. These inflate or deflate the median.
        if (dt > 0 && dt < 500) dtsMs.push(dt);
    }

    if (dtsMs.length === 0) return fallbackHz;

    dtsMs.sort((a, b) => a - b);
    const medianDtMs = median(dtsMs);

    if (!Number.isFinite(medianDtMs) || medianDtMs <= 0) {
        return fallbackHz;
    }

    const hz = 1000 / medianDtMs;
    if (!Number.isFinite(hz) || hz <= 0) {
        return fallbackHz;
    }

    // FIX FM-9: hard clamp — prevents jitter bursts from inflating Hz and
    // scaling all sample-count thresholds incorrectly.
    return Math.max(MIN_SAMPLE_HZ, Math.min(MAX_SAMPLE_HZ, hz));
}




// export function createDefaultMotionAnalyzerConfig(): MotionAnalyzerConfig {
//     return {
//         smoothingWindow: 3,

//         minExtremaPromDeg: 1.5,

//         // Python was roughly 30 samples and 25 samples around a ~100 Hz workflow.
//         // Convert to time so the behavior survives 10 Hz now and higher Hz later.
//         minExtremaDistanceS: 0.40,
//         extremaProminenceLookS: 0.30,
//         minRepSamplesDurationS: 0.30,

//         minRepDurationS: 0.90,
//         maxRepDurationS: 3.50,
//         minRepRomDeg: 10.0,
//         minPeakVelocityDegS: 8.0,
//         maxOffAxisRatio: 0.75,

//         maxGapBetweenRepsS: 1.25,

//         enableYawAxis: false,
//         fallbackSampleHz: 10,
//     };
// }

// export function resolveAnalyzerConfig(
//     samples: FusedSample[],
//     baseConfig: MotionAnalyzerConfig
// ): ResolvedAnalyzerConfig {
//     const estimatedSampleHz = estimateSampleHz(samples, baseConfig.fallbackSampleHz);

//     return {
//         ...baseConfig,
//         estimatedSampleHz,
//         minExtremaDistanceSamples: Math.max(
//             1,
//             Math.round(baseConfig.minExtremaDistanceS * estimatedSampleHz)
//         ),
//         extremaProminenceLookSamples: Math.max(
//             2,
//             Math.round(baseConfig.extremaProminenceLookS * estimatedSampleHz)
//         ),
//         minRepSamples: Math.max(
//             2,
//             Math.ceil(baseConfig.minRepSamplesDurationS * estimatedSampleHz)
//         ),
//     };
// }

// export function estimateSampleHz(
//     samples: FusedSample[],
//     fallbackHz: number
// ): number {
//     if (samples.length < 3) return fallbackHz;

//     const dtsMs: number[] = [];

//     for (let i = 1; i < samples.length; i++) {
//         const dt = samples[i].t_ms - samples[i - 1].t_ms;
//         if (dt > 0) dtsMs.push(dt);
//     }

//     if (dtsMs.length === 0) return fallbackHz;

//     dtsMs.sort((a, b) => a - b);
//     const medianDtMs = median(dtsMs);

//     if (!Number.isFinite(medianDtMs) || medianDtMs <= 0) {
//         return fallbackHz;
//     }

//     const hz = 1000 / medianDtMs;
//     if (!Number.isFinite(hz) || hz <= 0) {
//         return fallbackHz;
//     }

//     return hz;
// }
