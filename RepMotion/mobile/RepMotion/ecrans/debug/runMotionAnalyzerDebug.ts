// models
import { FusedSample } from "../../models/motionTypes";
// classes
import { MotionAnalyzer } from "../../motion/motionAnalyzer";
/*
Test 1 — true 3 closed reps
    Make the synthetic signal include a full closing cycle.
    Add one more turnaround after the last descent so the third rep closes.

    Right now the last rep dies at the edge of the dataset.

Test 2 — no movement
    Feed flat pitch/roll/yaw.
    Expected:

    rep_count = 0

Test 3 — noisy reps
    Add jitter to pitch and gyro magnitude.
    Expected:

    still detects reps
    shaking_score rises

Test 4 — off-axis motion
    Make roll large while pitch still dominates.
    Expected:

    possibly still detects
    off_axis_ratio increases
*/


type DebugCaseName =
    | "three_closed_reps"
    | "two_reps_open_end"
    | "no_movement"
    | "noisy_reps"
    | "off_axis_reps";

type DebugRunResult = {
    caseName: DebugCaseName;
    expected: string;
    debug: any;
};

// function AnalyzerDebugScreen() {
//     return (
//         <View style={{ padding: 24 }}>
//             <Button
//                 title="Run Motion Analyzer Debug"
//                 // onPress={() => {
//                 //     const result = runMotionAnalyzerDebugThreeClosedReps();
//                 //     console.log("runMotionAnalyzerDebugThreeClosedReps:", result);
//                 // }}


//                 // onPress={() => {
//                 //     const result = runMotionAnalyzerDebugNoMovement();
//                 //     console.log("runMotionAnalyzerDebugNoMovement:", result);
//                 // }}


//                 // onPress={() => {
//                 //     const result = runMotionAnalyzerDebugNoisyReps();
//                 //     console.log("runMotionAnalyzerDebugNoisyReps:", result);
//                 // }}


//                 onPress={() => {
//                     const result = runMotionAnalyzerDebugOffAxisReps();
//                     console.log("runMotionAnalyzerDebugOffAxisReps:", result);
//                 }}
//             />
//         </View>
//     );
// }

export function runMotionAnalyzerDebugThreeClosedReps(): DebugRunResult {
    const analyzer = createAnalyzer();
    const samples = makeSyntheticThreeClosedRepData();
    const debug = analyzer.analyze(samples, { debug: true });

    console.log("=== ANALYZER DEBUG: THREE CLOSED REPS ===");
    console.log("Expected: dominant_axis=pitch, rep_count≈3");
    console.log(JSON.stringify(debug, null, 2));

    return {
        caseName: "three_closed_reps",
        expected: "dominant_axis=pitch, rep_count≈3",
        debug,
    };
}

export function runMotionAnalyzerDebugTwoRepsOpenEnd(): DebugRunResult {
    const analyzer = createAnalyzer();
    const samples = makeSyntheticTwoRepsOpenEndData();
    const debug = analyzer.analyze(samples, { debug: true });

    console.log("=== ANALYZER DEBUG: TWO REPS OPEN END ===");
    console.log("Expected: dominant_axis=pitch, rep_count≈2");
    console.log(JSON.stringify(debug, null, 2));

    return {
        caseName: "two_reps_open_end",
        expected: "dominant_axis=pitch, rep_count≈2",
        debug,
    };
}

export function runMotionAnalyzerDebugNoMovement(): DebugRunResult {
    const analyzer = createAnalyzer();
    const samples = makeSyntheticNoMovementData();
    const debug = analyzer.analyze(samples, { debug: true });

    console.log("=== ANALYZER DEBUG: NO MOVEMENT ===");
    console.log("Expected: rep_count=0");
    console.log(JSON.stringify(debug, null, 2));

    return {
        caseName: "no_movement",
        expected: "rep_count=0",
        debug,
    };
}

export function runMotionAnalyzerDebugNoisyReps(): DebugRunResult {
    const analyzer = createAnalyzer();
    const samples = makeSyntheticNoisyRepData();
    const debug = analyzer.analyze(samples, { debug: true });

    console.log("=== ANALYZER DEBUG: NOISY REPS ===");
    console.log("Expected: pitch dominance, reps detected, higher shaking_score");
    console.log(JSON.stringify(debug, null, 2));

    return {
        caseName: "noisy_reps",
        expected: "pitch dominance, reps detected, higher shaking_score",
        debug,
    };
}

export function runMotionAnalyzerDebugOffAxisReps(): DebugRunResult {
    const analyzer = createAnalyzer();
    const samples = makeSyntheticOffAxisRepData();
    const debug = analyzer.analyze(samples, { debug: true });

    console.log("=== ANALYZER DEBUG: OFF-AXIS REPS ===");
    console.log("Expected: pitch still dominant, higher off-axis penalty");
    console.log(JSON.stringify(debug, null, 2));

    return {
        caseName: "off_axis_reps",
        expected: "pitch still dominant, higher off-axis penalty",
        debug,
    };
}




