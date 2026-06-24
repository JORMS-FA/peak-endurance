import type { ReactNode } from 'react'
import { Check, ChevronDown, ChevronUp, Eye, EyeOff, SlidersHorizontal } from 'lucide-react'
import type { I18nKey } from '../../lib/i18n'
import type { WidgetKey } from '../../lib/types'

// Map each widget to its i18n label key (shown in the customize controls).
export const WIDGET_LABEL_KEYS: Record<WidgetKey, I18nKey> = {
  coach: 'widgetCoach',
  recovery: 'widgetRecovery',
  connect_banner: 'widgetConnectBanner',
  metrics: 'mForma',
  level: 'widgetLevel',
  pmc_chart: 'widgetPmcChart',
  weekly_load: 'widgetWeeklyLoad',
  sport_distribution: 'widgetSportDistribution',
  today_session: 'trainingOfDay',
  quick_read: 'quickRead',
  recent_activities: 'recentActivities',
}

type Translate = (key: I18nKey) => string

// ─── Customize toggle button ─────────────────────────────────────────────────
export function CustomizeToggle({
  customizeMode,
  onToggle,
  t,
}: {
  customizeMode: boolean
  onToggle: () => void
  t: Translate
}) {
  return (
    <div className="dashboard-customize-bar">
      <button
        type="button"
        className={`btn-secondary btn-sm${customizeMode ? ' is-active' : ''}`}
        onClick={onToggle}
        aria-pressed={customizeMode}
      >
        {customizeMode ? <Check size={14} strokeWidth={1.5} /> : <SlidersHorizontal size={14} strokeWidth={1.5} />}
        <span>{customizeMode ? t('customizeDone') : t('customize')}</span>
      </button>
      {customizeMode && <small className="text-muted">{t('customizeHint')}</small>}
    </div>
  )
}

// ─── Widget frame — wraps a dashboard section with reorder/visibility controls ─
export function WidgetFrame({
  widgetKey,
  label,
  customizeMode,
  visible,
  canUp,
  canDown,
  onUp,
  onDown,
  onToggle,
  t,
  children,
}: {
  widgetKey: WidgetKey
  label: string
  customizeMode: boolean
  visible: boolean
  canUp: boolean
  canDown: boolean
  onUp: () => void
  onDown: () => void
  onToggle: () => void
  t: Translate
  children: ReactNode
}) {
  // Hidden widgets are only rendered while customizing (so the user can
  // re-enable them). Otherwise they disappear entirely.
  if (!customizeMode && !visible) return null

  return (
    <div
      className={`dashboard-widget${customizeMode ? ' is-customizing' : ''}${!visible ? ' is-hidden' : ''}`}
      data-widget={widgetKey}
    >
      {customizeMode && (
        <div className="widget-controls">
          <span className="widget-controls-label" title={label}>{label}</span>
          <div className="widget-controls-buttons">
            <button
              type="button"
              className="widget-control-btn"
              onClick={onUp}
              disabled={!canUp}
              aria-label={t('moveUp')}
              title={t('moveUp')}
            >
              <ChevronUp size={15} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              className="widget-control-btn"
              onClick={onDown}
              disabled={!canDown}
              aria-label={t('moveDown')}
              title={t('moveDown')}
            >
              <ChevronDown size={15} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              className="widget-control-btn"
              onClick={onToggle}
              aria-label={visible ? t('hideWidget') : t('showWidget')}
              title={visible ? t('hideWidget') : t('showWidget')}
            >
              {visible ? <Eye size={15} strokeWidth={1.5} /> : <EyeOff size={15} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      )}
      {children}
    </div>
  )
}
