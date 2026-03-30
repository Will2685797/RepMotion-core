// constants
import { RAD2DEG } from "../models/motionConstants";
// models
import type {
    FusedSample,
    MotionSample,
} from "../models/motionTypes";
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
// utils
import { buildFusedSample } from "../models/motionTypes";




// payload
export function parseFusedSample(raw: string): FusedSample | null {
    const trimmed = raw.trim();
    if (!trimmed) return null;

    if (trimmed.startsWith("{")) {
        try {
            const obj = JSON.parse(trimmed);
            return parseObjectPayload(obj);
        } catch {
            return null;
        }
    }

    return parseCsvPayload(trimmed);
}

export function parseObjectPayload(obj: any): FusedSample | null {
    // --------------------------------------------------
    // 1) Full fused payload (preferred / real backend shape)
    // --------------------------------------------------
    const hasFullFusedCore =
        isFiniteNumber(obj?.t_ms) &&
        isFiniteNumber(obj?.ax) &&
        isFiniteNumber(obj?.ay) &&
        isFiniteNumber(obj?.az) &&
        isFiniteNumber(obj?.gx) &&
        isFiniteNumber(obj?.gy) &&
        isFiniteNumber(obj?.gz) &&
        isFiniteNumber(obj?.accel_magnitude) &&
        isFiniteNumber(obj?.gyro_magnitude) &&
        isFiniteNumber(obj?.roll) &&
        isFiniteNumber(obj?.pitch) &&
        isFiniteNumber(obj?.yaw) &&
        isFiniteNumber(obj?.qw) &&
        isFiniteNumber(obj?.qx) &&
        isFiniteNumber(obj?.qy) &&
        isFiniteNumber(obj?.qz);

    if (hasFullFusedCore) {
        return buildFusedSample({
            t_ms: obj.t_ms,

            ax: obj.ax,
            ay: obj.ay,
            az: obj.az,

            gx: obj.gx,
            gy: obj.gy,
            gz: obj.gz,

            accel_magnitude: obj.accel_magnitude,
            gyro_magnitude: obj.gyro_magnitude,

            roll: obj.roll,
            pitch: obj.pitch,
            yaw: obj.yaw,

            qw: obj.qw,
            qx: obj.qx,
            qy: obj.qy,
            qz: obj.qz,

            temp_c: isFiniteNumber(obj?.temp_c) ? obj.temp_c : undefined,
            still:
                parseBooleanLike(obj?.still) ??
                parseBooleanLike(obj?.is_still) ??
                undefined,
        });
    }

    // --------------------------------------------------
    // 2) Old raw payload path
    // --------------------------------------------------
    const hasOldRawCore =
        isFiniteNumber(obj?.t_ms) &&
        isFiniteNumber(obj?.ax) &&
        isFiniteNumber(obj?.ay) &&
        isFiniteNumber(obj?.az) &&
        isFiniteNumber(obj?.gx) &&
        isFiniteNumber(obj?.gy) &&
        isFiniteNumber(obj?.gz);

    if (hasOldRawCore) {
        const accel_magnitude = isFiniteNumber(obj?.accel_magnitude)
            ? obj.accel_magnitude
            : isFiniteNumber(obj?.acc_mag_f)
                ? obj.acc_mag_f
                : magnitude3(obj.ax, obj.ay, obj.az);

        const gyro_magnitude = isFiniteNumber(obj?.gyro_magnitude)
            ? obj.gyro_magnitude
            : isFiniteNumber(obj?.gyro_mag_f)
                ? obj.gyro_mag_f
                : magnitude3(obj.gx, obj.gy, obj.gz);

        const still =
            parseBooleanLike(obj?.still) ??
            parseBooleanLike(obj?.is_still) ??
            inferStillness(accel_magnitude, gyro_magnitude);

        return buildFusedSample({
            t_ms: obj.t_ms,

            ax: obj.ax,
            ay: obj.ay,
            az: obj.az,

            gx: obj.gx,
            gy: obj.gy,
            gz: obj.gz,

            accel_magnitude,
            gyro_magnitude,

            roll: isFiniteNumber(obj?.roll) ? obj.roll : 0,
            pitch: isFiniteNumber(obj?.pitch) ? obj.pitch : 0,
            yaw: isFiniteNumber(obj?.yaw) ? obj.yaw : 0,

            qw: isFiniteNumber(obj?.qw) ? obj.qw : 1,
            qx: isFiniteNumber(obj?.qx) ? obj.qx : 0,
            qy: isFiniteNumber(obj?.qy) ? obj.qy : 0,
            qz: isFiniteNumber(obj?.qz) ? obj.qz : 0,

            temp_c: isFiniteNumber(obj?.temp_c) ? obj.temp_c : undefined,
            still,
        });
    }

    // --------------------------------------------------
    // 3) New SI raw payload path
    // --------------------------------------------------
    const hasNewRawCore =
        isFiniteNumber(obj?.t_ms) &&
        isFiniteNumber(obj?.ax_mps2) &&
        isFiniteNumber(obj?.ay_mps2) &&
        isFiniteNumber(obj?.az_mps2) &&
        isFiniteNumber(obj?.gx_rads) &&
        isFiniteNumber(obj?.gy_rads) &&
        isFiniteNumber(obj?.gz_rads);

    if (hasNewRawCore) {
        const accel_magnitude = isFiniteNumber(obj?.accel_magnitude)
            ? obj.accel_magnitude
            : isFiniteNumber(obj?.acc_mag_f)
                ? obj.acc_mag_f
                : magnitude3(obj.ax_mps2, obj.ay_mps2, obj.az_mps2);

        const gyro_magnitude = isFiniteNumber(obj?.gyro_magnitude)
            ? obj.gyro_magnitude
            : isFiniteNumber(obj?.gyro_mag_f)
                ? obj.gyro_mag_f
                : magnitude3(obj.gx_rads, obj.gy_rads, obj.gz_rads);

        const still =
            parseBooleanLike(obj?.still) ??
            parseBooleanLike(obj?.is_still) ??
            inferStillness(accel_magnitude, gyro_magnitude);

        return buildFusedSample({
            t_ms: obj.t_ms,

            ax: obj.ax_mps2,
            ay: obj.ay_mps2,
            az: obj.az_mps2,

            gx: obj.gx_rads,
            gy: obj.gy_rads,
            gz: obj.gz_rads,

            accel_magnitude,
            gyro_magnitude,

            roll:
                isFiniteNumber(obj?.roll) ? obj.roll :
                    isFiniteNumber(obj?.roll_rad) ? obj.roll_rad :
                        isFiniteNumber(obj?.roll_deg) ? (obj.roll_deg * Math.PI) / 180 :
                            0,

            pitch:
                isFiniteNumber(obj?.pitch) ? obj.pitch :
                    isFiniteNumber(obj?.pitch_rad) ? obj.pitch_rad :
                        isFiniteNumber(obj?.pitch_deg) ? (obj.pitch_deg * Math.PI) / 180 :
                            0,

            yaw:
                isFiniteNumber(obj?.yaw) ? obj.yaw :
                    isFiniteNumber(obj?.yaw_rad) ? obj.yaw_rad :
                        isFiniteNumber(obj?.yaw_deg) ? (obj.yaw_deg * Math.PI) / 180 :
                            0,

            qw: isFiniteNumber(obj?.qw) ? obj.qw : 1,
            qx: isFiniteNumber(obj?.qx) ? obj.qx : 0,
            qy: isFiniteNumber(obj?.qy) ? obj.qy : 0,
            qz: isFiniteNumber(obj?.qz) ? obj.qz : 0,

            temp_c: isFiniteNumber(obj?.temp_c) ? obj.temp_c : undefined,
            still,
        });
    }

    // --------------------------------------------------
    // 4) Compact payload path
    // Not enough data for FusedSample
    // --------------------------------------------------
    return null;
}

