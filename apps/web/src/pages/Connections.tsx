import { useI18n } from '../hooks/useI18n'

const sources = [
  { id: 'strava', name: 'Strava', color: '#fc4c02', status: 'available' as const },
  { id: 'garmin', name: 'Garmin Connect', color: '#007dbb', status: 'coming_soon' as const },
  { id: 'coros', name: 'COROS', color: '#23d18b', status: 'coming_soon' as const },
  { id: 'wahoo', name: 'Wahoo', color: '#0068b5', status: 'coming_soon' as const },
]

export function Connections() {
  const { t } = useI18n()

  return (
    <div className="page-connections">
      <div className="page-header">
        <h2>{t('connections')}</h2>
      </div>

      <div className="connections-list">
        {sources.map((source) => (
          <div key={source.id} className="connection-card">
            <div className="connection-icon" style={{ background: source.color }}>
              {source.name.charAt(0)}
            </div>
            <div className="connection-info">
              <strong>{source.name}</strong>
              <span className={`connection-status status-${source.status}`}>
                {source.status === 'available'
                  ? t('stravaConnect')
                  : t('comingSoon')}
              </span>
            </div>
            <button
              type="button"
              className={`btn-connection ${source.status === 'available' ? 'btn-primary btn-sm' : 'btn-disabled'}`}
              disabled={source.status !== 'available'}
            >
              {source.status === 'available' ? t('stravaConnect') : t('comingSoon')}
            </button>
          </div>
        ))}
      </div>

      <section className="card" style={{ marginTop: '1rem' }}>
        <p className="text-muted" style={{ fontSize: '0.85rem' }}>
          {t('stravaDescription')}
        </p>
      </section>
    </div>
  )
}
