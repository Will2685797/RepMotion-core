// imports
import {
  StyleSheet,
  Text,
  View,
  Button,
  Image,
  FlatList,
  Pressable,
  TextInput,
} from "react-native";
import { useState, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
// constants
import s from "../../css/styles";
import { TOKENS } from "../../theme/tokens";
// components
import AuthInput from "./AuthInput";
// stores
import { useAuthStore } from "../../store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const Login = () => {
  const navigation = useNavigation<any>();
  const login = useAuthStore((x) => x.login);
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async () => {
    try {
      setErr(null);
      await Haptics.selectionAsync();
      await login({ email: email.trim(), password });
      navigation.replace("menu");
    } catch (e: any) {
      setErr(t("login.invalidCredentials"));
    }
  };

  return (
    <View style={[s.screen, s.authScreen]}>
      <View style={s.authTop}>
        <Text style={s.authBrand}>RepMotion</Text>
      </View>

      <View style={s.authForm}>
        {/* EMAIL */}
        <View style={s.authInputWrap2}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder={t("login.email")}
            placeholderTextColor={TOKENS.textTertiary}
            style={s.authInput2}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* PASSWORD */}
        <View style={s.authInputWrap2}>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={t("login.password")}
            placeholderTextColor={TOKENS.textTertiary}
            style={s.authInput2}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
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
              color="rgba(120, 255, 180, 0.95)"
            />
          </Pressable>
        </View>

        <Pressable
          style={s.authForgotBtn}
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <Text style={[s.authForgotText, s.categoryPillText]}>
            {t("login.forgotPassword")}
          </Text>
        </Pressable>

        {err ? (
          <Text
            style={{ color: "tomato", marginBottom: 10, textAlign: "center" }}
          >
            {err}
          </Text>
        ) : null}

        <Pressable
          onPress={onSubmit}
          style={({ pressed }) => [
            s.categoryPill,
            { alignSelf: "stretch", alignItems: "center", paddingVertical: 12 },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Text style={[s.categoryPillText, { fontSize: 14 }]}>
            {t("login.submit")}
          </Text>
        </Pressable>

        {/* OR divider */}
        <View style={s.authOrRow}>
          <View style={s.authOrLine} />
        </View>
      </View>

      {/* Bottom sign up bar */}
      <View style={s.authBottom}>
        <Text style={s.authBottomText}>{t("login.noAccount")}</Text>
        <Pressable onPress={() => navigation.navigate("Register")}>
          <Text style={[s.authBottomLink, s.categoryPillText]}>
            {t("login.createAccount")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};
export default Login;

const styles = StyleSheet.create({
  eye: {
    position: "absolute",
    right: 12,
    top: "38%",
    transform: [{ translateY: -11 }],
  },
});
