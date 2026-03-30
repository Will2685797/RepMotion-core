import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  variant?: "warning" | "danger";
  title: string;
  description: string;
};

export default function AlertCard({
  variant = "warning",
  title,
  description,
}: Props) {
  const isDanger = variant === "danger";

  return (
    <View
      style={[
        styles.card,
        isDanger ? styles.cardDanger : styles.cardWarning,
      ]}
    >
      <Text
        style={[
          styles.title,
          isDanger ? styles.titleDanger : styles.titleWarning,
        ]}
      >
        {title}
      </Text>

      <Text
        style={[
          styles.description,
          isDanger ? styles.descDanger : styles.descWarning,
        ]}
      >
        {description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardWarning: {
    backgroundColor: "rgba(255,184,77,0.07)",
    borderColor: "rgba(255,184,77,0.35)",
  },
  cardDanger: {
    backgroundColor: "rgba(255,76,76,0.07)",
    borderColor: "rgba(255,76,76,0.35)",
  },
  title: {
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 4,
  },
  titleWarning: {
    color: "#FFB84D",
  },
  titleDanger: {
    color: "#FF6666",
  },
  description: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  descWarning: {
    color: "#FFCE7D",
  },
  descDanger: {
    color: "#FF8E8E",
  },
});
