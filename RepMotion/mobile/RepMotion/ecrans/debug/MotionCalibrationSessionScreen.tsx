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
    AnalyzerDebugResult,
    AxisName,
    RepCandidate,
} from "../../models/motionAnalyzerTypes";
import type {
    CalibrationSessionRecording,
    CalibrationSessionResult,
} from "../../models/motionCalibrationSessionTypes";
import type {
    MotionCalibrationSessionControllerSnapshot,
} from "../../motion/MotionCalibrationSessionController";
// stores
import { useDeviceStore } from "../../store/deviceStore";
// classes
import { MotionAnalyzer } from "../../motion/motionAnalyzer";
import { MotionCalibrationSessionController } from "../../motion/MotionCalibrationSessionController";




// ============================================================
// LIVE DETECTION TYPES
// ============================================================
type LiveCalibrationProfile = {
    axis_name: AxisName;
    normalize_points: number;
    angle_mean: number[];
    angle_std: number[];
    velocity_mean: number[];
    velocity_std: number[];
    mean_duration_s: number;
    mean_rom_deg: number;
    min_match_score: number;
    min_rep_gap_ms: number;
};

type LiveRepEvent = {
    rep_index: number;
    axis_name: AxisName;
    start_ms: number;
    end_ms: number;
    duration_s: number;
    rom_deg: number;
    peak_velocity_deg_s: number;
    match_score: number;
    angle_score: number;
    velocity_score: number;
    duration_score: number;
    rom_score: number;
};

type LiveDetectionState = {
    enabled: boolean;
    total_reps: number;
    last_reason: string;
    last_match_score: number | null;
    last_axis: AxisName | null;
    last_rep: LiveRepEvent | null;
};

// ============================================================
// UI HELPERS
// ============================================================
function getCalibrationUI(
    state: MotionCalibrationSessionControllerSnapshot["state"] | "completed" | "failed",
    snap: MotionCalibrationSessionControllerSnapshot,
    result: CalibrationSessionResult | null
) {
    void snap;
    void result;

    switch (state) {
        case "waiting_for_stillness":
            return { title: "⏳ WAITING", action: "Hold still..." };
        case "ready_for_reps":
            return { title: "✅ READY", action: "Start reps now" };
        case "recording_reps":
            return { title: "🏋️ RECORDING", action: "Keep going..." };
        case "processing":
            return { title: "⚙️ PROCESSING", action: "Analyzing..." };
        case "completed":
            return { title: "✅ SUCCESS", action: "Calibration captured" };
        case "failed":
            return { title: "❌ FAILED", action: "Retry calibration" };
        default:
            return { title: "IDLE", action: "Start calibration" };
    }
}

function CalibrationStatusCard({
    snap,
    result,
}: {
    snap: MotionCalibrationSessionControllerSnapshot;
    result: CalibrationSessionResult | null;
}) {
    const derivedSuccess = result?.success === true;
    const derivedFailure = result?.success === false;

    const ui = getCalibrationUI(
        derivedSuccess
            ? "completed"
            : derivedFailure
                ? "failed"
                : snap.state,
        snap,
        result
    );

    return (
        <View style={styles.calibCard}>
            <Text style={styles.calibTitle}>{ui.title}</Text>
            <Text style={styles.calibAction}>{ui.action}</Text>

            <View style={styles.calibRow}>
                <Text style={styles.calibLabel}>
                    Stillness: {snap.stillness_locked ? "✔" : "…"}
                </Text>

                <Text style={styles.calibLabel}>
                    Reps: {snap.rep_start_detected ? "✔" : "…"}
                </Text>
            </View>

            {(snap.state === "recording_reps" || snap.state === "processing") && (
                <Text style={styles.calibSmall}>
                    Duration: {round(snap.duration_s)}s
                </Text>
            )}

            {result?.template && (
                <Text style={styles.calibSmall}>
                    Template: ready
                </Text>
            )}

            {derivedSuccess && result && (
                <>
                    <Text style={styles.calibResult}>
                        Reps: {result.stats?.valid_rep_count ?? 0}
                    </Text>

                    <Text style={styles.calibResult}>
                        Quality: {round(result.quality?.overall_score)}
                    </Text>
                </>
            )}

            {derivedFailure && result && (
                <Text style={styles.calibError}>
                    {(result.rejection_reasons ?? []).join(", ") || snap.error || "Calibration failed"}
                </Text>
            )}
        </View>
    );
}

function LiveDetectionCard({
    live,
    profile,
}: {
    live: LiveDetectionState;
    profile: LiveCalibrationProfile | null;
}) {
    return (
        <View style={styles.calibCard}>
            <Text style={styles.calibTitle}>
                {live.enabled ? "🎯 LIVE DETECTION ON" : "🎯 LIVE DETECTION OFF"}
            </Text>

            <Text style={styles.calibAction}>
                {profile
                    ? `Axis: ${profile.axis_name} • Reps: ${live.total_reps}`
                    : "No calibration profile"}
            </Text>

            <View style={styles.calibRow}>
                <Text style={styles.calibLabel}>
                    Match: {live.last_match_score != null ? round(live.last_match_score) : "—"}
                </Text>

                <Text style={styles.calibLabel}>
                    Axis: {live.last_axis ?? "—"}
                </Text>
            </View>

            <Text style={styles.calibSmall}>
                {live.last_reason || "Waiting for motion..."}
            </Text>

            {live.last_rep && (
                <>
                    <Text style={styles.calibResult}>
                        Last rep #{live.last_rep.rep_index}
                    </Text>
                    <Text style={styles.calibSmall}>
                        dur={round(live.last_rep.duration_s)}s • rom={round(live.last_rep.rom_deg)}° • peak={round(live.last_rep.peak_velocity_deg_s)}
                    </Text>
                </>
            )}
        </View>
    );
}

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
                {data ? JSON.stringify(data, null, 2) : "-"}
            </Text>
        </View>
    );
}

function round(x: unknown, digits = 4): number | null {
    if (typeof x !== "number" || !Number.isFinite(x)) return null;
    const p = Math.pow(10, digits);
    return Math.round(x * p) / p;
}