// -----------------------------------------------------------------------------
// ANALYZER FACTORY
// -----------------------------------------------------------------------------
function createAnalyzer() {
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




// -----------------------------------------------------------------------------
// TEST DATA GENERATORS
// -----------------------------------------------------------------------------
/**
 * Test 1:
 * Three truly closed reps on pitch.
 *
 * Why this is better than your original:
 * - We add one more turnaround after the third descent
 * - So the third rep closes as a full extremum cycle
 *
 * Expected:
 * - dominant_axis = "pitch"
 * - rep_count ~= 3
 */
export function makeSyntheticThreeClosedRepData(): FusedSample[] {
    const pitchDegSeries = [
        // rep 1
        0, 4, 8, 12, 16, 20, 16, 12, 8, 4, 0,
        // rep 2
        0, 5, 10, 15, 20, 15, 10, 5, 0,
        // rep 3
        0, 6, 12, 18, 24, 18, 12, 6, 0,
        // closing turnaround to complete the final cycle
        0, 4, 8, 12, 8, 4, 0,
    ];

    return buildSyntheticFusedSamples({
        pitchDegSeries,
        rollDegSeries: pitchDegSeries.map((_, i) => 1.2 * Math.sin(i / 4)),
        yawDegSeries: pitchDegSeries.map(() => 0),
        gyroNoiseScale: 0,
        accelNoiseScale: 0,
    });
}

/**
 * Original-like dataset:
 * visible humps, but final motion dies at the edge.
 *
 * Expected:
 * - dominant_axis = "pitch"
 * - rep_count ~= 2
 */
export function makeSyntheticTwoRepsOpenEndData(): FusedSample[] {
    const pitchDegSeries = [
        0, 4, 8, 12, 16, 20, 16, 12, 8, 4, 0,
        0, 5, 10, 15, 20, 15, 10, 5, 0,
        0, 6, 12, 18, 24, 18, 12, 6, 0,
    ];

    return buildSyntheticFusedSamples({
        pitchDegSeries,
        rollDegSeries: pitchDegSeries.map((_, i) => 1.5 * Math.sin(i / 4)),
        yawDegSeries: pitchDegSeries.map(() => 0),
        gyroNoiseScale: 0,
        accelNoiseScale: 0,
    });
}

/**
 * Flat session.
 *
 * Expected:
 * - rep_count = 0
 */
export function makeSyntheticNoMovementData(): FusedSample[] {
    const n = 40;
    const pitchDegSeries = Array.from({ length: n }, () => 0);

    return buildSyntheticFusedSamples({
        pitchDegSeries,
        rollDegSeries: Array.from({ length: n }, () => 0),
        yawDegSeries: Array.from({ length: n }, () => 0),
        gyroNoiseScale: 0,
        accelNoiseScale: 0,
        still: true,
    });
}

/**
 * Clean pitch reps with injected noise.
 *
 * Expected:
 * - reps still detected
 * - shaking_score higher than clean case
 */
export function makeSyntheticNoisyRepData(): FusedSample[] {
    const pitchDegSeries = [
        0, 4, 8, 12, 16, 20, 16, 12, 8, 4, 0,
        0, 6, 12, 18, 24, 18, 12, 6, 0,
        0, 5, 10, 15, 20, 15, 10, 5, 0,
        0, 4, 8, 12, 8, 4, 0,
    ];

    return buildSyntheticFusedSamples({
        pitchDegSeries,
        rollDegSeries: pitchDegSeries.map((_, i) => 1.0 * Math.sin(i / 3)),
        yawDegSeries: pitchDegSeries.map((_, i) => 0.2 * Math.sin(i / 5)),
        gyroNoiseScale: 0.12,
        accelNoiseScale: 0.08,
    });
}

/**
 * Main motion on pitch, but strong roll contamination.
 *
 * Expected:
 * - pitch may still win
 * - off-axis penalties higher
 * - depending on thresholds, fewer reps may survive
 */
export function makeSyntheticOffAxisRepData(): FusedSample[] {
    const pitchDegSeries = [
        0, 5, 10, 15, 20, 15, 10, 5, 0,
        0, 6, 12, 18, 24, 18, 12, 6, 0,
        0, 5, 10, 15, 20, 15, 10, 5, 0,
        0, 4, 8, 12, 8, 4, 0,
    ];

    const rollDegSeries = pitchDegSeries.map((v, i) => 0.65 * v + 2.5 * Math.sin(i / 2));

    return buildSyntheticFusedSamples({
        pitchDegSeries,
        rollDegSeries,
        yawDegSeries: pitchDegSeries.map((_, i) => 0.5 * Math.sin(i / 6)),
        gyroNoiseScale: 0.03,
        accelNoiseScale: 0.03,
    });
}




// -----------------------------------------------------------------------------
// SHARED BUILDER
// -----------------------------------------------------------------------------
type BuildSyntheticOptions = {
    pitchDegSeries: number[];
    rollDegSeries?: number[];
    yawDegSeries?: number[];
    dtMs?: number;
    gyroNoiseScale?: number;
    accelNoiseScale?: number;
    still?: boolean;
};

function buildSyntheticFusedSamples(opts: BuildSyntheticOptions): FusedSample[] {
    const dtMs = opts.dtMs ?? 100; // 10 Hz
    const gyroNoiseScale = opts.gyroNoiseScale ?? 0;
    const accelNoiseScale = opts.accelNoiseScale ?? 0;
    const still = opts.still ?? false;

    const pitchDegSeries = opts.pitchDegSeries;
    const rollDegSeries =
        opts.rollDegSeries ?? Array.from({ length: pitchDegSeries.length }, () => 0);
    const yawDegSeries =
        opts.yawDegSeries ?? Array.from({ length: pitchDegSeries.length }, () => 0);

    if (
        rollDegSeries.length !== pitchDegSeries.length ||
        yawDegSeries.length !== pitchDegSeries.length
    ) {
        throw new Error("All synthetic angle series must have the same length.");
    }

    const samples: FusedSample[] = [];
    let t = 0;

    for (let i = 0; i < pitchDegSeries.length; i++) {
        const pitch = degToRad(pitchDegSeries[i]);
        const roll = degToRad(rollDegSeries[i]);
        const yaw = degToRad(yawDegSeries[i]);

        const prevPitchDeg = i > 0 ? pitchDegSeries[i - 1] : pitchDegSeries[i];
        const prevRollDeg = i > 0 ? rollDegSeries[i - 1] : rollDegSeries[i];
        const prevYawDeg = i > 0 ? yawDegSeries[i - 1] : yawDegSeries[i];

        const gyPitch = degToRad((pitchDegSeries[i] - prevPitchDeg) / (dtMs / 1000));
        const gxRoll = degToRad((rollDegSeries[i] - prevRollDeg) / (dtMs / 1000));
        const gzYaw = degToRad((yawDegSeries[i] - prevYawDeg) / (dtMs / 1000));

        const gx = gxRoll + pseudoNoise(i, 0, gyroNoiseScale);
        const gy = gyPitch + pseudoNoise(i, 1, gyroNoiseScale);
        const gz = gzYaw + pseudoNoise(i, 2, gyroNoiseScale);

        // Keep this simple and deterministic enough for analyzer tests.
        const ax = 0.1 + pseudoNoise(i, 3, accelNoiseScale);
        const ay = 9.7 + pseudoNoise(i, 4, accelNoiseScale);
        const az = 0.2 + pseudoNoise(i, 5, accelNoiseScale);

        const accelMagnitude = Math.sqrt(ax * ax + ay * ay + az * az);
        const gyroMagnitude = Math.sqrt(gx * gx + gy * gy + gz * gz);

        const q = eulerToQuaternion(roll, pitch, yaw);

        samples.push({
            t_ms: t,
            ax,
            ay,
            az,
            gx,
            gy,
            gz,
            accel_magnitude: accelMagnitude,
            gyro_magnitude: gyroMagnitude,
            roll,
            pitch,
            yaw,
            qw: q.w,
            qx: q.x,
            qy: q.y,
            qz: q.z,
            temp_c: 24,
            still,
        });

        t += dtMs;
    }

    return samples;
}




// -----------------------------------------------------------------------------
// SMALL HELPERS
// -----------------------------------------------------------------------------
function pseudoNoise(i: number, channel: number, scale: number): number {
    if (scale === 0) return 0;

    const a = Math.sin(i * 0.91 + channel * 1.37);
    const b = Math.cos(i * 1.73 + channel * 0.61);
    const c = Math.sin(i * 0.37 + channel * 2.11);

    return ((a + 0.7 * b + 0.4 * c) / 2.1) * scale;
}

function eulerToQuaternion(roll: number, pitch: number, yaw: number) {
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

function degToRad(x: number): number {
    return (x * Math.PI) / 180;
}

function makeSyntheticRepData(): FusedSample[] {
    const samples: FusedSample[] = [];
    const dtMs = 100; // 10 Hz
    let t = 0;

    // 3 slow clean reps on pitch
    const pitchDegSeries = [
        0, 4, 8, 12, 16, 20, 16, 12, 8, 4, 0,
        0, 5, 10, 15, 20, 15, 10, 5, 0,
        0, 6, 12, 18, 24, 18, 12, 6, 0,
    ];

    for (let i = 0; i < pitchDegSeries.length; i++) {
        const pitch = degToRad(pitchDegSeries[i]);
        const roll = degToRad(1.5 * Math.sin(i / 4));
        const yaw = 0;

        const gx = 0.02;
        const gy = 0.05;
        const gz = 0.01;

        const ax = 0.1;
        const ay = 9.7;
        const az = 0.2;

        const accelMagnitude = Math.sqrt(ax * ax + ay * ay + az * az);
        const gyroMagnitude = Math.sqrt(gx * gx + gy * gy + gz * gz);

        samples.push({
            t_ms: t,
            ax,
            ay,
            az,
            gx,
            gy,
            gz,
            accel_magnitude: accelMagnitude,
            gyro_magnitude: gyroMagnitude,
            roll,
            pitch,
            yaw,
            qw: 1,
            qx: 0,
            qy: 0,
            qz: 0,
            temp_c: 24,
            still: false,
        });

        t += dtMs;
    }

    return samples;
}
