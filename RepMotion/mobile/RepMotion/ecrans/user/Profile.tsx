// imports
import { useFocusEffect } from "@react-navigation/native";
import { View, Text, Pressable, Alert } from "react-native";
import { useState, useCallback } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
// constants
import s from "../../css/styles";
import { TOKENS } from "../../theme/tokens";
// store
import { useUser } from "../../contexts/UserContext";
import { useAuthStore } from "../../store/authStore";
import { saveLanguage } from "../../i18n/languageStorage";

const Profile = () => {
  const authUser = useAuthStore((state) => state.user);
  const deleteAccount = useAuthStore((st) => st.deleteAccount);
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language === "en" ? "en" : "fr";

  // NAVIGATION
  const navigation = useNavigation<any>();
  const [animKey, setAnimKey] = useState(0);
  useFocusEffect(
    useCallback(() => {
      setAnimKey((k) => k + 1);
    }, []),
  );

  // GLOBAL STATE

  // USER CONTEXT
  const { user, logout, setLanguage } = useUser();
  const logoutAuth = useAuthStore((st) => st.logout);

  // UI HANDLING
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dangerOpen, setDangerOpen] = useState(false);

  const toggleSettings = () => {
    Haptics.selectionAsync();
    setSettingsOpen((v) => !v);
  };
  const toggleDanger = () => {
    Haptics.selectionAsync();
    setDangerOpen((v) => !v);
  };

  const onDeleteAccount = async () => {
    const title = t("dangerZone.deleteTitle");
    const message = t("dangerZone.deleteMessage");

    if (typeof window !== "undefined") {
      const ok = window.confirm(`${title}\n\n${message}`);
      console.log("confirm result:", ok);

      if (!ok) return;

      try {
        await deleteAccount();
        logout();
        navigation.replace("Login");
      } catch (e: any) {
        console.log("Erreur suppression compte:", e);
      }

      return;
    }

    Alert.alert(title, message, [
      {
        text: t("dangerZone.cancel"),
        style: "cancel",
      },
      {
        text: t("dangerZone.confirmDelete"),
        style: "destructive",
        onPress: async () => {
          try {
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Warning,
            );

            await deleteAccount();
            logout();
            navigation.replace("Login");
          } catch (e: any) {
            console.log("Erreur suppression compte:", e);
          }
        },
      },
    ]);
  };
  // UI
  return (
    <View
      key={animKey}
      style={[
        s.screen,
        s.profileScreen,
        { backgroundColor: "#070A12" }, // même que Accueil
      ]}
    >
      {/* Title + Edit */}
      <View style={s.profileTopRow}>
        <Text style={s.profileTitle}>{t("profile.title")}</Text>
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            navigation.navigate("EditProfile");
          }}
          style={({ pressed }) => [
            s.categoryPill,
            { paddingHorizontal: 14, paddingVertical: 6 },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text style={s.categoryPillText}>{t("profile.edit")}</Text>
        </Pressable>
      </View>

      {/* PROFILE SECTION */}
      <Animated.View
        entering={FadeInDown.delay(40).springify()}
        style={s.block}
      >
        <View style={s.profileSectionBox}>
          <Text style={s.profileSectionTitle}>{t("profile.account")}</Text>

          <View style={s.profileRow}>
            <Text style={s.profileRowLabel}>{t("profile.email")}</Text>
            <Text style={s.profileRowValue}>{authUser?.email ?? "—"}</Text>
          </View>

          <View style={s.profileDivider} />

          <View style={s.profileRow}>
            <Text style={s.profileRowLabel}>{t("profile.username")}</Text>
            <Text style={s.profileRowValue}>{authUser?.username ?? "—"}</Text>
          </View>
        </View>
      </Animated.View>

      {/* SETTINGS SECTION (collapsible) */}
      <Animated.View
        entering={FadeInDown.delay(90).springify()}
        style={s.block}
      >
        <View style={s.settingsCard}>
          {/* Header row inside same card */}
          <Pressable
            onPress={toggleSettings}
            style={({ pressed }) => [
              s.settingsTopRow,
              pressed && { opacity: 0.95 },
            ]}
          >
            <Text style={s.settingsTitle}>{t("profile.settings")}</Text>
            <Ionicons
              name={settingsOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color={TOKENS.textSecondary}
            />
          </Pressable>

          <View style={s.settingsItems}>
            <View style={s.settingsDivider} />

            {settingsOpen && (
              <View>
                {/* Language row */}
                <View style={s.settingsItem}>
                  <Text style={s.settingsItemText}>
                    {t("profile.language")}:
                  </Text>

                  <View style={s.langSegment}>
                    <Pressable
                      onPress={async () => {
                        await Haptics.selectionAsync();
                        setLanguage("fr");
                        await i18n.changeLanguage("fr");
                        await saveLanguage("fr");
                      }}
                      style={[
                        s.langOption,
                        currentLanguage === "fr" && s.langOptionActive,
                      ]}
                    >
                      <Text
                        style={[
                          s.langText,
                          currentLanguage === "fr" && s.langTextActive,
                        ]}
                      >
                        FR
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={async () => {
                        await Haptics.selectionAsync();
                        setLanguage("en");
                        await i18n.changeLanguage("en");
                        await saveLanguage("en");
                      }}
                      style={[
                        s.langOption,
                        currentLanguage === "en" && s.langOptionActive,
                      ]}
                    >
                      <Text
                        style={[
                          s.langText,
                          currentLanguage === "en" && s.langTextActive,
                        ]}
                      >
                        EN
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View style={s.settingsDivider} />

                {/* Other setting row */}
                {/* <View style={s.settingsItem}>
                  <Text style={s.settingsItemText}>{t("profile.display")}</Text>
                  <Text style={s.profileRowValue}>
                    {t("profile.twoColumns")}
                  </Text>
                </View> */}

                <View style={s.settingsDivider} />
              </View>
            )}

            <Pressable
              style={s.settingsItem}
              onPress={() => {
                Haptics.selectionAsync();
                logoutAuth();
                logout();
                navigation.replace("Login");
              }}
            >
              <Text style={[s.settingsItemText, s.settingsDanger]}>
                {t("profile.logout")}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={{ height: 18 }} />

        {/* DANGER ZONE SECTION (collapsible) */}
        <View style={s.settingsCard}>
          <Pressable
            onPress={toggleDanger}
            style={({ pressed }) => [
              s.settingsTopRow,
              pressed && { opacity: 0.95 },
            ]}
          >
            <Text style={[s.settingsTitle, { color: "#ff6b6b" }]}>
              {t("dangerZone.title")}
            </Text>
            <Ionicons
              name={dangerOpen ? "chevron-up" : "chevron-down"}
              size={18}
              color="#ff6b6b"
            />
          </Pressable>

          <View style={s.settingsItems}>
            {dangerOpen && (
              <View>
                <View style={s.settingsDivider} />
                <View style={{ paddingHorizontal: 4, paddingVertical: 10 }}>
                  <Text
                    style={{
                      color: TOKENS.textSecondary,
                      marginBottom: 14,
                      lineHeight: 20,
                      paddingHorizontal: 12,
                    }}
                  >
                    {t("dangerZone.deleteDescription")}
                  </Text>

                  <Pressable
                    onPress={onDeleteAccount}
                    style={({ pressed }) => [
                      {
                        alignSelf: "stretch",
                        alignItems: "center",
                        paddingVertical: 10,
                        borderColor: "rgba(255, 90, 90, 0.55)",
                        backgroundColor: "rgba(239,68,68,0.16)",

                        paddingHorizontal: 10,
                        borderRadius: 999,

                        shadowOpacity: 0.6,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 0 },

                        elevation: 6,
                      },
                      pressed && { opacity: 0.8 },
                    ]}
                  >
                    <Text
                      style={[
                        {
                          fontWeight: "800",
                          letterSpacing: 0.5,
                          fontSize: 13,
                          color: "#ff6b6b",
                        },
                      ]}
                    >
                      {t("dangerZone.deleteAccount")}
                    </Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </View>
      </Animated.View>

      {/* <Footer /> */}
    </View>
  );
};

export default Profile;
