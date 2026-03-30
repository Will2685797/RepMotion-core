import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import HistoryCard from "../composants/repmotion/historique/HistoryCard";
import HistoryFilterChips from "../composants/repmotion/historique/HistoryFilterChips";
import { useNavigation } from "@react-navigation/native";
import { getSessionsWithSets } from "../db/db";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import DeleteSessionModal from "../composants/repmotion/historique/DeleteSessionModal";
import { deleteSession } from "../db/db";
import { useTranslation } from "react-i18next";

const FILTERS = [
  "all",
  "squat",
  "bench_press",
  "deadlift",
  "incline_bench_press",
  "overhead_press",
  "decline_bench_press",
];
export default function Historique() {
  const navigation = useNavigation<any>();
  const [activeFilter, setActiveFilter] = useState("all");
  const [sessions, setSessions] = useState<any[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedSessionToDelete, setSelectedSessionToDelete] = useState<
    any | null
  >(null);
  const { t } = useTranslation();

  const handleAskDeleteSession = (session: any) => {
    setSelectedSessionToDelete(session);
    setDeleteModalVisible(true);
  };

  const handleConfirmDeleteSession = async () => {
    try {
      if (!selectedSessionToDelete) return;

      await deleteSession(selectedSessionToDelete.id);

      setDeleteModalVisible(false);
      setSelectedSessionToDelete(null);

      await loadSessions();
    } catch (error) {
      console.error("Erreur suppression séance :", error);
    }
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalVisible(false);
    setSelectedSessionToDelete(null);
  };

  const loadSessions = async () => {
    try {
      const data = await getSessionsWithSets();
      console.log("HISTORIQUE DATA:", data);
      setSessions(data);
    } catch (error) {
      console.error("Erreur chargement historique :", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, []),
  );

  const filteredHistory = useMemo(() => {
    if (activeFilter === "all") return sessions;

    return sessions.filter((session) =>
      session.exercises.some((ex: any) => ex.exerciseName === activeFilter),
    );
  }, [activeFilter, sessions]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.overTitle}>{t("history.overTitle")}</Text>
        <Text style={styles.title}>
          {filteredHistory.length}{" "}
          {filteredHistory.length > 1
            ? t("history.session_other")
            : t("history.session_one")}
        </Text>
      </View>

      <HistoryFilterChips
        filters={FILTERS}
        activeFilter={activeFilter}
        onChange={setActiveFilter}
      />

      {filteredHistory.map((item) => (
        <HistoryCard
          key={item.id}
          item={item}
          onPress={(selectedItem) => {
            navigation.navigate("analyses", {
              session: selectedItem,
            });
          }}
          onLongPress={(selectedItem) => {
            handleAskDeleteSession(selectedItem);
          }}
        />
      ))}

      <DeleteSessionModal
        visible={deleteModalVisible}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDeleteSession}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#070A12",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 26,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 14,
  },
  overTitle: {
    color: "rgba(233,238,248,0.45)",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 34,
    fontWeight: "900",
  },
});
