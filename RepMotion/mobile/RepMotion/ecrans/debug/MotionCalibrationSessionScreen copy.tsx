// imports
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
// hooks
import { useMotionDevice } from "../../api/query/hooks/useMotionDevice";
// models
import { FusedSample } from "../../models/motionTypes";
import type {
    CalibrationSessionRecording,
    CalibrationSessionResult,
} from "../../models/motionCalibrationSessionTypes";
import type {
    MotionCalibrationSessionControllerSnapshot,
} from "../../motion/MotionCalibrationSessionController";
// classes
import { MotionCalibrationSessionRecorder } from "../../motion/motionCalibrationSessionRecorder";
import { MotionCalibrationSessionPipeline } from "../../motion/motionCalibrationSessionPipeline";
import { MotionCalibrationSessionController } from "../../motion/MotionCalibrationSessionController";


type RecorderUiState = "idle" | "recording" | "stopped";

function DebugBlock({
    title,
    data,
}: {
    title: string;
    data: unknown;
}) {
    return (
        <View>
            <Text style={styles.subtitle}>{title}</Text>
            <Text style={styles.mono}>
                {data ? JSON.stringify(data, null, 2) : "—"}
            </Text>
        </View>
    );
}

function round(x: unknown, digits = 4): number | null {
    if (typeof x !== "number" || !Number.isFinite(x)) return null;
    const p = Math.pow(10, digits);
    return Math.round(x * p) / p;
}

