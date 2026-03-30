// constants
import { RAD2DEG } from "../models/motionConstants";
// models
import type {
    AxisName,
    Extremum,
    RepMetric,
    RepCandidate,
    ExtremumKind,
    AnalyzeOptions,
    AnalysisResult,
    AnalysisSummary,
    DetectionResult,
    AxisDetectionEval,
    AnalyzerDebugResult,
    MotionAnalyzerConfig,
    ResolvedAnalyzerConfig,
} from "../models/motionAnalyzerTypes";
import {
    resolveAnalyzerConfig,
    createDefaultMotionAnalyzerConfig,
} from "../models/motionAnalyzerConfig";
import { FusedSample } from "../models/motionTypes";
// utils
import {
    sum,
    min,
    max,
    mean,
    unwrapDeg,
    sumAbsDeltas,
    compareScores,
    compareTriple,
    movingAverage,
    axisVelocityDegS,
    computeOffAxisRatio,
    computeShakingScore,
    configLikeFromCandidateThresholds,
} from "../utils/utils";


export class MotionAnalyzer {
    private readonly baseConfig: MotionAnalyzerConfig;

    constructor(config?: Partial<MotionAnalyzerConfig>) {
        this.baseConfig = {
            ...createDefaultMotionAnalyzerConfig(),
            ...config,
        };
    }

    analyze(
        fusedSamples: FusedSample[],
        options?: AnalyzeOptions
    ): AnalysisResult | AnalyzerDebugResult {
        const resolvedConfig = resolveAnalyzerConfig(fusedSamples, this.baseConfig);

        if (fusedSamples.length === 0) {
            const empty: AnalysisResult = {
                rep_count: 0,
                reps: [],
                summary: {
                    sample_count: 0,
                    duration_s: 0,
                    rep_count: 0,
                    candidate_rep_count: 0,
                    kept_rep_count: 0,
                    dominant_axis: null,
                    kept_block_start_ms: null,
                    kept_block_end_ms: null,
                    mean_accel_magnitude: 0,
                    mean_gyro_magnitude: 0,
                    calibration_like_clean_block_found: false,
                    estimated_sample_hz: resolvedConfig.estimatedSampleHz,
                },
            };

            if (options?.debug) {
                return {
                    rep_count: 0,
                    reps: [],
                    summary: {
                        sample_count: 0,
                        duration_s: 0,
                        rep_count: 0,
                        candidate_rep_count: 0,
                        kept_rep_count: 0,
                        dominant_axis: null,
                        kept_block_start_ms: null,
                        kept_block_end_ms: null,
                        mean_accel_magnitude: 0,
                        mean_gyro_magnitude: 0,
                        calibration_like_clean_block_found: false,
                        estimated_sample_hz: resolvedConfig.estimatedSampleHz,
                    },
                    detection: {
                        axis_name: "pitch",
                        candidate_reps: [],
                        kept_reps: [],
                        kept_start_idx: null,
                        kept_end_idx: null,
                        accepted_reps: [],
                    },
                    axisEvals: [],
                    resolvedConfig,
                    fusedSamples,
                };
            }

            return empty;
        }

        const { detection, axisEvals } = this.detectRepCandidatesInternal(
            fusedSamples,
            resolvedConfig
        );

        const reps = this.toRepMetrics(detection.kept_reps);
        const summary = this.buildSummary(fusedSamples, detection, reps, resolvedConfig);

        const result: AnalysisResult = {
            rep_count: reps.length,
            reps,
            summary,
        };

        if (options?.debug) {
            return {
                rep_count: reps.length,
                reps,
                summary,
                detection,
                axisEvals,
                resolvedConfig,
                fusedSamples,
            };
        }

        return result;
    }

    detectRepCandidates(fusedSamples: FusedSample[]): DetectionResult {
        const resolvedConfig = resolveAnalyzerConfig(fusedSamples, this.baseConfig);
        return this.detectRepCandidatesInternal(fusedSamples, resolvedConfig).detection;
    }