// ============================================================
// MAIN SCREEN
// ============================================================
export default function MotionCalibrationSessionScreen() {
    // DEVICE STORE
    const networkName = useDeviceStore((s) => s.networkName);
    const esp32Ip = useDeviceStore((s) => s.esp32Ip);
    const port = useDeviceStore((s) => s.port);
    const autoConnect = useDeviceStore((s) => s.autoConnect);

    const isConnectedStore = useDeviceStore((s) => s.isConnected);
    const statusStore = useDeviceStore((s) => s.status);
    const wsUrl = useDeviceStore((s) => s.wsUrl());

    const setNetworkName = useDeviceStore((s) => s.setNetworkName);
    const setEsp32Ip = useDeviceStore((s) => s.setEsp32Ip);
    const setPort = useDeviceStore((s) => s.setPort);
    const setAutoConnect = useDeviceStore((s) => s.setAutoConnect);

    const setConnecting = useDeviceStore((s) => s.setConnecting);
    const setConnected = useDeviceStore((s) => s.setConnected);
    const setDisconnected = useDeviceStore((s) => s.setDisconnected);
    const setErrorStore = useDeviceStore((s) => s.setError);
    const setLastMessageAt = useDeviceStore((s) => s.setLastMessageAt);




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
    const handleConnect = () => {
        if (isConnected) {
            disconnect();
            return;
        }

        setConnecting();
        connect(wsUrl);
    };




    // CALIBRATION SESSION CONTROLLER
    const controllerRef = useRef(
        new MotionCalibrationSessionController({
            recentStillnessMaxSamples: 120,
            nonStillSamplesToStartReps: 2,
            sessionPipeline: {
                minValidReps: 5,
                minRepDurationS: 1.2,
                maxRepDurationS: 3.5,
                minRepRomDeg: 10,
                maxOffAxisRatio: 0.75,
                maxVelocityIrregularity: 0.35,
                maxGapBetweenRepsS: 1.25,
                minAxisScoreMarginRatio: 0.2,
                maxDurationCv: 0.2,
                maxRomCv: 0.2,
                analyzer: {
                    smoothingWindow: 3,
                    minExtremaPromDeg: 1.5,
                    minRepDurationS: 1.2,
                    maxRepDurationS: 3.5,
                    minRepRomDeg: 10,
                    minPeakVelocityDegS: 8,
                    maxOffAxisRatio: 0.75,
                    maxGapBetweenRepsS: 1.25,
                    enableYawAxis: false,
                },
            },
        })
    );

    // LIVE ANALYZER
    const liveAnalyzerRef = useRef(
        new MotionAnalyzer({
            smoothingWindow: 3,
            minExtremaPromDeg: 1.5,
            minRepDurationS: 1.0,
            maxRepDurationS: 4.0,
            minRepRomDeg: 8,
            minPeakVelocityDegS: 6,
            maxOffAxisRatio: 1.25,
            maxGapBetweenRepsS: 1.25,
            enableYawAxis: false,
        })
    );

    // SCREEN STATE
    const [lastRecording, setLastRecording] = useState<CalibrationSessionRecording | null>(null);
    const [sessionResult, setSessionResult] = useState<CalibrationSessionResult | null>(null);
    const [recent, setRecent] = useState<FusedSample[]>([]);
    const [sessionSnap, setSessionSnap] =
        useState<MotionCalibrationSessionControllerSnapshot>(
            controllerRef.current.getSnapshot()
        );

    // FORCE-ACCEPTED CALIBRATION FOR LIVE TESTING
    const [activeCalibration, setActiveCalibration] = useState<LiveCalibrationProfile | null>(null);
    const [live, setLive] = useState<LiveDetectionState>({
        enabled: false,
        total_reps: 0,
        last_reason: "No calibration profile",
        last_match_score: null,
        last_axis: null,
        last_rep: null,
    });

    // REFS FOR LIVE DETECTION
    const liveRecentRef = useRef<FusedSample[]>([]);
    const liveTickRef = useRef(0);
    const lastAcceptedRepEndMsRef = useRef<number | null>(null);
    const liveRepCountRef = useRef(0);

    // STREAM SUBSCRIPTION
    useEffect(() => {
        const unsub = subscribeSample((sample) => {
            // keep UI recent buffer
            setRecent((prev) => [...prev, sample].slice(-120));

            // keep detector rolling buffer
            const nextLiveRecent = [...liveRecentRef.current, sample].slice(-180);
            liveRecentRef.current = nextLiveRecent;

            // push into calibration controller
            const snap = controllerRef.current.push(sample);
            setSessionSnap(snap);

            // run live detection only if we force-accepted a calibration profile
            if (activeCalibration && live.enabled) {
                maybeRunLiveDetection({
                    samples: nextLiveRecent,
                    profile: activeCalibration,
                    analyzer: liveAnalyzerRef.current,
                    onAccepted: (rep) => {
                        liveRepCountRef.current += 1;
                        lastAcceptedRepEndMsRef.current = rep.end_ms;

                        setLive({
                            enabled: true,
                            total_reps: liveRepCountRef.current,
                            last_reason: "Rep accepted",
                            last_match_score: rep.match_score,
                            last_axis: rep.axis_name,
                            last_rep: {
                                ...rep,
                                rep_index: liveRepCountRef.current,
                            },
                        });
                    },
                    onRejected: (reason, axis, score) => {
                        setLive((prev) => ({
                            ...prev,
                            last_reason: reason,
                            last_match_score: score,
                            last_axis: axis,
                        }));
                    },
                    lastAcceptedRepEndMsRef,
                    liveTickRef,
                });
            }
        });

        return unsub;
    }, [subscribeSample, activeCalibration, live.enabled]);

    // ACTIONS
    const handleStartCalibration = () => {
        const snap = controllerRef.current.start();

        setSessionSnap(snap);
        setLastRecording(null);
        setSessionResult(null);

        console.log("=== CALIBRATION SESSION STARTED ===");
    };

    const handleStopCalibration = () => {
        const out = controllerRef.current.stop();

        setSessionSnap(out.snapshot);
        setLastRecording(out.recording);
        setSessionResult(out.result);

        // FORCE-ACCEPT TEST PATH:
        // if template exists, arm live detection even if result.success === false
        const forcedProfile = buildLiveCalibrationProfile(out.result);

        setActiveCalibration(forcedProfile);
        liveRepCountRef.current = 0;
        lastAcceptedRepEndMsRef.current = null;

        setLive({
            enabled: !!forcedProfile,
            total_reps: 0,
            last_reason: forcedProfile
                ? "Calibration loaded. Move to test live detection."
                : "Calibration template missing",
            last_match_score: null,
            last_axis: forcedProfile?.axis_name ?? null,
            last_rep: null,
        });

        console.log("STOP_UI_CHECK", {
            snapshotState: out.snapshot.state,
            snapshotError: out.snapshot.error ?? null,
            resultSuccess: out.result?.success ?? null,
            rejectionReasons: out.result?.rejection_reasons ?? [],
            liveProfileLoaded: !!forcedProfile,
        });
    };

    const handleResetCalibration = () => {
        const snap = controllerRef.current.reset();

        setSessionSnap(snap);
        setLastRecording(null);
        setSessionResult(null);
        setRecent([]);

        setActiveCalibration(null);
        liveRecentRef.current = [];
        liveTickRef.current = 0;
        lastAcceptedRepEndMsRef.current = null;
        liveRepCountRef.current = 0;

        setLive({
            enabled: false,
            total_reps: 0,
            last_reason: "Reset",
            last_match_score: null,
            last_axis: null,
            last_rep: null,
        });

        console.log("=== CALIBRATION SESSION RESET ===");
    };

    const handleToggleLiveDetection = () => {
        if (!activeCalibration) return;

        setLive((prev) => ({
            ...prev,
            enabled: !prev.enabled,
            last_reason: !prev.enabled ? "Live detection armed" : "Live detection paused",
        }));
    };

    const handleClearLiveCount = () => {
        liveRepCountRef.current = 0;
        lastAcceptedRepEndMsRef.current = null;

        setLive((prev) => ({
            ...prev,
            total_reps: 0,
            last_reason: "Live count cleared",
            last_match_score: null,
            last_rep: null,
        }));
    };

    // DERIVED UI DATA
    const controllerSummaryUI = useMemo(() => {
        return {
            state: sessionSnap.state,
            stillness_locked: sessionSnap.stillness_locked,
            ready_for_reps: sessionSnap.ready_for_reps,
            rep_start_detected: sessionSnap.rep_start_detected,
            session_sample_count: sessionSnap.sample_count,
            session_duration_s: round(sessionSnap.duration_s),
            locked_stillness_start_ms: sessionSnap.locked_stillness_start_ms ?? null,
            locked_stillness_end_ms: sessionSnap.locked_stillness_end_ms ?? null,
            rep_start_ms: sessionSnap.rep_start_ms ?? null,
            stop_reason: sessionSnap.stop_reason ?? null,
            error: sessionSnap.error ?? null,
        };
    }, [sessionSnap]);

    const phase1SummaryUI = useMemo(() => {
        if (!sessionSnap.phase1) return null;

        return {
            success: sessionSnap.phase1.success,
            sample_hz: round(sessionSnap.phase1.debug.sampleHz),
            still_segment_count: sessionSnap.phase1.debug.segments?.length ?? 0,
            calibration_block: sessionSnap.phase1.calibrationBlock
                ? {
                    start_idx: sessionSnap.phase1.calibrationBlock.startIndex,
                    end_idx: sessionSnap.phase1.calibrationBlock.endIndex,
                    start_ms: sessionSnap.phase1.calibrationBlock.startMs,
                    end_ms: sessionSnap.phase1.calibrationBlock.endMs,
                    duration_ms: sessionSnap.phase1.calibrationBlock.durationMs,
                    score: round(sessionSnap.phase1.calibrationBlock.score),
                }
                : null,
            reason: sessionSnap.phase1.reason ?? [],
        };
    }, [sessionSnap]);

    const phase2SummaryUI = useMemo(() => {
        if (!sessionSnap.phase2) return null;

        return {
            success: sessionSnap.phase2.success,
            gyro_bias: sessionSnap.phase2.gyro_bias ?? null,
            overall_confidence: round(sessionSnap.phase2.quality?.overallConfidence),
            warnings: sessionSnap.phase2.warnings ?? [],
        };
    }, [sessionSnap]);

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
            rejection_reasons: sessionResult.rejection_reasons ?? [],
        };
    }, [sessionResult]);

    const liveSummaryUI = useMemo(() => {
        return {
            live_enabled: live.enabled,
            total_reps: live.total_reps,
            last_reason: live.last_reason,
            last_match_score: round(live.last_match_score),
            last_axis: live.last_axis,
            active_calibration_axis: activeCalibration?.axis_name ?? null,
            active_calibration_duration_s: round(activeCalibration?.mean_duration_s),
            active_calibration_rom_deg: round(activeCalibration?.mean_rom_deg),
            buffered_live_samples: liveRecentRef.current.length,
        };
    }, [live, activeCalibration]);

    // UI
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Motion Calibration + Live Rep Detection</Text>

            {/* CONNECTION */}
            <View style={styles.card}>
                <Text style={styles.subtitle}>Connection</Text>

                <View style={styles.row}>
                    <Pressable style={styles.button} onPress={handleConnect}>
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

            {/* CALIBRATION STATUS */}
            <CalibrationStatusCard snap={sessionSnap} result={sessionResult} />

            {/* LIVE DETECTION STATUS */}
            <LiveDetectionCard live={live} profile={activeCalibration} />

            {/* CONTROLS */}
            <View style={styles.card}>
                <Text style={styles.subtitle}>Calibration Controls</Text>

                <View style={styles.rowWrap}>
                    <Pressable
                        style={[
                            styles.button,
                            sessionSnap.state !== "idle" &&
                            sessionSnap.state !== "completed" &&
                            sessionSnap.state !== "failed" &&
                            styles.buttonDisabled,
                        ]}
                        onPress={handleStartCalibration}
                        disabled={
                            sessionSnap.state !== "idle" &&
                            sessionSnap.state !== "completed" &&
                            sessionSnap.state !== "failed"
                        }
                    >
                        <Text style={styles.buttonText}>Start calibration</Text>
                    </Pressable>

                    <Pressable
                        style={[
                            styles.button,
                            (sessionSnap.state === "idle" ||
                                sessionSnap.state === "completed" ||
                                sessionSnap.state === "failed") &&
                            styles.buttonDisabled,
                        ]}
                        onPress={handleStopCalibration}
                        disabled={
                            sessionSnap.state === "idle" ||
                            sessionSnap.state === "completed" ||
                            sessionSnap.state === "failed"
                        }
                    >
                        <Text style={styles.buttonText}>Stop calibration</Text>
                    </Pressable>

                    <Pressable style={styles.buttonSecondary} onPress={handleResetCalibration}>
                        <Text style={styles.buttonText}>Reset</Text>
                    </Pressable>
                </View>

                <View style={styles.spacer12} />

                <Text style={styles.label}>Session state: {sessionSnap.state}</Text>
                <Text style={styles.label}>Stillness locked: {String(sessionSnap.stillness_locked)}</Text>
                <Text style={styles.label}>Ready for reps: {String(sessionSnap.ready_for_reps)}</Text>
                <Text style={styles.label}>Rep start detected: {String(sessionSnap.rep_start_detected)}</Text>
                <Text style={styles.label}>Session samples: {sessionSnap.sample_count}</Text>
                <Text style={styles.label}>
                    Session duration: {round(sessionSnap.duration_s)} s
                </Text>
            </View>

            {/* LIVE DETECTOR CONTROLS */}
            <View style={styles.card}>
                <Text style={styles.subtitle}>Live Detection Controls</Text>

                <View style={styles.rowWrap}>
                    <Pressable
                        style={[
                            styles.button,
                            !activeCalibration && styles.buttonDisabled,
                        ]}
                        onPress={handleToggleLiveDetection}
                        disabled={!activeCalibration}
                    >
                        <Text style={styles.buttonText}>
                            {live.enabled ? "Pause live detect" : "Arm live detect"}
                        </Text>
                    </Pressable>

                    <Pressable style={styles.buttonSecondary} onPress={handleClearLiveCount}>
                        <Text style={styles.buttonText}>Clear rep count</Text>
                    </Pressable>
                </View>

                <View style={styles.spacer12} />

                <Text style={styles.label}>
                    Calibration loaded: {String(!!activeCalibration)}
                </Text>
                <Text style={styles.label}>
                    Live detector enabled: {String(live.enabled)}
                </Text>
                <Text style={styles.label}>
                    Live rep count: {live.total_reps}
                </Text>
            </View>

            {/* DEBUG / OPTIONAL */}
            <View style={styles.card}>
                <DebugBlock title="Controller Summary" data={controllerSummaryUI} />
            </View>

            <View style={styles.card}>
                <DebugBlock
                    title="Phase 1 / Phase 2 Status"
                    data={{
                        phase1: phase1SummaryUI,
                        phase2: phase2SummaryUI,
                    }}
                />
            </View>

            <View style={styles.card}>
                <DebugBlock title="Calibration Result" data={sessionSummaryUI} />
            </View>

            <View style={styles.card}>
                <DebugBlock title="Live Summary" data={liveSummaryUI} />
            </View>

            <View style={styles.card}>
                <DebugBlock
                    title="Latest Sample"
                    data={latestSample ? latestSample : { message: "No sample yet" }}
                />
            </View>
        </ScrollView>
    );
}

