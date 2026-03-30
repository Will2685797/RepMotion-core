import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import RepWeightTopCard from "../composants/repmotion/weight/RepWeightTopCard";
import RepWeightBarLive from "../composants/repmotion/weight/RepWeightBarLive";
import RepWeightPlateGrid from "../composants/repmotion/weight/RepWeightPlateGrid";
import RepWeightActions from "../composants/repmotion/weight/RepWeightActions";
import { useTranslation } from "react-i18next";
import { useWeightConfiguratorStore } from "../store/weightConfiguratorStore";

type Unit = "LB" | "KG";

const BAR_WEIGHT_LB = 45;
const BAR_WEIGHT_KG = 20;

const LB_PLATES = [45, 35, 25, 10, 5, 2.5];
const KG_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

function formatWeight(value: number) {
  return Number.isInteger(value)
    ? `${value}`
    : value
        .toFixed(2)
        .replace(/\.00$/, "")
        .replace(/(\.\d)0$/, "$1");
}



export default function RepWeightConfiguratorTest() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const setSelection = useWeightConfiguratorStore((s) => s.setSelection);
  const storedUnit = useWeightConfiguratorStore((s) => s.selectedUnit);
  const storedPlatesPerSide = useWeightConfiguratorStore(
    (s) => s.platesPerSide,
  );

  const exercise = route?.params?.exercise ?? "";
  const [unit, setUnit] = useState<Unit>(storedUnit || "LB");
  const [platesPerSide, setPlatesPerSide] = useState<number[]>(
    storedPlatesPerSide.length > 0
      ? storedPlatesPerSide
      : storedUnit === "KG"
        ? [20]
        : [45],
  );

  const barWeight = unit === "KG" ? BAR_WEIGHT_KG : BAR_WEIGHT_LB;
  const availablePlates = unit === "KG" ? KG_PLATES : LB_PLATES;

  const sideWeight = useMemo(() => {
    return platesPerSide.reduce((sum, current) => sum + current, 0);
  }, [platesPerSide]);

  const totalWeight = useMemo(() => {
    return barWeight + sideWeight * 2;
  }, [barWeight, sideWeight]);

  const currentBreakdown = useMemo(() => {
    if (!platesPerSide.length) return t("weight.noPlates");
    return platesPerSide.map((p) => formatWeight(p)).join(" + ");
  }, [platesPerSide]);

  const lightHaptic = async () => {
    try {
      await Haptics.selectionAsync();
    } catch {}
  };

  const mediumHaptic = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {}
  };

  const warningHaptic = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch {}
  };

  const successHaptic = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {}
  };

  const handleChangeUnit = async (nextUnit: Unit) => {
    if (nextUnit === unit) return;

    setUnit(nextUnit);
    setPlatesPerSide(nextUnit === "LB" ? [45] : [20]);

    await mediumHaptic();
  };

  const handleAddPlate = async (plate: number) => {
    setPlatesPerSide((prev) => [...prev, plate]);
    await lightHaptic();
  };

  const handleUndo = async () => {
    if (!platesPerSide.length) {
      await warningHaptic();
      return;
    }

    setPlatesPerSide((prev) => prev.slice(0, -1));
    await mediumHaptic();
  };

  const handleReset = async () => {
    if (!platesPerSide.length) {
      await warningHaptic();
      return;
    }

    setPlatesPerSide([]);
    await mediumHaptic();
  };

  const handleConfirm = async () => {
    const weightKg = unit === "KG" ? totalWeight : totalWeight * 0.45359237;

    setSelection({
      selectedExercise: exercise || null,
      selectedWeightKg: weightKg,
      selectedUnit: unit,
      platesPerSide,
    });

    await successHaptic();
    navigation.goBack();
  };
  useEffect(() => {
  setUnit(storedUnit || "LB");

  if (storedPlatesPerSide.length > 0) {
    setPlatesPerSide(storedPlatesPerSide);
  } else {
    setPlatesPerSide((storedUnit || "LB") === "KG" ? [20] : [45]);
  }
}, [storedUnit, storedPlatesPerSide]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.header}>
            <Text style={styles.pageTitle}>{t("weight.title")}</Text>
            <Text style={styles.pageSubtitle}>
              {exercise
                ? t("weight.exerciseLabel", { exercise })
                : t("weight.selectLoad")}
            </Text>
          </View>

          <RepWeightTopCard
            totalWeight={totalWeight}
            sideWeight={sideWeight}
            barWeight={barWeight}
            unit={unit}
            onChangeUnit={handleChangeUnit}
          />

          <RepWeightBarLive platesPerSide={platesPerSide} unit={unit} />

          <View style={styles.breakdownCard}>
            <Text style={styles.breakdownLabel}>
              {t("weight.currentConfig")}
            </Text>
            <Text style={styles.breakdownValue}>{currentBreakdown} / côté</Text>
          </View>

          <RepWeightPlateGrid
            values={availablePlates}
            unit={unit}
            onSelect={handleAddPlate}
          />

          <RepWeightActions
            canUndo={platesPerSide.length > 0}
            canReset={platesPerSide.length > 0}
            onUndo={handleUndo}
            onReset={handleReset}
          />
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={styles.confirmButton} onPress={handleConfirm}>
            <Text style={styles.confirmButtonText}>
              {t("weight.confirm", {
                weight: formatWeight(totalWeight),
                unit: unit.toLowerCase(),
              })}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#070B16",
  },
  container: {
    flex: 1,
    backgroundColor: "#070B16",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 170,
  },
  header: {
    marginBottom: 14,
    paddingTop: 4,
  },
  pageTitle: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 4,
  },
  pageSubtitle: {
    color: "rgba(233,238,248,0.6)",
    fontSize: 13,
    fontWeight: "600",
  },

  breakdownCard: {
    backgroundColor: "#121426",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginBottom: 14,
  },
  breakdownLabel: {
    color: "rgba(201,214,255,0.55)",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
  },
  breakdownValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
    backgroundColor: "rgba(7,11,22,0.98)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
  },
  confirmButton: {
    minHeight: 52,
    borderRadius: 18,
    backgroundColor: "#4C7DFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
});