export function parseCsvPayload(trimmed: string): FusedSample | null {
    const parts = trimmed.split(",");

    // Legacy compact CSV: not enough fields for FusedSample
    if (parts.length === 4) {
        return null;
    }

    // Raw 7-field CSV: t_ms, ax, ay, az, gx, gy, gz
    if (parts.length === 7) {
        const t_ms = Number(parts[0]);
        const ax = Number(parts[1]);
        const ay = Number(parts[2]);
        const az = Number(parts[3]);
        const gx = Number(parts[4]);
        const gy = Number(parts[5]);
        const gz = Number(parts[6]);

        if (
            Number.isFinite(t_ms) &&
            Number.isFinite(ax) &&
            Number.isFinite(ay) &&
            Number.isFinite(az) &&
            Number.isFinite(gx) &&
            Number.isFinite(gy) &&
            Number.isFinite(gz)
        ) {
            const accel_magnitude = magnitude3(ax, ay, az);
            const gyro_magnitude = magnitude3(gx, gy, gz);
            const still = inferStillness(accel_magnitude, gyro_magnitude);

            return buildFusedSample({
                t_ms,
                ax,
                ay,
                az,
                gx,
                gy,
                gz,
                accel_magnitude,
                gyro_magnitude,
                still,
            });
        }
    }

    return null;
}

