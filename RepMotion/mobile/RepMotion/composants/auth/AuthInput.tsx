// imports
import { View, Text, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
// constants
import s from "../../css/styles";
import { TOKENS } from "../../theme/tokens";


type Props = {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
    secureTextEntry?: boolean;
    keyboardType?: "default" | "email-address";
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
};

const AuthInput = ({
    label,
    icon,
    value,
    onChange,
    placeholder,
    secureTextEntry,
    keyboardType = "default",
    autoCapitalize = "none",
}: Props) => {
    // UI
    return (
        <View style={s.authField}>
            <Text style={s.authLabel}>{label}</Text>

            <View style={s.authInputWrap}>
                <Ionicons name={icon} size={18} color={TOKENS.textTertiary} />
                <TextInput
                    value={value}
                    onChangeText={onChange}
                    placeholder={placeholder}
                    placeholderTextColor={TOKENS.textTertiary}
                    style={s.authInput}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    autoCorrect={false}
                />
            </View>
        </View>
    );
};
export default AuthInput;
