import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function AppHeader({
  title = "REPMOTION",
  status = "PRÊT",
  isConnected = true,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.row}>
        <View style={styles.leftStatus}>
          <View style={[styles.dot, { backgroundColor: isConnected ? "#4CFF9B" : "rgba(233,238,248,0.25)" }]} />
          <Text style={styles.statusText}>{status}</Text>
        </View>

        <Ionicons
          name={isConnected ? "wifi" : "wifi-outline"}
          size={18}
          color={isConnected ? "rgba(233,238,248,0.75)" : "rgba(233,238,248,0.35)"}
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    marginTop: 35,
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: "#070A12",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  title: {
    fontSize: 14,
    letterSpacing: 2,
    color: "rgba(233,238,248,0.75)",
    marginBottom: 10,
    fontWeight: "700",
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  leftStatus: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 99 },
  statusText: { color: "rgba(233,238,248,0.75)", fontSize: 12, letterSpacing: 1 },
});
