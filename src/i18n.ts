import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  // load translation using http -> see /public/locales (i.e. https://github.com/i18next/react-i18next/tree/master/example/react/public/locales)
  // learn more: https://github.com/i18next/i18next-http-backend
  .use(HttpApi)
  // detect user language
  // learn more: https://github.com/i18next/i18next-browser-languageDetector
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // init i18next
  // for all options read: https://www.i18next.com/overview/configuration-options
  .init({
    fallbackLng: 'en',
    debug: import.meta.env.DEV, // Enable debug mode in development
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    detection: {
      // order and from where user language should be detected
      order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
      // keys or params to lookup language from
      caches: ['localStorage'], // cache user language on localStorage
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // path to translation files
    },
  });

export default i18n;
