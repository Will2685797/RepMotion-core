// imports
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
// hooks
import { useMotionDevice } from "../api/query/hooks/useMotionDevice";
// store
import { useTranslation } from "react-i18next";
import { useDeviceStore } from "../store/deviceStore";


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
  // TRANSLATION
  const { t } = useTranslation();




  // UNITS
  const [speedUnit, setSpeedUnit] = useState("m/s");
  const [formSensitivity, setFormSensitivity] = useState("normal");
  const [autoExport, setAutoExport] = useState("disabled");
  const [ipAddress] = useState("192.168.4.1");
  const [signalStrength] = useState("strong");




  // DEVICE STORE
  const networkName = useDeviceStore((s) => s.networkName);
  const esp32Ip = useDeviceStore((s) => s.esp32Ip);
  const port = useDeviceStore((s) => s.port);
  const isConnectedStore = useDeviceStore((s) => s.isConnected);
  const statusStore = useDeviceStore((s) => s.status);
  const wsUrl = useDeviceStore((s) => s.wsUrl());
  const setConnecting = useDeviceStore((s) => s.setConnecting);
  const setConnected = useDeviceStore((s) => s.setConnected);
  const setDisconnected = useDeviceStore((s) => s.setDisconnected);
  const setErrorStore = useDeviceStore((s) => s.setError);
  const setLastMessageAt = useDeviceStore((s) => s.setLastMessageAt);




  // DEVICE STREAM
  const {
    status,
    isConnected,
    latestSample,
    sampleCount,
    connect,
    disconnect,
    subscribeSample,
  } = useMotionDevice();
  const handleConnect = () => {
    if (isConnected) {
      disconnect();
      return;
    }
    setConnecting();
    connect();
  };




  // HANDLERS
  useEffect(() => {
    if (status === "connecting") {
      setConnecting();
      return;
    }

    if (status === "connected" || isConnected) {
      setConnected();
      return;
    }

    if (status === "error") {
      setErrorStore("WebSocket connection error");
      return;
    }

    if (status === "disconnected" || !isConnected) {
      setDisconnected();
    }
  }, [status, isConnected, setConnecting, setConnected, setDisconnected, setErrorStore]);

  useEffect(() => {
    if (!latestSample) return;
    setLastMessageAt();
  }, [latestSample, setLastMessageAt]);

  useEffect(() => {
    const unsub = subscribeSample((sample) => {
      // debug or extra processing here
      // console.log("sample", sample);
    });

    return unsub;
  }, [subscribeSample]);




  // UI
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* header */}
      <View style={styles.header}>
        <Text style={styles.overTitle}>{t("device.title")}</Text>
        <Text style={styles.title}>{t("device.module")}</Text>
      </View>



      {/* device and controls */}
      <View style={styles.deviceCard}>
        <View style={styles.deviceTop}>
          <View style={styles.iconBox}>
            <Ionicons
              name="wifi-outline"
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
                  isConnected
                    ? styles.badgeConnected
                    : styles.badgeDisconnected,
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
                  {isConnected
                    ? t("device.connected")
                    : t("device.disconnected")}
                </Text>
              </View>
            </View>

            <Text style={styles.deviceHint}>
              {isConnected
                ? t("device.connectedHint")
                : t("device.connectHint")}
            </Text>
          </View>
        </View>

        <View style={styles.networkInfoCard}>
          <View style={styles.networkRow}>
            <Text style={styles.networkLabel}>{t("device.transport")}</Text>
            <Text style={styles.networkValue}>{t("device.wifi")}</Text>
          </View>

          <View style={styles.networkRow}>
            <Text style={styles.networkLabel}>{t("device.network")}</Text>
            <Text style={styles.networkValue}>{networkName}</Text>
          </View>

          <View style={styles.networkRow}>
            <Text style={styles.networkLabel}>{t("device.ip")}</Text>
            <Text style={styles.networkValue}>{ipAddress}</Text>
          </View>

          <View style={styles.networkRow}>
            <Text style={styles.networkLabel}>{t("device.signal")}</Text>
            <Text style={styles.networkValue}>
              {t(`device.${signalStrength.toLowerCase()}`)}
            </Text>
          </View>
        </View>
        <Pressable style={styles.connectButton} onPress={handleConnect}>
          <Ionicons
            name={isConnected ? "checkmark-circle-outline" : "wifi-outline"}
            size={18}
            color="#FFFFFF"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.connectButtonText}>
            {isConnected
              ? t("device.disconnectButton")
              : t("device.connectButton")}
          </Text>
        </Pressable>
      </View>



      {/* settings */}
      <View style={styles.settingsCard}>
        <Text style={styles.settingsTitle}>{t("device.settings")}</Text>
        <View style={styles.borderBottom} />

        <SettingRow
          label={t("device.speedUnit")}
          value={speedUnit}
          onPress={() =>
            setSpeedUnit((prev) => (prev === "m/s" ? "cm/s" : "m/s"))
          }
        />
        <View style={styles.borderBottom} />


        <SettingRow
          label={t("device.formSensitivity")}
          value={t(`device.${formSensitivity}`)}
          onPress={() =>
            setFormSensitivity((prev) =>
              prev === "low" ? "normal" : prev === "normal" ? "high" : "low",
            )
          }
        />
        <View style={styles.borderBottom} />


        <SettingRow
          label={t("device.autoExport")}
          value={t(`device.${autoExport}`)}
          onPress={() =>
            setAutoExport((prev) =>
              prev === "disabled" ? "enabled" : "disabled",
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

  networkInfoCard: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  networkRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  networkLabel: {
    color: "rgba(233,238,248,0.55)",
    fontSize: 14,
    fontWeight: "700",
  },
  networkValue: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
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
    // borderBottomWidth: 1,
    // borderBottomColor: "rgba(255,255,255,0.05)",
  },
  borderBottom: {
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
