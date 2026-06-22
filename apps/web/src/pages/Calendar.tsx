import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useI18n } from '../hooks/useI18n'
import { SportIcon, SPORT_COLORS } from '../components/ui/SportIcon'

type CalActivity = {
  id: string
  date: string // YYYY-MM-DD
  title: string
  sport: string
  duration_minutes: number | null
  distance_km: number | null
  tss: number | null
  planned?: boolean
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}
function iso(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`
}

export function Calendar({ embedded = false }: { embedded?: boolean } = {}) {
  const { t, language } = useI18n()
  const isEs = language === 'es'
  const { status: authStatus, session } = useAuth()

  const today = new Date()
  const [cur, setCur] = useState({ year: today.getFullYear(), month: today.getMonth() })
  const [selected, setSelected] = useState<string>(iso(today.getFullYear(), today.getMonth(), today.getDate()))
  const [acts, setActs] = useState<CalActivity[]>([])

  const daysInMonth = new Date(cur.year, cur.month + 1, 0).getDate()
  const firstDow = (new Date(cur.year, cur.month, 1).getDay() + 6) % 7
  const monthName = new Date(cur.year, cur.month).toLocaleDateString(isEs ? 'es-CO' : 'en-US', {
    month: 'long',
    year: 'numeric',
  })

  const fetchMonth = useCallback(async () => {
    if (!supabase || authStatus !== 'authenticated' || !session?.user?.id) {
      setActs([])
      return
    }
    const from = iso(cur.year, cur.month, 1)
    const to = iso(cur.year, cur.month, daysInMonth)

    const [imported, planned] = await Promise.all([
      supabase
        .from('imported_activities')
        .select('id, activity_date, title, sport, duration_minutes, distance_km, tss')
        .eq('profile_id', session.user.id)
        .gte('activity_date', from)
        .lte('activity_date', to),
      supabase
        .from('training_sessions')
        .select('id, session_date, title, sport, duration_minutes, tss, status')
        .eq('profile_id', session.user.id)
        .gte('session_date', from)
        .lte('session_date', to),
    ])

    const importedActs: CalActivity[] = (imported.data ?? []).map((r) => ({
      id: r.id as string,
      date: r.activity_date as string,
      title: (r.title as string) ?? 'Activity',
      sport: (r.sport as string) ?? 'other',
      duration_minutes: r.duration_minutes as number | null,
      distance_km: r.distance_km != null ? Number(r.distance_km) : null,
      tss: r.tss as number | null,
      planned: false,
    }))

    const plannedActs: CalActivity[] = (planned.data ?? [])
      .filter((r) => (r.status as string) !== 'completed')
      .map((r) => ({
        id: `s_${r.id as string}`,
        date: r.session_date as string,
        title: (r.title as string) ?? 'Entrenamiento',
        sport: (r.sport as string) ?? 'other',
        duration_minutes: r.duration_minutes as number | null,
        distance_km: null,
        tss: r.tss as number | null,
        planned: true,
      }))

    setActs([...plannedActs, ...importedActs])
  }, [authStatus, session?.user?.id, cur.year, cur.month, daysInMonth])

  useEffect(() => { void fetchMonth() }, [fetchMonth])

  const byDate = useMemo(() => {
    const map = new Map<string, CalActivity[]>()
    for (const a of acts) {
      const arr = map.get(a.date) ?? []
      arr.push(a)
      map.set(a.date, arr)
    }
    return map
  }, [acts])

  const selectedActs = byDate.get(selected) ?? []

  function prevMonth() {
    setCur((p) => (p.month === 0 ? { year: p.year - 1, month: 11 } : { ...p, month: p.month - 1 }))
  }
  function nextMonth() {
    setCur((p) => (p.month === 11 ? { year: p.year + 1, month: 0 } : { ...p, month: p.month + 1 }))
  }

  const cells: (number | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const todayIso = iso(today.getFullYear(), today.getMonth(), today.getDate())

  return (
    <div className="page-calendar">
      {!embedded && (
        <div className="page-header">
          <h2>{t('calendar')}</h2>
        </div>
      )}

      <div className="calendar-card">
        <div className="calendar-nav">
          <button type="button" className="icon-btn" onClick={prevMonth}><ChevronLeft size={18} /></button>
          <h3 className="calendar-month-title" style={{ textTransform: 'capitalize' }}>{monthName}</h3>
          <button type="button" className="icon-btn" onClick={nextMonth}><ChevronRight size={18} /></button>
        </div>

        <div className="calendar-weekdays">
          {(isEs ? ['L', 'M', 'X', 'J', 'V', 'S', 'D'] : ['M', 'T', 'W', 'T', 'F', 'S', 'S']).map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>

        <div className="calendar-grid">
          {cells.map((day, i) => {
            if (!day) return <div key={i} className="calendar-cell empty" />
            const dIso = iso(cur.year, cur.month, day)
            const dayActs = byDate.get(dIso) ?? []
            const isToday = dIso === todayIso
            const isSelected = dIso === selected
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(dIso)}
                className={`calendar-cell${isToday ? ' today' : ''}${isSelected ? ' selected' : ''}`}
                style={{
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--accent)' : undefined,
                  position: 'relative',
                  minHeight: 56,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 4,
                  background: 'transparent',
                }}
              >
                <span className="calendar-day">{day}</span>
                {dayActs.length > 0 && (
                  <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
                    {dayActs.slice(0, 3).map((a) => (
                      <span
                        key={a.id}
                        title={a.title}
                        style={{
                          width: 18, height: 18, borderRadius: 5,
                          background: a.planned ? 'transparent' : (SPORT_COLORS[a.sport] || SPORT_COLORS.other),
                          border: a.planned ? `1.5px dashed ${SPORT_COLORS[a.sport] || SPORT_COLORS.other}` : 'none',
                          color: a.planned ? (SPORT_COLORS[a.sport] || SPORT_COLORS.other) : '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        <SportIcon sport={a.sport} size={11} />
                      </span>
                    ))}
                    {dayActs.length > 3 && (
                      <span style={{ fontSize: 9, color: 'var(--text-muted, #b8bcc8)' }}>+{dayActs.length - 3}</span>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Selected day detail */}
      <div className="card" style={{ marginTop: '1rem' }}>
        <div className="card-header">
          <span>
            {new Date(selected + 'T00:00:00').toLocaleDateString(isEs ? 'es-CO' : 'en-US', {
              weekday: 'long', day: 'numeric', month: 'long',
            })}
          </span>
        </div>
        {selectedActs.length === 0 ? (
          <div className="empty-state">
            <p>{isEs ? 'Sin entrenamientos este día' : 'No training this day'}</p>
          </div>
        ) : (
          <div className="activities-list">
            {selectedActs.map((a, i) => (
              <motion.article
                key={a.id}
                className="activity-card"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: i * 0.05 }}
              >
                <div className="activity-icon" data-sport={a.sport} style={{ background: SPORT_COLORS[a.sport] || SPORT_COLORS.other, color: '#fff' }}>
                  <SportIcon sport={a.sport} size={16} />
                </div>
                <div className="activity-body">
                  <div className="activity-row">
                    <strong className="activity-title">{a.title}</strong>
                    {a.planned
                      ? <span className="status-badge warning" style={{ fontSize: '0.68rem' }}>{isEs ? 'Planificado' : 'Planned'}</span>
                      : a.tss !== null && <span className="activity-tss">{a.tss} TSS</span>}
                  </div>
                  <div className="activity-meta">
                    {a.distance_km !== null && <span>{a.distance_km.toFixed(1)} km</span>}
                    {a.duration_minutes !== null && <span>{a.distance_km !== null ? '· ' : ''}{a.duration_minutes} min</span>}
                    {a.planned && a.tss !== null && <span>· {a.tss} TSS</span>}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
