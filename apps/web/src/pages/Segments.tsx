import { useState, useEffect, useCallback } from 'react'
import { Mountain, MapPin, Timer, TrendingUp, Trophy, Star, Navigation, Loader2, AlertCircle, Zap } from 'lucide-react'
import { useI18n } from '../hooks/useI18n'
import { useStravaConnection } from '../hooks/useStrava'
import { fetchStravaSegments, type StravaSegmentData } from '../lib/strava'

type SportFilter = 'all' | 'running' | 'riding'

const FILTERS: { key: SportFilter; label_es: string; label_en: string }[] = [
  { key: 'all', label_es: 'Todos', label_en: 'All' },
  { key: 'running', label_es: 'Running', label_en: 'Running' },
  { key: 'riding', label_es: 'Ciclismo', label_en: 'Cycling' },
]

export function Segments() {
  const { t, language } = useI18n()
  const isEs = language === 'es'
  const { status: strava, loading: stravaLoading } = useStravaConnection()
  const stravaConnected = Boolean(strava?.connected)

  const [segments, setSegments] = useState<StravaSegmentData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<SportFilter>('all')

  const fetchData = useCallback(async () => {
    if (!stravaConnected) return
    setLoading(true)
    setError(null)
    try {
      const sportArg = filter === 'all' ? undefined : filter
      const result = await fetchStravaSegments(sportArg)
      setSegments(result.segments)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar segmentos')
    } finally {
      setLoading(false)
    }
  }, [stravaConnected, filter])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const filteredSegments = filter === 'all'
    ? segments
    : segments.filter((s) => s.sport === filter)

  return (
    <div className="page-segments">
      <div className="page-header">
        <h2>{t('segments')}</h2>
      </div>

      <div className="segments-filters">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`chip${filter === f.key ? ' active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {isEs ? f.label_es : f.label_en}
          </button>
        ))}
      </div>

      {!stravaConnected && !stravaLoading ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <Mountain size={24} />
            </div>
            <h3>{isEs ? 'Strava no conectado' : 'Strava not connected'}</h3>
            <p>{isEs ? 'Conecta Strava para explorar tus segmentos guardados.' : 'Connect Strava to explore your starred segments.'}</p>
          </div>
        </div>
      ) : loading ? (
        <div className="card">
          <div className="empty-state">
            <Loader2 size={24} className="spin-icon" />
            <p>{isEs ? 'Cargando segmentos...' : 'Loading segments...'}</p>
          </div>
        </div>
      ) : error ? (
        <div className="card">
          <div className="empty-state">
            <AlertCircle size={24} />
            <h3>{isEs ? 'Error' : 'Error'}</h3>
            <p>{error}</p>
            <button type="button" className="btn-secondary btn-sm" onClick={fetchData}>
              {isEs ? 'Reintentar' : 'Retry'}
            </button>
          </div>
        </div>
      ) : filteredSegments.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">
              <Star size={24} />
            </div>
            <h3>{isEs ? 'Sin segmentos' : 'No segments'}</h3>
            <p>{isEs
              ? 'Guarda segmentos en Strava para verlos aquí. Usa la app de Strava para marcar segmentos como favoritos.'
              : 'Star segments on Strava to see them here. Use the Strava app to mark segments as favorites.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="segments-list">
          {filteredSegments.map((seg) => (
            <div key={seg.id} className="card segment-card">
              <div className="segment-card-top">
                <div className="segment-card-name-row">
                  <div className={`segment-sport-icon ${seg.sport === 'riding' ? 'segment-sport-ride' : 'segment-sport-run'}`}>
                    {seg.sport === 'riding' ? <Zap size={14} /> : <Mountain size={14} />}
                  </div>
                  <div className="segment-card-name">
                    <strong>{seg.name}</strong>
                    {seg.city && (
                      <span className="segment-location">
                        <MapPin size={10} />
                        {[seg.city, seg.state, seg.country].filter(Boolean).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                {seg.starred && <Star size={14} className="segment-starred-icon" fill="currentColor" />}
              </div>

              <div className="segment-stats">
                <div className="segment-stat">
                  <span className="segment-stat-label">
                    <MapPin size={12} />
                    {isEs ? 'Distancia' : 'Distance'}
                  </span>
                  <strong>{seg.distance_km.toFixed(2)} km</strong>
                </div>
                <div className="segment-stat">
                  <span className="segment-stat-label">
                    <TrendingUp size={12} />
                    {isEs ? 'Desnivel' : 'Elevation'}
                  </span>
                  <strong>{seg.elevation_gain.toFixed(0)} m</strong>
                </div>
                {seg.average_grade != null && (
                  <div className="segment-stat">
                    <span className="segment-stat-label">
                      <TrendingUp size={12} />
                      {isEs ? 'Pendiente' : 'Grade'}
                    </span>
                    <strong>{seg.average_grade.toFixed(1)}%</strong>
                  </div>
                )}
                {seg.pr_time && (
                  <div className="segment-stat">
                    <span className="segment-stat-label">
                      <Timer size={12} />
                      PR
                    </span>
                    <strong>{seg.pr_time}</strong>
                  </div>
                )}
                {seg.kom && (
                  <div className="segment-stat">
                    <span className="segment-stat-label">
                      <Trophy size={12} />
                      KOM/QOM
                    </span>
                    <strong>{seg.kom}</strong>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {stravaConnected && (
        <button
          type="button"
          className="btn-primary"
          style={{ width: '100%', marginTop: 16 }}
          onClick={() => window.open('https://www.strava.com/segments', '_blank', 'noopener')}
        >
          <Navigation size={16} />
          {isEs ? 'Explorar segmentos cercanos' : 'Explore nearby segments'}
        </button>
      )}
    </div>
  )
}