export default function MotionCalibrationSessionScreen() {
    // DEVICE STREAM
    const {
        status,
        isConnected,
        latestSample,
        sampleCount,
        connect,
        disconnect,
        subscribeSample,
    } = useMotionDevice();




    // OFFLINE CALIBRATION SESSION
    const recorderRef = useRef(new MotionCalibrationSessionRecorder());
    const pipelineRef = useRef(new MotionCalibrationSessionPipeline());

    const [recorderState, setRecorderState] = useState<RecorderUiState>("idle");
    const [liveSessionSampleCount, setLiveSessionSampleCount] = useState(0);
    const [liveSessionDurationS, setLiveSessionDurationS] = useState(0);

    const [lastRecording, setLastRecording] = useState<CalibrationSessionRecording | null>(null);
    const [sessionResult, setSessionResult] = useState<CalibrationSessionResult | null>(null);

    const [recent, setRecent] = useState<FusedSample[]>([]);






    // STREAM SUBSCRIPTION
    useEffect(() => {
        const unsub = subscribeSample((sample) => {
            // keep a small rolling debug buffer for UI visibility
            setRecent((prev) => [...prev, sample].slice(-120));

            // push into offline recorder only when active
            if (recorderRef.current.getState() === "recording") {
                recorderRef.current.push(sample);
                setLiveSessionSampleCount(recorderRef.current.getSampleCount());
                setLiveSessionDurationS(recorderRef.current.getDurationSeconds());
            }
        });

        return unsub;
    }, [subscribeSample]);





    // ACTIONS
    const handleStartCalibration = () => {
        recorderRef.current.start();
        setRecorderState("recording");
        setLiveSessionSampleCount(0);
        setLiveSessionDurationS(0);
        setLastRecording(null);
        setSessionResult(null);

        console.log("=== CALIBRATION SESSION STARTED ===");
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

        console.log("=== CALIBRATION SESSION RESET ===");
    };




    // DERIVED UI DATA
    const sessionSummaryUI = useMemo(() => {
        if (!sessionResult) return null;

        return {
            success: sessionResult.success,
            dominant_axis: sessionResult.dominant_axis,
            valid_rep_count: sessionResult.stats?.valid_rep_count ?? 0,
            candidate_rep_count: sessionResult.stats?.candidate_rep_count ?? 0,
            mean_duration_s: round(sessionResult.stats?.mean_duration_s),
            std_duration_s: round(sessionResult.stats?.std_duration_s),
            mean_rom_deg: round(sessionResult.stats?.mean_rom_deg),
            std_rom_deg: round(sessionResult.stats?.std_rom_deg),
            mean_peak_velocity_deg_s: round(sessionResult.stats?.mean_peak_velocity_deg_s),
            mean_off_axis_ratio: round(sessionResult.stats?.mean_off_axis_ratio),
            mean_velocity_irregularity: round(sessionResult.stats?.mean_velocity_irregularity),
            quality_score: round(sessionResult.quality?.overall_score),
            rejection_reasons: sessionResult.rejection_reasons,
        };
    }, [sessionResult]);

    const templateSummaryUI = useMemo(() => {
        if (!sessionResult?.template) return null;

        return {
            axis_name: sessionResult.template.axis_name,
            normalize_points: sessionResult.template.normalize_points,
            angle_mean_len: sessionResult.template.angle_mean.length,
            angle_std_len: sessionResult.template.angle_std.length,
            velocity_mean_len: sessionResult.template.velocity_mean.length,
            velocity_std_len: sessionResult.template.velocity_std.length,
            angle_mean_preview: sessionResult.template.angle_mean.slice(0, 10).map(round),
            angle_std_preview: sessionResult.template.angle_std.slice(0, 10).map(round),
            velocity_mean_preview: sessionResult.template.velocity_mean.slice(0, 10).map(round),
        };
    }, [sessionResult]);

    const debugSummaryUI = useMemo(() => {
        if (!sessionResult?.debug) return null;

        return {
            axis_scores: sessionResult.debug.axis_scores,
            dominant_axis_margin_ratio: round(sessionResult.debug.dominant_axis_margin_ratio),
            all_candidates: sessionResult.debug.all_candidates.length,
            accepted_candidates: sessionResult.debug.accepted_candidates.length,
            kept_candidates: sessionResult.debug.kept_candidates.length,
            selected_signal_len: sessionResult.debug.selected_signal_deg.length,
            selected_velocity_len: sessionResult.debug.selected_velocity_deg_s.length,
            selected_gyro_mag_len: sessionResult.debug.selected_gyro_mag.length,
        };
    }, [sessionResult]);

    const recordingSummaryUI = useMemo(() => {
        return {
            recorder_state: recorderState,
            session_sample_count: liveSessionSampleCount,
            session_duration_s: round(liveSessionDurationS),
            last_recording_sample_count: lastRecording?.sample_count ?? 0,
            last_recording_duration_s: round(lastRecording?.duration_s),
        };
    }, [recorderState, liveSessionSampleCount, liveSessionDurationS, lastRecording]);




    // UI
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Motion Calibration Session</Text>

            {/* CONNECTION */}
            <View style={styles.card}>
                <Text style={styles.subtitle}>Connection</Text>

                <View style={styles.row}>
                    <Pressable style={styles.button} onPress={connect}>
                        <Text style={styles.buttonText}>Connect</Text>
                    </Pressable>

                    <Pressable style={styles.button} onPress={disconnect}>
                        <Text style={styles.buttonText}>Disconnect</Text>
                    </Pressable>
                </View>

                <View style={styles.spacer8} />

                <Text style={styles.label}>Status: {status}</Text>
                <Text style={styles.label}>Connected: {String(isConnected)}</Text>
                <Text style={styles.label}>Global stream sample count: {sampleCount}</Text>
            </View>

            {/* CALIBRATION SESSION CONTROLS */}
            <View style={styles.card}>
                <Text style={styles.subtitle}>Calibration Session Controls</Text>

                <View style={styles.rowWrap}>
                    <Pressable
                        style={[
                            styles.button,
                            recorderState === "recording" && styles.buttonDisabled,
                        ]}
                        onPress={handleStartCalibration}
                        disabled={recorderState === "recording"}
                    >
                        <Text style={styles.buttonText}>Start calibration</Text>
                    </Pressable>

                    <Pressable
                        style={[
                            styles.button,
                            recorderState !== "recording" && styles.buttonDisabled,
                        ]}
                        onPress={handleStopCalibration}
                        disabled={recorderState !== "recording"}
                    >
                        <Text style={styles.buttonText}>Stop calibration</Text>
                    </Pressable>

                    <Pressable style={styles.buttonSecondary} onPress={handleResetCalibration}>
                        <Text style={styles.buttonText}>Reset</Text>
                    </Pressable>
                </View>

                <View style={styles.spacer12} />

                <Text style={styles.label}>Recorder state: {recorderState}</Text>
                <Text style={styles.label}>Session samples: {liveSessionSampleCount}</Text>
                <Text style={styles.label}>
                    Session duration: {round(liveSessionDurationS)} s
                </Text>
            </View>

            {/* SESSION RECORDING */}
            <View style={styles.card}>
                <DebugBlock title="Recording Summary" data={recordingSummaryUI} />
            </View>

            {/* RESULT */}
            <View style={styles.card}>
                <DebugBlock title="Calibration Session Result" data={sessionSummaryUI} />
            </View>

            {/* TEMPLATE */}
            <View style={styles.card}>
                <DebugBlock title="Template Summary" data={templateSummaryUI} />
            </View>

            {/* DEBUG */}
            <View style={styles.card}>
                <DebugBlock title="Session Debug" data={debugSummaryUI} />
            </View>

            {/* LAST SAMPLE */}
            <View style={styles.card}>
                <DebugBlock
                    title="Latest Sample"
                    data={latestSample ? latestSample : { message: "No sample yet" }}
                />
            </View>

            {/* RECENT BUFFER */}
            <View style={styles.card}>
                <Text style={styles.subtitle}>Recent Stream</Text>
                <Text style={styles.mono}>Buffered samples: {recent.length}</Text>
            </View>
        </ScrollView>
    );
}
const styles = StyleSheet.create({
    container: {
        padding: 16,
        gap: 16,
        backgroundColor: "#000",
    },
    title: {
        fontSize: 24,
        fontWeight: "800",
        color: "white",
    },
    subtitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 8,
        color: "white",
    },
    row: {
        flexDirection: "row",
        gap: 12,
    },
    rowWrap: {
        flexDirection: "row",
        gap: 12,
        flexWrap: "wrap",
    },
    button: {
        backgroundColor: "#222",
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 10,
    },
    buttonSecondary: {
        backgroundColor: "#333",
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 10,
    },
    buttonDisabled: {
        opacity: 0.45,
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
    spacer8: {
        height: 8,
    },
    spacer12: {
        height: 12,
    },
});
