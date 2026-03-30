// models
import { FusedSample } from "../models/motionTypes";
import type { AxisName, AnalyzerDebugResult } from "../models/motionAnalyzerTypes";
import type { MotionBiasEstimationResult } from "../models/motionBiasEstimation";
import type { MotionCalibrationPhase1Result } from "../models/motionCalibration";
import type {
    CalibrationAxisScore,
    CalibrationRepCandidate,
    CalibrationSessionDebug,
    CalibrationSessionQuality,
    CalibrationSessionRecording,
    CalibrationSessionResult,
    CalibrationSessionStats,
    CalibrationTemplate,
    NormalizedRepWaveform,
} from "../models/motionCalibrationSessionTypes";
import {
    DEFAULT_MOTION_CALIBRATION_SESSION_CONFIG,
    type MotionCalibrationSessionConfig,
} from "../models/motionCalibrationSessionConfig";
// classes
import { MotionAnalyzer } from "../motion/motionAnalyzer";
import { MotionCalibrator } from "../motion/motionCalibrator";
import { MotionBiasEstimator } from "../motion/motionBiasEstimator";
import { MotionCalibrationApplier } from "../motion/motionCalibrationApplier";


export type MotionCalibrationSessionPipelineInput = {
    recording: CalibrationSessionRecording;
    skipPhase123?: boolean;
    biasEstimateOverride?: MotionBiasEstimationResult | null;
};

export class MotionCalibrationSessionPipeline {
    private readonly cfg: MotionCalibrationSessionConfig;
    private readonly phase1: MotionCalibrator;
    private readonly phase2: MotionBiasEstimator;
    private readonly phase3: MotionCalibrationApplier;
    private readonly analyzer: MotionAnalyzer;

    constructor(config?: Partial<MotionCalibrationSessionConfig>) {
        this.cfg = {
            ...DEFAULT_MOTION_CALIBRATION_SESSION_CONFIG,
            ...config,
            analyzer: {
                ...DEFAULT_MOTION_CALIBRATION_SESSION_CONFIG.analyzer,
                ...(config?.analyzer ?? {}),
            },
            qualityWeights: {
                ...DEFAULT_MOTION_CALIBRATION_SESSION_CONFIG.qualityWeights,
                ...(config?.qualityWeights ?? {}),
            },
        };

        this.phase1 = new MotionCalibrator();
        this.phase2 = new MotionBiasEstimator();
        this.phase3 = new MotionCalibrationApplier();
        this.analyzer = new MotionAnalyzer(this.cfg.analyzer);
    }

