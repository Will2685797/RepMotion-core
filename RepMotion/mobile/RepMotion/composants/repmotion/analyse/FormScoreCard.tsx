import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

type Props = {
  score: number;
  status: string;
  description: string;
};

export default function FormScoreCard({
  score,
  status,
  description,
}: Props) {
  const clamped = Math.max(0, Math.min(score, 100));
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.title}>{t("formScore.title")}</Text>

        <View style={styles.pill}>
          <Text style={styles.pillText}>{status}</Text>
        </View>
      </View>

      <View style={styles.scoreRow}>
        <Text style={styles.score}>{clamped}</Text>
        <Text style={styles.scoreOver}>/100</Text>
      </View>

      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${clamped}%` }]} />
      </View>

      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: "#12172A",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginBottom: 14,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    color: "rgba(233,238,248,0.58)",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.2,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,184,77,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,184,77,0.28)",
  },
  pillText: {
    color: "#FFB84D",
    fontWeight: "900",
    fontSize: 13,
  },
  scoreRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  score: {
    color: "#FFB84D",
    fontWeight: "900",
    fontSize: 46,
    lineHeight: 48,
  },
  scoreOver: {
    color: "rgba(233,238,248,0.52)",
    fontWeight: "900",
    fontSize: 18,
    marginLeft: 6,
    marginBottom: 4,
  },
  barTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    marginBottom: 12,
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#D9A441",
  },
  description: {
    color: "rgba(233,238,248,0.55)",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
});
