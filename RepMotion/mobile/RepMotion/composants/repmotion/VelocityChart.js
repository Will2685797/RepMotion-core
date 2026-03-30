import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function VelocityChart({ title, unit, data }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>

      <View style={styles.body}>
        {/* Placeholder: on mettra un vrai chart après */}
        <View style={styles.line} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    borderRadius: 18,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginTop: 6,
  },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  title: { fontSize: 12, letterSpacing: 2, fontWeight: "700", color: "rgba(233,238,248,0.35)" },
  unit: { fontSize: 12, fontWeight: "700", color: "rgba(120,150,255,0.8)" },
  body: { height: 86, borderRadius: 14, overflow: "hidden", justifyContent: "center" },
  line: { height: 2, width: "100%", backgroundColor: "rgba(120,150,255,0.65)" },
});