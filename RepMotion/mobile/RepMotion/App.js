import { initI18n } from "./i18n/index.js";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import * as Linking from "expo-linking";
import React, { useEffect, useState } from "react";
import { initDb } from "./db/db";
import { UserProvider } from "./contexts/UserContext";
import { queryClient } from "./api/query/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import Navigation from "./composants/Navigation.js";
import { StatusBar } from "react-native";

const MyDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#070A12",
    card: "#070A12",
    text: "#E9EEF8",
    border: "rgba(255,255,255,0.08)",
    primary: "#4C7DFF",
  },
};

const linking = {
  prefixes: [Linking.createURL("/"), "http://localhost:8081"],
  config: {
    screens: {
      Login: "login",
      Register: "register",
      ForgotPassword: "forgot-password",
      ResetPassword: "reset-password",
      menu: "menu",
      EditProfile: "edit-profile",
    },
  },
};

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const setupApp = async () => {
      try {
        await initI18n();
        await initDb();
        console.log("i18n et base de données initialisés");
        setReady(true);
      } catch (error) {
        console.error("Erreur lors de l'initialisation de l'app :", error);
      }
    };

    setupApp();
  }, []);

  if (!ready) {
    return null;
  }
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <NavigationContainer theme={MyDarkTheme} linking={linking}>
          <StatusBar barStyle="light" />
          <Navigation />
        </NavigationContainer>
      </UserProvider>
    </QueryClientProvider>
  );
}
