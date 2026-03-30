// imports
import React from "react";
import { View, ScrollView, StyleSheet, Text } from "react-native";
// hooks
import { useRepMotionSocket } from "../../api/query/hooks/useRepMotionSocket";
// constants
import { WS_HOST } from "../../models/motionConstants";
const ESP32_IP = WS_HOST;

function MetricCard({
    label,
    value,
    unit,
}: {
    label: string;
    value: string | number | boolean | null | undefined;
    unit?: string;
}) {
    return (
        <View style={styles.card}>
            <Text style={styles.cardLabel}>{label}</Text>
            <Text style={styles.cardValue}>
                {String(value)} {unit ?? ""}
            </Text>
        </View>
    );
}

export default function AppareilScreen() {
    const { connectionState, sample, error } = useRepMotionSocket(ESP32_IP);

    return (
        <View style={styles.screen}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.overTitle}>APPAREIL</Text>
                <Text style={styles.title}>RepMotion IMU Live</Text>

                <View style={styles.statusRow}>
                    <View style={[styles.dot, connectionState === "open" ? styles.dotOpen : styles.dotClosed]} />
                    <Text style={styles.statusText}>Socket: {connectionState}</Text>
                </View>

                {!!error && <Text style={styles.errorText}>{error}</Text>}

                <View style={styles.grid}>
                    <MetricCard label="Time" value={sample?.t_ms ?? "--"} unit="ms" />
                    <MetricCard label="Temperature" value={sample ? sample.temp_c.toFixed(2) : "--"} unit="°C" />
                    <MetricCard label="Still" value={sample?.still ?? "--"} />

                    <MetricCard label="Ax" value={sample ? sample.ax_mps2.toFixed(3) : "--"} unit="m/s²" />
                    <MetricCard label="Ay" value={sample ? sample.ay_mps2.toFixed(3) : "--"} unit="m/s²" />
                    <MetricCard label="Az" value={sample ? sample.az_mps2.toFixed(3) : "--"} unit="m/s²" />

                    <MetricCard label="Gx" value={sample ? sample.gx_rads.toFixed(4) : "--"} unit="rad/s" />
                    <MetricCard label="Gy" value={sample ? sample.gy_rads.toFixed(4) : "--"} unit="rad/s" />
                    <MetricCard label="Gz" value={sample ? sample.gz_rads.toFixed(4) : "--"} unit="rad/s" />

                    <MetricCard label="Roll" value={sample ? sample.roll_deg.toFixed(2) : "--"} unit="deg" />
                    <MetricCard label="Pitch" value={sample ? sample.pitch_deg.toFixed(2) : "--"} unit="deg" />
                </View>

                <View style={styles.payloadBox}>
                    <Text style={styles.payloadTitle}>Raw Payload</Text>
                    <Text style={styles.payloadText}>
                        {sample ? JSON.stringify(sample, null, 2) : "Waiting for data..."}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: "#0B1220",
    },
    content: {
        padding: 20,
        gap: 16,
    },
    overTitle: {
        color: "#7C8AA5",
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 1.2,
        textTransform: "uppercase",
    },
    title: {
        color: "#F8FAFC",
        fontSize: 28,
        fontWeight: "800",
    },
    statusRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 6,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 999,
    },
    dotOpen: {
        backgroundColor: "#22C55E",
    },
    dotClosed: {
        backgroundColor: "#EF4444",
    },
    statusText: {
        color: "#CBD5E1",
        fontSize: 14,
        fontWeight: "600",
    },
    errorText: {
        color: "#F87171",
        fontSize: 14,
        fontWeight: "600",
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
    },
    card: {
        width: "47%",
        backgroundColor: "#111827",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: "#1F2937",
    },
    cardLabel: {
        color: "#94A3B8",
        fontSize: 12,
        fontWeight: "700",
        marginBottom: 6,
        textTransform: "uppercase",
    },
    cardValue: {
        color: "#F8FAFC",
        fontSize: 18,
        fontWeight: "800",
    },
    payloadBox: {
        backgroundColor: "#111827",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "#1F2937",
        marginTop: 8,
    },
    payloadTitle: {
        color: "#F8FAFC",
        fontSize: 16,
        fontWeight: "800",
        marginBottom: 10,
    },
    payloadText: {
        color: "#CBD5E1",
        fontSize: 13,
        lineHeight: 20,
        fontFamily: "monospace",
    },
});
