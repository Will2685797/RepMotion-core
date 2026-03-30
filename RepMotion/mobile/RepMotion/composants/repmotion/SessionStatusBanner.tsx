import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

type Props = {
  setsCount: number;
  exerciseCount: number;
};

export default function SessionStatusBanner({
  setsCount,
  exerciseCount,
}: Props) {
  const { t } = useTranslation();

  const bannerText =
    setsCount === 0
      ? t("sessionBanner.ready")
      : exerciseCount > 1 && setsCount > 1
        ? t("sessionBanner.active_plural_both", { exerciseCount, setsCount })
        : exerciseCount > 1
          ? t("sessionBanner.active_plural_exercise", {
              exerciseCount,
              setsCount,
            })
          : setsCount > 1
            ? t("sessionBanner.active_plural_set", {
                exerciseCount,
                setsCount,
              })
            : t("sessionBanner.active", { exerciseCount, setsCount });

  return (
    <View style={styles.wrap}>
      <View style={styles.dot} />
      <Text style={styles.text}>{bannerText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: "100%",
    minHeight: 44,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76,125,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(76,125,255,0.22)",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginRight: 10,
    backgroundColor: "#4C7DFF",
    shadowColor: "#4C7DFF",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  text: {
    color: "#DCE7FF",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
});
