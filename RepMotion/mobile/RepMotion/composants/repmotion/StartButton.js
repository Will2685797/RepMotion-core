import React from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";

export default function StartButton({ isRunning, onPress, disabled = false }) {
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.btn, disabled && { opacity: 0.5 }]}
    >
      <View style={styles.playCircle}>
        <Ionicons name={isRunning ? "stop" : "play"} size={16} color="white" />
      </View>
      <Text style={styles.text}>{isRunning ? t("startButton.stop") : t("startButton.start")}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: "100%",
    height: 56,
    borderRadius: 16,
    backgroundColor: "#4C7DFF",
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  playCircle: {
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  text: { color: "white", fontWeight: "800", fontSize: 16 },
});