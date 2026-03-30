// imports
import React, { useEffect, useState, useMemo, useRef } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, Button } from "react-native";
// hooks
import { useMotionDevice } from "../../api/query/hooks/useMotionDevice";
// models
import { FusedSample } from "../../models/motionTypes";
import type {
    CalibrationSessionRecording,
    CalibrationSessionResult,
} from "../../models/motionCalibrationSessionTypes";
// constants
import { WS_HOST } from "../../models/motionConstants";
import { createAnalyzerAndCfg } from "../../motion/motionAnalyzer";
// classes
import { MotionCalibrator } from "../../motion/motionCalibrator";
import { MotionBiasEstimator } from "../../motion/motionBiasEstimator";
import { MotionCalibrationApplier } from "../../motion/motionCalibrationApplier";
import { MotionCalibrationSessionRecorder } from "../../motion/motionCalibrationSessionRecorder";
import { MotionCalibrationSessionPipeline } from "../../motion/motionCalibrationSessionPipeline";
// screens / components
import MotionCalibrationSessionScreen from "./MotionCalibrationSessionScreen";
/*
ESP32
Logic:
    reading MPU registers
    basic conversion raw → g / dps
    basic boot calibration for gyro bias
    packet throttling to fixed Hz
    maybe a simple is_alive / is_streaming status
    maybe ultra-light smoothing if packet noise is insane

Send raw packet:
    t_ms
    ax ay az
    gx gy gz
    mx my mz

    boot bias
    battery/device status


{
  "t_ms": 12345,
  "temp_c": 24.18,
  "ax_mps2": 0.1123,
  "ay_mps2": 9.8011,
  "az_mps2": -0.0842,
  "gx_rads": 0.00123,
  "gy_rads": -0.01554,
  "gz_rads": 0.00678,
  "roll_deg": 89.51,
  "pitch_deg": -0.64,
  "still": true
}
*/
/*
CURRENT pipeline
    ESP32 (IMU raw)
        ↓
    WebSocket (JSON stream)
        ↓
    MotionPreprocessor
        - unit conversion
        - accel / gyro magnitude
        - roll / pitch / yaw
        - quaternion
        ↓
    FusedSample
        ↓
    MotionSessionBuffer (rolling window)
        ↓
    MotionAnalyzer
        - extrema detection
        - rep segmentation
        - velocity
        - sticking point
        - shaking
        ↓
    Debug / UI

CURRENT pipeline
    ESP32 (IMU raw)
        ↓
    WebSocket (JSON stream)
        ↓
    MotionPreprocessor
        - unit conversion
        - accel / gyro magnitude
        - roll / pitch / yaw
        - quaternion
        ↓
    FusedSample        
        ↓
    Calibrator  ← (NEW CRITICAL LAYER)
        - still detection
        - calibration block
        - bias estimation
        - correction
        ↓
    CalibratedFusedSample
        ↓
    MotionSessionBuffer
        ↓
    MotionAnalyzer
        ↓
    Metrics / UI / Feedback
*/


const DebugBlock = ({
    title,
    data,
}: {
    title: string;
    data: any;
}) => {
    if (!data) return null;

    return (
        <View style={styles.card}>
            <Text style={[styles.subtitle, { color: "white" }]}>{title}</Text>

            <Text style={styles.mono}>
                {JSON.stringify(data, null, 2)}
            </Text>
        </View>
    );
};

