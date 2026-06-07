import React from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Accueil from "../ecrans/Accueil";
import Analyses from "../ecrans/Analyses";
import Appareil from "../ecrans/Appareil";
import Historique from "../ecrans/Historique";
import AppHeader from "./AppHeader";
import Profile from "../ecrans/user/Profile";

const Tab = createBottomTabNavigator();

export default function Menu() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        header: () => (
          <AppHeader
            status="Déconnecté"
            isConnected={false}
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
          let iconName = "ellipse-outline";

          if (route.name === "accueil") iconName = focused ? "home" : "home-outline";
          else if (route.name === "analyses") iconName = focused ? "analytics" : "analytics-outline";
          else if (route.name === "historique") iconName = focused ? "time" : "time-outline";
          else if (route.name === "appareil") iconName = focused ? "wifi" : "wifi-outline";
          else if (route.name === "profil") iconName = focused ? "person" : "person-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="accueil" component={Accueil} />
      <Tab.Screen name="analyses" component={Analyses} />
      <Tab.Screen name="historique" component={Historique} />
      <Tab.Screen name="appareil" component={Appareil} />
      <Tab.Screen name="profil" component={Profile} />
    </Tab.Navigator>
  );
}