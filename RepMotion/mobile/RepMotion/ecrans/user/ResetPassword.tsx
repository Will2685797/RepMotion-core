// imports
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  Platform,
} from "react-native";
import { useEffect, useMemo, useState } from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import * as Linking from "expo-linking";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

// constants
import s from "../../css/styles";
import { TOKENS } from "../../theme/tokens";
import * as api from "../../api/api";

const ResetPassword = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { t } = useTranslation();

  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    const readToken = async () => {
      let foundToken = "";

      // 1) Param de navigation (mobile / deep link déjà transformé)
      if (route?.params?.token) {
        foundToken = String(route.params.token);
      }

      // 2) Web : query string directe ?token=...
      if (!foundToken && Platform.OS === "web" && typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        foundToken = params.get("token") ?? "";
      }

      // 3) Fallback expo-linking
      if (!foundToken) {
        const initialUrl = await Linking.getInitialURL();
        if (initialUrl) {
          const parsed = Linking.parse(initialUrl);
          const qp = parsed.queryParams?.token;
          if (typeof qp === "string") {
            foundToken = qp;
          }
        }
      }

      setToken(foundToken);
    };

    readToken();
  }, [route?.params]);

  const canSubmit = useMemo(() => {
    return (
      !!token &&
      !!newPassword &&
      newPassword.length >= 8 &&
      newPassword === confirmPassword
    );
  }, [token, newPassword, confirmPassword]);

  const showPwTooShort =
    !!newPassword && newPassword.length > 0 && newPassword.length < 8;

  const showPwMismatch =
    !!confirmPassword && newPassword !== confirmPassword;

  const onSubmit = async () => {
  try {
    setErr(null);
    setOk(null);
    setLoading(true);
    await Haptics.selectionAsync();

    if (!token) {
      setErr("Jeton manquant ou invalide.");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setErr("Veuillez remplir tous les champs.");
      return;
    }

    if (newPassword.length < 8) {
      setErr("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErr("Les mots de passe ne correspondent pas.");
      return;
    }

    await api.resetPassword({
      token,
      new_password: newPassword,
    });

    setOk("Mot de passe réinitialisé avec succès.");
    setNewPassword("");
    setConfirmPassword("");

    setTimeout(() => {
      navigation.navigate("Login");
    }, 1200);
  } catch (e: any) {
    setErr(e?.message ?? "Erreur lors de la réinitialisation.");
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={[s.screen, s.authScreen]}>
      {/* Top brand */}
      <View style={s.authTop}>
        <Text style={s.authBrand}>RepMotion</Text>
        <Text style={s.authSubtitleIG}>Réinitialiser ton mot de passe</Text>
        <Text style={s.profileRowValue}>
          {token ? "Jeton détecté" : "Jeton manquant"}
        </Text>
      </View>

      {/* Form */}
      <View style={s.authForm}>
        <Text style={{ color: TOKENS.textSecondary, marginBottom: 10 }}>
          Sécurité
        </Text>

        <View style={s.authInputWrap2}>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Nouveau mot de passe (8+)"
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
            placeholder="Confirmer le nouveau mot de passe"
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
            Le mot de passe doit contenir au moins 8 caractères.
          </Text>
        )}

        {showPwMismatch && (
          <Text style={[s.authError, { marginTop: 6 }]}>
            Les mots de passe ne correspondent pas.
          </Text>
        )}

        {!token && (
          <Text style={[s.authError, { marginTop: 6 }]}>
            Le lien semble invalide ou incomplet.
          </Text>
        )}

        <Pressable
          onPress={onSubmit}
          disabled={!canSubmit || loading}
          style={({ pressed }) => [
            s.categoryPill,
            {
              alignSelf: "stretch",
              alignItems: "center",
              paddingVertical: 10,
              marginTop: 10,
            },
            (!canSubmit || loading || pressed) && { opacity: 0.6 },
          ]}
        >
          <Text style={[s.categoryPillText, { fontSize: 13 }]}>
            {loading ? "Réinitialisation..." : "Changer le mot de passe"}
          </Text>
        </Pressable>

        {!!err && <Text style={s.authError}>{err}</Text>}
        {!!ok && <Text style={{ color: "#8ef0b3", marginTop: 10 }}>{ok}</Text>}
      </View>
    </View>
  );
};

export default ResetPassword;

const styles = StyleSheet.create({
  eye: {
    position: "absolute",
    right: 12,
    top: "38%",
    transform: [{ translateY: -11 }],
  },
});