// ============================================================
// LIVE DETECTION CORE
// ============================================================
function buildLiveCalibrationProfile(
    result: CalibrationSessionResult | null
): LiveCalibrationProfile | null {
    if (!result?.template) return null;
    if (!result.dominant_axis) return null;
    if (!result.stats) return null;

    return {
        axis_name: result.dominant_axis,
        normalize_points: result.template.normalize_points,
        angle_mean: result.template.angle_mean,
        angle_std: result.template.angle_std,
        velocity_mean: result.template.velocity_mean,
        velocity_std: result.template.velocity_std,
        mean_duration_s: result.stats.mean_duration_s,
        mean_rom_deg: result.stats.mean_rom_deg,
        min_match_score: 0.58,
        min_rep_gap_ms: 700,
    };
}

function maybeRunLiveDetection(input: {
    samples: FusedSample[];
    profile: LiveCalibrationProfile;
    analyzer: MotionAnalyzer;
    onAccepted: (rep: LiveRepEvent) => void;
    onRejected: (reason: string, axis: AxisName | null, score: number | null) => void;
    lastAcceptedRepEndMsRef: React.MutableRefObject<number | null>;
    liveTickRef: React.MutableRefObject<number>;
}) {
    const {
        samples,
        profile,
        analyzer,
        onAccepted,
        onRejected,
        lastAcceptedRepEndMsRef,
        liveTickRef,
    } = input;

    if (samples.length < 24) {
        onRejected("Waiting for enough live samples", null, null);
        return;
    }

    liveTickRef.current += 1;
    if (liveTickRef.current % 3 !== 0) return;

    const analyzed = analyzer.analyze(samples, { debug: true }) as AnalyzerDebugResult;
    const detectedAxis = analyzed.detection.axis_name;

    if (detectedAxis !== profile.axis_name) {
        onRejected(`Axis mismatch (${detectedAxis})`, detectedAxis, null);
        return;
    }

    const kept = analyzed.detection.kept_reps;
    if (!kept || kept.length === 0) {
        onRejected("No kept reps in live window", detectedAxis, null);
        return;
    }

    const latest = kept[kept.length - 1];
    const absoluteEndMs = latest.end_ms;

    if (
        lastAcceptedRepEndMsRef.current != null &&
        absoluteEndMs <= lastAcceptedRepEndMsRef.current + profile.min_rep_gap_ms
    ) {
        onRejected("Rep already counted", detectedAxis, null);
        return;
    }

    const segment = samples.slice(latest.start_idx, latest.end_idx + 1);
    if (segment.length < 4) {
        onRejected("Rep segment too short", detectedAxis, null);
        return;
    }

    const normalized = normalizeRepSegment(segment, profile.axis_name, profile.normalize_points);
    const score = scoreRepAgainstTemplate({
        normalized,
        rep: latest,
        profile,
    });

    if (!score.accepted) {
        onRejected(score.reason, detectedAxis, score.overall_score);
        return;
    }

    onAccepted({
        rep_index: 0,
        axis_name: profile.axis_name,
        start_ms: latest.start_ms,
        end_ms: latest.end_ms,
        duration_s: latest.duration_s,
        rom_deg: latest.rom_deg,
        peak_velocity_deg_s: latest.peak_velocity_deg_s,
        match_score: score.overall_score,
        angle_score: score.angle_score,
        velocity_score: score.velocity_score,
        duration_score: score.duration_score,
        rom_score: score.rom_score,
    });
}