    public run(input: MotionCalibrationSessionPipelineInput): CalibrationSessionResult {
        const recording = this.sanitizeRecording(input.recording);
        const rejectionReasons: string[] = [];

        if (recording.samples.length < 10) {
            return this.buildFailure(recording, ["not_enough_samples"], this.emptyDebug());
        }

        let phase1: MotionCalibrationPhase1Result | null = null;
        let phase2: MotionBiasEstimationResult | null = null;
        let phase3Samples = recording.samples;
        let phase3: ReturnType<MotionCalibrationApplier["apply"]> | null = null;

        if (!input.skipPhase123) {
            phase1 = this.phase1.runPhase1(recording.samples);

            if (input.biasEstimateOverride) {
                phase2 = input.biasEstimateOverride;
            } else if (phase1.calibrationBlock) {
                phase2 = this.phase2.estimate({
                    samples: phase1.samples,
                    calibrationBlock: phase1.calibrationBlock,
                });
            }

            if (phase2) {
                phase3 = this.phase3.apply({
                    samples: phase1?.samples ?? recording.samples,
                    biasEstimate: phase2,
                });
                phase3Samples = phase3.samples;
            } else {
                phase3Samples = phase1?.samples ?? recording.samples;
            }
        }

        const analyzed = this.analyzer.analyze(phase3Samples, { debug: true }) as AnalyzerDebugResult;
        const axisScores = this.buildAxisScores(analyzed);
        const dominantAxis = analyzed.detection.axis_name;
        const dominantAxisEval = analyzed.axisEvals.find((x) => x.axis_name === dominantAxis) ?? null;
        const dominantAxisMarginRatio = this.computeAxisMarginRatio(axisScores);

        if (!dominantAxisEval) {
            rejectionReasons.push("dominant_axis_not_found");
            return this.buildFailure(
                recording,
                rejectionReasons,
                this.buildDebug({
                    phase1,
                    phase2,
                    phase3,
                    axisScores,
                    dominantAxisMarginRatio,
                    selectedSignalDeg: [],
                    selectedVelocityDegS: [],
                    selectedGyroMag: [],
                    allCandidates: [],
                    acceptedCandidates: [],
                    keptCandidates: [],
                }),
                dominantAxis,
            );
        }

        const selectedSignalDeg = movingAverage(
            dominantAxisEval.smoothed_deg,
            this.cfg.smoothingWindow,
        );
        const selectedVelocityDegS = computeAbsVelocityDegS(
            phase3Samples.map((s) => s.t_ms),
            selectedSignalDeg,
        );
        const selectedGyroMag = movingAverage(
            phase3Samples.map((s) => s.gyro_magnitude),
            this.cfg.smoothingWindow,
        );

        const allCandidates = dominantAxisEval.candidate_reps.map((candidate) =>
            this.enrichCandidate({
                candidate,
                samples: phase3Samples,
                axisName: dominantAxis,
                smoothedSignalDeg: selectedSignalDeg,
            }),
        );

        const acceptedCandidates = allCandidates.filter((x) => x.accepted);
        const keptCandidates = this.selectMainContiguousBlock(acceptedCandidates);

        if (keptCandidates.length < this.cfg.minValidReps) {
            rejectionReasons.push("not_enough_valid_reps");
        }

        if (
            dominantAxisMarginRatio != null &&
            dominantAxisMarginRatio < this.cfg.minAxisScoreMarginRatio
        ) {
            rejectionReasons.push("no_clear_dominant_axis");
        }

        const normalizedReps = keptCandidates.map((rep, idx) =>
            this.normalizeRep({
                repIndex: idx,
                axisName: dominantAxis,
                samples: phase3Samples.slice(rep.start_idx, rep.end_idx + 1),
            }),
        );

        const template = normalizedReps.length > 0
            ? this.buildTemplate(dominantAxis, normalizedReps)
            : null;

        const stats = keptCandidates.length > 0
            ? this.buildStats(recording, analyzed.summary.estimated_sample_hz, keptCandidates)
            : null;

        const quality = keptCandidates.length > 0 && template
            ? this.buildQuality(axisScores, dominantAxis, dominantAxisMarginRatio, keptCandidates, template)
            : null;

        if (stats) {
            if (stats.cv_duration > this.cfg.maxDurationCv) {
                rejectionReasons.push("duration_variance_too_high");
            }
            if (stats.cv_rom > this.cfg.maxRomCv) {
                rejectionReasons.push("rom_variance_too_high");
            }
        }

        if (template) {
            const waveformStdMean = mean(template.angle_std);
            if (waveformStdMean > this.cfg.maxWaveformMeanStd) {
                rejectionReasons.push("waveform_variance_too_high");
            }
        }

        const success = rejectionReasons.length === 0;

        return {
            success,
            dominant_axis: dominantAxis,
            recording,
            reps: keptCandidates,
            normalized_reps: normalizedReps,
            template,
            stats,
            quality,
            rejection_reasons: rejectionReasons,
            debug: this.buildDebug({
                phase1,
                phase2,
                phase3,
                axisScores,
                dominantAxisMarginRatio,
                selectedSignalDeg,
                selectedVelocityDegS,
                selectedGyroMag,
                allCandidates,
                acceptedCandidates,
                keptCandidates,
            }),
        };
    }

    private sanitizeRecording(recording: CalibrationSessionRecording): CalibrationSessionRecording {
        const sorted = [...recording.samples]
            .filter((s) => Number.isFinite(s.t_ms))
            .sort((a, b) => a.t_ms - b.t_ms)
            .filter((sample, index, arr) => index === 0 || sample.t_ms > arr[index - 1].t_ms);

        return {
            ...recording,
            samples: sorted,
            sample_count: sorted.length,
            duration_s:
                sorted.length >= 2
                    ? (sorted[sorted.length - 1].t_ms - sorted[0].t_ms) / 1000
                    : 0,
            started_at_ms: sorted[0]?.t_ms ?? recording.started_at_ms,
            stopped_at_ms: sorted[sorted.length - 1]?.t_ms ?? recording.stopped_at_ms,
        };
    }

