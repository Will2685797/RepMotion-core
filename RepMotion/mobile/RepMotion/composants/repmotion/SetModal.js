import React, { useEffect, useState } from "react";
import { Modal, View, Text, StyleSheet, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { useWeightConfiguratorStore } from "../../store/weightConfiguratorStore";

const EXERCISES = [
  "squat",
  "bench_press",
  "deadlift",
  "incline_bench_press",
  "overhead_press",
  "decline_bench_press",
];

export default function SetModal({ visible, onClose, onSave }) {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [exercise, setExercise] = useState("");
  const [selectedWeightKg, setSelectedWeightKg] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState("KG");
  const [showExerciseList, setShowExerciseList] = useState(false);

  const storeExercise = useWeightConfiguratorStore((s) => s.selectedExercise);
  const storeWeightKg = useWeightConfiguratorStore((s) => s.selectedWeightKg);
  const storeUnit = useWeightConfiguratorStore((s) => s.selectedUnit);

  const hasExercise = exercise.trim().length > 0;
  const hasWeight = selectedWeightKg !== null && selectedWeightKg > 0;
  const canSave = hasExercise && hasWeight;

  function formatDisplayWeight(weightKg, unit) {
    if (weightKg === null) return "?";

    const formatNumber = (value) =>
      Number.isInteger(value)
        ? `${value}`
        : value
            .toFixed(2)
            .replace(/\.00$/, "")
            .replace(/(\.\d)0$/, "$1");

    if (unit === "LB") {
      return `${Math.round(weightKg * 2.2046226218)} lb`;
    }

    return `${formatNumber(weightKg)} kg`;
  }

  const handleOpenWeightConfigurator = () => {
    if (!hasExercise) return;

    setShowExerciseList(false);
    onClose?.();

    setTimeout(() => {
      navigation.navigate("RepWeightConfiguratorTest", {
        exercise,
      });
    }, 30);
  };

  useEffect(() => {
    if (visible && storeWeightKg === null) {
      setSelectedWeightKg(null);
      setSelectedUnit("KG");
    }
  }, [visible, storeWeightKg]);

  useEffect(() => {
    if (visible && storeWeightKg !== null) {
      setSelectedWeightKg(storeWeightKg);
      setSelectedUnit(storeUnit || "KG");

      if (storeExercise) {
        setExercise(storeExercise);
      }
    }
  }, [visible, storeWeightKg, storeUnit, storeExercise]);

  useEffect(() => {
    if (!visible) {
      setShowExerciseList(false);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{t("setModal.title")}</Text>

          <Text style={styles.label}>{t("setModal.exercise")}</Text>

          <Pressable
            style={[styles.input, showExerciseList && styles.inputActive]}
            onPress={() => setShowExerciseList((prev) => !prev)}
          >
            <Text
              style={[styles.inputText, !hasExercise && styles.placeholderText]}
            >
              {hasExercise
                ? t(`exercises.${exercise}`)
                : t("setModal.selectExercise")}
            </Text>

            <Ionicons
              name={showExerciseList ? "chevron-up" : "chevron-down"}
              size={18}
              color="rgba(233,238,248,0.75)"
            />
          </Pressable>

          {showExerciseList && (
            <View style={styles.dropdown}>
              {EXERCISES.map((item) => {
                const isSelected = item === exercise;

                return (
                  <Pressable
                    key={item}
                    style={[
                      styles.dropdownItem,
                      isSelected && styles.dropdownItemSelected,
                    ]}
                    onPress={() => {
                      const changed = item !== exercise;

                      setExercise(item);
                      setShowExerciseList(false);

                      if (changed) {
                        setSelectedWeightKg(null);
                        setSelectedUnit("KG");
                      }
                    }}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        isSelected && styles.dropdownItemTextSelected,
                      ]}
                    >
                      {t(`exercises.${item}`)}
                    </Text>

                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#4C7DFF"
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          )}

          <Text style={styles.label}>{t("setModal.weightKg")}</Text>

          <Pressable
            style={[
              styles.weightButton,
              !hasExercise && styles.weightButtonDisabled,
            ]}
            disabled={!hasExercise}
            onPress={handleOpenWeightConfigurator}
          >
            <View style={styles.weightButtonLeft}>
              <View
                style={[
                  styles.weightIconWrap,
                  !hasExercise && styles.weightIconWrapDisabled,
                ]}
              >
                <Ionicons
                  name="barbell-outline"
                  size={18}
                  color={hasExercise ? "#FFFFFF" : "rgba(255,255,255,0.35)"}
                />
              </View>

              <View style={styles.weightTextWrap}>
                <Text
                  style={[
                    styles.weightButtonTitle,
                    !hasExercise && styles.placeholderText,
                  ]}
                >
                  {hasWeight
                    ? formatDisplayWeight(selectedWeightKg, selectedUnit)
                    : hasExercise
                      ? t("setModal.configureWeight")
                      : t("setModal.selectExerciseFirst")}
                </Text>

                <Text
                  style={[
                    styles.weightButtonSubtitle,
                    !hasExercise && styles.placeholderText,
                  ]}
                >
                  {hasWeight
                    ? t("setModal.displayUnit", { unit: selectedUnit })
                    : t("setModal.openInteractiveBar")}
                </Text>
              </View>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={
                hasExercise
                  ? "rgba(233,238,248,0.75)"
                  : "rgba(233,238,248,0.25)"
              }
            />
          </Pressable>

          <View style={styles.row}>
            <Pressable style={styles.btnGhost} onPress={onClose}>
              <Text style={styles.btnGhostText}>{t("setModal.cancel")}</Text>
            </Pressable>

            <Pressable
              style={[styles.btnPrimary, !canSave && styles.btnDisabled]}
              disabled={!canSave}
              onPress={() => {
                if (!selectedWeightKg) return;

                onSave({
                  exercise,
                  weightKg: selectedWeightKg,
                });

                setExercise("");
                setSelectedWeightKg(null);
                setSelectedUnit("KG");
                setShowExerciseList(false);
              }}
            >
              <Text style={styles.btnPrimaryText}>{t("setModal.save")}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: 16,
  },
  card: {
    borderRadius: 22,
    padding: 18,
    backgroundColor: "#0B1020",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  title: {
    color: "#E9EEF8",
    fontWeight: "900",
    fontSize: 22,
    marginBottom: 14,
  },
  label: {
    color: "rgba(233,238,248,0.58)",
    fontWeight: "700",
    marginTop: 10,
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    minHeight: 50,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputActive: {
    borderColor: "rgba(76,125,255,0.85)",
    backgroundColor: "rgba(76,125,255,0.08)",
  },
  inputText: {
    color: "#E9EEF8",
    fontSize: 15,
    fontWeight: "700",
  },
  placeholderText: {
    color: "rgba(233,238,248,0.35)",
  },
  dropdown: {
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: "#11182B",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  dropdownItem: {
    minHeight: 50,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownItemSelected: {
    backgroundColor: "rgba(76,125,255,0.08)",
  },
  dropdownItemText: {
    color: "#E9EEF8",
    fontSize: 15,
    fontWeight: "600",
  },
  dropdownItemTextSelected: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  weightButton: {
    minHeight: 64,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  weightButtonDisabled: {
    opacity: 0.55,
  },
  weightButtonLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  weightTextWrap: {
    flex: 1,
  },
  weightIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#4C7DFF",
    alignItems: "center",
    justifyContent: "center",
  },
  weightIconWrapDisabled: {
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  weightButtonTitle: {
    color: "#E9EEF8",
    fontSize: 15,
    fontWeight: "800",
  },
  weightButtonSubtitle: {
    color: "rgba(233,238,248,0.52)",
    fontSize: 12,
    marginTop: 2,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  btnGhost: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  btnGhostText: {
    color: "rgba(233,238,248,0.78)",
    fontWeight: "800",
    fontSize: 15,
  },
  btnPrimary: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#4C7DFF",
  },
  btnDisabled: {
    opacity: 0.4,
  },
  btnPrimaryText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 15,
  },
});
