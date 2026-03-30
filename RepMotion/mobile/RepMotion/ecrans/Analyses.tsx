import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Text } from "react-native";
import AnalysisSetPicker, {
  type AnalysisSet,
} from "../composants/repmotion/analyse/AnalysisSetPicker";
import AlertCard from "../composants/repmotion/analyse/AlertCard";
import RepBarsChart from "../composants/repmotion/analyse/RepBarsChart";
import RepCurveChart from "../composants/repmotion/analyse/RepCurveChart";
import SeriesSummaryCard from "../composants/repmotion/analyse/SeriesSummaryCard";
import FormScoreCard from "../composants/repmotion/analyse/FormScoreCard";
import { useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

export default function Analyse() {
  const { t } = useTranslation();
  const route = useRoute<any>();
  const selectedSession = route.params?.session ?? null;
  const sets = selectedSession?.sets ?? [];

  const [selectedSet, setSelectedSet] = useState<AnalysisSet | null>(null);
  const [mode, setMode] = useState<"bars" | "curve">("bars");

  useEffect(() => {
    setSelectedSet(sets[0] ?? null);
  }, [selectedSession]);

  if (!selectedSession || !selectedSet) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>{t("analysis.empty.title")}</Text>
        <Text style={styles.emptyText}>{t("analysis.empty.text")}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <AnalysisSetPicker
        sets={sets}
        selectedSet={selectedSet}
        onSelect={setSelectedSet}
        session={selectedSession}
      />

      <AlertCard
        variant="warning"
        title={t("analysis.alerts.declineDetected")}
        description={t("analysisAlerts.performanceDrop.description")}
      />

      <AlertCard
        variant="danger"
        title={t("analysisAlerts.stickingPoint.title")}
        description={t("analysis.alerts.decelerationZone")}
      />

      {mode === "bars" ? (
        <RepBarsChart
          data={selectedSet.velocities}
          stickingPointRep={selectedSet.stickingPointRep}
          mode={mode}
          onChangeMode={setMode}
        />
      ) : (
        <RepCurveChart
          data={selectedSet.velocities}
          stickingPointPercent={selectedSet.stickingPointPercent}
          mode={mode}
          onChangeMode={setMode}
        />
      )}

      <SeriesSummaryCard item={selectedSet} />

      <FormScoreCard
        score={selectedSet.formScore}
        status={t("formScoreCard.status.stable")}
        description={t("formScoreCard.description.simulatedSetAnalysis")}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#070A12",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 26,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    backgroundColor: "#070A12",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 10,
    textAlign: "center",
  },
  emptyText: {
    color: "rgba(233,238,248,0.62)",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 22,
  },
});
