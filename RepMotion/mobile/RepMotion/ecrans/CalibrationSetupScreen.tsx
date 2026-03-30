import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

type Phase = "ready" | "recording" | "success";

export default function CalibrationSetupScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const {
    exercise,
    loadKg,
    isCalibrated,
    onCalibrationSuccess,
  } = route.params || {};

  const [phase, setPhase] = useState<Phase>("ready");
  const [repCount, setRepCount] = useState(0);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  const isRecording = phase === "recording";
  const isSuccess = phase === "success";

  useEffect(() => {
    if (!isRecording) return;

    setRepCount(0);

    const interval = setInterval(() => {
      setRepCount((prev) => {
        const next = prev + 1;

        if (next >= 10) {
          setPhase("success");
          return next;
        }

        return next;
      });
    }, 800);

    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (!isRecording) {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    loop.start();
    return () => loop.stop();
  }, [isRecording, pulseAnim]);

  useEffect(() => {
    if (!isSuccess) return;

    const finish = async () => {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (typeof onCalibrationSuccess === "function" && exercise) {
        onCalibrationSuccess(exercise);
      }

      setTimeout(() => {
        navigation.goBack();
      }, 1200);
    };

    finish();
  }, [isSuccess, onCalibrationSuccess, exercise, navigation]);

  const handleStart = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRepCount(0);
    setPhase("recording");
  };

  const handleStop = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (repCount >= 5) {
      setPhase("success");
      return;
    }

    setPhase("ready");
  };

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>REPMOTION</Text>

        <Text style={styles.title}>
          {isCalibrated ? "Recalibration" : "Calibration"}
        </Text>

        <Text style={styles.subtitle}>
          {exercise ?? "Aucun exercice"}
          {loadKg != null ? ` · ${loadKg} kg` : ""}
        </Text>
      </View>

      <View style={styles.center}>
        <Animated.View
          style={[
            styles.circleWrap,
            isRecording && styles.circleWrapActive,
            isSuccess && styles.circleWrapSuccess,
            { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <View
            style={[
              styles.circleOuter,
              isSuccess && styles.circleOuterSuccess,
            ]}
          >
            <View
              style={[
                styles.circleInner,
                isSuccess && styles.circleInnerSuccess,
              ]}
            />
          </View>
        </Animated.View>

        <Text style={styles.stateTitle}>
          {isSuccess
            ? "Calibration réussie"
            : isRecording
              ? "Calibration en cours..."
              : "Prêt à calibrer"}
        </Text>

        <View style={styles.statusBlock}>
          {isSuccess ? (
            <>
              <Text style={styles.repOkText}>Calibration terminée ✔</Text>
              <Text style={styles.readyText}>
                Retour à l’accueil...
              </Text>
            </>
          ) : isRecording ? (
            <>
              <Text style={styles.repCountText}>Reps détectées : {repCount}</Text>

              {repCount < 5 ? (
                <Text style={styles.repHintText}>
                  Minimum 5 répétitions requises
                </Text>
              ) : (
                <Text style={styles.repOkText}>Calibration suffisante ✔</Text>
              )}
            </>
          ) : (
            <Text style={styles.readyText}>
              Lance la calibration pour enregistrer ton mouvement de référence.
            </Text>
          )}
        </View>

        <View style={styles.infoBlock}>
          {isSuccess ? (
            <>
              <Text style={styles.infoLineActive}>
                {repCount} répétitions retenues
              </Text>
              <Text style={styles.infoLineMuted}>
                Modèle de calibration créé
              </Text>
            </>
          ) : !isRecording ? (
            <>
              <Text style={styles.infoLine}>1. Fixe le capteur sur la barre</Text>
              <Text style={styles.infoLine}>2. Place-toi correctement</Text>
              <Text style={styles.infoLine}>3. Reste stable 1–2 secondes</Text>
              <Text style={styles.infoLine}>4. Fais 5 à 10 répétitions propres</Text>
              <Text style={styles.infoLine}>5. Reracke puis arrête</Text>
            </>
          ) : (
            <>
              <Text style={styles.infoLineActive}>Analyse du mouvement...</Text>
              <Text style={styles.infoLineMuted}>
                Détection des répétitions valides
              </Text>
              <Text style={styles.infoLineMuted}>
                Construction du modèle de calibration
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        {!isRecording && !isSuccess ? (
          <Pressable style={styles.primaryButton} onPress={handleStart}>
            <Text style={styles.primaryButtonText}>
              Démarrer la calibration
            </Text>
          </Pressable>
        ) : isRecording ? (
          <Pressable style={styles.primaryButton} onPress={handleStop}>
            <Text style={styles.primaryButtonText}>
              Arrêter la calibration
            </Text>
          </Pressable>
        ) : (
          <View style={styles.primaryButtonDisabled}>
            <Text style={styles.primaryButtonText}>Calibration terminée</Text>
          </View>
        )}

        {!isSuccess && (
          <Pressable
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryButtonText}>Retour</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#070A12",
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 26,
  },

  header: {
    paddingTop: 10,
  },

  eyebrow: {
    color: "rgba(233,238,248,0.46)",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.8,
    marginBottom: 10,
  },

  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
  },

  subtitle: {
    color: "rgba(233,238,248,0.68)",
    fontSize: 15,
    fontWeight: "600",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  circleWrap: {
    marginBottom: 22,
    borderRadius: 999,
  },

  circleWrapActive: {
    shadowColor: "#4E7EFF",
    shadowOpacity: 0.55,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
  },

  circleWrapSuccess: {
    shadowColor: "#4CFF9B",
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
  },

  circleOuter: {
    width: 104,
    height: 104,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(78,126,255,0.28)",
    backgroundColor: "rgba(78,126,255,0.04)",
    justifyContent: "center",
    alignItems: "center",
  },

  circleOuterSuccess: {
    borderColor: "rgba(76,255,155,0.26)",
    backgroundColor: "rgba(76,255,155,0.05)",
  },

  circleInner: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 4,
    borderColor: "#4E7EFF",
  },

  circleInnerSuccess: {
    borderColor: "#4CFF9B",
  },

  stateTitle: {
    color: "white",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 12,
  },

  statusBlock: {
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  repCountText: {
    color: "#6E96FF",
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 6,
  },

  repHintText: {
    color: "rgba(233,238,248,0.50)",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },

  repOkText: {
    color: "#4CFF9B",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },

  readyText: {
    color: "rgba(233,238,248,0.58)",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 22,
  },

  infoBlock: {
    width: "100%",
    minHeight: 140,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },

  infoLine: {
    color: "rgba(233,238,248,0.78)",
    fontSize: 15,
    lineHeight: 26,
    textAlign: "center",
  },

  infoLineActive: {
    color: "#6E96FF",
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 28,
    textAlign: "center",
    marginBottom: 6,
  },

  infoLineMuted: {
    color: "rgba(233,238,248,0.46)",
    fontSize: 14,
    lineHeight: 24,
    textAlign: "center",
  },

  footer: {
    gap: 12,
  },

  primaryButton: {
    backgroundColor: "#4E7EFF",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },

  primaryButtonDisabled: {
    backgroundColor: "rgba(78,126,255,0.45)",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },

  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
  },

  secondaryButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(255,255,255,0.02)",
  },

  secondaryButtonText: {
    color: "rgba(233,238,248,0.74)",
    fontSize: 15,
    fontWeight: "700",
  },
});