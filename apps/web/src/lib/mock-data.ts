import type {
  AiSettings,
  AiUsage,
  ImportedActivity,
  SourceConnection,
  TrainingSession,
} from './types'

export const calendarMonths = ['2026-04', '2026-05', '2026-06']
export const raceDate = '2026-05-03'

export const initialConnections: SourceConnection[] = [
  { source: 'strava', label: 'Strava', status: 'connected', lastSync: '2026-04-24T09:15:00Z', connected: true, color: '#ff6a1a' },
  { source: 'garmin', label: 'Garmin', status: 'coming_soon', lastSync: '', connected: false, color: '#53a4ff' },
  { source: 'coros', label: 'Coros', status: 'coming_soon', lastSync: '', connected: false, color: '#23d18b' },
  { source: 'igpsport', label: 'iGPSPORT', status: 'coming_soon', lastSync: '', connected: false, color: '#f6b31a' },
  { source: 'coospo', label: 'Coospo', status: 'coming_soon', lastSync: '', connected: false, color: '#ff4d6d' },
]

export const initialAiSettings: AiSettings = {
  tone: 'supportive',
  autonomy: 'confirm-required',
  equipment: 'Solo frecuencia cardiaca',
  extraContext: 'Atleta enfocado en MTB/XCO. La IA debe responder corto, claro y accionable.',
}

export const initialAiUsage: AiUsage = {
  used: 7,
  limit: 20,
  plan: 'free',
}

export const initialSessions: TrainingSession[] = [
  { id: 's1', date: '2026-04-28', title: 'Fuerza general', sport: 'gym', durationMinutes: 60, tss: 42, status: 'planned', intensity: 'moderate', notes: 'Movilidad + fuerza base.' },
  { id: 's2', date: '2026-04-29', title: 'Z2 fondo', sport: 'bike', durationMinutes: 150, tss: 95, status: 'planned', intensity: 'moderate', notes: 'Trabajo aeróbico estable.' },
  { id: 's3', date: '2026-05-01', title: 'Umbral en subida', sport: 'bike', durationMinutes: 90, tss: 85, status: 'planned', intensity: 'high', notes: 'Bloques al umbral con control de FC.' },
  { id: 's4', date: '2026-05-02', title: 'Activacion pre carrera', sport: 'bike', durationMinutes: 45, tss: 38, status: 'planned', intensity: 'low', notes: 'Pierna viva, sin fatigar.' },
  { id: 's5', date: '2026-05-03', title: 'Peak Endurace Race Day', sport: 'race', durationMinutes: 110, tss: 120, status: 'race', intensity: 'high', notes: 'Carrera principal del bloque.' },
  { id: 's6', date: '2026-05-05', title: 'Recuperacion activa', sport: 'bike', durationMinutes: 50, tss: 24, status: 'recovery', intensity: 'low', notes: 'Soltar piernas y revisar sensaciones.' },
  { id: 's7', date: '2026-05-08', title: 'VO2 tecnico', sport: 'bike', durationMinutes: 80, tss: 88, status: 'planned', intensity: 'high', notes: 'Bloques cortos con tecnica MTB.' },
  { id: 's8', date: '2026-05-14', title: 'Trail run aeróbico', sport: 'run', durationMinutes: 70, tss: 55, status: 'planned', intensity: 'moderate', notes: 'Terreno ondulado.' },
  { id: 's9', date: '2026-05-20', title: 'Largo MTB', sport: 'bike', durationMinutes: 180, tss: 145, status: 'planned', intensity: 'moderate', notes: 'Volumen principal del microciclo.' },
  { id: 's10', date: '2026-06-02', title: 'Fuerza + tecnica', sport: 'gym', durationMinutes: 75, tss: 48, status: 'planned', intensity: 'moderate', notes: 'Estabilidad y fuerza útil.' },
  { id: 's11', date: '2026-06-09', title: 'Z2 suave', sport: 'bike', durationMinutes: 90, tss: 52, status: 'planned', intensity: 'low', notes: 'Carga controlada.' },
  { id: 's12', date: '2026-06-17', title: 'Umbral progresivo', sport: 'bike', durationMinutes: 95, tss: 86, status: 'planned', intensity: 'high', notes: 'Construccion de forma post carrera.' },
]

export const initialActivities: ImportedActivity[] = [
  {
    id: 'a1',
    sourceType: 'strava',
    title: 'Resistencia Z2',
    date: '2026-04-29',
    sport: 'bike',
    durationMinutes: 145,
    distanceKm: 53.2,
    tss: 91,
    avgHr: 144,
    maxHr: 165,
    elevationGain: 680,
    zonePrecision: 'real',
    zoneBreakdown: { z1: 18, z2: 92, z3: 24, z4: 9, z5: 2 },
  },
  {
    id: 'a2',
    sourceType: 'strava',
    title: 'Umbral en subida',
    date: '2026-05-01',
    sport: 'bike',
    durationMinutes: 88,
    distanceKm: 27.4,
    tss: 85,
    avgHr: 159,
    maxHr: 178,
    elevationGain: 720,
    zonePrecision: 'real',
    zoneBreakdown: { z1: 11, z2: 21, z3: 24, z4: 25, z5: 7 },
  },
  {
    id: 'a3',
    sourceType: 'strava',
    title: 'Carrera Peak Endurace',
    date: '2026-05-03',
    sport: 'race',
    durationMinutes: 112,
    distanceKm: 39.8,
    tss: 118,
    avgHr: 166,
    maxHr: 184,
    elevationGain: 980,
    zonePrecision: 'real',
    zoneBreakdown: { z1: 7, z2: 18, z3: 26, z4: 41, z5: 20 },
  },
  {
    id: 'a4',
    sourceType: 'strava',
    title: 'Recovery spin',
    date: '2026-05-05',
    sport: 'bike',
    durationMinutes: 48,
    distanceKm: 18.5,
    tss: 22,
    avgHr: 128,
    maxHr: 141,
    elevationGain: 120,
    zonePrecision: 'estimated',
    zoneBreakdown: { z1: 30, z2: 15, z3: 3, z4: 0, z5: 0 },
  },
  {
    id: 'a5',
    sourceType: 'strava',
    title: 'VO2 tecnico',
    date: '2026-05-08',
    sport: 'bike',
    durationMinutes: 76,
    distanceKm: 24.3,
    tss: 84,
    avgHr: 161,
    maxHr: 181,
    elevationGain: 510,
    zonePrecision: 'real',
    zoneBreakdown: { z1: 10, z2: 16, z3: 18, z4: 22, z5: 10 },
  },
  {
    id: 'a6',
    sourceType: 'coros',
    title: 'Trail run base',
    date: '2026-05-14',
    sport: 'run',
    durationMinutes: 67,
    distanceKm: 12.7,
    tss: 53,
    avgHr: 149,
    maxHr: 171,
    elevationGain: 240,
    zonePrecision: 'insufficient',
    zoneBreakdown: { z1: 0, z2: 0, z3: 0, z4: 0, z5: 0 },
  },
]

export const sparklineSets = {
  form: [62, 64, 63, 65, 67, 66, 68, 72],
  load: [510, 560, 545, 610, 640, 690, 735, 842],
  ctl: [58, 60, 61, 63, 62, 66, 69, 72],
  atl: [44, 52, 49, 57, 51, 62, 70, 68],
  tsb: [-10, -5, -8, -2, 3, 1, 6, 4],
}
