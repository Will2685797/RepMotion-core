import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

type Unit = "LB" | "KG";

type Props = {
  values: number[];
  unit: Unit;
  onSelect: (value: number) => void;
};

function formatWeight(value: number) {
  return Number.isInteger(value)
    ? `${value}`
    : value.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

function getTileColors(value: number, unit: Unit) {
  if (unit === "KG") {
    if (value === 25) return { bg: "rgba(255,77,79,0.08)", border: "rgba(255,77,79,0.25)", text: "#FF4D4F" };
    if (value === 20) return { bg: "rgba(79,131,255,0.08)", border: "rgba(79,131,255,0.25)", text: "#4F83FF" };
    if (value === 15) return { bg: "rgba(247,183,49,0.10)", border: "rgba(247,183,49,0.30)", text: "#F7B731" };
    if (value === 10) return { bg: "rgba(32,217,151,0.08)", border: "rgba(32,217,151,0.25)", text: "#20D997" };
    if (value === 5) return { bg: "rgba(139,108,255,0.08)", border: "rgba(139,108,255,0.25)", text: "#8B6CFF" };
    if (value === 2.5) return { bg: "rgba(185,189,199,0.10)", border: "rgba(185,189,199,0.25)", text: "#E5E7EB" };
    return { bg: "rgba(246,179,41,0.08)", border: "rgba(246,179,41,0.25)", text: "#F6B329" };
  }

  if (value === 45) return { bg: "rgba(255,77,79,0.08)", border: "rgba(255,77,79,0.25)", text: "#FF4D4F" };
  if (value === 35) return { bg: "rgba(79,131,255,0.08)", border: "rgba(79,131,255,0.25)", text: "#4F83FF" };
  if (value === 25) return { bg: "rgba(247,183,49,0.10)", border: "rgba(247,183,49,0.30)", text: "#F7B731" };
  if (value === 10) return { bg: "rgba(32,217,151,0.08)", border: "rgba(32,217,151,0.25)", text: "#20D997" };
  if (value === 5) return { bg: "rgba(139,108,255,0.08)", border: "rgba(139,108,255,0.25)", text: "#8B6CFF" };
  return { bg: "rgba(185,189,199,0.10)", border: "rgba(185,189,199,0.25)", text: "#E5E7EB" };
}

export default function RepWeightPlateGrid({
  values,
  unit,
  onSelect,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t("weightPlateGrid.addPlate")}</Text>

      <View style={styles.grid}>
        {values.map((value) => {
          const colors = getTileColors(value, unit);

          return (
            <Pressable
              key={value}
              style={[
                styles.tile,
                {
                  backgroundColor: colors.bg,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => onSelect(value)}
            >
              <Text style={[styles.plus, { color: colors.text }]}>+</Text>
              <Text style={[styles.value, { color: colors.text }]}>
                {formatWeight(value)}
              </Text>
              <Text style={styles.unit}>{unit.toLowerCase()}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#121426",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 18,
  },
  title: {
    color: "#66A0FF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    marginBottom: 14,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  tile: {
    width: "23%",
    minWidth: 72,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    marginBottom: 10,
  },
  plus: {
    fontSize: 24,
    lineHeight: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    lineHeight: 26,
    fontWeight: "900",
    marginBottom: 2,
  },
  unit: {
    color: "rgba(233,238,248,0.55)",
    fontSize: 12,
    fontWeight: "700",
  },
  
});