    private buildAxisScores(analyzed: AnalyzerDebugResult): CalibrationAxisScore[] {
        return analyzed.axisEvals.map((axisEval) => {
            const structuredScore =
                axisEval.kept_reps.length * 10 +
                axisEval.accepted_reps.length * 4 +
                sum(axisEval.accepted_reps.map((r) => r.quality_score)) +
                0.15 * sum(axisEval.accepted_reps.map((r) => r.rom_deg));

            return {
                axis_name: axisEval.axis_name,
                structured_score: structuredScore,
                candidate_count: axisEval.candidate_reps.length,
                accepted_count: axisEval.accepted_reps.length,
                kept_count: axisEval.kept_reps.length,
                total_quality_score: sum(axisEval.accepted_reps.map((r) => r.quality_score)),
                total_rom_deg: sum(axisEval.accepted_reps.map((r) => r.rom_deg)),
            };
        }).sort((a, b) => b.structured_score - a.structured_score);
    }

    private computeAxisMarginRatio(axisScores: CalibrationAxisScore[]): number | null {
        if (axisScores.length === 0) return null;
        if (axisScores.length === 1) return 1;

        const best = axisScores[0].structured_score;
        const second = axisScores[1].structured_score;

        if (best <= 1e-9) return 0;
        return Math.max(0, (best - second) / best);
    }

    private enrichCandidate(input: {
        candidate: AnalyzerDebugResult["detection"]["candidate_reps"][number];
        samples: FusedSample[];
        axisName: AxisName;
        smoothedSignalDeg: number[];
    }): CalibrationRepCandidate {
        const { candidate, samples, axisName, smoothedSignalDeg } = input;
        const segment = samples.slice(candidate.start_idx, candidate.end_idx + 1);
        const signalSeg = smoothedSignalDeg.slice(candidate.start_idx, candidate.end_idx + 1);
        const timeSeg = segment.map((s) => s.t_ms);
        const velocitySeg = computeSignedVelocityDegS(timeSeg, signalSeg);

        const leftDuration = Math.max(0, candidate.mid_ms - candidate.start_ms) / 1000;
        const rightDuration = Math.max(0, candidate.end_ms - candidate.mid_ms) / 1000;
        const symmetryScore = ratio01(leftDuration, rightDuration);

        const pathLength = sumAbsDeltas(signalSeg);
        const pathLengthRatio = pathLength / Math.max(candidate.rom_deg, 1e-6);

        const signChanges = countVelocitySignChanges(velocitySeg);
        const velocityIrregularity = clamp01(
            0.60 * Math.max(0, signChanges - 1) / 6 +
            0.40 * Math.max(0, pathLengthRatio - 1.2) / 1.4,
        );

        const rejectReasons: string[] = [];

        if (candidate.duration_s < this.cfg.minRepDurationS) {
            rejectReasons.push("duration_too_short");
        }
        if (candidate.duration_s > this.cfg.maxRepDurationS) {
            rejectReasons.push("duration_too_long");
        }
        if (candidate.rom_deg < this.cfg.minRepRomDeg) {
            rejectReasons.push("rom_too_small");
        }
        if (candidate.off_axis_ratio > this.cfg.maxOffAxisRatio) {
            rejectReasons.push("off_axis_too_high");
        }
        if (velocityIrregularity > this.cfg.maxVelocityIrregularity) {
            rejectReasons.push("velocity_profile_irregular");
        }
        if (pathLengthRatio > this.cfg.maxPathLengthRatio) {
            rejectReasons.push("spike_like_cycle");
        }

        const enrichedQualityScore =
            0.35 * Math.min(candidate.rom_deg / Math.max(this.cfg.minRepRomDeg, 1e-6), 3) +
            0.25 * Math.min(candidate.peak_velocity_deg_s / 12, 3) +
            0.20 * symmetryScore +
            0.20 * Math.max(0, 1 - velocityIrregularity);

        return {
            rep_index: candidate.rep_index,
            axis_name: axisName,
            start_idx: candidate.start_idx,
            mid_idx: candidate.mid_idx,
            end_idx: candidate.end_idx,
            start_ms: candidate.start_ms,
            mid_ms: candidate.mid_ms,
            end_ms: candidate.end_ms,
            duration_s: candidate.duration_s,
            rom_deg: candidate.rom_deg,
            peak_velocity_deg_s: candidate.peak_velocity_deg_s,
            mean_velocity_deg_s: candidate.mean_velocity_deg_s,
            symmetry_score: symmetryScore,
            off_axis_ratio: candidate.off_axis_ratio,
            velocity_irregularity: velocityIrregularity,
            path_length_ratio: pathLengthRatio,
            quality_score: enrichedQualityScore,
            accepted: rejectReasons.length === 0,
            reject_reasons: rejectReasons,
        };
    }

