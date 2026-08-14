import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "../locales/en/common.json";

// The product is English-only across the UI now (only the site name/logo
// keep their original wording). i18next is kept in place purely so the
// many existing t("...") calls throughout the app keep working without
// having to touch every component -- it just always resolves to English.
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: en },
    },
    lng: "en",
    fallbackLng: "en",
    defaultNS: "common",
    interpolation: { escapeValue: false },
  });

export default i18n;
