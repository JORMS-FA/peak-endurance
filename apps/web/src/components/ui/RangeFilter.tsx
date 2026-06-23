import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarRange } from 'lucide-react'

export type DateRange = { preset: Preset; days: number; from?: string; to?: string }
type Preset = 'week' | 'month' | 'quarter' | 'custom'

const PRESET_DAYS: Record<Exclude<Preset, 'custom'>, number> = {
  week: 7,
  month: 30,
  quarter: 90,
}

// Universal range/compare filter used across panel pages.
export function RangeFilter({
  value,
  onChange,
}: {
  value: DateRange
  onChange: (r: DateRange) => void
}) {
  const [from, setFrom] = useState(value.from ?? '')
  const [to, setTo] = useState(value.to ?? '')

  const presets: { key: Preset; es: string }[] = [
    { key: 'week', es: 'Semana' },
    { key: 'month', es: 'Mes' },
    { key: 'quarter', es: '3 meses' },
    { key: 'custom', es: 'Personalizado' },
  ]

  function pick(key: Preset) {
    if (key === 'custom') {
      onChange({ preset: 'custom', days: 365, from: from || undefined, to: to || undefined })
    } else {
      onChange({ preset: key, days: PRESET_DAYS[key] })
    }
  }

  function applyCustom() {
    if (!from) return
    onChange({ preset: 'custom', days: 365, from, to: to || undefined })
  }

  return (
    <div className="range-filter">
      <div className="range-filter-head">
        <CalendarRange size={14} />
        <div className="seg-tabs range-tabs" role="tablist">
          {presets.map((p) => (
            <button
              key={p.key}
              type="button"
              role="tab"
              aria-selected={value.preset === p.key}
              className={`seg-tab${value.preset === p.key ? ' active' : ''}`}
              onClick={() => pick(p.key)}
            >
              {p.es}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {value.preset === 'custom' && (
          <motion.div
            className="range-custom"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <label>
              <span>Desde</span>
              <input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} />
            </label>
            <label>
              <span>Hasta</span>
              <input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} />
            </label>
            <button type="button" className="btn-primary btn-sm" onClick={applyCustom} disabled={!from}>
              Aplicar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Filter a list of `{date:'YYYY-MM-DD'}` items by a DateRange. */
export function inRange<T extends { date: string }>(items: T[], r: DateRange): T[] {
  if (r.preset !== 'custom') {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - r.days)
    const iso = cutoff.toISOString().slice(0, 10)
    return items.filter((i) => i.date >= iso)
  }
  return items.filter((i) => (!r.from || i.date >= r.from) && (!r.to || i.date <= r.to))
}