    private selectMainContiguousBlock(reps: CalibrationRepCandidate[]): CalibrationRepCandidate[] {
        if (reps.length === 0) return [];

        const ordered = [...reps].sort((a, b) => a.start_idx - b.start_idx);
        const groups: CalibrationRepCandidate[][] = [];
        let current: CalibrationRepCandidate[] = [ordered[0]];

        for (const rep of ordered.slice(1)) {
            const prev = current[current.length - 1];
            const gapS = (rep.start_ms - prev.end_ms) / 1000;

            if (gapS <= this.cfg.maxGapBetweenRepsS) {
                current.push(rep);
            } else {
                groups.push(current);
                current = [rep];
            }
        }

        groups.push(current);

        const best = groups.reduce((a, b) => {
            const scoreA = this.blockScore(a);
            const scoreB = this.blockScore(b);
            return scoreB > scoreA ? b : a;
        });

        return best.map((rep, index) => ({ ...rep, rep_index: index }));
    }

    private blockScore(reps: CalibrationRepCandidate[]): number {
        return reps.length * 10 + sum(reps.map((r) => r.quality_score)) + 0.1 * sum(reps.map((r) => r.rom_deg));
    }

    private normalizeRep(input: {
        repIndex: number;
        axisName: AxisName;
        samples: FusedSample[];
    }): NormalizedRepWaveform {
        const angleDeg = unwrapDeg(getAxisSignalDeg(input.samples, input.axisName));
        const timeMs = input.samples.map((s) => s.t_ms);
        const rawVelocity = computeSignedVelocityDegS(timeMs, angleDeg);

        const centeredAngle = angleDeg.map((v) => v - angleDeg[0]);
        const polarity = centeredAngle.length >= 3
            ? Math.sign(centeredAngle[Math.floor(centeredAngle.length / 2)] || 1) || 1
            : 1;

        const orientedAngle = centeredAngle.map((v) => v * polarity);
        const orientedVelocity = rawVelocity.map((v) => v * polarity);

        return {
            rep_index: input.repIndex,
            axis_name: input.axisName,
            angle: resampleLinear(orientedAngle, this.cfg.normalizePoints),
            velocity: resampleLinear(orientedVelocity.length > 0 ? orientedVelocity : [0], this.cfg.normalizePoints),
        };
    }

    private buildTemplate(axisName: AxisName, reps: NormalizedRepWaveform[]): CalibrationTemplate {
        const angleCurves = reps.map((r) => r.angle);
        const velocityCurves = reps.map((r) => r.velocity);

        const angleMean = pointwiseMean(angleCurves);
        const angleStd = pointwiseStd(angleCurves, angleMean);
        const velocityMean = pointwiseMean(velocityCurves);
        const velocityStd = pointwiseStd(velocityCurves, velocityMean);

        return {
            axis_name: axisName,
            normalize_points: this.cfg.normalizePoints,
            angle_mean: angleMean,
            angle_std: angleStd,
            angle_upper: angleMean.map((v, i) => v + angleStd[i]),
            angle_lower: angleMean.map((v, i) => v - angleStd[i]),
            velocity_mean: velocityMean,
            velocity_std: velocityStd,
        };
    }

    private buildStats(
        recording: CalibrationSessionRecording,
        estimatedSampleHz: number,
        reps: CalibrationRepCandidate[],
    ): CalibrationSessionStats {
        const durations = reps.map((r) => r.duration_s);
        const roms = reps.map((r) => r.rom_deg);
        const peaks = reps.map((r) => r.peak_velocity_deg_s);
        const means = reps.map((r) => r.mean_velocity_deg_s);
        const syms = reps.map((r) => r.symmetry_score);
        const offAxis = reps.map((r) => r.off_axis_ratio);
        const irregularity = reps.map((r) => r.velocity_irregularity);

        const meanDuration = mean(durations);
        const meanRom = mean(roms);

        return {
            sample_count: recording.sample_count,
            duration_s: recording.duration_s,
            estimated_sample_hz: estimatedSampleHz,
            valid_rep_count: reps.length,
            candidate_rep_count: reps.length,
            mean_duration_s: meanDuration,
            std_duration_s: std(durations),
            cv_duration: coeffVar(durations),
            mean_rom_deg: meanRom,
            std_rom_deg: std(roms),
            cv_rom: coeffVar(roms),
            mean_peak_velocity_deg_s: mean(peaks),
            std_peak_velocity_deg_s: std(peaks),
            mean_mean_velocity_deg_s: mean(means),
            std_mean_velocity_deg_s: std(means),
            mean_symmetry_score: mean(syms),
            mean_off_axis_ratio: mean(offAxis),
            mean_velocity_irregularity: mean(irregularity),
        };
    }

