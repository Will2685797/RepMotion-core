import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useTranslation } from "react-i18next";

type Props = {
  mode: "bars" | "curve";
  onChange: (mode: "bars" | "curve") => void;
};

export default function ChartModeTabs({ mode, onChange }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.wrap}>
      <Pressable
        style={[styles.tab, mode === "bars" && styles.tabActive]}
        onPress={() => onChange("bars")}
      >
        <Text style={[styles.text, mode === "bars" && styles.textActive]}>
          {t("chartMode.bars")}
        </Text>
      </Pressable>

      <Pressable
        style={[styles.tab, mode === "curve" && styles.tabActive]}
        onPress={() => onChange("curve")}
      >
        <Text style={[styles.text, mode === "curve" && styles.textActive]}>
          {t("chartMode.curve")}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: "rgba(76,125,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(76,125,255,0.45)",
  },
  text: {
    color: "rgba(233,238,248,0.55)",
    fontWeight: "800",
  },
  textActive: {
    color: "#7AA7FF",
  },
});