    private detectRepCandidatesInternal(
        fusedSamples: FusedSample[],
        config: ResolvedAnalyzerConfig
    ): { detection: DetectionResult; axisEvals: AxisDetectionEval[] } {
        if (fusedSamples.length < 3) {
            return {
                detection: {
                    axis_name: "pitch",
                    candidate_reps: [],
                    kept_reps: [],
                    kept_start_idx: null,
                    kept_end_idx: null,
                    accepted_reps: [],
                },
                axisEvals: [],
            };
        }

        const axes: AxisName[] = config.enableYawAxis
            ? ["roll", "pitch", "yaw"]
            : ["roll", "pitch"];

        const axisEvals = axes.map((axisName) =>
            this.evaluateAxis(fusedSamples, axisName, config)
        );

        const best = axisEvals.reduce((bestSoFar, current) =>
            compareScores(current.score, bestSoFar.score) > 0 ? current : bestSoFar
        );

        const keptStartIdx =
            best.kept_reps.length > 0 ? best.kept_reps[0].start_idx : null;
        const keptEndIdx =
            best.kept_reps.length > 0 ? best.kept_reps[best.kept_reps.length - 1].end_idx : null;

        return {
            detection: {
                axis_name: best.axis_name,
                candidate_reps: best.candidate_reps,
                kept_reps: best.kept_reps,
                kept_start_idx: keptStartIdx,
                kept_end_idx: keptEndIdx,
                accepted_reps: best.accepted_reps,
            },
            axisEvals,
        };
    }

    private evaluateAxis(
        fusedSamples: FusedSample[],
        axisName: AxisName,
        config: ResolvedAnalyzerConfig
    ): AxisDetectionEval {
        const axisSignalDeg = unwrapDeg(this.getAxisSignalDeg(fusedSamples, axisName));
        const smoothedDeg = movingAverage(axisSignalDeg, config.smoothingWindow);
        const extrema = this.findExtrema(smoothedDeg, config);

        const candidateReps = this.buildRepCandidates(
            fusedSamples,
            axisName,
            smoothedDeg,
            extrema
        );

        const acceptedReps = candidateReps.filter((candidate) =>
            this.acceptCandidate(candidate, config)
        );

        const keptReps = this.selectMainContiguousBlock(acceptedReps, config);

        const score: [number, number, number, number, number] = [
            keptReps.length,
            acceptedReps.length,
            candidateReps.length,
            sum(acceptedReps.map((r) => r.quality_score)),
            sum(acceptedReps.map((r) => r.rom_deg)),
        ];

        return {
            axis_name: axisName,
            smoothed_deg: smoothedDeg,
            extrema,
            candidate_reps: candidateReps,
            accepted_reps: acceptedReps,
            kept_reps: keptReps,
            score,
        };
    }

    private getAxisSignalDeg(xs: FusedSample[], axisName: AxisName): number[] {
        switch (axisName) {
            case "roll":
                return xs.map((s) => s.roll * RAD2DEG);
            case "pitch":
                return xs.map((s) => s.pitch * RAD2DEG);
            case "yaw":
                return xs.map((s) => s.yaw * RAD2DEG);
        }
    }

    private findExtrema(
        signalDeg: number[],
        config: ResolvedAnalyzerConfig
    ): Extremum[] {
        if (signalDeg.length < 3) return [];

        const rawExtrema: Extremum[] = [];
        const minDist = config.minExtremaDistanceSamples;
        const promMin = config.minExtremaPromDeg;
        const look = config.extremaProminenceLookSamples;

        for (let i = 1; i < signalDeg.length - 1; i++) {
            const prevV = signalDeg[i - 1];
            const curV = signalDeg[i];
            const nextV = signalDeg[i + 1];

            const isPeak = prevV < curV && curV >= nextV;
            const isTrough = prevV > curV && curV <= nextV;

            if (!isPeak && !isTrough) continue;

            const leftStart = Math.max(0, i - look);
            const rightEnd = Math.min(signalDeg.length, i + look + 1);

            const left = signalDeg.slice(leftStart, i);
            const right = signalDeg.slice(i + 1, rightEnd);

            if (left.length === 0 || right.length === 0) continue;

            let prominence = 0;
            let kind: ExtremumKind;

            if (isPeak) {
                // FIX FM-1: CORRECT prominence formula.
                // Prominence of a peak = peak value − the LOWER of the two reference
                // minima (left-side min and right-side min). Original code used
                // Math.max, which gives the higher reference — systematically
                // deflating prominence and rejecting real peaks.
                prominence = curV - Math.min(min(left), min(right));
                kind = "peak";
            } else {
                // Trough prominence = the LOWER of the two reference maxima minus
                // trough value. SciPy-compatible.
                prominence = Math.max(max(left), max(right)) - curV;
                kind = "trough";
            }

            if (prominence < promMin) continue;

            rawExtrema.push({
                index: i,
                valueDeg: curV,
                kind,
            });
        }

        return this.compressExtrema(rawExtrema, minDist);
    }

