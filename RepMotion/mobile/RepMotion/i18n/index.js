import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import fr from "./locales/fr.json";
import en from "./locales/en.json";
import { getLanguage } from "./languageStorage";

const locales = Localization.getLocales();
const langueParDefaut = locales[0]?.languageCode || "fr";

export const initI18n = async () => {
  const savedLanguage = await getLanguage();

  const langueInitiale =
    savedLanguage || (langueParDefaut === "en" ? "en" : "fr");

  await i18next.use(initReactI18next).init({
    compatibilityJSON: "v4",
    resources: {
      en: { translation: en },
      fr: { translation: fr },
    },
    lng: langueInitiale,
    fallbackLng: "fr",
    interpolation: {
      escapeValue: false,
    },
  });
};

export default i18next;