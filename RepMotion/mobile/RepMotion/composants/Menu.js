// imports
import React, { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// sceens
import Accueil from "../ecrans/Accueil";
import Analyses from "../ecrans/Analyses";
import Appareil from "../ecrans/Appareil";
import Historique from "../ecrans/Historique";
import AppHeader from "./AppHeader";
import Profile from "../ecrans/user/Profile";
// debug/dev
import MotionDebugScreen from "../ecrans/debug/MotionDebugScreen";
import MotionCalibrationSessionScreen from "../ecrans/debug/MotionCalibrationSessionScreen";
// store
import { useTranslation } from "react-i18next";
import { useDeviceStore } from "../store/deviceStore";
import { useAnalysisStore } from "../store/analysisStore";
// compnents
import BlockedNavigationModal from "../composants/repmotion/modals/BlockedNavigationModal";

const Tab = createBottomTabNavigator();
export default function Menu() {
  const debugging = true;

  // TRANSLATION
  const { t } = useTranslation();

  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const isRunning = useAnalysisStore((s) => s.isRunning);
  const blockIfRunning = (e) => {
    if (isRunning) {
      e.preventDefault();
      setShowBlockedModal(true);
    }
  };

  // DEVICE STORE
  const isConnectedStore = useDeviceStore((s) => s.isConnected);

  // UI
  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          header: () => (
            <AppHeader
              status={
                isConnectedStore
                  ? t("device.connected")
                  : t("device.disconnected")
              }
              isConnected={isConnectedStore}
              onPressProfile={() => console.log("ouvrir profil")}
            />
          ),
          tabBarStyle: {
            backgroundColor: "#070A12",
            borderTopColor: "rgba(255,255,255,0.08)",
            height: "9%",
            paddingTop: 8,
            paddingBottom: 10,
          },
          tabBarActiveTintColor: "#4C7DFF",
          tabBarInactiveTintColor: "rgba(233,238,248,0.45)",
          tabBarLabelStyle: { fontSize: 12 },
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === "accueil")
              iconName = focused ? "home" : "home-outline";
            else if (route.name === "analyses")
              iconName = focused ? "analytics" : "analytics-outline";
            else if (route.name === "historique")
              iconName = focused ? "time" : "time-outline";
            else if (route.name === "appareil")
              iconName = focused ? "wifi" : "wifi-outline";
            else if (route.name === "profil")
              iconName = focused ? "person" : "person-outline";
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        {/* <Tab.Screen name="MotionDebugScreen" component={MotionDebugScreen} /> */}
        {debugging && (
          <Tab.Screen
            name="MotionCalibrationSessionScreen"
            component={MotionCalibrationSessionScreen}
          />
        )}

        <Tab.Screen name="accueil" component={Accueil} />

        <Tab.Screen
          name="analyses"
          component={Analyses}
          listeners={{ tabPress: blockIfRunning }}
        />

        <Tab.Screen
          name="historique"
          component={Historique}
          listeners={{ tabPress: blockIfRunning }}
        />

        <Tab.Screen
          name="appareil"
          component={Appareil}
          listeners={{ tabPress: blockIfRunning }}
        />

        <Tab.Screen
          name="profil"
          component={Profile}
          listeners={{ tabPress: blockIfRunning }}
        />
      </Tab.Navigator>

      <BlockedNavigationModal
        visible={showBlockedModal}
        onClose={() => setShowBlockedModal(false)}
      />
    </>
  );
}