function normalizeRepSegment(
    samples: FusedSample[],
    axisName: AxisName,
    normalizePoints: number
): { angle: number[]; velocity: number[] } {
    const angleDeg = unwrapDeg(getAxisSignalDeg(samples, axisName));
    const centeredAngle = angleDeg.map((v) => v - angleDeg[0]);
    const mid = centeredAngle[Math.floor(centeredAngle.length / 2)] ?? 0;
    const polarity = Math.sign(mid) || 1;
    const orientedAngle = centeredAngle.map((v) => v * polarity);

    const timeMs = samples.map((s) => s.t_ms);
    const velocity = computeSignedVelocityDegS(timeMs, orientedAngle);
    const orientedVelocity = velocity.map((v) => v * polarity);

    return {
        angle: resampleLinear(orientedAngle, normalizePoints),
        velocity: resampleLinear(orientedVelocity.length > 0 ? orientedVelocity : [0], normalizePoints),
    };
}

function scoreRepAgainstTemplate(input: {
    normalized: { angle: number[]; velocity: number[] };
    rep: RepCandidate;
    profile: LiveCalibrationProfile;
}): {
    accepted: boolean;
    reason: string;
    overall_score: number;
    angle_score: number;
    velocity_score: number;
    duration_score: number;
    rom_score: number;
} {
    const { normalized, rep, profile } = input;

    const angleCorr = correlation(normalized.angle, profile.angle_mean);
    const velocityCorr = correlation(normalized.velocity, profile.velocity_mean);

    const angleScore = corrTo01(angleCorr);
    const velocityScore = corrTo01(velocityCorr);

    const durationScore = closenessScore(
        rep.duration_s,
        profile.mean_duration_s,
        Math.max(profile.mean_duration_s * 0.60, 0.40)
    );

    const romScore = closenessScore(
        rep.rom_deg,
        profile.mean_rom_deg,
        Math.max(profile.mean_rom_deg * 0.60, 4.0)
    );

    const overall =
        0.45 * angleScore +
        0.20 * velocityScore +
        0.20 * durationScore +
        0.15 * romScore;

    if (rep.rom_deg < Math.max(4, profile.mean_rom_deg * 0.40)) {
        return {
            accepted: false,
            reason: "ROM too small vs calibration",
            overall_score: overall,
            angle_score: angleScore,
            velocity_score: velocityScore,
            duration_score: durationScore,
            rom_score: romScore,
        };
    }

    if (overall < profile.min_match_score) {
        return {
            accepted: false,
            reason: "Template match too weak",
            overall_score: overall,
            angle_score: angleScore,
            velocity_score: velocityScore,
            duration_score: durationScore,
            rom_score: romScore,
        };
    }

    return {
        accepted: true,
        reason: "Rep accepted",
        overall_score: overall,
        angle_score: angleScore,
        velocity_score: velocityScore,
        duration_score: durationScore,
        rom_score: romScore,
    };
}

