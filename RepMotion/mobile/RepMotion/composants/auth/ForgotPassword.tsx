import { View, Text, Pressable, TextInput } from "react-native";
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

// constants
import s from "../../css/styles";
import { TOKENS } from "../../theme/tokens";

// api
import * as api from "../../api/api";

const ForgotPassword = () => {
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);

  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const EMAIL_MAX = 254;

  const isValidEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const canSend = !!email.trim() && isValidEmail(email);

  const showEmailInvalid =
    emailTouched && !!email.trim() && !isValidEmail(email);

  const onSend = async () => {
  try {
    setErr(null);
    setOk(null);

    await Haptics.selectionAsync();

    if (!isValidEmail(email)) {
      setErr("Adresse email invalide");
      return;
    }

    await api.forgotPassword({
      email: email.trim(),
    });

    setOk("Si un compte existe avec cet email, un lien a été envoyé.");
  } catch (e: any) {
    setErr(e?.message ?? "Erreur lors de l'envoi du courriel");
  }
};

  return (
    <View style={[s.screen, s.authScreen]}>
      
      {/* TOP */}
      <View style={s.authTop}>
        <Text style={s.authBrand}>RepMotion</Text>
        <Text style={s.authSubtitleIG}>
          Réinitialiser ton mot de passe
        </Text>
      </View>

      {/* FORM */}
      <View style={s.authForm}>

        <Text style={{ color: TOKENS.textSecondary, marginBottom: 10 }}>
          Entre ton adresse email et nous t'enverrons un lien de réinitialisation.
        </Text>

        <View style={s.authInputWrap2}>
          <TextInput
            value={email}
            onChangeText={(v) => {
              setEmailTouched(true);
              setEmail(v.slice(0, EMAIL_MAX));
            }}
            placeholder="Email"
            placeholderTextColor={TOKENS.textTertiary}
            style={s.authInput2}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        {showEmailInvalid && (
          <Text style={[s.authError, { marginTop: 6 }]}>
            Adresse email invalide
          </Text>
        )}

        <Pressable
          onPress={onSend}
          disabled={!canSend}
          style={({ pressed }) => [
            s.categoryPill,
            {
              alignSelf: "stretch",
              alignItems: "center",
              paddingVertical: 10,
              marginTop: 12,
            },
            (!canSend || pressed) && { opacity: 0.6 },
          ]}
        >
          <Text style={[s.categoryPillText, { fontSize: 13 }]}>
            Envoyer le lien
          </Text>
        </Pressable>

        {!!err && (
          <Text style={[s.authError, { marginTop: 10 }]}>
            {err}
          </Text>
        )}

        {!!ok && (
          <Text style={{ color: "#8ef0b3", marginTop: 10 }}>
            {ok}
          </Text>
        )}

        <Pressable
          onPress={() => navigation.navigate("Login")}
          style={{ marginTop: 18, alignItems: "center" }}
        >
          <Text style={{ color: TOKENS.textSecondary }}>
            Retour à la connexion
          </Text>
        </Pressable>

      </View>
    </View>
  );
};

export default ForgotPassword;