    /**
         * FIX FM-2: compressExtrema rewritten.
         *
         * Original bug: when two same-kind extrema appeared consecutively (without an
         * intervening opposite), the algorithm *always* replaced the previous one if the
         * new one was more extreme — regardless of distance. This swallowed one arm of
         * a valid rep when the inter-extremum noise was asymmetric.
         *
         * Correct behaviour:
         * - If same kind AND within minDist → keep the more extreme one (merge).
         * - If same kind AND beyond minDist → keep both; the pattern alternation
         *   is broken but buildRepCandidates will skip non-alternating windows.
         *   We must NOT silently drop either, because the skipped one may be the
         *   start of the next valid window.
         * - If different kind → always append.
         */
    private compressExtrema(extrema: Extremum[], minDist: number): Extremum[] {
        if (extrema.length === 0) return [];

        const out: Extremum[] = [extrema[0]];

        for (const ext of extrema.slice(1)) {
            const last = out[out.length - 1];

            if (ext.kind !== last.kind) {
                // Different kind — always keep; this is the alternating pattern we want.
                out.push(ext);
                continue;
            }

            // Same kind — only merge if they are within the minimum separation window.
            const withinDist = ext.index - last.index <= minDist;
            if (withinDist) {
                // Keep the more extreme value.
                const lastIsMoreExtreme =
                    ext.kind === "peak"
                        ? last.valueDeg >= ext.valueDeg
                        : last.valueDeg <= ext.valueDeg;
                if (!lastIsMoreExtreme) {
                    out[out.length - 1] = ext;
                }
                // else: keep last, discard ext
            } else {
                // Beyond minDist and same kind — keep both. buildRepCandidates will
                // correctly skip the [peak, peak, ...] non-full-cycle window.
                out.push(ext);
            }
        }

        return out;
    }

    private compressExtrema_OLD(
        extrema: Extremum[],
        minDist: number
    ): Extremum[] {
        if (extrema.length === 0) return [];

        const out: Extremum[] = [extrema[0]];

        for (const ext of extrema.slice(1)) {
            const last = out[out.length - 1];

            if (ext.kind === last.kind && ext.index - last.index <= minDist) {
                if (ext.kind === "peak") {
                    if (ext.valueDeg > last.valueDeg) {
                        out[out.length - 1] = ext;
                    }
                } else {
                    if (ext.valueDeg < last.valueDeg) {
                        out[out.length - 1] = ext;
                    }
                }
                continue;
            }

            if (ext.kind === last.kind) {
                const lastMoreExtreme =
                    ext.kind === "peak"
                        ? last.valueDeg >= ext.valueDeg
                        : last.valueDeg <= ext.valueDeg;

                if (!lastMoreExtreme) {
                    out[out.length - 1] = ext;
                }
                continue;
            }

            out.push(ext);
        }

        return out;
    }

