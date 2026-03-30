// imports
import AsyncStorage from "@react-native-async-storage/async-storage";


const LANGUAGE_KEY = "app_language";

export const saveLanguage = async (lang: "fr" | "en") => {
  await AsyncStorage.setItem(LANGUAGE_KEY, lang);
};

export const getLanguage = async (): Promise<"fr" | "en" | null> => {
  const lang = await AsyncStorage.getItem(LANGUAGE_KEY);

  if (lang === "fr" || lang === "en") return lang;

  return null;
};
