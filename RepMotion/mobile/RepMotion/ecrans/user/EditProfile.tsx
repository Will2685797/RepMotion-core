// imports
import { View, Text, Pressable, TextInput, StyleSheet } from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

// constants
import s from "../../css/styles";
import { TOKENS } from "../../theme/tokens";

// store
import { useAuthStore } from "../../store/authStore";

const EditProfile = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  const user = useAuthStore((st) => st.user);
  const token = useAuthStore((st) => st.token);

  const updateProfile = useAuthStore((st) => st.updateProfile);
  const changePassword = useAuthStore((st) => st.changePassword);

  // Champs "profil"
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");

  const [emailWasTrimmed, setEmailWasTrimmed] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Champs "password"
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSecurity, setShowSecurity] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const USERNAME_MIN = 3;
  const USERNAME_MAX = 20;
  const EMAIL_MAX = 254;
  const isValidEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  // Pré-remplir avec l'utilisateur connecté
  useEffect(() => {
    setEmail(user?.email ?? "");
    setUsername(user?.username ?? "");
  }, [user]);

  const canSaveProfile = useMemo(() => {
    const u = username.trim();
    return !!email.trim() && isValidEmail(email) && u.length >= USERNAME_MIN;
  }, [email, username]);

  const showUsernameTooShort =
    !!username && username.trim().length < USERNAME_MIN;

  const canChangePassword = useMemo(() => {
    return (
      !!newPassword &&
      newPassword.length >= 8 &&
      newPassword === confirmPassword
    );
  }, [newPassword, confirmPassword]);

  const showEmailTooLong = emailTouched && emailWasTrimmed;

  const showEmailInvalid =
    emailTouched && !!email.trim() && !showEmailTooLong && !isValidEmail(email);

  const showPwMismatch =
    showSecurity &&
    !!confirmPassword && // on affiche seulement si l’utilisateur a commencé à confirmer
    newPassword !== confirmPassword;

  const showPwTooShort =
    showSecurity &&
    !!newPassword &&
    newPassword.length > 0 &&
    newPassword.length < 8;

  const onSaveProfile = async () => {
    try {
      setErr(null);
      setOk(null);
      await Haptics.selectionAsync();

      if (!token) {
        setErr(t("editProfile.mustBeConnected"));
        return;
      }
      if (!email.trim() || !username.trim()) {
        setErr(t("editProfile.requiredFields"));
        return;
      }
      const u = username.trim();

      if (u.length < USERNAME_MIN) {
        setErr(t("editProfile.usernameMinError", { min: USERNAME_MIN }));
        return;
      }
      if (!isValidEmail(email)) {
        setErr(t("editProfile.emailInvalid"));
        return;
      }

      await updateProfile({ email, username });

      setOk(t("editProfile.profileUpdated"));
    } catch (e: any) {
      const detail =
        e?.data?.detail ?? e?.data?.message ?? e?.detail ?? e?.message ?? null;

      const msg =
        typeof detail === "string"
          ? detail
          : Array.isArray(detail) && detail[0]?.msg
            ? detail[0].msg
            : t("editProfile.profileUpdateError");

      setErr(msg);
    }
  };

  const onChangePassword = async () => {
    try {
      setErr(null);
      setOk(null);
      await Haptics.selectionAsync();

      if (!token) {
        setErr(t("editProfile.mustBeConnected"));
        return;
      }
      if (!canChangePassword) {
        setErr(t("editProfile.passwordCheckError"));
        return;
      }

      await changePassword({ currentPassword: "", newPassword });

      // ensuite seulement tu vides
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setOk(t("editProfile.passwordChanged"));
    } catch (e: any) {
      setErr(e?.message ?? t("editProfile.passwordChangeError"));
    }
  };
  const toggleSecurity = async () => {
    await Haptics.selectionAsync();

    setShowSecurity((prev) => {
      const next = !prev;

      // Si on FERME la section => on wipe les champs
      if (!next) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setErr(null);
        setOk(null);
      }

      return next;
    });
  };

  return (
   <View
  style={[
    s.screen,
    s.authScreen,
    { backgroundColor: "#070A12" }
  ]}
>
      {/* Top brand */}
      <View style={s.authTop}>
        <Text style={s.authBrand}>RepMotion</Text>
        <Text style={s.authSubtitleIG}>{t("editProfile.subtitle")}</Text>
        <Text style={s.profileRowValue}>{user?.username ?? "—"}</Text>
      </View>

      {/* Form */}
      <View style={s.authForm}>
        {/* SECTION 1 : Profil */}
        <Text style={{ color: TOKENS.textSecondary, marginBottom: 10 }}>
          {t("editProfile.profileInfo")}
        </Text>

        <View style={s.authInputWrap2}>
          <TextInput
            value={email}
            onChangeText={(v) => {
              setEmailTouched(true);

              const trimmed = v.slice(0, EMAIL_MAX);
              setEmail(trimmed);
              setEmailWasTrimmed(v.length > EMAIL_MAX);
            }}
            placeholder={t("editProfile.email")}
            placeholderTextColor={TOKENS.textTertiary}
            style={s.authInput2}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        {showEmailTooLong && (
          <Text style={[s.authError, { marginTop: 6 }]}>
            {t("editProfile.emailTooLong", { max: EMAIL_MAX })}
          </Text>
        )}

        {showEmailInvalid && (
          <Text style={[s.authError, { marginTop: 6 }]}>
            {t("editProfile.emailInvalid")}
          </Text>
        )}

        <View style={s.authInputWrap2}>
          <TextInput
            value={username}
            onChangeText={(v) => {
              const cleaned = v.replace(/\s+/g, "");
              setUsername(cleaned.slice(0, USERNAME_MAX));
            }}
            placeholder={t("editProfile.username")}
            placeholderTextColor={TOKENS.textTertiary}
            style={s.authInput2}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            textContentType="username"
          />
        </View>
        {showUsernameTooShort && (
          <Text style={[s.authError, { marginTop: 6 }]}>
            {t("editProfile.usernameTooShort", { min: USERNAME_MIN })}
          </Text>
        )}

        <Pressable
          onPress={onSaveProfile}
          disabled={!canSaveProfile}
          style={({ pressed }) => [
            s.categoryPill,
            {
              alignSelf: "stretch",
              alignItems: "center",
              paddingVertical: 10,
              marginTop: 10,
            },
            (!canSaveProfile || pressed) && { opacity: 0.6 },
          ]}
        >
          <Text style={[s.categoryPillText, { fontSize: 13 }]}>
            {t("editProfile.save")}
          </Text>
        </Pressable>

        {/* Divider */}
        <View style={s.authOrRow}>
          <View style={s.authOrLine} />
        </View>

        {/* SECTION 2 : Sécurité (repliable) */}
        <Pressable
          onPress={toggleSecurity}
          style={({ pressed }) => [
            s.categoryPill,
            {
              alignSelf: "stretch",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 10,
              marginTop: 6,
            },
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={[s.categoryPillText, { fontSize: 13 }]}>
            {t("editProfile.security")}
          </Text>
          <Text style={[s.categoryPillText, { fontSize: 13 }]}>
            {showSecurity ? "▲" : "▼"}
          </Text>
        </Pressable>

        {showSecurity ? (
          <View style={{ marginTop: 12 }}>
            {/* <View style={s.authInputWrap2}>
              <TextInput
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Mot de passe actuel"
                placeholderTextColor={TOKENS.textTertiary}
                style={s.authInput2}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View> */}

            <View style={s.authInputWrap2}>
              <TextInput
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder={t("editProfile.newPassword")}
                placeholderTextColor={TOKENS.textTertiary}
                style={s.authInput2}
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Pressable
                onPressIn={() => setShowNewPassword(true)}
                onPressOut={() => setShowNewPassword(false)}
                style={({ pressed }) => [
                  styles.eye,
                  s.categoryPill,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Ionicons
                  name={showNewPassword ? "eye" : "eye-off"}
                  size={18}
                  color="rgba(120, 255, 180, 0.95)"
                />
              </Pressable>
            </View>

            <View style={s.authInputWrap2}>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={t("editProfile.confirmPassword")}
                placeholderTextColor={TOKENS.textTertiary}
                style={s.authInput2}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <Pressable
                onPressIn={() => setShowConfirmPassword(true)}
                onPressOut={() => setShowConfirmPassword(false)}
                style={({ pressed }) => [
                  styles.eye,
                  s.categoryPill,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye" : "eye-off"}
                  size={18}
                  color="rgba(120, 255, 180, 0.95)"
                />
              </Pressable>
            </View>

            {showPwTooShort && (
              <Text style={[s.authError, { marginTop: 6 }]}>
                {t("editProfile.passwordTooShort")}
              </Text>
            )}

            {showPwMismatch && (
              <Text style={[s.authError, { marginTop: 6 }]}>
                {t("editProfile.passwordMismatch")}
              </Text>
            )}

            <Pressable
              onPress={onChangePassword}
              disabled={!canChangePassword}
              style={({ pressed }) => [
                s.categoryPill,
                {
                  alignSelf: "stretch",
                  alignItems: "center",
                  paddingVertical: 10,
                  marginTop: 10,
                },
                (!canChangePassword || pressed) && { opacity: 0.6 },
              ]}
            >
              <Text style={[s.categoryPillText, { fontSize: 13 }]}>
                {t("editProfile.changePassword")}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {!!err && <Text style={s.authError}>{err}</Text>}
        {!!ok && <Text style={{ color: "#8ef0b3", marginTop: 10 }}>{ok}</Text>}
      </View>
    </View>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  eye: {
    position: "absolute",
    right: 12,
    top: "38%",
    transform: [{ translateY: -11 }],
  },
});