// ============================================================
// NUMERIC HELPERS
// ============================================================
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

function computeSignedVelocityDegS(timesMs: number[], angleDeg: number[]): number[] {
    const out: number[] = [];
    for (let i = 1; i < angleDeg.length; i += 1) {
        const dt = Math.max((timesMs[i] - timesMs[i - 1]) / 1000, 1e-6);
        out.push((angleDeg[i] - angleDeg[i - 1]) / dt);
    }
    return out;
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
        } else {
            const w = pos - left;
            out.push(xs[left] * (1 - w) + xs[right] * w);
        }
    }

    return out;
}

function mean(xs: number[]): number {
    if (xs.length === 0) return 0;
    let acc = 0;
    for (const x of xs) acc += x;
    return acc / xs.length;
}

function std_corr(xs: number[], mu?: number): number {
    if (xs.length <= 1) return 0;
    const m = mu ?? mean(xs);
    let acc = 0;
    for (const x of xs) {
        const d = x - m;
        acc += d * d;
    }
    return Math.sqrt(acc / xs.length);
}

function correlation(a: number[], b: number[]): number {
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

function corrTo01(x: number): number {
    return clamp01((x + 1) / 2);
}

function closenessScore(value: number, target: number, tolerance: number): number {
    const d = Math.abs(value - target);
    return 1 - clamp01(d / Math.max(tolerance, 1e-6));
}

function clamp01(x: number): number {
    return Math.max(0, Math.min(1, x));
}

// ============================================================
// STYLES
// ============================================================
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

    calibCard: {
        backgroundColor: "#111",
        padding: 16,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#222",
    },
    calibTitle: {
        color: "white",
        fontSize: 20,
        fontWeight: "800",
        marginBottom: 6,
    },
    calibAction: {
        color: "#9fe7b8",
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 10,
    },
    calibRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    calibLabel: {
        color: "#ccc",
        fontSize: 14,
    },
    calibSmall: {
        color: "#aaa",
        fontSize: 13,
    },
    calibResult: {
        color: "#9fe7b8",
        fontSize: 15,
        fontWeight: "700",
    },
    calibError: {
        color: "#ff6b6b",
        fontSize: 14,
        fontWeight: "600",
    },
});


















// function getCalibrationUI(
//     state: MotionCalibrationSessionControllerSnapshot["state"] | "completed" | "failed",
//     snap: MotionCalibrationSessionControllerSnapshot,
//     result: CalibrationSessionResult | null
// ) {
//     void snap;
//     void result;

//     switch (state) {
//         case "waiting_for_stillness":
//             return { title: "⏳ WAITING", action: "Hold still..." };

//         case "ready_for_reps":
//             return { title: "✅ READY", action: "Start reps now" };

//         case "recording_reps":
//             return { title: "🏋️ RECORDING", action: "Keep going..." };

//         case "processing":
//             return { title: "⚙️ PROCESSING", action: "Analyzing..." };

//         case "completed":
//             return { title: "✅ SUCCESS", action: "Calibration done" };

//         case "failed":
//             return { title: "❌ FAILED", action: "Retry calibration" };

//         default:
//             return { title: "IDLE", action: "Start calibration" };
//     }
// }

// function CalibrationStatusCard({
//     snap,
//     result,
// }: {
//     snap: MotionCalibrationSessionControllerSnapshot;
//     result: CalibrationSessionResult | null;
// }) {
//     const derivedSuccess = result?.success === true;
//     const derivedFailure = result?.success === false;

