import { TRANSLATION_SERVICE as translations } from '../translations/all'

const currentLanguage = navigator.language.split('-')[0] === 'lt' ? 'lt' : 'en'

export const i18n = (key: string, values: string[] = []): string => {
  let translation =
    translations[currentLanguage]?.[key] ?? translations.en[key] ?? key

  // Interpolate values into the translation string
  values.forEach((value, index) => {
    translation = translation.replace(`{${index + 1}}`, value)
  })

  return translation
}
