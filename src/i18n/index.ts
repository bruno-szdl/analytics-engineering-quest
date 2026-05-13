import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import pt from './locales/pt.json'

const saved = localStorage.getItem('dbt-quest-lang')

void i18n.use(initReactI18next).init({
  resources: {
    en: { ui: en },
    pt: { ui: pt },
  },
  lng: saved ?? 'en',
  fallbackLng: 'en',
  defaultNS: 'ui',
  interpolation: { escapeValue: false },
})

export default i18n
