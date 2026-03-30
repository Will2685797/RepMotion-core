import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AnalysisSession } from "../../../types/repmotion";
import { useTranslation } from "react-i18next";

type Props = {
  item: AnalysisSession;
  onPress?: (item: AnalysisSession) => void;
  onLongPress?: (item: AnalysisSession) => void;
};

export default function HistoryCard({ item, onPress, onLongPress }: Props) {
  const exerciseCount = item.exercises.length;
  const { t } = useTranslation();

  const [dateOnly, timeOnly] = item.dateLabel.split(", ");

  const title = dateOnly;

  const subtitle = `${timeOnly} · ${exerciseCount} ${
    exerciseCount > 1
      ? t("historyCard.exercise_other")
      : t("historyCard.exercise_one")
  }`;

  const isMulti = exerciseCount > 1;

  return (
    <Pressable
      style={styles.card}
      onPress={() => onPress?.(item)}
      onLongPress={() => onLongPress?.(item)}
      delayLongPress={350}
    >
      <View style={styles.topRow}>
        <View style={styles.leftBlock}>
          <View style={styles.iconBox}>
            <Ionicons name="calendar-outline" size={18} color="#9AB6FF" />
          </View>

          <View style={styles.textBlock}>
            <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>

              {isMulti && (
                <View
                  style={[styles.badge, styles.badgeMulti, styles.inlineBadge]}
                >
                  <Text style={[styles.badgeText, styles.badgeMultiText]}>
                    {t("historyCard.multi")}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>

        <View style={styles.rightBlock}>
          {item.hasStickingPoint && (
            <View style={[styles.badge, styles.badgeDanger]}>
              <Text style={[styles.badgeText, styles.badgeDangerText]}>SP</Text>
            </View>
          )}

          {item.hasFormWarning && (
            <View style={[styles.badge, styles.badgeWarn]}>
              <Ionicons name="warning-outline" size={13} color="#FFB84D" />
            </View>
          )}

          <Ionicons
            name="chevron-forward"
            size={16}
            color="rgba(233,238,248,0.45)"
          />
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>{t("historyCard.sets")}</Text>
          <Text style={styles.metricValue}>{item.setsCount}</Text>
        </View>

        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>{t("historyCard.reps")}</Text>
          <Text style={styles.metricValue}>{item.repsTotal}</Text>
        </View>

        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>{t("historyCard.avgVelocity")}</Text>
          <Text style={styles.metricValue}>
            {item.avgVelocity.toFixed(2)} m/s
          </Text>
        </View>

        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>{t("historyCard.avgTUT")}</Text>
          <Text style={styles.metricValue}>{item.avgTUT.toFixed(1)} s</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    backgroundColor: "#0D1222",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  leftBlock: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: "rgba(76,125,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(76,125,255,0.18)",
  },
  textBlock: {
    flex: 1,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  title: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 18,
    flexShrink: 1,
  },
  subtitle: {
    marginTop: 3,
    color: "rgba(233,238,248,0.55)",
    fontSize: 13,
    fontWeight: "600",
  },
  rightBlock: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  badge: {
    minWidth: 30,
    height: 26,
    paddingHorizontal: 8,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginRight: 8,
  },
  badgeMulti: {
    backgroundColor: "rgba(76,125,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(76,125,255,0.35)",
  },
  badgeMultiText: {
    color: "#4C7DFF",
  },
  inlineBadge: {
    marginLeft: 8,
    marginRight: 0,
    minWidth: 0,
    paddingHorizontal: 7,
    height: 24,
  },
  badgeDanger: {
    backgroundColor: "rgba(255,59,59,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,59,59,0.35)",
  },
  badgeDangerText: {
    color: "#FF5C5C",
  },
  badgeWarn: {
    backgroundColor: "rgba(255,184,77,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,184,77,0.28)",
  },
  badgeText: {
    fontWeight: "900",
    fontSize: 12,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricCol: {
    flex: 1,
  },
  metricLabel: {
    color: "rgba(233,238,248,0.45)",
    fontSize: 12,
    marginBottom: 4,
    fontWeight: "700",
  },
  metricValue: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "900",
  },
});
