import type { AppLanguage } from '../../lib/types'
import { t } from '../../lib/i18n'

type Props = {
  language: AppLanguage
  setLanguage: (language: AppLanguage) => void
}

export function LanguageSwitcher({ language, setLanguage }: Props) {
  return (
    <label className="language-switch" aria-label={t(language, 'language')}>
      <select
        value={language}
        onChange={(event) => setLanguage(event.target.value as AppLanguage)}
      >
        <option value="es">ES</option>
        <option value="en">EN</option>
      </select>
    </label>
  )
}