export function isFiniteNumber(x: unknown): x is number {
    return typeof x === "number" && Number.isFinite(x);
}

export function parseBooleanLike(v: unknown): boolean | null {
    if (typeof v === "boolean") return v;
    if (v === 1 || v === "1" || v === "true") return true;
    if (v === 0 || v === "0" || v === "false") return false;
    return null;
}

export function inferStillness(accMag: number, gyroMag: number): boolean {
    return gyroMag < 0.15;
}




// analyse / math
export function magnitude3(x: number, y: number, z: number): number {
    return Math.sqrt(x * x + y * y + z * z);
}

export function wrapAnglePi(angle: number): number {
    let a = angle;
    while (a > Math.PI) a -= 2 * Math.PI;
    while (a < -Math.PI) a += 2 * Math.PI;
    return a;
}

export function eulerToQuaternion(roll: number, pitch: number, yaw: number) {
    const cr = Math.cos(roll * 0.5);
    const sr = Math.sin(roll * 0.5);
    const cp = Math.cos(pitch * 0.5);
    const sp = Math.sin(pitch * 0.5);
    const cy = Math.cos(yaw * 0.5);
    const sy = Math.sin(yaw * 0.5);

    const w = cr * cp * cy + sr * sp * sy;
    const x = sr * cp * cy - cr * sp * sy;
    const y = cr * sp * cy + sr * cp * sy;
    const z = cr * cp * sy - sr * sp * cy;

    const norm = Math.sqrt(w * w + x * x + y * y + z * z) || 1;

    return {
        w: w / norm,
        x: x / norm,
        y: y / norm,
        z: z / norm,
    };
}

export function median(xs: number[]): number {
    if (xs.length === 0) return 0;
    const mid = Math.floor(xs.length / 2);
    return xs.length % 2 === 0 ? (xs[mid - 1] + xs[mid]) / 2 : xs[mid];
}

export function configLikeFromCandidateThresholds(
    config: MotionAnalyzerConfig
): Pick<
    MotionAnalyzerConfig,
    "minRepDurationS" | "maxRepDurationS" | "minRepRomDeg" | "minPeakVelocityDegS"
> {
    return {
        minRepDurationS: config.minRepDurationS,
        maxRepDurationS: config.maxRepDurationS,
        minRepRomDeg: config.minRepRomDeg,
        minPeakVelocityDegS: config.minPeakVelocityDegS,
    };
}

export function computeShakingScore(seg: FusedSample[]): number {
    const vals = seg.map((s) => s.gyro_magnitude);
    if (vals.length < 2) return 0;

    const mu = mean(vals);
    const variance = mean(vals.map((v) => (v - mu) ** 2));
    return Math.sqrt(variance);
}

export function computeOffAxisRatio(seg: FusedSample[], axisName: AxisName): number {
    const rollDeg = unwrapDeg(seg.map((s) => s.roll * RAD2DEG));
    const pitchDeg = unwrapDeg(seg.map((s) => s.pitch * RAD2DEG));
    const yawDeg = unwrapDeg(seg.map((s) => s.yaw * RAD2DEG));

    const axisSeries: Record<AxisName, number[]> = {
        roll: rollDeg,
        pitch: pitchDeg,
        yaw: yawDeg,
    };

    const main = axisSeries[axisName];
    const others = (["roll", "pitch", "yaw"] as AxisName[])
        .filter((axis) => axis !== axisName)
        .map((axis) => axisSeries[axis]);

    const mainEnergy = sumAbsDeltas(main);
    const offEnergy = sum(others.map((series) => sumAbsDeltas(series)));

    return offEnergy / Math.max(mainEnergy, 1e-6);
}

export function axisVelocityDegS(timesMs: number[], angleDeg: number[]): number[] {
    const out: number[] = [];

    for (let i = 1; i < angleDeg.length; i++) {
        const dt = Math.max((timesMs[i] - timesMs[i - 1]) / 1000, 1e-6);
        out.push(Math.abs(angleDeg[i] - angleDeg[i - 1]) / dt);
    }

    return out;
}

export function movingAverage(xs: number[], window: number): number[] {
    if (window <= 1 || xs.length <= 2) return [...xs];

    const half = Math.floor(window / 2);
    const out: number[] = [];

    for (let i = 0; i < xs.length; i++) {
        const lo = Math.max(0, i - half);
        const hi = Math.min(xs.length, i + half + 1);
        out.push(mean(xs.slice(lo, hi)));
    }

    return out;
}

