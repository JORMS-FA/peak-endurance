import { useCallback } from 'react'
import { useTheme } from './useTheme'
import { t, type I18nKey } from '../lib/i18n'

export function useI18n() {
  const { language } = useTheme()
  const translate = useCallback(
    (key: I18nKey) => t(language, key),
    [language]
  )
  return { t: translate, language }
}
