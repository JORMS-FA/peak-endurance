import { useEffect, useRef, useState, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { MapPin } from 'lucide-react'
import '../../styles/13-polyline-map.css'

// ─── Polyline decoder (Google encoded polyline format) ────────────────────

function decodePolyline(encoded: string): [number, number][] {
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

// ─── Tile layer configs ────────────────────────────────────────────────────

type ViewMode = 'street' | 'satellite' | 'terrain' | 'dark'

interface TileConfig {
  url: string
  attribution: string
  label: string
  labelEs: string
}

const TILE_LAYERS: Record<ViewMode, TileConfig> = {
  street: {
    url: 'https://tiles.openfreemap.org/styles/liberty/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://openfreemap.org">OpenFreeMap</a> &copy; <a href="https://openmaptiles.org">OpenMapTiles</a>',
    label: 'Street',
    labelEs: 'Mapa',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://esri.com">Esri</a>',
    label: 'Satellite',
    labelEs: 'Satélite',
  },
  terrain: {
    url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
    label: 'Terrain',
    labelEs: 'Terreno',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com">CARTO</a>',
    label: 'Dark',
    labelEs: 'Oscuro',
  },
}

// ─── Props ──────────────────────────────────────────────────────────────────

type PolylineMapProps = {
  encoded: string | null | undefined
  variant?: 'compact' | 'large'
  showUnavailable?: boolean
  unavailableLabel?: string
}

// ─── Component ──────────────────────────────────────────────────────────────

export function PolylineMap({
  encoded,
  variant = 'compact',
  showUnavailable = false,
  unavailableLabel = 'Mapa no disponible',
}: PolylineMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<L.Map | null>(null)
  const tileLayer = useRef<L.TileLayer | null>(null)
  const routeLayer = useRef<L.Polyline | null>(null)
  const markersLayer = useRef<L.LayerGroup | null>(null)
  const [view, setView] = useState<ViewMode>('dark')

  const pts = useMemo(() => (encoded ? decodePolyline(encoded) : []), [encoded])

  const isEs = unavailableLabel.includes('disponible')

  // ── Build leaflet map (once) ───────────────────────────────────────────────
  useEffect(() => {
    // Wait until ref is attached
    if (!mapRef.current || pts.length < 2) return
    if (mapInstance.current) return

    const container = mapRef.current
    const map = L.map(container, {
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
      dragging: true,
      touchZoom: true,
    })

    // Fit the polyline bounds
    const lats = pts.map((p) => p[0])
    const lngs = pts.map((p) => p[1])
    const padding = variant === 'large' ? 0.005 : 0.01
    map.fitBounds(
      [
        [Math.min(...lats) - padding, Math.min(...lngs) - padding],
        [Math.max(...lats) + padding, Math.max(...lngs) + padding],
      ],
      { padding: [24, 24] },
    )

    // Tile layer
    const cfg = TILE_LAYERS[view]
    const layer = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: 19,
    }).addTo(map)
    tileLayer.current = layer

    // Route polyline
    const latlngs: [number, number][] = pts
    const line = L.polyline(latlngs, {
      color: '#ffffff',
      weight: variant === 'large' ? 4 : 3,
      opacity: 0.85,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(map)
    routeLayer.current = line

    // Start / end markers
    const markers = L.layerGroup().addTo(map)
    const startIcon = L.divIcon({ className: 'marker-start', iconSize: [12, 12], iconAnchor: [6, 6] })
    const endIcon = L.divIcon({ className: 'marker-end', iconSize: [12, 12], iconAnchor: [6, 6] })
    L.marker(latlngs[0], { icon: startIcon }).addTo(markers)
    L.marker(latlngs[latlngs.length - 1], { icon: endIcon }).addTo(markers)
    markersLayer.current = markers

    mapInstance.current = map

    // Cleanup on unmount
    return () => {
      map.remove()
      mapInstance.current = null
    }
    // We intentionally only init once when pts first become available
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pts.length > 1])

  // ── Switch tile layer when view changes ────────────────────────────────────
  useEffect(() => {
    const map = mapInstance.current
    if (!map) return
    const cfg = TILE_LAYERS[view]
    if (tileLayer.current) {
      map.removeLayer(tileLayer.current)
    }
    tileLayer.current = L.tileLayer(cfg.url, {
      attribution: cfg.attribution,
      maxZoom: 19,
    }).addTo(map)
  }, [view])

  // ── No polyline handler ────────────────────────────────────────────────────
  if (pts.length < 2) {
    if (!showUnavailable) return null
    return (
      <div className="polyline-map-empty" role="img" aria-label={unavailableLabel}>
        <MapPin size={variant === 'large' ? 22 : 16} strokeWidth={1.5} />
        <span>{unavailableLabel}</span>
      </div>
    )
  }

  return (
    <div className={`polyline-map-wrapper ${variant}`}>
      <div ref={mapRef} />
      {/* Layer switcher */}
      <div className="polyline-map-toolbar">
        {(Object.keys(TILE_LAYERS) as ViewMode[]).map((k) => (
          <button
            key={k}
            type="button"
            className={`polyline-map-btn${view === k ? ' active' : ''}`}
            onClick={() => setView(k)}
          >
            {isEs ? TILE_LAYERS[k].labelEs : TILE_LAYERS[k].label}
          </button>
        ))}
      </div>
    </div>
  )
}