//     const ui = getCalibrationUI(
//         derivedSuccess
//             ? "completed"
//             : derivedFailure
//                 ? "failed"
//                 : snap.state,
//         snap,
//         result
//     );

//     return (
//         <View style={styles.calibCard}>
//             <Text style={styles.calibTitle}>{ui.title}</Text>
//             <Text style={styles.calibAction}>{ui.action}</Text>

//             <View style={styles.calibRow}>
//                 <Text style={styles.calibLabel}>
//                     Stillness: {snap.stillness_locked ? "✔" : "…"}
//                 </Text>

//                 <Text style={styles.calibLabel}>
//                     Reps: {snap.rep_start_detected ? "✔" : "…"}
//                 </Text>
//             </View>

//             {(snap.state === "recording_reps" || snap.state === "processing") && (
//                 <Text style={styles.calibSmall}>
//                     Duration: {round(snap.duration_s)}s
//                 </Text>
//             )}

//             {derivedSuccess && result && (
//                 <>
//                     <Text style={styles.calibResult}>
//                         Reps: {result.stats?.valid_rep_count ?? 0}
//                     </Text>

//                     <Text style={styles.calibResult}>
//                         Quality: {round(result.quality?.overall_score)}
//                     </Text>
//                 </>
//             )}

//             {derivedFailure && result && (
//                 <Text style={styles.calibError}>
//                     {(result.rejection_reasons ?? []).join(", ") || snap.error || "Calibration failed"}
//                 </Text>
//             )}
//         </View>
//     );
// }

// function DebugBlock({
//     title,
//     data,
// }: {
//     title: string;
//     data: unknown;
// }) {
//     return (
//         <View>
//             <Text style={styles.subtitle}>{title}</Text>
//             <Text style={styles.mono}>
//                 {data ? JSON.stringify(data, null, 2) : "-"}
//             </Text>
//         </View>
//     );
// }

// function round(x: unknown, digits = 4): number | null {
//     if (typeof x !== "number" || !Number.isFinite(x)) return null;
//     const p = Math.pow(10, digits);
//     return Math.round(x * p) / p;
// }

// export default function MotionCalibrationSessionScreen() {
//     // DEVICE STREAM
//     const {
//         status,
//         isConnected,
//         latestSample,
//         sampleCount,
//         connect,
//         disconnect,
//         subscribeSample,
//     } = useMotionDevice();




//     // CALIBRATION SESSION CONTROLLER
//     const controllerRef = useRef(
//         new MotionCalibrationSessionController({
//             recentStillnessMaxSamples: 120,
//             nonStillSamplesToStartReps: 2,
//             sessionPipeline: {
//                 minValidReps: 5,
//                 minRepDurationS: 1.2,
//                 maxRepDurationS: 3.5,
//                 minRepRomDeg: 10,
//                 maxOffAxisRatio: 0.75,
//                 maxVelocityIrregularity: 0.35,
//                 maxGapBetweenRepsS: 1.25,
//                 minAxisScoreMarginRatio: 0.2,
//                 maxDurationCv: 0.2,
//                 maxRomCv: 0.2,
//                 analyzer: {
//                     smoothingWindow: 3,
//                     minExtremaPromDeg: 1.5,
//                     minRepDurationS: 1.2,
//                     maxRepDurationS: 3.5,
//                     minRepRomDeg: 10,
//                     minPeakVelocityDegS: 8,
//                     maxOffAxisRatio: 0.75,
//                     maxGapBetweenRepsS: 1.25,
//                     enableYawAxis: false,
//                 },
//             },
//         })
//     );
//     const [lastRecording, setLastRecording] = useState<CalibrationSessionRecording | null>(null);
//     const [sessionResult, setSessionResult] = useState<CalibrationSessionResult | null>(null);
//     const [recent, setRecent] = useState<FusedSample[]>([]);
//     const [sessionSnap, setSessionSnap] =
//         useState<MotionCalibrationSessionControllerSnapshot>(
//             controllerRef.current.getSnapshot()
//         );




//     // STREAM SUBSCRIPTION
//     useEffect(() => {
//         const unsub = subscribeSample((sample) => {
//             // keep recent samples for debug UI
//             setRecent((prev) => [...prev, sample].slice(-120));

//             // push every sample into the controller
//             const snap = controllerRef.current.push(sample);
//             setSessionSnap(snap);
//         });

//         return unsub;
//     }, [subscribeSample]);





//     // ACTIONS
//     const handleStartCalibration = () => {
//         const snap = controllerRef.current.start();

//         setSessionSnap(snap);
//         setLastRecording(null);
//         setSessionResult(null);

//         console.log("=== CALIBRATION SESSION STARTED ===");
//         // console.log(JSON.stringify(snap, null, 2));
//     };

//     const handleStopCalibration = () => {
//         const out = controllerRef.current.stop();

//         setSessionSnap(out.snapshot);
//         setLastRecording(out.recording);
//         setSessionResult(out.result);

//         console.log("STOP_UI_CHECK", {
//             snapshotState: out.snapshot.state,
//             snapshotError: out.snapshot.error ?? null,
//             resultSuccess: out.result?.success ?? null,
//             rejectionReasons: out.result?.rejection_reasons ?? [],
//         });

//         // console.log("=== CALIBRATION SESSION SNAPSHOT ===");
//         // console.log(JSON.stringify(out.snapshot, null, 2));

//         // console.log("=== CALIBRATION SESSION RECORDING ===");
//         // console.log(JSON.stringify(out.recording, null, 2));

//         // console.log("=== CALIBRATION SESSION RESULT ===");
//         // console.log(JSON.stringify(out.result, null, 2));
//     };

//     const handleResetCalibration = () => {
//         const snap = controllerRef.current.reset();

//         setSessionSnap(snap);
//         setLastRecording(null);
//         setSessionResult(null);
//         setRecent([]);

//         console.log("=== CALIBRATION SESSION RESET ===");
//         // console.log(JSON.stringify(snap, null, 2));
//     };




