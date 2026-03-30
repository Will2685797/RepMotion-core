import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  LayoutChangeEvent,
} from "react-native";
import ChartModeTabs from "./ChartModeTabs";
import { useTranslation } from "react-i18next";

type Props = {
  data: number[];
  stickingPointPercent: number;
  mode: "bars" | "curve";
  onChangeMode: (mode: "bars" | "curve") => void;
};

type Point = {
  x: number;
  y: number;
  value: number;
  percent: number;
};

export default function RepCurveChart({
  data,
  stickingPointPercent,
  mode,
  onChangeMode,
}: Props) {
  const [chartWidth, setChartWidth] = useState(260);
  const [selectedIndex, setSelectedIndex] = useState(1);
  const { t } = useTranslation();

  const chartHeight = 140;
  const paddingX = 16;
  const maxValue = useMemo(() => Math.max(...data, 1.2), [data]);

  const points: Point[] = useMemo(() => {
    if (data.length === 0) return [];

    return data.map((value, index) => {
      const percent = data.length === 1 ? 0 : index / (data.length - 1);
      const x = paddingX + percent * (chartWidth - paddingX * 2);
      const y = chartHeight - (value / maxValue) * (chartHeight - 12);

      return { x, y, value, percent };
    });
  }, [data, chartWidth, maxValue]);

  const selectedPoint = points[selectedIndex] || points[0];

  const updateSelectionFromX = (x: number) => {
    if (!points.length) return;

    let closestIndex = 0;
    let closestDistance = Math.abs(points[0].x - x);

    for (let i = 1; i < points.length; i++) {
      const d = Math.abs(points[i].x - x);
      if (d < closestDistance) {
        closestDistance = d;
        closestIndex = i;
      }
    }

    setSelectedIndex(closestIndex);
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          updateSelectionFromX(evt.nativeEvent.locationX);
        },
        onPanResponderMove: (evt) => {
          updateSelectionFromX(evt.nativeEvent.locationX);
        },
      }),
    [points],
  );

  const handleLayout = (e: LayoutChangeEvent) => {
    setChartWidth(e.nativeEvent.layout.width);
  };

  const stickingX =
    paddingX + stickingPointPercent * (chartWidth - paddingX * 2);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.title}>{t("repCurveChart.title")}</Text>
          <Text style={styles.subTitle}>{t("repCurveChart.subTitle")}</Text>
        </View>

        <View style={styles.rightTop}>
          <ChartModeTabs mode={mode} onChange={onChangeMode} />
          <Text style={styles.spTop}>
            {t("repCurveChart.spLabel")}{" "}
            {Math.round(stickingPointPercent * 100)}%
          </Text>
        </View>
      </View>

      <View style={styles.chartBox}>
        <View style={styles.gridYLabels}>
          <Text style={styles.axisText}>1.2</Text>
          <Text style={styles.axisText}>0.9</Text>
          <Text style={styles.axisText}>0.6</Text>
          <Text style={styles.axisText}>0.3</Text>
          <Text style={styles.axisText}>0</Text>
        </View>

        <View
          style={styles.plotArea}
          onLayout={handleLayout}
          {...panResponder.panHandlers}
        >
          {points.slice(0, -1).map((point, index) => {
            const next = points[index + 1];
            const dx = next.x - point.x;
            const dy = next.y - point.y;
            const length = Math.sqrt(dx * dx + dy * dy);
            const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

            return (
              <View
                key={`seg-${index}`}
                style={[
                  styles.segment,
                  {
                    width: length,
                    left: point.x,
                    top: point.y,
                    transform: [{ rotate: `${angle}deg` }],
                  },
                ]}
              />
            );
          })}

          {points.map((point, index) => (
            <View
              key={`pt-${index}`}
              style={[
                styles.point,
                {
                  left: point.x - 5,
                  top: point.y - 5,
                  opacity: selectedIndex === index ? 1 : 0.65,
                },
              ]}
            />
          ))}

          <View
            style={[
              styles.stickingLine,
              {
                left: stickingX,
              },
            ]}
          />

          {selectedPoint && (
            <>
              <View
                style={[
                  styles.activeLine,
                  {
                    left: selectedPoint.x,
                  },
                ]}
              />

              <View
                style={[
                  styles.tooltip,
                  {
                    left: Math.max(0, selectedPoint.x - 30),
                    top: Math.max(8, selectedPoint.y - 68),
                  },
                ]}
              >
                <Text style={styles.tooltipPercent}>
                  {Math.round(selectedPoint.percent * 100)}%
                </Text>
                <Text style={styles.tooltipValue}>
                  {selectedPoint.value.toFixed(2)} m/s
                </Text>
              </View>
            </>
          )}
        </View>
      </View>

      <Text style={styles.note}>{t("repCurveChart.note")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    padding: 16,
    backgroundColor: "#12172A",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginBottom: 14,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 10,
  },
  rightTop: {
    alignItems: "flex-end",
  },
  title: {
    color: "rgba(233,238,248,0.58)",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  subTitle: {
    color: "rgba(233,238,248,0.42)",
    fontSize: 13,
    fontWeight: "700",
  },
  chartBox: {
    flexDirection: "row",
    minHeight: 180,
  },
  gridYLabels: {
    width: 28,
    justifyContent: "space-between",
    paddingTop: 6,
    paddingBottom: 10,
  },
  axisText: {
    color: "rgba(233,238,248,0.32)",
    fontSize: 11,
    fontWeight: "700",
  },
  plotArea: {
    flex: 1,
    height: 140,
    position: "relative",
    marginLeft: 8,
    overflow: "hidden",
  },
  segment: {
    position: "absolute",
    height: 3,
    backgroundColor: "#25E39A",
    borderRadius: 999,
  },
  point: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#D9FFF2",
    borderWidth: 2,
    borderColor: "#25E39A",
  },
  stickingLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: "rgba(255,90,90,0.85)",
    borderRadius: 999,
  },
  activeLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(233,238,248,0.20)",
  },
  tooltip: {
    position: "absolute",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#171C31",
    borderWidth: 1,
    borderColor: "rgba(122,167,255,0.28)",
  },
  tooltipPercent: {
    color: "rgba(233,238,248,0.75)",
    fontSize: 12,
    fontWeight: "800",
  },
  tooltipValue: {
    color: "#25E39A",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 2,
  },
  note: {
    color: "rgba(233,238,248,0.48)",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 12,
  },
  spTop: {
    color: "#FF6A6A",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 8,
  },
});
