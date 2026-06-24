import { useMemo } from 'react'
import { MapPin } from 'lucide-react'

// ─── Polyline decoder (Google encoded polyline format) ────────────────────────

export function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = []
  let idx = 0
  let lat = 0
  let lng = 0
  while (idx < encoded.length) {
    let b: number, shift = 0, result = 0
    do { b = encoded.charCodeAt(idx++) - 63; result |= (b & 0x1f) << shift; shift += 5 } while (b >= 0x20)
    lat += result & 1 ? ~(result >> 1) : result >> 1
    shift = 0; result = 0
    do { b = encoded.charCodeAt(idx++) - 63; result |= (b & 0x1f) << shift; shift += 5 } while (b >= 0x20)
    lng += result & 1 ? ~(result >> 1) : result >> 1
    points.push([lat / 1e5, lng / 1e5])
  }
  return points
}

// ─── Shared SVG polyline map ──────────────────────────────────────────────────
//
// Renders a Strava `summary_polyline` as a pure SVG path — no external map
// tiles. B&W gradient stroke over an AMOLED-black canvas with white start/end
// dots, matching the app's calm monochrome aesthetic.
//
// `variant`:
//   - "compact" → inline route preview (Training list), small height
//   - "large"   → full ActivityDetail route block, taller, with grid + glow

type PolylineMapProps = {
  encoded: string | null | undefined
  variant?: 'compact' | 'large'
  /** When true and there is no polyline, render an empty-state skeleton. */
  showUnavailable?: boolean
  unavailableLabel?: string
}

export function PolylineMap({
  encoded,
  variant = 'compact',
  showUnavailable = false,
  unavailableLabel = 'Mapa no disponible',
}: PolylineMapProps) {
  const pts = useMemo(() => (encoded ? decodePolyline(encoded) : []), [encoded])

  if (pts.length < 2) {
    if (!showUnavailable) return null
    return (
      <div className={`polyline-map polyline-map-${variant} polyline-map-empty`} role="img" aria-label={unavailableLabel}>
        <MapPin size={variant === 'large' ? 22 : 16} strokeWidth={1.5} />
        <span>{unavailableLabel}</span>
      </div>
    )
  }

  const lats = pts.map((p) => p[0])
  const lngs = pts.map((p) => p[1])
  const minLat = Math.min(...lats), maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)

  const w = 600
  const h = variant === 'large' ? 400 : 200
  const pad = variant === 'large' ? 28 : 16
  const scaleX = (maxLng - minLng) || 0.001
  const scaleY = (maxLat - minLat) || 0.001
  const toX = (lng: number) => pad + ((lng - minLng) / scaleX) * (w - pad * 2)
  const toY = (lat: number) => h - pad - ((lat - minLat) / scaleY) * (h - pad * 2)
  const d = pts
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(p[1]).toFixed(1)},${toY(p[0]).toFixed(1)}`)
    .join(' ')

  const start = pts[0]
  const end = pts[pts.length - 1]
  const gradId = variant === 'large' ? 'routeGlowLarge' : 'routeGlowCompact'
  const gridId = variant === 'large' ? 'routeGridLarge' : 'routeGridCompact'

  return (
    <div className={`polyline-map polyline-map-${variant}`} role="img" aria-label="Route map">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid meet" className="polyline-map-svg">
        <defs>
          {/* B&W gradient: faint white → bright white along the route */}
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.5)" />
          </linearGradient>
          {variant === 'large' && (
            <filter id="routeGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
          <pattern id={gridId} width="40" height="40" patternUnits="userSpaceOnUse">
            <circle cx="20" cy="20" r="1" fill="rgba(255,255,255,0.06)" />
          </pattern>
        </defs>
        <rect width={w} height={h} fill={`url(#${gridId})`} />
        <path
          d={d}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={variant === 'large' ? 3 : 2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={variant === 'large' ? 'url(#routeGlowFilter)' : undefined}
        />
        {/* White start/end markers */}
        <circle cx={toX(start[1])} cy={toY(start[0])} r={variant === 'large' ? 6 : 5} fill="#ffffff" stroke="#0a0a0a" strokeWidth="2" />
        <circle cx={toX(end[1])} cy={toY(end[0])} r={variant === 'large' ? 6 : 5} fill="#ffffff" stroke="#0a0a0a" strokeWidth="2" />
      </svg>
    </div>
  )
}