//     // DERIVED UI DATA
//     const controllerSummaryUI = useMemo(() => {
//         return {
//             state: sessionSnap.state,
//             stillness_locked: sessionSnap.stillness_locked,
//             ready_for_reps: sessionSnap.ready_for_reps,
//             rep_start_detected: sessionSnap.rep_start_detected,
//             session_sample_count: sessionSnap.sample_count,
//             session_duration_s: round(sessionSnap.duration_s),
//             locked_stillness_start_ms: sessionSnap.locked_stillness_start_ms ?? null,
//             locked_stillness_end_ms: sessionSnap.locked_stillness_end_ms ?? null,
//             rep_start_ms: sessionSnap.rep_start_ms ?? null,
//             stop_reason: sessionSnap.stop_reason ?? null,
//             error: sessionSnap.error ?? null,
//         };
//     }, [sessionSnap]);

//     const phase1SummaryUI = useMemo(() => {
//         if (!sessionSnap.phase1) return null;

//         return {
//             success: sessionSnap.phase1.success,
//             sample_hz: round(sessionSnap.phase1.debug.sampleHz),
//             still_segment_count: sessionSnap.phase1.debug.segments?.length ?? 0,
//             calibration_block: sessionSnap.phase1.calibrationBlock
//                 ? {
//                     start_idx: sessionSnap.phase1.calibrationBlock.startIndex,
//                     end_idx: sessionSnap.phase1.calibrationBlock.endIndex,
//                     start_ms: sessionSnap.phase1.calibrationBlock.startMs,
//                     end_ms: sessionSnap.phase1.calibrationBlock.endMs,
//                     duration_ms: sessionSnap.phase1.calibrationBlock.durationMs,
//                     score: round(sessionSnap.phase1.calibrationBlock.score),
//                 }
//                 : null,
//             reason: sessionSnap.phase1.reason ?? [],
//         };
//     }, [sessionSnap]);

//     const phase2SummaryUI = useMemo(() => {
//         if (!sessionSnap.phase2) return null;

//         return {
//             success: sessionSnap.phase2.success,
//             gyro_bias: sessionSnap.phase2.gyro_bias ?? null,
//             overall_confidence: round(sessionSnap.phase2.quality?.overallConfidence),
//             warnings: sessionSnap.phase2.warnings ?? [],
//         };
//     }, [sessionSnap]);

//     const sessionSummaryUI = useMemo(() => {
//         if (!sessionResult) return null;

//         return {
//             success: sessionResult.success,
//             dominant_axis: sessionResult.dominant_axis,
//             valid_rep_count: sessionResult.stats?.valid_rep_count ?? 0,
//             candidate_rep_count: sessionResult.stats?.candidate_rep_count ?? 0,
//             mean_duration_s: round(sessionResult.stats?.mean_duration_s),
//             std_duration_s: round(sessionResult.stats?.std_duration_s),
//             mean_rom_deg: round(sessionResult.stats?.mean_rom_deg),
//             std_rom_deg: round(sessionResult.stats?.std_rom_deg),
//             mean_peak_velocity_deg_s: round(sessionResult.stats?.mean_peak_velocity_deg_s),
//             mean_off_axis_ratio: round(sessionResult.stats?.mean_off_axis_ratio),
//             mean_velocity_irregularity: round(sessionResult.stats?.mean_velocity_irregularity),
//             quality_score: round(sessionResult.quality?.overall_score),
//             rejection_reasons: sessionResult.rejection_reasons ?? [],
//         };
//     }, [sessionResult]);

//     const templateSummaryUI = useMemo(() => {
//         if (!sessionResult?.template) return null;

//         return {
//             axis_name: sessionResult.template.axis_name,
//             normalize_points: sessionResult.template.normalize_points,
//             angle_mean_len: sessionResult.template.angle_mean.length,
//             angle_std_len: sessionResult.template.angle_std.length,
//             velocity_mean_len: sessionResult.template.velocity_mean.length,
//             velocity_std_len: sessionResult.template.velocity_std.length,
//             angle_mean_preview: sessionResult.template.angle_mean.slice(0, 10).map(round),
//             angle_std_preview: sessionResult.template.angle_std.slice(0, 10).map(round),
//             velocity_mean_preview: sessionResult.template.velocity_mean.slice(0, 10).map(round),
//         };
//     }, [sessionResult]);

//     const debugSummaryUI = useMemo(() => {
//         if (!sessionResult?.debug) return null;

//         return {
//             axis_scores: sessionResult.debug.axis_scores,
//             dominant_axis_margin_ratio: round(sessionResult.debug.dominant_axis_margin_ratio),
//             all_candidates: sessionResult.debug.all_candidates.length,
//             accepted_candidates: sessionResult.debug.accepted_candidates.length,
//             kept_candidates: sessionResult.debug.kept_candidates.length,
//             selected_signal_len: sessionResult.debug.selected_signal_deg.length,
//             selected_velocity_len: sessionResult.debug.selected_velocity_deg_s.length,
//             selected_gyro_mag_len: sessionResult.debug.selected_gyro_mag.length,
//         };
//     }, [sessionResult]);

//     const recordingSummaryUI = useMemo(() => {
//         return {
//             session_state: sessionSnap.state,
//             session_sample_count: sessionSnap.sample_count,
//             session_duration_s: round(sessionSnap.duration_s),
//             last_recording_sample_count: lastRecording?.sample_count ?? 0,
//             last_recording_duration_s: round(lastRecording?.duration_s),
//         };
//     }, [sessionSnap, lastRecording]);




//     // UI
//     return (
//         <ScrollView contentContainerStyle={styles.container}>
//             {/* TITLE */}
//             <Text style={styles.title}>Motion Calibration Session</Text>




//             {/* CONNECTION */}
//             <View style={styles.card}>
//                 <Text style={styles.subtitle}>Connection</Text>

//                 <View style={styles.row}>
//                     <Pressable style={styles.button} onPress={connect}>
//                         <Text style={styles.buttonText}>Connect</Text>
//                     </Pressable>

//                     <Pressable style={styles.button} onPress={disconnect}>
//                         <Text style={styles.buttonText}>Disconnect</Text>
//                     </Pressable>
//                 </View>

//                 <View style={styles.spacer8} />

//                 <Text style={styles.label}>Status: {status}</Text>
//                 <Text style={styles.label}>Connected: {String(isConnected)}</Text>
//                 <Text style={styles.label}>Global stream sample count: {sampleCount}</Text>
//             </View>




//             {/* CalibrationStatusCard */}
//             <CalibrationStatusCard snap={sessionSnap} result={sessionResult} />




