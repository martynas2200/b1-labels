import { TRANSLATION_SERVICE as translations } from '../translations/all'

const currentLanguage = navigator.language.split('-')[0] === 'lt' ? 'lt' : 'en';

export const i18n = (key: string): string => {
  return translations[currentLanguage]?.[key] ?? translations.en[key] ?? key
}
