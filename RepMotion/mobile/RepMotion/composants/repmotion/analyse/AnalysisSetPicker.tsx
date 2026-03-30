import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTranslation } from "react-i18next";

export type AnalysisSet = {
  id: string;
  setLabel: string;
  exercise: string;
  weightKg: number;
  reps: number;
  avgVelocity: number;
  maxVelocity: number;
  bestRep: number;
  romDeg: number;
  durationSec: number;
  formScore: number;
  formStatus: string;
  formDescription: string;
  declineText: string;
  stickingPointText: string;
  stickingPointRep: number;
  stickingPointPercent: number;
  velocities: number[];
};

type AnalysisSession = {
  id: string;
  exercise: string;
  dateLabel: string;
  weightKg: number;
  setsCount: number;
  repsTotal: number;
  avgVelocity: number;
  avgTUT: number;
  hasStickingPoint: boolean;
  hasFormWarning: boolean;
};

type Props = {
  sets: AnalysisSet[];
  selectedSet: AnalysisSet;
  onSelect: (item: AnalysisSet) => void;
  session?: AnalysisSession;
};

export default function AnalysisSetPicker({
  sets,
  selectedSet,
  onSelect,
  session,
}: Props) {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const getExerciseLabel = (exercise?: string) => {
    if (!exercise) return "";

    const translated = t(`exercises.${exercise}`);
    return translated === `exercises.${exercise}` ? exercise : translated;
  };

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.selector} onPress={() => setOpen((p) => !p)}>
        <View style={styles.left}>
          <Text style={styles.overTitle}>
            {t("analysisSetPicker.analysis")} ·{" "}
            {selectedSet?.setLabel || t("analysisSetPicker.setFallback")}
          </Text>

          <Text style={styles.title}>
            {getExerciseLabel(session?.exercise || selectedSet?.exercise)} ·{" "}
            {session?.weightKg || selectedSet?.weightKg} kg
          </Text>

          {!!session?.dateLabel && (
            <Text style={styles.dateText}>{session.dateLabel}</Text>
          )}
        </View>

        <View style={styles.right}>
          <View style={styles.repsPill}>
            <Text style={styles.repsText}>
              {selectedSet?.reps} {t("analysisSetPicker.reps")}
            </Text>
          </View>
        </View>
      </Pressable>

      {open && (
        <View style={styles.dropdown}>
          {sets
            .filter((item) => item.id !== selectedSet?.id)
            .map((item) => (
              <Pressable
                key={item.id}
                style={styles.item}
                onPress={() => {
                  onSelect(item);
                  setOpen(false);
                }}
              >
                <Text style={styles.itemTitle}>
                  {item.setLabel} · {getExerciseLabel(item.exercise)} ·{" "}
                  {item.weightKg} kg
                </Text>
                <Text style={styles.itemSub}>
                  {item.reps} {t("analysisSetPicker.reps")} ·{" "}
                  {t("analysisSetPicker.duration")} {item.durationSec}s
                </Text>
              </Pressable>
            ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 16,
  },
  selector: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  left: {
    flex: 1,
    paddingRight: 12,
  },
  right: {
    alignItems: "flex-end",
  },
  overTitle: {
    color: "rgba(233,238,248,0.45)",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
  dateText: {
    marginTop: 6,
    color: "rgba(233,238,248,0.62)",
    fontWeight: "600",
    fontSize: 12,
  },
  repsPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(76,125,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(76,125,255,0.38)",
  },
  repsText: {
    color: "#7AA7FF",
    fontWeight: "900",
    fontSize: 13,
  },
  dropdown: {
    marginTop: 12,
    borderRadius: 16,
    backgroundColor: "#0D1222",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  item: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  itemTitle: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
    marginBottom: 4,
  },
  itemSub: {
    color: "rgba(233,238,248,0.52)",
    fontWeight: "600",
    fontSize: 12,
  },
});
