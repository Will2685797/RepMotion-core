import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import ChartModeTabs from "./ChartModeTabs";
import { useTranslation } from "react-i18next";

type Props = {
  data: number[];
  stickingPointRep: number;
  mode: "bars" | "curve";
  onChangeMode: (mode: "bars" | "curve") => void;
};

function getBarColor(index: number, data: number[], stickingPointRep: number) {
  const repNumber = index + 1;
  if (repNumber === 1) return "#25E39A";
  if (repNumber === stickingPointRep) return "#FF5A5A";
  if (repNumber === data.length) return "#D9A441";
  return "#4F74D9";
}

export default function RepBarsChart({
  data,
  stickingPointRep,
  mode,
  onChangeMode,
}: Props) {
  const [selectedIndex, setSelectedIndex] = useState(1);

  const selectedValue = data[selectedIndex] ?? 0;
  const maxValue = useMemo(() => Math.max(...data, 1.2), [data]);
  const { t } = useTranslation();

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.title}>{t("repBarsChart.title")}</Text>
          <Text style={styles.subTitle}>{t("repBarsChart.subTitle")}</Text>
        </View>

        <ChartModeTabs mode={mode} onChange={onChangeMode} />
      </View>

      <View style={styles.chartArea}>
        <View style={styles.yAxis}>
          <Text style={styles.axisText}>1.2</Text>
          <Text style={styles.axisText}>0.9</Text>
          <Text style={styles.axisText}>0.6</Text>
          <Text style={styles.axisText}>0.3</Text>
          <Text style={styles.axisText}>0</Text>
        </View>

        <View style={styles.barsWrap}>
          <View style={styles.tooltipWrap}>
            <View style={styles.tooltip}>
              <Text style={styles.tooltipRep}>
                {t("repBarsChart.repShort")} {selectedIndex + 1}
              </Text>
              <Text style={styles.tooltipValue}>
                {selectedValue.toFixed(2)} m/s
              </Text>
            </View>
          </View>

          <View style={styles.barsRow}>
            {data.map((value, index) => {
              const height = Math.max((value / maxValue) * 120, 18);

              return (
                <Pressable
                  key={index}
                  style={styles.barItem}
                  onPress={() => setSelectedIndex(index)}
                >
                  <View
                    style={[
                      styles.bar,
                      {
                        height,
                        backgroundColor: getBarColor(
                          index,
                          data,
                          stickingPointRep,
                        ),
                        opacity: selectedIndex === index ? 1 : 0.92,
                      },
                    ]}
                  />
                  <Text style={styles.repLabel}>{index + 1}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: "#25E39A" }]} />
          <Text style={styles.legendText}>{t("repBarsChart.bestRep")}</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: "#D9A441" }]} />
          <Text style={styles.legendText}>{t("repBarsChart.decline")}</Text>
        </View>

        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: "#FF5A5A" }]} />
          <Text style={styles.legendText}>{t("repBarsChart.stickingPoint")}</Text>
        </View>
      </View>
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
    marginBottom: 14,
    gap: 10,
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
  chartArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    minHeight: 180,
  },
  yAxis: {
    width: 28,
    justifyContent: "space-between",
    height: 130,
    marginRight: 8,
  },
  axisText: {
    color: "rgba(233,238,248,0.32)",
    fontSize: 11,
    fontWeight: "700",
  },
  barsWrap: {
    flex: 1,
  },
  tooltipWrap: {
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  tooltip: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#171C31",
    borderWidth: 1,
    borderColor: "rgba(122,167,255,0.28)",
  },
  tooltipRep: {
    color: "rgba(233,238,248,0.7)",
    fontSize: 12,
    fontWeight: "800",
  },
  tooltipValue: {
    color: "#7AA7FF",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 2,
  },
  barsRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 130,
  },
  barItem: {
    alignItems: "center",
    width: 28,
  },
  bar: {
    width: 14,
    borderRadius: 5,
    marginBottom: 8,
  },
  repLabel: {
    color: "rgba(233,238,248,0.55)",
    fontSize: 12,
    fontWeight: "700",
  },
  legend: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 14,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 14,
    marginBottom: 8,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 999,
    marginRight: 6,
  },
  legendText: {
    color: "rgba(233,238,248,0.58)",
    fontSize: 12,
    fontWeight: "700",
  },
});
