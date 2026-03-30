import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { type AnalysisSet } from "./AnalysisSetPicker";
import { useTranslation } from "react-i18next";

type Props = {
  item: AnalysisSet;
};

function Row({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, highlight && styles.valueHighlight]}>
        {value}
      </Text>
    </View>
  );
}

export default function SeriesSummaryCard({ item }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t("seriesSummary.title")}</Text>

      <Row label={t("seriesSummary.reps")} value={`${item.reps}`} />
     <Row label={t("seriesSummary.avgVelocity")} value={`${item.avgVelocity.toFixed(2)} m/s`} highlight />
      <Row label={t("seriesSummary.maxVelocity")} value={`${item.maxVelocity.toFixed(2)} m/s`} />
      <Row label={t("seriesSummary.bestRep")} value={`${t("seriesSummary.repShort")} ${item.bestRep}`} />
      <Row label={t("seriesSummary.rom")} value={`~${item.romDeg}°`} />
      <Row label={t("seriesSummary.duration")} value={`${item.durationSec} s`} />
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
  title: {
    color: "rgba(233,238,248,0.58)",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  label: {
    color: "rgba(233,238,248,0.68)",
    fontSize: 16,
    fontWeight: "600",
  },
  value: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  valueHighlight: {
    color: "#63A3FF",
  },
});
