import { useMemo } from 'react'
import { useActivities } from './useActivities'

export type Achievement = {
  id: string
  emoji: string
  title: string
  desc: string
  unlocked: boolean
  progress: number // 0..1
}

export type Gamification = {
  xp: number
  level: number
  levelTitle: string
  xpInLevel: number
  xpForNextLevel: number
  levelProgress: number // 0..1
  achievements: Achievement[]
  unlockedCount: number
}

const LEVEL_TITLES = ['Novato', 'Aficionado', 'Constante', 'Competidor', 'Atleta', 'Élite', 'Leyenda']

// XP needed to *reach* level n (n starts at 1). Quadratic curve.
function xpForLevel(level: number): number {
  return Math.round(100 * (level - 1) * (level - 1))
}

export function useGamification() {
  const { data, loading } = useActivities({ days: 365 })

  const result = useMemo<Gamification>(() => {
    const runs = data.filter((a) => a.sport === 'run')
    const bikes = data.filter((a) => a.sport === 'bike')
    const maxRunKm = runs.reduce((m, a) => Math.max(m, a.distance_km ?? 0), 0)
    const maxBikeKm = bikes.reduce((m, a) => Math.max(m, a.distance_km ?? 0), 0)
    const totalElev = data.reduce((s, a) => s + (a.elevation_gain_m ?? 0), 0)
    const totalTss = data.reduce((s, a) => s + (a.tss ?? 0), 0)
    const n = data.length

    const xp = Math.round(totalTss)

    // Level from XP
    let level = 1
    while (xpForLevel(level + 1) <= xp && level < 60) level++
    const base = xpForLevel(level)
    const next = xpForLevel(level + 1)
    const xpInLevel = xp - base
    const xpForNextLevel = next - base
    const levelProgress = xpForNextLevel > 0 ? Math.min(1, xpInLevel / xpForNextLevel) : 1
    const levelTitle = LEVEL_TITLES[Math.min(LEVEL_TITLES.length - 1, Math.floor((level - 1) / 5))]

    const defs: { id: string; emoji: string; title: string; desc: string; value: number; target: number }[] = [
      { id: 'first', emoji: '🎯', title: 'Primer entreno', desc: 'Registra tu primera actividad', value: n, target: 1 },
      { id: 'ten', emoji: '💪', title: '10 entrenos', desc: 'Completa 10 actividades', value: n, target: 10 },
      { id: 'fifty', emoji: '🏅', title: '50 entrenos', desc: 'Completa 50 actividades', value: n, target: 50 },
      { id: 'ten_k', emoji: '🏃', title: 'Primer 10K', desc: 'Corre 10 km en una sesión', value: maxRunKm, target: 10 },
      { id: 'half', emoji: '🥈', title: 'Media maratón', desc: 'Corre 21,1 km', value: maxRunKm, target: 21.1 },
      { id: 'marathon', emoji: '🏆', title: 'Tu primera maratón', desc: 'Corre 42,2 km', value: maxRunKm, target: 42.195 },
      { id: 'century', emoji: '🚴', title: 'Siglo (100 km)', desc: 'Pedalea 100 km', value: maxBikeKm, target: 100 },
      { id: 'climber', emoji: '⛰️', title: 'Escalador', desc: '2.000 m de desnivel acumulado', value: totalElev, target: 2000 },
      { id: 'fire', emoji: '🔥', title: '1.000 TSS', desc: 'Acumula 1.000 de carga', value: totalTss, target: 1000 },
    ]

    const achievements: Achievement[] = defs.map((d) => ({
      id: d.id,
      emoji: d.emoji,
      title: d.title,
      desc: d.desc,
      unlocked: d.value >= d.target,
      progress: Math.min(1, d.target > 0 ? d.value / d.target : 0),
    }))

    return {
      xp,
      level,
      levelTitle,
      xpInLevel,
      xpForNextLevel,
      levelProgress,
      achievements,
      unlockedCount: achievements.filter((a) => a.unlocked).length,
    }
  }, [data])

  return { ...result, loading }
}
