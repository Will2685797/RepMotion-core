import React from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useTranslation } from "react-i18next";

type Props = {
  onPress: () => void;
};

export default function EndSessionButton({ onPress }: Props) {
   const { t } = useTranslation();
  return (
    <Pressable style={styles.btn} onPress={onPress}>
      <View style={styles.iconWrap}>
        <Ionicons name="checkmark-done-outline" size={14} color="#E9EEF8" />
      </View>
     <Text style={styles.text}>{t("endSessionButton.label")}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 42,
    borderRadius: 14,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    marginRight: 6,
  },
  text: {
    color: "#E9EEF8",
    fontWeight: "800",
    fontSize: 13,
  },
});