    private buildRepCandidates(
        fusedSamples: FusedSample[],
        axisName: AxisName,
        smoothedSignalDeg: number[],
        extrema: Extremum[]
    ): RepCandidate[] {
        const candidates: RepCandidate[] = [];
        let i = 0;

        while (i + 2 < extrema.length) {
            const a = extrema[i];
            const b = extrema[i + 1];
            const c = extrema[i + 2];

            const isFullCycle = a.kind === c.kind && a.kind !== b.kind;
            if (!isFullCycle) {
                i += 1;
                continue;
            }

            const startIdx = a.index;
            const midIdx = b.index;
            const endIdx = c.index;

            if (endIdx <= startIdx) {
                i += 1;
                continue;
            }

            const seg = fusedSamples.slice(startIdx, endIdx + 1);
            if (seg.length < 2) {
                i += 2;
                continue;
            }

            const mainSeg = smoothedSignalDeg.slice(startIdx, endIdx + 1);
            const durationS = seg.length > 1
                ? (seg[seg.length - 1].t_ms - seg[0].t_ms) / 1000
                : 0;

            const romDeg = max(mainSeg) - min(mainSeg);

            // FIX FM-4 context: Use absolute velocity values — the finite-difference
            // at 10 Hz is already coarse, taking absolute value before max gives the
            // true peak unsigned velocity regardless of direction.
            const velocitiesDegS = axisVelocityDegS(seg.map((s) => s.t_ms), mainSeg);
            const absVelocities = velocitiesDegS.map(Math.abs);
            const peakVelocity = absVelocities.length > 0 ? max(absVelocities) : 0;
            const meanVelocity = absVelocities.length > 0 ? mean(absVelocities) : 0;

            const shakingScore = computeShakingScore(seg);
            const offAxisRatio = computeOffAxisRatio(seg, axisName);
            const qualityScore = this.computeQualityScore(
                durationS, romDeg, peakVelocity, offAxisRatio,
                configLikeFromCandidateThresholds(this.baseConfig)
            );

            candidates.push({
                rep_index: candidates.length,
                axis_name: axisName,
                start_idx: startIdx,
                mid_idx: midIdx,
                end_idx: endIdx,
                start_ms: seg[0].t_ms,
                mid_ms: fusedSamples[midIdx].t_ms,
                end_ms: seg[seg.length - 1].t_ms,
                duration_s: durationS,
                rom_deg: romDeg,
                peak_velocity_deg_s: peakVelocity,
                mean_velocity_deg_s: meanVelocity,
                shaking_score: shakingScore,
                off_axis_ratio: offAxisRatio,
                quality_score: qualityScore,
            });

            // FIX FM-3: advance by 2 to reuse extremum c as the next a.
            // This is correct for a perfect alternating sequence. The compressExtrema
            // fix above ensures same-kind duplicates beyond minDist are retained, so
            // a [peak, peak] pair will hit `isFullCycle === false` and advance by 1,
            // not silently skip a rep.
            i += 2;
        }

        return candidates;
    }

    private buildRepCandidates_OLD(
        fusedSamples: FusedSample[],
        axisName: AxisName,
        smoothedSignalDeg: number[],
        extrema: Extremum[]
    ): RepCandidate[] {
        const candidates: RepCandidate[] = [];
        let i = 0;

        while (i + 2 < extrema.length) {
            const a = extrema[i];
            const b = extrema[i + 1];
            const c = extrema[i + 2];

            const isFullCycle = a.kind === c.kind && a.kind !== b.kind;
            if (!isFullCycle) {
                i += 1;
                continue;
            }

            const startIdx = a.index;
            const midIdx = b.index;
            const endIdx = c.index;

            if (endIdx <= startIdx) {
                i += 1;
                continue;
            }

            const seg = fusedSamples.slice(startIdx, endIdx + 1);
            if (seg.length < 2) {
                i += 2;
                continue;
            }

            const mainSeg = smoothedSignalDeg.slice(startIdx, endIdx + 1);
            const durationS =
                seg.length > 1
                    ? (seg[seg.length - 1].t_ms - seg[0].t_ms) / 1000
                    : 0;

            const romDeg = max(mainSeg) - min(mainSeg);

            const velocitiesDegS = axisVelocityDegS(
                seg.map((s) => s.t_ms),
                mainSeg
            );

            const peakVelocity = velocitiesDegS.length > 0 ? max(velocitiesDegS) : 0;
            const meanVelocity = velocitiesDegS.length > 0 ? mean(velocitiesDegS) : 0;

            const shakingScore = computeShakingScore(seg);
            const offAxisRatio = computeOffAxisRatio(seg, axisName);
            const qualityScore = this.computeQualityScore(
                durationS,
                romDeg,
                peakVelocity,
                offAxisRatio,
                configLikeFromCandidateThresholds(this.baseConfig)
            );

            candidates.push({
                rep_index: candidates.length,
                axis_name: axisName,

                start_idx: startIdx,
                mid_idx: midIdx,
                end_idx: endIdx,

                start_ms: seg[0].t_ms,
                mid_ms: fusedSamples[midIdx].t_ms,
                end_ms: seg[seg.length - 1].t_ms,

                duration_s: durationS,
                rom_deg: romDeg,
                peak_velocity_deg_s: peakVelocity,
                mean_velocity_deg_s: meanVelocity,
                shaking_score: shakingScore,
                off_axis_ratio: offAxisRatio,
                quality_score: qualityScore,
            });

            i += 2;
        }

        return candidates;
    }

