import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

type Unit = "LB" | "KG";

type Props = {
  totalWeight: number;
  sideWeight: number;
  barWeight: number;
  unit: Unit;
  onChangeUnit: (unit: Unit) => void;
};

function formatWeight(value: number) {
  return Number.isInteger(value)
    ? `${value}`
    : value
        .toFixed(2)
        .replace(/\.00$/, "")
        .replace(/(\.\d)0$/, "$1");
}

export default function RepWeightTopCard({
  totalWeight,
  sideWeight,
  barWeight,
  unit,
  onChangeUnit,
}: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.titleBlock}>
          <Text style={styles.eyebrow}>{t("weightTopCard.loading")}</Text>
          <Text style={styles.title}>{t("weightTopCard.title")}</Text>
        </View>

        <View style={styles.unitToggle}>
          <Pressable
            style={[
              styles.unitButton,
              unit === "LB" && styles.unitButtonActive,
            ]}
            onPress={() => onChangeUnit("LB")}
          >
            <Text
              style={[
                styles.unitButtonText,
                unit === "LB" && styles.unitButtonTextActive,
              ]}
            >
              LB
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.unitButton,
              unit === "KG" && styles.unitButtonActive,
            ]}
            onPress={() => onChangeUnit("KG")}
          >
            <Text
              style={[
                styles.unitButtonText,
                unit === "KG" && styles.unitButtonTextActive,
              ]}
            >
              KG
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.valueRow}>
        <Text style={styles.totalValue}>{formatWeight(totalWeight)}</Text>
        <Text style={styles.unit}>{unit.toLowerCase()}</Text>
      </View>

      <View style={styles.metaWrap}>
        <View style={styles.metaItem}>
          <Text style={styles.detailLabel}>{t("weightTopCard.bar")}</Text>
          <Text style={styles.detailValue}>
            {formatWeight(barWeight)} {unit.toLowerCase()}
          </Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.metaItem}>
          <Text style={styles.detailLabel}>{t("weightTopCard.platesX2")}</Text>
          <Text style={styles.detailValue}>
            {formatWeight(sideWeight)} {unit.toLowerCase()}{" "}
            {t("weightTopCard.perSide")}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#0B1430",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(76,125,255,0.25)",
    marginBottom: 16,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  titleBlock: {
    flex: 1,
    paddingRight: 12,
  },
  eyebrow: {
    color: "rgba(201,214,255,0.55)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "900",
  },

  unitToggle: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  unitButton: {
    minWidth: 48,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  unitButtonActive: {
    backgroundColor: "#4C7DFF",
  },
  unitButtonText: {
    color: "rgba(233,238,248,0.58)",
    fontSize: 13,
    fontWeight: "900",
  },
  unitButtonTextActive: {
    color: "#FFFFFF",
  },

  valueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 14,
  },
  totalValue: {
    color: "#FFFFFF",
    fontSize: 54,
    lineHeight: 58,
    fontWeight: "900",
  },
  unit: {
    color: "rgba(233,238,248,0.8)",
    fontSize: 18,
    fontWeight: "800",
    marginLeft: 8,
    marginBottom: 6,
  },

  metaWrap: {
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "space-between",
    gap: 12,
  },
  metaItem: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  separator: {
    width: 0,
  },
  detailLabel: {
    color: "rgba(201,214,255,0.6)",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 4,
  },
  detailValue: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
});
