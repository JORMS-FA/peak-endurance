import type { ReactNode } from 'react'

type IconKind = 'workout' | 'race' | 'rest' | 'strength' | 'completed'

type Props = {
  icon: IconKind
  title: string
  meta?: string
  trailing?: ReactNode
  onClick?: () => void
  children?: ReactNode
}

const ICONS: Record<IconKind, string> = {
  workout: 'M',
  race: '★',
  rest: '—',
  strength: '⚙',
  completed: '✓',
}

const LABELS: Record<IconKind, string> = {
  workout: 'Entrenamiento',
  race: 'Carrera',
  rest: 'Descanso',
  strength: 'Fuerza',
  completed: 'Completado',
}

export function SessionRow({ icon, title, meta, trailing, onClick }: Props) {
  return (
    <button type="button" className="session-row" onClick={onClick} aria-label={title}>
      <span className={`session-icon ${icon}`} aria-hidden>
        {ICONS[icon]}
      </span>
      <div className="session-body">
        <div className="session-title">{title}</div>
        {meta ? <div className="session-meta">{meta}</div> : null}
      </div>
      <div className="session-stats">
        <div className="big">{LABELS[icon]}</div>
      </div>
      {trailing ? <div className="session-stats">{trailing}</div> : null}
    </button>
  )
}