import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Unit = "LB" | "KG";

type Props = {
  platesPerSide: number[];
  unit: Unit;
};

function formatWeight(value: number) {
  return Number.isInteger(value)
    ? `${value}`
    : value.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
}

function getPlateStyle(value: number, unit: Unit) {
  if (unit === "KG") {
    if (value === 25) return { width: 28, height: 96, color: "#FF4D4F", textColor: "#FFFFFF" };
    if (value === 20) return { width: 26, height: 90, color: "#4F83FF", textColor: "#FFFFFF" };
    if (value === 15) return { width: 24, height: 84, color: "#F7B731", textColor: "#FFFFFF" };
    if (value === 10) return { width: 22, height: 76, color: "#20D997", textColor: "#FFFFFF" };
    if (value === 5) return { width: 20, height: 68, color: "#8B6CFF", textColor: "#FFFFFF" };
    if (value === 2.5) return { width: 18, height: 60, color: "#B9BDC7", textColor: "#111827" };
    return { width: 16, height: 52, color: "#F6B329", textColor: "#111827" };
  }

  if (value === 45) return { width: 28, height: 96, color: "#FF4D4F", textColor: "#FFFFFF" };
  if (value === 35) return { width: 26, height: 90, color: "#4F83FF", textColor: "#FFFFFF" };
  if (value === 25) return { width: 24, height: 84, color: "#F7B731", textColor: "#FFFFFF" };
  if (value === 10) return { width: 22, height: 76, color: "#20D997", textColor: "#FFFFFF" };
  if (value === 5) return { width: 20, height: 68, color: "#8B6CFF", textColor: "#FFFFFF" };
  return { width: 18, height: 60, color: "#B9BDC7", textColor: "#111827" };
}

function Plate({
  value,
  unit,
  mirrored,
}: {
  value: number;
  unit: Unit;
  mirrored?: boolean;
}) {
  const visual = getPlateStyle(value, unit);

  return (
    <View
      style={[
        styles.plate,
        {
          width: visual.width,
          height: visual.height,
          backgroundColor: visual.color,
        },
      ]}
    >
      <Text
        style={[
          styles.plateText,
          {
            color: visual.textColor,
            transform: [{ rotate: mirrored ? "180deg" : "0deg" }],
          },
        ]}
      >
        {formatWeight(value)}
      </Text>
    </View>
  );
}

export default function RepWeightBarLive({ platesPerSide, unit }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.stage}>
        <View style={styles.bar} />
        <View style={styles.centerGrip} />
        <View style={styles.centerRingLeft} />
        <View style={styles.centerRingRight} />

        <View style={styles.leftGroup}>
          {[...platesPerSide].reverse().map((plate, index) => (
            <Plate
              key={`left-${plate}-${index}`}
              value={plate}
              unit={unit}
            />
          ))}
          <View style={styles.collar} />
        </View>

        <View style={styles.rightGroup}>
          <View style={styles.collar} />
          {platesPerSide.map((plate, index) => (
            <Plate
              key={`right-${plate}-${index}`}
              value={plate}
              unit={unit}
              mirrored
            />
          ))}
        </View>
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
  stage: {
    height: 140,
    borderRadius: 20,
    backgroundColor: "#15172B",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  },
  bar: {
    position: "absolute",
    left: 36,
    right: 36,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#C7CFDA",
  },
  centerGrip: {
    width: 76,
    height: 14,
    borderRadius: 999,
    backgroundColor: "#3C4054",
  },
  centerRingLeft: {
    position: "absolute",
    left: "50%",
    marginLeft: -22,
    width: 9,
    height: 22,
    borderRadius: 999,
    backgroundColor: "#9AA4B6",
  },
  centerRingRight: {
    position: "absolute",
    left: "50%",
    marginLeft: 13,
    width: 9,
    height: 22,
    borderRadius: 999,
    backgroundColor: "#9AA4B6",
  },
  leftGroup: {
    position: "absolute",
    left: 30,
    top: 20,
    bottom: 20,
    width: 118,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  rightGroup: {
    position: "absolute",
    right: 30,
    top: 20,
    bottom: 20,
    width: 118,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  collar: {
    width: 10,
    height: 24,
    borderRadius: 4,
    backgroundColor: "#6B7184",
    marginHorizontal: 3,
  },
  plate: {
    borderRadius: 6,
    marginHorizontal: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  plateText: {
    fontSize: 9,
    fontWeight: "900",
  },
});