    private acceptCandidate(
        candidate: RepCandidate,
        config: ResolvedAnalyzerConfig
    ): boolean {
        const sampleCount = candidate.end_idx - candidate.start_idx + 1;

        if (candidate.duration_s < config.minRepDurationS) return false;
        if (candidate.duration_s > config.maxRepDurationS) return false;
        if (sampleCount < config.minRepSamples) return false;
        if (candidate.rom_deg < config.minRepRomDeg) return false;

        // FIX FM-4: `minPeakVelocityDegS` is now 5.0 in the config.
        // Additionally, if the signal ROM is large (> 3× minRepRomDeg) we
        // relax the velocity requirement further — a big ROM lift that is slow
        // is still a real rep. This prevents false rejection of heavy, slow lifts.
        const effectiveMinVelocity = candidate.rom_deg > config.minRepRomDeg * 3
            ? config.minPeakVelocityDegS * 0.7
            : config.minPeakVelocityDegS;

        if (candidate.peak_velocity_deg_s < effectiveMinVelocity) return false;
        if (candidate.off_axis_ratio > config.maxOffAxisRatio) return false;

        return true;
    }

    private acceptCandidate_OLD(
        candidate: RepCandidate,
        config: ResolvedAnalyzerConfig
    ): boolean {
        const sampleCount = candidate.end_idx - candidate.start_idx + 1;

        if (candidate.duration_s < config.minRepDurationS) return false;
        if (candidate.duration_s > config.maxRepDurationS) return false;
        if (sampleCount < config.minRepSamples) return false;
        if (candidate.rom_deg < config.minRepRomDeg) return false;
        if (candidate.peak_velocity_deg_s < config.minPeakVelocityDegS) return false;
        if (candidate.off_axis_ratio > config.maxOffAxisRatio) return false;

        return true;
    }

    private selectMainContiguousBlock(
        reps: RepCandidate[],
        config: ResolvedAnalyzerConfig
    ): RepCandidate[] {
        if (reps.length === 0) return [];

        const ordered = [...reps].sort((a, b) => a.start_idx - b.start_idx);
        const groups: RepCandidate[][] = [];
        let currentGroup: RepCandidate[] = [ordered[0]];

        for (const rep of ordered.slice(1)) {
            const prev = currentGroup[currentGroup.length - 1];
            // FIX FM-6: gap is already in seconds. Config default changed to 2.5 s.
            const gapS = (rep.start_ms - prev.end_ms) / 1000;

            if (gapS <= config.maxGapBetweenRepsS) {
                currentGroup.push(rep);
            } else {
                groups.push(currentGroup);
                currentGroup = [rep];
            }
        }
        groups.push(currentGroup);

        const bestGroup = groups.reduce((best, group) => {
            const a: [number, number, number] = [
                group.length,
                sum(group.map((r) => r.quality_score)),
                sum(group.map((r) => r.rom_deg)),
            ];
            const b: [number, number, number] = [
                best.length,
                sum(best.map((r) => r.quality_score)),
                sum(best.map((r) => r.rom_deg)),
            ];
            return compareTriple(a, b) > 0 ? group : best;
        });

        return bestGroup.map((rep, index) => ({ ...rep, rep_index: index }));
    }