export default function MotionDebugScreen() {
    // WS
    const {
        status,
        isConnected,
        latestSample,
        sampleCount,
        lastPacketAt,
        error,
        connect,
        disconnect,
        subscribeSample,
        sendCommand,
    } = useMotionDevice();
    const [recent, setRecent] = useState<FusedSample[]>([]);
    const sampleCounterRef = useRef(0);
    const lastProcessedRef = useRef(0);




    // CALIBRATION
    const calibrator = useMemo(() => new MotionCalibrator(), []);
    const biasEstimator = useMemo(() => new MotionBiasEstimator(), []);
    const applier = useMemo(() => new MotionCalibrationApplier(), []);




    // ANALYSER
    const analyzer = useMemo(() => createAnalyzerAndCfg(), []);
    const [debug, setDebug] = useState<any>(null);
    const [calibDebug, setCalibDebug] = useState<any>(null);
    useEffect(() => {
        const unsub = subscribeSample((sample) => {
            sampleCounterRef.current += 1;
            if (recorderRef.current.getState() === "recording") {
                recorderRef.current.push(sample);
                setLiveSessionSampleCount(recorderRef.current.getSampleCount());
                setLiveSessionDurationS(recorderRef.current.getDurationSeconds());
            }
            setRecent((prev) => [...prev, sample].slice(-100));
        });

        return unsub;
    }, [subscribeSample]);





    // MAIN PIPELINE (PHASE 1-3 + ANALYZER)
    const STEP = 75;
    const MIN_SAMPLES = 20;
    useEffect(() => {
        const total = sampleCounterRef.current;
        if (recent.length < MIN_SAMPLES) return;
        if (total - lastProcessedRef.current < STEP) return;
        lastProcessedRef.current = total;
        const ordered = [...recent].sort((a, b) => a.t_ms - b.t_ms);




        // ----------------------------
        // PHASE 1
        // ----------------------------
        const phase1 = calibrator.runPhase1(ordered);
        let phase2 = null;
        let phase3 = null;
        let calibratedSamples = ordered;




        // ----------------------------
        // PHASE 2 + 3 only if valid block
        // ----------------------------
        if (phase1.success && phase1.calibrationBlock) {
            phase2 = biasEstimator.estimate({
                samples: phase1.samples,
                calibrationBlock: phase1.calibrationBlock,
            });

            phase3 = applier.apply({
                samples: phase1.samples,
                biasEstimate: phase2,
            });

            calibratedSamples = phase3.samples;
        }




        // ----------------------------
        // ANALYZER (on calibrated stream)
        // ----------------------------
        const result = analyzer.analyze(calibratedSamples, { debug: true });
        setDebug(result);
        setCalibDebug({
            phase1,
            phase2,
            phase3,
        });
    }, [recent, analyzer, calibrator, biasEstimator, applier]);





    // LOGGING
    useEffect(() => {
        return;
        if (!debug) return;

        console.log("=== ANALYZER ===");
        console.log(JSON.stringify(debug.summary, null, 2));
    }, [debug]);
    useEffect(() => {
        return;
        if (!calibDebug) return;

        console.log("=== CALIBRATION ===");

        console.log("Phase1:", {
            success: calibDebug.phase1?.success,
            block: calibDebug.phase1?.calibrationBlock,
        });

        console.log("Phase2:", {
            bias: calibDebug.phase2?.gyro_bias,
            confidence: calibDebug.phase2?.quality?.overallConfidence,
            warnings: calibDebug.phase2?.warnings,
        });

        console.log("Phase3:", {
            applied: calibDebug.phase3?.applied,
            warnings: calibDebug.phase3?.warnings,
        });
    }, [calibDebug]);
    const analyzerDebugUI = debug
        ? {
            rep_count: debug.summary?.rep_count,
            candidate_rep_count: debug.summary?.candidate_rep_count,
            kept_rep_count: debug.summary?.kept_rep_count,
            dominant_axis: debug.summary?.dominant_axis,
            duration_s: debug.summary?.duration_s,
            accel_mag: debug.summary?.mean_accel_magnitude,
            gyro_mag: debug.summary?.mean_gyro_magnitude,
            clean_block: debug.summary?.calibration_like_clean_block_found,
        }
        : null;

    const calibrationDebugUI = calibDebug
        ? {
            phase1: {
                success: calibDebug.phase1?.success,
                has_block: !!calibDebug.phase1?.calibrationBlock,
            },
            phase2: {
                bias: calibDebug.phase2?.gyro_bias,
                confidence: calibDebug.phase2?.quality?.overallConfidence,
                warnings: calibDebug.phase2?.warnings,
            },
            phase3: {
                applied: calibDebug.phase3?.applied,
                warnings: calibDebug.phase3?.warnings,
            },
        }
        : null;





    // FULL CALIBRATION PIPELINE
    const recorderRef = useRef(new MotionCalibrationSessionRecorder());
    const pipelineRef = useRef(new MotionCalibrationSessionPipeline());

    const [recorderState, setRecorderState] = useState<"idle" | "recording" | "stopped">("idle");
    const [liveSessionSampleCount, setLiveSessionSampleCount] = useState(0);
    const [liveSessionDurationS, setLiveSessionDurationS] = useState(0);

    const [lastRecording, setLastRecording] = useState<CalibrationSessionRecording | null>(null);
    const [sessionResult, setSessionResult] = useState<CalibrationSessionResult | null>(null);

    const handleStartCalibration = () => {
        recorderRef.current.start();
        setRecorderState("recording");
        setLiveSessionSampleCount(0);
        setLiveSessionDurationS(0);
        setLastRecording(null);
        setSessionResult(null);
    };

    const handleStopCalibration = () => {
        const recording = recorderRef.current.stop();
        const result = pipelineRef.current.run({ recording });

        setRecorderState("stopped");
        setLastRecording(recording);
        setSessionResult(result);
        setLiveSessionSampleCount(recording.sample_count);
        setLiveSessionDurationS(recording.duration_s);

        console.log("=== CALIBRATION SESSION RECORDING ===");
        console.log(JSON.stringify(recording, null, 2));

        console.log("=== CALIBRATION SESSION RESULT ===");
        console.log(JSON.stringify(result, null, 2));
    };

    const handleResetCalibration = () => {
        recorderRef.current.reset();
        setRecorderState("idle");
        setLiveSessionSampleCount(0);
        setLiveSessionDurationS(0);
        setLastRecording(null);
        setSessionResult(null);
    };








    // UI
    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* title */}
            <Text style={[styles.title, { color: "white" }]}>
                Motion Debug (Calibration)
            </Text>




            {/* connection */}
            <View style={styles.row}>
                <Pressable style={styles.button} onPress={connect}>
                    <Text style={styles.buttonText}>Connect</Text>
                </Pressable>

                <Pressable style={styles.button} onPress={disconnect}>
                    <Text style={styles.buttonText}>Disconnect</Text>
                </Pressable>
            </View>




            {/* status */}
            <View style={styles.card}>
                <Text style={styles.label}>Status: {status}</Text>
                <Text style={styles.label}>Connected: {String(isConnected)}</Text>
                <Text style={styles.label}>Sample count: {sampleCount}</Text>
            </View>




            {/* status */}
            <View style={styles.card}>
                <Text style={[styles.subtitle, { color: "white" }]}>
                    Offline Calibration Session
                </Text>

                <View style={styles.row}>
                    <Pressable
                        style={styles.button}
                        onPress={handleStartCalibration}
                        disabled={recorderState === "recording"}
                    >
                        <Text style={styles.buttonText}>Start calibration</Text>
                    </Pressable>

                    <Pressable
                        style={styles.button}
                        onPress={handleStopCalibration}
                        disabled={recorderState !== "recording"}
                    >
                        <Text style={styles.buttonText}>Stop calibration</Text>
                    </Pressable>
                </View>

                <View style={{ height: 12 }} />

                <Pressable style={styles.button} onPress={handleResetCalibration}>
                    <Text style={styles.buttonText}>Reset</Text>
                </Pressable>

                <View style={{ height: 12 }} />

                <Text style={styles.label}>Recorder state: {recorderState}</Text>
                <Text style={styles.label}>Session samples: {liveSessionSampleCount}</Text>
                <Text style={styles.label}>Session duration: {liveSessionDurationS.toFixed(2)} s</Text>

                <View style={{ height: 12 }} />

                <DebugBlock
                    title="Session Result"
                    data={
                        sessionResult
                            ? {
                                success: sessionResult.success,
                                dominant_axis: sessionResult.dominant_axis,
                                valid_rep_count: sessionResult.stats?.valid_rep_count,
                                mean_duration_s: sessionResult.stats?.mean_duration_s,
                                mean_rom_deg: sessionResult.stats?.mean_rom_deg,
                                quality_score: sessionResult.quality?.overall_score,
                                rejection_reasons: sessionResult.rejection_reasons,
                            }
                            : null
                    }
                />
            </View>




            {/* summary */}
            <View style={styles.card}>
                <Text style={[styles.subtitle, { color: "white" }]}>Calibration</Text>


                <View style={[]}>
                    <Text style={[styles.label, { color: "white" }]}>Still block:</Text>
                    <Text style={styles.mono}>
                        {String(!!calibDebug?.phase1?.calibrationBlock)}
                    </Text>
                </View>


                <View style={[]}>
                    <Text style={[styles.label, { color: "white" }]}>Gyro bias:{" "}</Text>
                    <Text style={styles.mono}>
                        {calibDebug?.phase2?.gyro_bias
                            ? JSON.stringify(calibDebug.phase2.gyro_bias, null, 2)
                            : "—"}
                    </Text>
                </View>


                <View style={[]}>
                    <Text style={[styles.label, { color: "white" }]}>Confidence:{" "}</Text>
                    <Text style={styles.mono}>
                        {Number(calibDebug?.phase2?.quality?.overallConfidence).toFixed(4) ?? "—"}
                    </Text>
                </View>


                <View style={[]}>
                    <Text style={[styles.label, { color: "white" }]}>Applied gyro:</Text>
                    <Text style={styles.mono}>
                        {String(calibDebug?.phase3?.applied?.gyro)}
                    </Text>
                </View>


                <View style={[]}>
                    <Text style={[styles.label, { color: "white" }]}>Warnings:{" "}</Text>
                    <Text style={styles.mono}>
                        {calibDebug?.phase3?.warnings?.join(", ") ?? "—"}
                    </Text>
                </View>
            </View>




            {/* reps */}
            <View style={styles.card}>
                <DebugBlock title="Analyzer Debug" data={analyzerDebugUI} />
                <DebugBlock title="Calibration Debug" data={calibrationDebugUI} />
            </View>



            {/* latest sample */}
            {/* <View style={styles.card}>
                <Text style={[styles.subtitle, { color: "white" }]}>Latest sample</Text>
                <Text style={styles.mono}>
                    {latestSample ? JSON.stringify(latestSample, null, 2) : "No sample yet"}
                </Text>
            </View> */}
        </ScrollView>
    );
}
const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
    },
    subtitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 8,
    },
    row: {
        flexDirection: "row",
        gap: 12,
    },
    button: {
        backgroundColor: "#222",
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 10,
    },
    buttonText: {
        color: "white",
        fontWeight: "700",
    },
    card: {
        backgroundColor: "#111",
        padding: 14,
        borderRadius: 12,
    },
    label: {
        color: "white",
        marginBottom: 6,
    },
    mono: {
        color: "#9fe7b8",
        fontFamily: "monospace",
        marginBottom: 6,
    },
});
