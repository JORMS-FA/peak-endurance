import { Bike, Waves, Dumbbell, Activity, Moon } from 'lucide-react'

// A running person (Material Symbols "directions_run"), filled with currentColor.
function Runner({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z" />
    </svg>
  )
}

/** Consistent sport icon used across Training, Calendar, Dashboard, etc. */
export function SportIcon({ sport, size = 16 }: { sport: string; size?: number }) {
  switch (sport) {
    case 'run':
      return <Runner size={size} />
    case 'bike':
      return <Bike size={size} />
    case 'swim':
      return <Waves size={size} />
    case 'gym':
      return <Dumbbell size={size} />
    case 'rest':
      return <Moon size={size} />
    default:
      return <Activity size={size} />
  }
}

export const SPORT_COLORS: Record<string, string> = {
  run: '#22c55e',
  bike: '#f59e0b',
  swim: '#06b6d4',
  gym: '#f97316',
  rest: '#64748b',
  other: '#8b5cf6',
}