    private selectMainContiguousBlock_OLD(
        reps: RepCandidate[],
        config: ResolvedAnalyzerConfig
    ): RepCandidate[] {
        if (reps.length === 0) return [];

        const ordered = [...reps].sort((a, b) => a.start_idx - b.start_idx);

        const groups: RepCandidate[][] = [];
        let currentGroup: RepCandidate[] = [ordered[0]];

        for (const rep of ordered.slice(1)) {
            const prev = currentGroup[currentGroup.length - 1];
            const gapS = (rep.start_ms - prev.end_ms) / 1000;

            if (gapS <= config.maxGapBetweenRepsS) {
                currentGroup.push(rep);
            } else {
                groups.push(currentGroup);
                currentGroup = [rep];
            }
        }

        groups.push(currentGroup);

        const bestGroup = groups.reduce((best, group) => {
            const a: [number, number, number] = [
                group.length,
                sum(group.map((r) => r.quality_score)),
                sum(group.map((r) => r.rom_deg)),
            ];
            const b: [number, number, number] = [
                best.length,
                sum(best.map((r) => r.quality_score)),
                sum(best.map((r) => r.rom_deg)),
            ];

            return compareTriple(a, b) > 0 ? group : best;
        });

        return bestGroup.map((rep, index) => ({
            ...rep,
            rep_index: index,
        }));
    }

    private toRepMetrics(reps: RepCandidate[]): RepMetric[] {
        return reps.map((rep, index) => ({
            rep_index: index,
            start_ms: rep.start_ms,
            end_ms: rep.end_ms,
            peak_velocity: rep.peak_velocity_deg_s,
            mean_velocity: rep.mean_velocity_deg_s,
            shaking_score: rep.shaking_score,
            sticking_point_ms: rep.mid_ms,
        }));
    }

    private buildSummary(
        fusedSamples: FusedSample[],
        detection: DetectionResult,
        reps: RepMetric[],
        config: ResolvedAnalyzerConfig
    ): AnalysisSummary {
        return {
            sample_count: fusedSamples.length,
            duration_s:
                fusedSamples.length >= 2
                    ? (fusedSamples[fusedSamples.length - 1].t_ms - fusedSamples[0].t_ms) / 1000
                    : 0,
            rep_count: reps.length,
            candidate_rep_count: detection.candidate_reps.length,
            kept_rep_count: detection.kept_reps.length,
            dominant_axis: detection.axis_name,
            kept_block_start_ms:
                detection.kept_start_idx != null
                    ? fusedSamples[detection.kept_start_idx]?.t_ms ?? null
                    : null,
            kept_block_end_ms:
                detection.kept_end_idx != null
                    ? fusedSamples[detection.kept_end_idx]?.t_ms ?? null
                    : null,
            mean_accel_magnitude: mean(
                fusedSamples.map((s) => s.accel_magnitude)
            ),
            mean_gyro_magnitude: mean(
                fusedSamples.map((s) => s.gyro_magnitude)
            ),
            calibration_like_clean_block_found: detection.kept_reps.length > 0,
            estimated_sample_hz: config.estimatedSampleHz,
        };
    }

    private computeQualityScore(
        durationS: number,
        romDeg: number,
        peakVelocityDegS: number,
        offAxisRatio: number,
        config: Pick<
            MotionAnalyzerConfig,
            "minRepDurationS" | "maxRepDurationS" | "minRepRomDeg" | "minPeakVelocityDegS"
        >
    ): number {
        const durationTerm =
            durationS >= config.minRepDurationS && durationS <= config.maxRepDurationS ? 1 : 0;

        const romTerm = Math.min(romDeg / Math.max(config.minRepRomDeg, 1e-6), 3);
        const velTerm = Math.min(
            peakVelocityDegS / Math.max(config.minPeakVelocityDegS, 1e-6),
            3
        );
        const axisTerm = Math.max(0, 1.5 - offAxisRatio);

        return durationTerm + romTerm + velTerm + axisTerm;
    }
}

export function createAnalyzerAndCfg() {
    return new MotionAnalyzer({
        enableYawAxis: false,
        minRepRomDeg: 6,
        minPeakVelocityDegS: 3,
        minRepDurationS: 0.4,
        maxRepDurationS: 6,
        minExtremaPromDeg: 1,
        smoothingWindow: 3,
    });
}
