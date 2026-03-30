import React from "react";
import { ScrollView, Pressable, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";

type Props = {
  filters: string[];
  activeFilter: string;
  onChange: (filter: string) => void;
};

export default function HistoryFilterChips({
  filters,
  activeFilter,
  onChange,
}: Props) {
  const { t } = useTranslation();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {filters.map((filter) => {
        const active = activeFilter === filter;

        return (
          <Pressable
            key={filter}
            onPress={() => onChange(filter)}
            style={[styles.chip, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {filter === "all"
                ? t("historyFilters.all")
                : t(`exercises.${filter}`)}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingBottom: 16,
  },
  chip: {
    height: 38,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    marginRight: 10,
  },
  chipActive: {
    backgroundColor: "rgba(76,125,255,0.18)",
    borderColor: "rgba(76,125,255,0.45)",
  },
  chipText: {
    color: "rgba(233,238,248,0.65)",
    fontWeight: "800",
  },
  chipTextActive: {
    color: "#7AA7FF",
  },
});