    private buildQuality(
        axisScores: CalibrationAxisScore[],
        dominantAxis: AxisName,
        dominantAxisMarginRatio: number | null,
        reps: CalibrationRepCandidate[],
        template: CalibrationTemplate,
    ): CalibrationSessionQuality {
        const axisClarityScore = clamp01(dominantAxisMarginRatio ?? 0);
        const repCountScore = clamp01(reps.length / this.cfg.minValidReps);
        const durationConsistencyScore = 1 - clamp01(coeffVar(reps.map((r) => r.duration_s)) / this.cfg.maxDurationCv);
        const romConsistencyScore = 1 - clamp01(coeffVar(reps.map((r) => r.rom_deg)) / this.cfg.maxRomCv);
        const waveformConsistencyScore = 1 - clamp01(mean(template.angle_std) / this.cfg.maxWaveformMeanStd);
        const meanCandidateQualityScore = clamp01(mean(reps.map((r) => r.quality_score)) / 2.5);

        const w = this.cfg.qualityWeights;
        const overallScore = clamp01(
            axisClarityScore * w.axisClarity +
            repCountScore * w.repCount +
            durationConsistencyScore * w.durationConsistency +
            romConsistencyScore * w.romConsistency +
            waveformConsistencyScore * w.waveformConsistency +
            meanCandidateQualityScore * w.candidateQuality,
        );

        void axisScores;
        void dominantAxis;

        return {
            axis_clarity_score: axisClarityScore,
            rep_count_score: repCountScore,
            duration_consistency_score: durationConsistencyScore,
            rom_consistency_score: romConsistencyScore,
            waveform_consistency_score: waveformConsistencyScore,
            mean_candidate_quality_score: meanCandidateQualityScore,
            overall_score: overallScore,
        };
    }

    private buildFailure(
        recording: CalibrationSessionRecording,
        rejectionReasons: string[],
        debug: CalibrationSessionDebug,
        dominantAxis: AxisName | null = null,
    ): CalibrationSessionResult {
        return {
            success: false,
            dominant_axis: dominantAxis,
            recording,
            reps: [],
            normalized_reps: [],
            template: null,
            stats: null,
            quality: null,
            rejection_reasons: Array.from(new Set(rejectionReasons)),
            debug,
        };
    }

    private buildDebug(input: {
        phase1: MotionCalibrationPhase1Result | null;
        phase2: MotionBiasEstimationResult | null;
        phase3: ReturnType<MotionCalibrationApplier["apply"]> | null;
        axisScores: CalibrationAxisScore[];
        dominantAxisMarginRatio: number | null;
        selectedSignalDeg: number[];
        selectedVelocityDegS: number[];
        selectedGyroMag: number[];
        allCandidates: CalibrationRepCandidate[];
        acceptedCandidates: CalibrationRepCandidate[];
        keptCandidates: CalibrationRepCandidate[];
    }): CalibrationSessionDebug {
        return {
            phase1: input.phase1,
            phase2: input.phase2,
            phase3: input.phase3,
            axis_scores: input.axisScores,
            dominant_axis_margin_ratio: input.dominantAxisMarginRatio,
            selected_signal_deg: input.selectedSignalDeg,
            selected_velocity_deg_s: input.selectedVelocityDegS,
            selected_gyro_mag: input.selectedGyroMag,
            all_candidates: input.allCandidates,
            accepted_candidates: input.acceptedCandidates,
            kept_candidates: input.keptCandidates,
        };
    }

    private emptyDebug(): CalibrationSessionDebug {
        return this.buildDebug({
            phase1: null,
            phase2: null,
            phase3: null,
            axisScores: [],
            dominantAxisMarginRatio: null,
            selectedSignalDeg: [],
            selectedVelocityDegS: [],
            selectedGyroMag: [],
            allCandidates: [],
            acceptedCandidates: [],
            keptCandidates: [],
        });
    }
}

function getAxisSignalDeg(samples: FusedSample[], axis: AxisName): number[] {
    switch (axis) {
        case "roll":
            return samples.map((s) => radToDeg(s.roll));
        case "pitch":
            return samples.map((s) => radToDeg(s.pitch));
        case "yaw":
            return samples.map((s) => radToDeg(s.yaw));
    }
}

