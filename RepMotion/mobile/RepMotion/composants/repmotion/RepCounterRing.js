import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function RepCounterRing({ reps = 0 }) {
  return (
    <View style={styles.ringOuter}>
      <View style={styles.ringInner}>
        <Text style={styles.repsValue}>{String(reps).padStart(2, "0")}</Text>
        <Text style={styles.repsLabel}>REPS</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ringOuter: {
    width: 220, height: 220, borderRadius: 110,
    borderWidth: 1, borderColor: "rgba(120,150,255,0.20)",
    justifyContent: "center", alignItems: "center",
  },
  ringInner: {
    width: 180, height: 180, borderRadius: 90,
    borderWidth: 1, borderColor: "rgba(120,150,255,0.12)",
    justifyContent: "center", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  repsValue: {
    fontSize: 64, fontWeight: "800", letterSpacing: 2,
    color: "rgba(233,238,248,0.65)", marginTop: -6,
  },
  repsLabel: { marginTop: 2, letterSpacing: 3, fontSize: 12, fontWeight: "700", color: "rgba(233,238,248,0.35)" },
});