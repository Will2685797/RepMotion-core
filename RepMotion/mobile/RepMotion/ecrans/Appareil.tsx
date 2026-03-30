import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";


type SettingRowProps = {
  label: string;
  value: string;
  onPress: () => void;
};

function SettingRow({ label, value, onPress }: SettingRowProps) {
  return (
    <Pressable style={styles.settingRow} onPress={onPress}>
      <Text style={styles.settingLabel}>{label}</Text>

      <View style={styles.settingRight}>
        <Text style={styles.settingValue}>{value}</Text>
        <Ionicons
          name="chevron-forward"
          size={16}
          color="rgba(233,238,248,0.35)"
        />
      </View>
    </Pressable>
  );
}

export default function Appareil() {
  const [isConnected, setIsConnected] = useState(false);

  const [speedUnit, setSpeedUnit] = useState("m/s");
  const [formSensitivity, setFormSensitivity] = useState("Normale");
  const [autoExport, setAutoExport] = useState("Désactivé");

  const handleConnect = () => {
    setIsConnected((prev) => !prev);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.overTitle}>APPAREIL</Text>
        <Text style={styles.title}>Module RepMotion</Text>
      </View>

      <View style={styles.deviceCard}>
        <View style={styles.deviceTop}>
          <View style={styles.iconBox}>
            <Ionicons
              name="hardware-chip-outline"
              size={28}
              color="rgba(233,238,248,0.40)"
            />
          </View>

          <View style={styles.deviceInfo}>
            <View style={styles.deviceTitleRow}>
              <Text style={styles.deviceName}>RM-01 Sensor</Text>

              <View
                style={[
                  styles.statusBadge,
                  isConnected ? styles.badgeConnected : styles.badgeDisconnected,
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    isConnected
                      ? styles.statusTextConnected
                      : styles.statusTextDisconnected,
                  ]}
                >
                  {isConnected ? "Connecté" : "Déconnecté"}
                </Text>
              </View>
            </View>

            <Text style={styles.deviceHint}>
              {isConnected
                ? "Module détecté et prêt à transmettre"
                : "Approchez le module de la barre"}
            </Text>
          </View>
        </View>

        <Pressable style={styles.connectButton} onPress={handleConnect}>
          <Ionicons
            name={isConnected ? "checkmark-circle-outline" : "download-outline"}
            size={18}
            color="#FFFFFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.connectButtonText}>
            {isConnected ? "Déconnecter" : "Connecter"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.settingsCard}>
        <Text style={styles.settingsTitle}>RÉGLAGES</Text>

        <SettingRow
          label="Unités vitesse"
          value={speedUnit}
          onPress={() =>
            setSpeedUnit((prev) => (prev === "m/s" ? "cm/s" : "m/s"))
          }
        />

        <SettingRow
          label="Sensibilité alertes forme"
          value={formSensitivity}
          onPress={() =>
            setFormSensitivity((prev) =>
              prev === "Faible"
                ? "Normale"
                : prev === "Normale"
                ? "Élevée"
                : "Faible"
            )
          }
        />

        <SettingRow
          label="Export automatique"
          value={autoExport}
          onPress={() =>
            setAutoExport((prev) =>
              prev === "Désactivé" ? "Activé" : "Désactivé"
            )
          }
        />
      </View>
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
    marginBottom: 18,
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
    fontSize: 22,
    fontWeight: "900",
  },

  deviceCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    backgroundColor: "#12172A",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  deviceTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  iconBox: {
    width: 66,
    height: 66,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  deviceInfo: {
    flex: 1,
  },
  deviceTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 6,
  },
  deviceName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeConnected: {
    backgroundColor: "rgba(37,227,154,0.10)",
    borderColor: "rgba(37,227,154,0.32)",
  },
  badgeDisconnected: {
    backgroundColor: "rgba(255,76,76,0.10)",
    borderColor: "rgba(255,76,76,0.25)",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "900",
  },
  statusTextConnected: {
    color: "#25E39A",
  },
  statusTextDisconnected: {
    color: "#FF6666",
  },
  deviceHint: {
    color: "rgba(233,238,248,0.48)",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  connectButton: {
    height: 50,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "#5F8DFF",
  },
  connectButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },

  settingsCard: {
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 6,
    backgroundColor: "#12172A",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  settingsTitle: {
    color: "rgba(233,238,248,0.45)",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  settingRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  settingLabel: {
    color: "rgba(233,238,248,0.72)",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    paddingRight: 12,
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingValue: {
    color: "#4C7DFF",
    fontSize: 16,
    fontWeight: "800",
    marginRight: 6,
  },
});
