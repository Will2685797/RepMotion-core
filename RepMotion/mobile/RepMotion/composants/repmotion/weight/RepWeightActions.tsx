import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

type Props = {
  canUndo: boolean;
  canReset: boolean;
  onUndo: () => void;
  onReset: () => void;
};

export default function RepWeightActions({
  canUndo,
  canReset,
  onUndo,
  onReset,
}: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.undoButton, !canUndo && styles.disabled]}
        onPress={onUndo}
        disabled={!canUndo}
      >
       <Text style={styles.undoText}>{t("weightActions.undoLast")}</Text>
      </Pressable>

      <Pressable
        style={[styles.resetButton, !canReset && styles.disabled]}
        onPress={onReset}
        disabled={!canReset}
      >
        <Text style={styles.resetText}>{t("weightActions.reset")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginBottom: 18,
  },
  undoButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: "rgba(140, 0, 20, 0.28)",
    borderWidth: 1,
    borderColor: "rgba(255,77,79,0.45)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  resetButton: {
    width: 92,
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  undoText: {
    color: "#FF6B6B",
    fontSize: 15,
    fontWeight: "900",
  },
  resetText: {
    color: "rgba(233,238,248,0.72)",
    fontSize: 15,
    fontWeight: "900",
  },
  disabled: {
    opacity: 0.35,
  },
});