function radToDeg(x: number): number {
    return x * 180 / Math.PI;
}

function unwrapDeg(xs: number[]): number[] {
    if (xs.length === 0) return [];

    const out = [xs[0]];
    let offset = 0;

    for (let i = 1; i < xs.length; i += 1) {
        const delta = xs[i] - xs[i - 1];
        if (delta > 180) offset -= 360;
        else if (delta < -180) offset += 360;
        out.push(xs[i] + offset);
    }

    return out;
}

function movingAverage(xs: number[], window: number): number[] {
    if (window <= 1 || xs.length <= 2) return [...xs];

    const half = Math.floor(window / 2);
    const out: number[] = [];

    for (let i = 0; i < xs.length; i += 1) {
        const lo = Math.max(0, i - half);
        const hi = Math.min(xs.length, i + half + 1);
        out.push(mean(xs.slice(lo, hi)));
    }

    return out;
}

function computeAbsVelocityDegS(timesMs: number[], angleDeg: number[]): number[] {
    return computeSignedVelocityDegS(timesMs, angleDeg).map((v) => Math.abs(v));
}

function computeSignedVelocityDegS(timesMs: number[], angleDeg: number[]): number[] {
    const out: number[] = [];

    for (let i = 1; i < angleDeg.length; i += 1) {
        const dt = Math.max((timesMs[i] - timesMs[i - 1]) / 1000, 1e-6);
        out.push((angleDeg[i] - angleDeg[i - 1]) / dt);
    }

    return out;
}

function countVelocitySignChanges(xs: number[]): number {
    if (xs.length < 2) return 0;

    let count = 0;
    let prev = Math.sign(xs[0]);

    for (let i = 1; i < xs.length; i += 1) {
        const cur = Math.sign(xs[i]);
        if (cur === 0) continue;
        if (prev !== 0 && cur !== prev) count += 1;
        prev = cur;
    }

    return count;
}

function resampleLinear(xs: number[], nOut: number): number[] {
    if (nOut <= 1) return [xs[0] ?? 0];
    if (xs.length === 0) return Array(nOut).fill(0);
    if (xs.length === 1) return Array(nOut).fill(xs[0]);

    const out: number[] = [];
    const nIn = xs.length;

    for (let i = 0; i < nOut; i += 1) {
        const pos = (i * (nIn - 1)) / (nOut - 1);
        const left = Math.floor(pos);
        const right = Math.ceil(pos);

        if (left === right) {
            out.push(xs[left]);
            continue;
        }

        const w = pos - left;
        out.push(xs[left] * (1 - w) + xs[right] * w);
    }

    return out;
}

function pointwiseMean(curves: number[][]): number[] {
    if (curves.length === 0) return [];
    const n = curves[0].length;
    const out: number[] = [];

    for (let i = 0; i < n; i += 1) {
        out.push(mean(curves.map((curve) => curve[i] ?? 0)));
    }

    return out;
}

function pointwiseStd(curves: number[][], mu: number[]): number[] {
    if (curves.length === 0) return [];
    const n = curves[0].length;
    const out: number[] = [];

    for (let i = 0; i < n; i += 1) {
        const vals = curves.map((curve) => curve[i] ?? 0);
        out.push(std(vals, mu[i] ?? 0));
    }

    return out;
}

function coeffVar(xs: number[]): number {
    const m = Math.abs(mean(xs));
    if (m <= 1e-9) return 0;
    return std(xs) / m;
}

function ratio01(a: number, b: number): number {
    const hi = Math.max(Math.abs(a), Math.abs(b), 1e-9);
    const lo = Math.min(Math.abs(a), Math.abs(b));
    return lo / hi;
}

function sum(xs: number[]): number {
    let out = 0;
    for (const x of xs) out += x;
    return out;
}

function mean(xs: number[]): number {
    if (xs.length === 0) return 0;
    return sum(xs) / xs.length;
}

function std(xs: number[], mu?: number): number {
    if (xs.length <= 1) return 0;
    const m = mu ?? mean(xs);
    let acc = 0;
    for (const x of xs) {
        const d = x - m;
        acc += d * d;
    }
    return Math.sqrt(acc / xs.length);
}

function sumAbsDeltas(xs: number[]): number {
    if (xs.length < 2) return 0;
    let out = 0;
    for (let i = 1; i < xs.length; i += 1) {
        out += Math.abs(xs[i] - xs[i - 1]);
    }
    return out;
}

function clamp01(x: number): number {
    return Math.max(0, Math.min(1, x));
}