//             {/* CALIBRATION SESSION CONTROLS */}
//             <View style={styles.card}>
//                 <Text style={styles.subtitle}>Calibration Session Controls</Text>

//                 <View style={styles.rowWrap}>
//                     <Pressable
//                         style={[
//                             styles.button,
//                             sessionSnap.state !== "idle" &&
//                             sessionSnap.state !== "completed" &&
//                             sessionSnap.state !== "failed" &&
//                             styles.buttonDisabled,
//                         ]}
//                         onPress={handleStartCalibration}
//                         disabled={
//                             sessionSnap.state !== "idle" &&
//                             sessionSnap.state !== "completed" &&
//                             sessionSnap.state !== "failed"
//                         }
//                     >
//                         <Text style={styles.buttonText}>Start calibration</Text>
//                     </Pressable>

//                     <Pressable
//                         style={[
//                             styles.button,
//                             (sessionSnap.state === "idle" ||
//                                 sessionSnap.state === "completed" ||
//                                 sessionSnap.state === "failed") &&
//                             styles.buttonDisabled,
//                         ]}
//                         onPress={handleStopCalibration}
//                         disabled={
//                             sessionSnap.state === "idle" ||
//                             sessionSnap.state === "completed" ||
//                             sessionSnap.state === "failed"
//                         }
//                     >
//                         <Text style={styles.buttonText}>Stop calibration</Text>
//                     </Pressable>

//                     <Pressable style={styles.buttonSecondary} onPress={handleResetCalibration}>
//                         <Text style={styles.buttonText}>Reset</Text>
//                     </Pressable>
//                 </View>

//                 <View style={styles.spacer12} />

//                 <Text style={styles.label}>Session state: {sessionSnap.state}</Text>
//                 <Text style={styles.label}>Stillness locked: {String(sessionSnap.stillness_locked)}</Text>
//                 <Text style={styles.label}>Ready for reps: {String(sessionSnap.ready_for_reps)}</Text>
//                 <Text style={styles.label}>Rep start detected: {String(sessionSnap.rep_start_detected)}</Text>
//                 <Text style={styles.label}>Session samples: {sessionSnap.sample_count}</Text>
//                 <Text style={styles.label}>
//                     Session duration: {round(sessionSnap.duration_s)} s
//                 </Text>
//             </View>




//             {/* Controller Summary */}
//             <View style={styles.card}>
//                 <DebugBlock title="Controller Summary" data={controllerSummaryUI} />
//             </View>
//             <View style={styles.card}>
//                 <DebugBlock
//                     title="Phase 1 / Phase 2 Status"
//                     data={{
//                         phase1: phase1SummaryUI,
//                         phase2: phase2SummaryUI,
//                     }}
//                 />
//             </View>


//             {/* SESSION RECORDING */}
//             <View style={styles.card}>
//                 <DebugBlock title="Recording Summary" data={recordingSummaryUI} />
//             </View>




//             {/* RESULT */}
//             <View style={styles.card}>
//                 <DebugBlock title="Calibration Session Result" data={sessionSummaryUI} />
//             </View>




//             {/* TEMPLATE */}
//             <View style={styles.card}>
//                 <DebugBlock title="Template Summary" data={templateSummaryUI} />
//             </View>




//             {/* DEBUG */}
//             <View style={styles.card}>
//                 <DebugBlock title="Session Debug" data={debugSummaryUI} />
//             </View>




//             {/* LAST SAMPLE */}
//             <View style={styles.card}>
//                 <DebugBlock
//                     title="Latest Sample"
//                     data={latestSample ? latestSample : { message: "No sample yet" }}
//                 />
//             </View>




//             {/* RECENT BUFFER */}
//             {/* <View style={styles.card}>
//                 <Text style={styles.subtitle}>Recent Stream</Text>
//                 <Text style={styles.mono}>Buffered samples: {recent.length}</Text>
//             </View> */}
//         </ScrollView>
//     );
// }
// const styles = StyleSheet.create({
//     container: {
//         padding: 16,
//         gap: 16,
//         backgroundColor: "#000",
//     },
//     title: {
//         fontSize: 24,
//         fontWeight: "800",
//         color: "white",
//     },
//     subtitle: {
//         fontSize: 18,
//         fontWeight: "700",
//         marginBottom: 8,
//         color: "white",
//     },
//     row: {
//         flexDirection: "row",
//         gap: 12,
//     },
//     rowWrap: {
//         flexDirection: "row",
//         gap: 12,
//         flexWrap: "wrap",
//     },
//     button: {
//         backgroundColor: "#222",
//         paddingHorizontal: 14,
//         paddingVertical: 12,
//         borderRadius: 10,
//     },
//     buttonSecondary: {
//         backgroundColor: "#333",
//         paddingHorizontal: 14,
//         paddingVertical: 12,
//         borderRadius: 10,
//     },
//     buttonDisabled: {
//         opacity: 0.45,
//     },
//     buttonText: {
//         color: "white",
//         fontWeight: "700",
//     },
//     card: {
//         backgroundColor: "#111",
//         padding: 14,
//         borderRadius: 12,
//     },
//     label: {
//         color: "white",
//         marginBottom: 6,
//     },
//     mono: {
//         color: "#9fe7b8",
//         fontFamily: "monospace",
//         marginBottom: 6,
//     },
//     spacer8: {
//         height: 8,
//     },
//     spacer12: {
//         height: 12,
//     },



//     calibCard: {
//         backgroundColor: "#111",
//         padding: 16,
//         borderRadius: 14,
//         borderWidth: 1,
//         borderColor: "#222",
//     },
//     calibTitle: {
//         color: "white",
//         fontSize: 20,
//         fontWeight: "800",
//         marginBottom: 6,
//     },
//     calibAction: {
//         color: "#9fe7b8",
//         fontSize: 16,
//         fontWeight: "600",
//         marginBottom: 10,
//     },
//     calibRow: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         marginBottom: 8,
//     },
//     calibLabel: {
//         color: "#ccc",
//         fontSize: 14,
//     },
//     calibSmall: {
//         color: "#aaa",
//         fontSize: 13,
//     },
//     calibResult: {
//         color: "#9fe7b8",
//         fontSize: 15,
//         fontWeight: "700",
//     },
//     calibError: {
//         color: "#ff6b6b",
//         fontSize: 14,
//         fontWeight: "600",
//     },
// });
