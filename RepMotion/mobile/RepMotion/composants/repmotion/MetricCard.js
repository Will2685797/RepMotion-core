import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");
const CARD_W = (width - 16 * 2 - 10 * 2) / 3;

export default function MetricCard({ label, value, accent, unit = "m/s" }) {
  const str = Number(value).toFixed(2);
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <Text style={[styles.value, { color: accent }]}>{str}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
 card: {
  flex: 1,
  minWidth: 0,
  borderRadius: 16,
  paddingVertical: 14,
  paddingHorizontal: 12,
  backgroundColor: "rgba(255,255,255,0.03)",
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.06)",
},
  label: { fontSize: 12, letterSpacing: 2, fontWeight: "700", color: "rgba(233,238,248,0.35)", marginBottom: 6 },
  row: { flexDirection: "row", alignItems: "flex-end", gap: 6 },
  value: { fontSize: 28, fontWeight: "800" },
  unit: { fontSize: 12, marginBottom: 3, color: "rgba(233,238,248,0.35)", fontWeight: "700" },
});