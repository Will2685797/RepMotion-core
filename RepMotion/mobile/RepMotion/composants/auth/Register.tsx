// imports
import { View, Text, Pressable, TextInput, StyleSheet } from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
// constants
import s from "../../css/styles";
import { TOKENS } from "../../theme/tokens";
// stores
import { useAuthStore } from "../../store/authStore";
import { Ionicons } from "@expo/vector-icons";

const Register = () => {
  const navigation = useNavigation<any>();
  const register = useAuthStore((x) => x.register);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const USERNAME_MIN = 3;
  const USERNAME_MAX = 20;
  const EMAIL_MAX = 254;
  const [emailWasTrimmed, setEmailWasTrimmed] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isValidEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const onSubmit = async () => {
    try {
      setErr(null);
      await Haptics.selectionAsync();

      // Champs requis (ça reste une erreur globale)
      if (!email.trim() || !password || !username.trim()) {
        setErr("Email, mot de passe et nom d'utilisateur requis");
        return;
      }

      // Username (ça reste une erreur globale)
      if (username.length < USERNAME_MIN) {
        setErr(
          `Le nom d'utilisateur doit contenir au moins ${USERNAME_MIN} caractères`,
        );
        return;
      }

      if (username.length > USERNAME_MAX) {
        setErr(
          `Le nom d'utilisateur ne peut pas dépasser ${USERNAME_MAX} caractères`,
        );
        return;
      }

      // ✅ Email: NE PAS setErr ici si tu affiches déjà showEmailTooLong/showEmailInvalid
      if (email.length > EMAIL_MAX) {
        return;
      }

      if (!isValidEmail(email)) {
        return;
      }

      await register({
        email: email.trim(),
        password,
        username: username.trim().replace(/\s+/g, ""),
      });

      navigation.replace("Main");
    } catch (e: any) {
      const detail =
        e?.data?.detail ?? e?.data?.message ?? e?.detail ?? e?.message ?? null;

      const msg =
        typeof detail === "string"
          ? detail
          : Array.isArray(detail) && detail[0]?.msg
            ? detail[0].msg
            : "Register failed";

      setErr(msg);
    }
  };
  const showEmailTooLong = emailTouched && emailWasTrimmed;

  const showEmailInvalid =
    emailTouched && !!email.trim() && !showEmailTooLong && !isValidEmail(email);
  // UI
  return (
    <View style={[s.screen, s.authScreen]}>
      {/* Top brand */}
      <View style={s.authTop}>
        <Text style={s.authBrand}>RepMotion</Text>
        <Text style={s.authSubtitleIG}>Créer ton compte</Text>
      </View>

      {/* Form */}
      <View style={s.authForm}>
        <View style={s.authInputWrap2}>
          <TextInput
            value={email}
            onChangeText={(v) => {
              setEmailTouched(true);

              const trimmed = v.slice(0, EMAIL_MAX);
              setEmail(trimmed);
              setEmailWasTrimmed(v.length > EMAIL_MAX);
            }}
            placeholder="Email"
            placeholderTextColor={TOKENS.textTertiary}
            style={s.authInput2}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        {showEmailTooLong && (
          <Text style={[s.authError, { marginTop: 6 }]}>
            L'email est trop long (max {EMAIL_MAX} caractères).
          </Text>
        )}

        {showEmailInvalid && (
          <Text style={[s.authError, { marginTop: 6 }]}>
            Email invalide (ex: nom@domaine.com)
          </Text>
        )}
        <View style={s.authInputWrap2}>
          <TextInput
            value={username}
            onChangeText={(v) => {
              const cleaned = v.replace(/\s+/g, "");
              setUsername(cleaned.slice(0, USERNAME_MAX));
            }}
            placeholder="Nom d'utilisateur"
            placeholderTextColor={TOKENS.textTertiary}
            style={s.authInput2}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
            textContentType="username"
          />
        </View>

        <View style={s.authInputWrap2}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Mot de passe"
            placeholderTextColor={TOKENS.textTertiary}
            style={s.authInput2}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Pressable
            onPressIn={() => setShowPassword(true)}
            onPressOut={() => setShowPassword(false)}
            style={({ pressed }) => [
              styles.eye,
              s.categoryPill,
              pressed && { opacity: 0.8 },
            ]}
          >
            <Ionicons
              name={showPassword ? "eye" : "eye-off"}
              size={18}
              color="rgba(120, 220, 255, 0.95)"
            />
          </Pressable>
        </View>

        {!!err && <Text style={s.authError}>{err}</Text>}

        <Pressable
          onPress={onSubmit}
          style={({ pressed }) => [
            s.categoryPill,
            {
              alignSelf: "stretch",
              alignItems: "center",
              paddingVertical: 10,
              marginTop: 10,
            },
            pressed && { opacity: 0.85 },
          ]}
        >
          <Text style={[s.categoryPillText, { fontSize: 13 }]}>
            Créer un compte
          </Text>
        </Pressable>

        {/* OR divider */}
        <View style={s.authOrRow}>
          <View style={s.authOrLine} />
        </View>
      </View>

      {/* Bottom bar */}
      <View style={s.authBottom}>
        <Text style={s.authBottomText}>Déjà un compte ? </Text>
        <Pressable
          onPress={() => {
            Haptics.selectionAsync();
            navigation.navigate("Login");
          }}
        >
          <Text style={[s.authBottomLink, s.categoryPillText]}>Se connecter</Text>
        </Pressable>
      </View>
    </View>
  );
};
export default Register;

const styles = StyleSheet.create({
  eye: {
    position: "absolute",
    right: 12,
    top: "38%",
    transform: [{ translateY: -11 }],
  },
});