export function unwrapDeg(xs: number[]): number[] {
    if (xs.length === 0) return [];

    const out = [xs[0]];
    let offset = 0;

    for (let i = 1; i < xs.length; i++) {
        const cur = xs[i];
        const prev = xs[i - 1];
        const delta = cur - prev;

        if (delta > 180) {
            offset -= 360;
        } else if (delta < -180) {
            offset += 360;
        }

        out.push(cur + offset);
    }

    return out;
}

export function sumAbsDeltas(xs: number[]): number {
    if (xs.length < 2) return 0;

    let total = 0;
    for (let i = 1; i < xs.length; i++) {
        total += Math.abs(xs[i] - xs[i - 1]);
    }
    return total;
}

export function mean(xs: number[]): number {
    if (xs.length === 0) return 0;
    return sum(xs) / xs.length;
}

export function sum(xs: number[]): number {
    let total = 0;
    for (const x of xs) total += x;
    return total;
}

export function min(xs: number[]): number {
    let m = xs[0];
    for (let i = 1; i < xs.length; i++) {
        if (xs[i] < m) m = xs[i];
    }
    return m;
}

export function max(xs: number[]): number {
    let m = xs[0];
    for (let i = 1; i < xs.length; i++) {
        if (xs[i] > m) m = xs[i];
    }
    return m;
}

export function compareScores(
    a: [number, number, number, number, number],
    b: [number, number, number, number, number]
): number {
    for (let i = 0; i < a.length; i++) {
        if (a[i] > b[i]) return 1;
        if (a[i] < b[i]) return -1;
    }
    return 0;
}

export function compareTriple(
    a: [number, number, number],
    b: [number, number, number]
): number {
    for (let i = 0; i < a.length; i++) {
        if (a[i] > b[i]) return 1;
        if (a[i] < b[i]) return -1;
    }
    return 0;
}

export function std(xs: number[]): number {
    if (xs.length <= 1) return 0;
    const mu = mean(xs);
    const variance =
        xs.reduce((sum, x) => {
            const d = x - mu;
            return sum + d * d;
        }, 0) / xs.length;

    return Math.sqrt(variance);
}

export function range(xs: number[]): number {
    if (xs.length === 0) return 0;
    return max(xs) - min(xs);
}

export function clamp(value: number, lo: number, hi: number): number {
    return Math.max(lo, Math.min(hi, value));
}

export function clamp01(value: number): number {
    return clamp(value, 0, 1);
}

export function resampleLinear(xs: number[], nOut: number): number[] {
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
        } else {
            const w = pos - left;
            out.push(xs[left] * (1 - w) + xs[right] * w);
        }
    }

    return out;
}

export function computeSignedVelocityDegS(timesMs: number[], angleDeg: number[]): number[] {
    const out: number[] = [];
    for (let i = 1; i < angleDeg.length; i += 1) {
        const dt = Math.max((timesMs[i] - timesMs[i - 1]) / 1000, 1e-6);
        out.push((angleDeg[i] - angleDeg[i - 1]) / dt);
    }
    return out;
}

export function getAxisSignalDeg(samples: FusedSample[], axis: AxisName): number[] {
    switch (axis) {
        case "roll":
            return samples.map((s) => radToDeg(s.roll));
        case "pitch":
            return samples.map((s) => radToDeg(s.pitch));
        case "yaw":
            return samples.map((s) => radToDeg(s.yaw));
    }
}

export function radToDeg(x: number): number {
    return x * 180 / Math.PI;
}

export function correlation(a: number[], b: number[]): number {
    const n = Math.min(a.length, b.length);
    if (n < 3) return 0;

    const aa = a.slice(0, n);
    const bb = b.slice(0, n);

    const ma = mean(aa);
    const mb = mean(bb);
    const sa = std_corr(aa, ma);
    const sb = std_corr(bb, mb);

    if (sa <= 1e-9 || sb <= 1e-9) return 0;

    let acc = 0;
    for (let i = 0; i < n; i += 1) {
        acc += ((aa[i] - ma) / sa) * ((bb[i] - mb) / sb);
    }

    return acc / n;
}

export function corrTo01(x: number): number {
    return clamp01((x + 1) / 2);
}

export function closenessScore(value: number, target: number, tolerance: number): number {
    const d = Math.abs(value - target);
    return 1 - clamp01(d / Math.max(tolerance, 1e-6));
}

export function std_corr(xs: number[], mu?: number): number {
    if (xs.length <= 1) return 0;
    const m = mu ?? mean(xs);
    let acc = 0;
    for (const x of xs) {
        const d = x - m;
        acc += d * d;
    }
    return Math.sqrt(acc / xs.length);
}

export function round(x: unknown, digits = 4): number | null {
  if (typeof x !== "number" || !Number.isFinite(x)) return null;
  const p = Math.pow(10, digits);
  return Math.round(x * p) / p;
}






