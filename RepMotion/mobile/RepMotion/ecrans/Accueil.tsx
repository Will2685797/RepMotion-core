import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Animated,
  Easing,
} from "react-native";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";

import RepCounterRing from "../composants/repmotion/RepCounterRing";
import MetricCard from "../composants/repmotion/MetricCard";
import VelocityChart from "../composants/repmotion/VelocityChart";
import StartButton from "../composants/repmotion/StartButton";
import SetModal from "../composants/repmotion/SetModal";
import SessionStatusBanner from "../composants/repmotion/SessionStatusBanner";
import EndSessionButton from "../composants/repmotion/EndSessionButton";
import { useTranslation } from "react-i18next";
import { useWeightConfiguratorStore } from "../store/weightConfiguratorStore";

import { getDb } from "../db/db";
import { useAnalysisStore } from "../store/analysisStore";
import {
  createSession,
  getActiveSession,
  closeSession,
  addSetToSession,
} from "../db/db";

type CalibrationMap = Record<
  string,
  {
    isCalibrated: boolean;
    calibratedAt?: string;
    validRepCount?: number;
    quality?: "low" | "good" | "excellent";
  }
>;

export default function Accueil() {
  const navigation = useNavigation<any>();

  const [reps, setReps] = useState(0);
  const [phase, setPhase] = useState<"concentric" | "eccentric">("concentric");

  const isRunning = useAnalysisStore((s) => s.isRunning);
  const setIsRunning = useAnalysisStore((s) => s.setIsRunning);

  const storeExercise = useWeightConfiguratorStore((s) => s.selectedExercise);
  const storeWeightKg = useWeightConfiguratorStore((s) => s.selectedWeightKg);
  const storeUnit = useWeightConfiguratorStore((s) => s.selectedUnit);

  const [exercise, setExercise] = useState<string | null>(null);
  const [loadKg, setLoadKg] = useState<number | null>(null);
  const [showSetModal, setShowSetModal] = useState(false);
  const [activeSession, setActiveSession] = useState<any | null>(null);
  const [currentSetNumber, setCurrentSetNumber] = useState(1);
  const { t, i18n } = useTranslation();

  // MOCK TEMPORAIRE
  const [calibrations, setCalibrations] = useState<CalibrationMap>({
    squat: {
      isCalibrated: true,
      calibratedAt: "2026-03-19",
      validRepCount: 7,
      quality: "good",
    },
  });

  // Bloquer le choix d'exercice seulement pendant l'analyse
  const isExerciseDisabled = isRunning;

  const calibrationInfo = exercise ? calibrations[exercise] : undefined;
  const isCalibrated = !!calibrationInfo?.isCalibrated;

  const showEndButton = !!activeSession && !isRunning;
  const showCalibrationRow = !!exercise && !isRunning;
  const shouldPulseCalibration = !!exercise && !isRunning && !isCalibrated;

  const pulseAnim = useRef(new Animated.Value(1)).current;

  function formatDisplayWeight(weightKg: number | null, unit: "KG" | "LB") {
    if (weightKg === null) return "?";

    if (unit === "LB") {
      const weightLb = weightKg * 2.2046226218;

      return `${Math.round(weightLb)} lb`;
    }

    // KG = tu peux garder précision
    return Number.isInteger(weightKg)
      ? `${weightKg} kg`
      : `${weightKg
          .toFixed(2)
          .replace(/\.00$/, "")
          .replace(/(\.\d)0$/, "$1")} kg`;
  }

  useEffect(() => {
    if (storeExercise && storeWeightKg) {
      setExercise(storeExercise);
      setLoadKg(storeWeightKg);
    }
  }, [storeExercise, storeWeightKg]);

  useEffect(() => {
    if (!shouldPulseCalibration) {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();

    return () => loop.stop();
  }, [shouldPulseCalibration, pulseAnim]);

  const series = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => ({
      t: i,
      v: Math.max(
        0,
        0.8 + Math.sin(i * 0.25) * 0.25 + (Math.random() - 0.5) * 0.12,
      ),
    }));
  }, [isRunning]);

  const current = 0.84;
  const max = 1.12;
  const avg = 0.91;

  const handleCalibrationPress = async () => {
    if (!exercise) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    navigation.navigate("CalibrationSetupScreen", {
      exercise,
      loadKg,
      isCalibrated,
      onCalibrationSuccess: (exerciseName: string) => {
        setCalibrations((prev) => ({
          ...prev,
          [exerciseName]: {
            isCalibrated: true,
            calibratedAt: new Date().toISOString(),
            validRepCount: 7,
            quality: "good",
          },
        }));
      },
    });
  };

  const handleStartStop = async () => {
    try {
      if (!exercise || !loadKg) return;

      if (!isRunning && !isCalibrated) {
        Alert.alert(
          t("home.alerts.calibrationRequiredTitle"),
          t("home.alerts.calibrationRequiredMessage", { exercise }),
        );
        return;
      }

      if (!isRunning) {
        let session = await getActiveSession();

        if (!session) {
          const now = new Date();
          const locale = i18n.language === "fr" ? "fr-CA" : "en-CA";
          const dateLabel = now.toLocaleString(locale, {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          await createSession({
            dateLabel,
            startedAt: now.toISOString() as any,
            endedAt: null,
            isActive: 1,
          });

          session = await getActiveSession();
        }

        setActiveSession(session);
        setIsRunning(true);
        setReps(0);
        setPhase("concentric");
        return;
      }

      const session = await getActiveSession();

      if (!session) {
        setIsRunning(false);
        return;
      }

      const fakeSetData = {
        setLabel: t("home.setLabel", { number: currentSetNumber }),
        exercise,
        weightKg: loadKg,
        reps: reps || 8,
        avgVelocity: avg,
        maxVelocity: max,
        bestRep: 1,
        romDeg: 95,
        durationSec: 30,
        tutSec: 11.5,
        formScore: 76,
        formStatus: "Stable",
        formDescription: "Analyse simulée de la série.",
        declineText: "Légère baisse de vitesse sur les dernières reps.",
        stickingPointText: "Sticking point détecté au milieu du mouvement",
        stickingPointRep: Math.max(1, Math.min(reps || 8, 6)),
        stickingPointPercent: 0.36,
        velocities: series
          .slice(0, reps || 8)
          .map((point) => Number(point.v.toFixed(2))),
      };

      await addSetToSession(session.id, fakeSetData);

      const updatedSession = await getActiveSession();
      setActiveSession(updatedSession);
      setCurrentSetNumber((updatedSession?.sets?.length ?? 0) + 1);
      setIsRunning(false);
    } catch (error) {
      console.error("Erreur handleStartStop :", error);
    }
  };

  useEffect(() => {
    const loadActiveSession = async () => {
      try {
        const session = await getActiveSession();
        setActiveSession(session);

        if (session?.sets?.length) {
          setCurrentSetNumber(session.sets.length + 1);
        } else {
          setCurrentSetNumber(1);
        }
      } catch (error) {
        console.error("Erreur chargement séance active :", error);
      }
    };

    loadActiveSession();
  }, []);

  const handleEndSession = async () => {
    try {
      const session = await getActiveSession();
      if (!session) return;

      if ((session.setsCount ?? 0) === 0) {
        const db = await getDb();
        await db.runAsync("DELETE FROM sessions WHERE id = ?", [session.id]);

        setActiveSession(null);
        setCurrentSetNumber(1);
        setIsRunning(false);
        setExercise(null);
        setLoadKg(null);
        setReps(0);
        return;
      }

      await closeSession(session.id);

      setActiveSession(null);
      setCurrentSetNumber(1);
      setIsRunning(false);
      setExercise(null);
      setLoadKg(null);
      setReps(0);
    } catch (error) {
      console.error("Erreur fermeture séance :", error);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topZone}>
          {activeSession && (
            <SessionStatusBanner
              setsCount={activeSession.setsCount ?? 0}
              exerciseCount={activeSession.exercises?.length ?? 0}
            />
          )}

          <View style={styles.exerciseRow}>
            <Pressable
              disabled={isExerciseDisabled}
              style={[
                styles.exerciseChip,
                isExerciseDisabled && styles.disabled,
              ]}
              onPress={() => setShowSetModal(true)}
            >
              <Text style={styles.exerciseChipText}>
                {exercise
                  ? `${t(`exercises.${exercise}`)} · ${formatDisplayWeight(loadKg, storeUnit)}`
                  : t("home.chooseExercise")}
              </Text>
            </Pressable>

            {showEndButton && (
              <View style={styles.endButtonWrap}>
                <EndSessionButton onPress={handleEndSession} />
              </View>
            )}
          </View>

          {showCalibrationRow && (
            <View style={styles.calibrationRow}>
              <Text
                style={[
                  styles.calibrationText,
                  isCalibrated
                    ? styles.calibrationTextCalibrated
                    : styles.calibrationTextRequired,
                ]}
              >
                {isCalibrated
                  ? `${t("home.calibration.calibrated")}${
                      calibrationInfo?.quality
                        ? ` · ${t(`home.calibration.quality.${calibrationInfo.quality}`)}`
                        : ""
                    }${
                      calibrationInfo?.validRepCount
                        ? ` · ${t("home.calibration.validReps", {
                            count: calibrationInfo.validRepCount,
                          })}`
                        : ""
                    }`
                  : t("home.calibration.required")}
              </Text>

              <Animated.View
                style={[
                  styles.calibrationGlowWrap,
                  { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Pressable
                  onPress={handleCalibrationPress}
                  style={[
                    styles.calibrationGlowButton,
                    isCalibrated
                      ? styles.calibrationGlowButtonCalibrated
                      : styles.calibrationGlowButtonRequired,
                  ]}
                >
                  <View
                    style={[
                      styles.calibrationGlowInner,
                      isCalibrated
                        ? styles.calibrationGlowInnerCalibrated
                        : styles.calibrationGlowInnerRequired,
                    ]}
                  />
                </Pressable>
              </Animated.View>
            </View>
          )}
        </View>

        <View style={styles.analysisZone}>
          <RepCounterRing reps={reps} />

          <View style={styles.phaseRow}>
            <View style={styles.dot} />
            <Text style={styles.phaseText}>↑ {t(`home.phase.${phase}`)}</Text>
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <MetricCard
                label={t("home.metrics.current")}
                value={current}
                accent="#7AA7FF"
              />
            </View>

            <View style={styles.metricItem}>
              <MetricCard
                label={t("home.metrics.max")}
                value={max}
                accent="#39E6A0"
              />
            </View>

            <View style={styles.metricItemLast}>
              <MetricCard
                label={t("home.metrics.average")}
                value={avg}
                accent="#FFC84A"
              />
            </View>
          </View>

          <VelocityChart
            title={t("home.chart.title")}
            unit={t("home.chart.unit")}
            data={series}
          />
        </View>

        <SetModal
          visible={showSetModal}
          onClose={() => setShowSetModal(false)}
          onSave={(data: any) => {
            setExercise(data.exercise);
            setLoadKg(data.weightKg);
            setShowSetModal(false);
          }}
        />
      </ScrollView>

      <View style={styles.fixedActionBar}>
        <StartButton
          isRunning={isRunning}
          onPress={handleStartStop}
          disabled={!exercise || !isCalibrated}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#070A12",
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 120,
    alignItems: "center",
  },

  topZone: {
    width: "100%",
    marginBottom: 8,
  },

  exerciseRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  exerciseChip: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },

  exerciseChipText: {
    color: "rgba(233,238,248,0.75)",
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  endButtonWrap: {
    marginLeft: 10,
  },

  calibrationRow: {
    width: "100%",
    minHeight: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 6,
    marginBottom: 4,
  },

  calibrationText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.35,
  },

  calibrationTextRequired: {
    color: "rgba(255, 196, 84, 0.88)",
  },

  calibrationTextCalibrated: {
    color: "rgba(233,238,248,0.60)",
  },

  calibrationGlowWrap: {
    marginLeft: 10,
  },

  calibrationGlowButton: {
    width: 42,
    height: 42,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },

  calibrationGlowButtonRequired: {
    backgroundColor: "rgba(78,126,255,0.10)",
    borderColor: "rgba(78,126,255,0.28)",
    shadowColor: "#4E7EFF",
    shadowOpacity: 0.42,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  },

  calibrationGlowButtonCalibrated: {
    backgroundColor: "rgba(76,255,155,0.06)",
    borderColor: "rgba(76,255,155,0.18)",
    shadowColor: "#4CFF9B",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },

  calibrationGlowInner: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 3,
  },

  calibrationGlowInnerRequired: {
    borderColor: "#8CB3FF",
  },

  calibrationGlowInnerCalibrated: {
    borderColor: "#61F2B0",
  },

  analysisZone: {
    width: "100%",
    alignItems: "center",
  },

  phaseRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 14,
  },

  dot: {
    marginRight: 8,
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#4CFF9B",
    shadowColor: "#4CFF9B",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },

  phaseText: {
    letterSpacing: 2,
    fontWeight: "700",
    fontSize: 12,
    color: "rgba(233,238,248,0.55)",
  },

  metricsRow: {
    width: "100%",
    flexDirection: "row",
    marginBottom: 10,
  },

  metricItem: {
    flex: 1,
    marginRight: 10,
  },

  metricItemLast: {
    flex: 1,
  },

  fixedActionBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
    backgroundColor: "rgba(7,10,18,0.96)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },

  disabled: {
    opacity: 0.4,
  },
});
