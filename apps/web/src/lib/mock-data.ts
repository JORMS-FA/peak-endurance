import type {
  AiSettings,
  AiUsage,
  HermesStatus,
  ImportedActivity,
  SourceConnection,
  StravaSegment,
  TrainingSession,
} from './types'

export const calendarMonths = ['2026-06', '2026-07', '2026-08']
export const raceDate = '2026-08-16'

export const initialConnections: SourceConnection[] = [
  { source: 'strava', label: 'Strava', status: 'coming_soon', lastSync: '', connected: false, color: '#5e6ad2' },
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
  // ── Semana de transición (existing) ──
  { id: 's10', date: '2026-06-18', title: 'Fuerza general', sport: 'gym', durationMinutes: 60, tss: 42, status: 'planned', intensity: 'moderate', notes: 'Movilidad + fuerza base.' },
  { id: 's11', date: '2026-06-20', title: 'Z2 fondo aeróbico', sport: 'run', durationMinutes: 55, tss: 45, status: 'planned', intensity: 'moderate', notes: 'Base aeróbica 5:30/km.' },
  { id: 's12', date: '2026-06-22', title: 'Umbral progresivo', sport: 'run', durationMinutes: 45, tss: 52, status: 'planned', intensity: 'high', notes: 'Bloques 3x8min al umbral.' },

  // ════════════════════════════════════════════
  // PLAN 15K — 9 Semanas (16 Jun → 16 Ago 2026)
  // ════════════════════════════════════════════

  // ─── S1: Base (16-22 Jun) ───
  { id: 's1-1', date: '2026-06-16', title: 'Fondo suave', sport: 'run', durationMinutes: 30, tss: 22, status: 'planned', intensity: 'low', notes: '5 km a 6:00/km. Sensaciones.' },
  { id: 's1-2', date: '2026-06-17', title: 'Fuerza general', sport: 'gym', durationMinutes: 45, tss: 30, status: 'planned', intensity: 'moderate', notes: 'Full body + core.' },
  { id: 's1-3', date: '2026-06-18', title: 'Rodaje suave', sport: 'run', durationMinutes: 35, tss: 28, status: 'planned', intensity: 'low', notes: '5 km a 5:45/km.' },
  { id: 's1-4', date: '2026-06-20', title: 'Fondo acumulación', sport: 'run', durationMinutes: 50, tss: 42, status: 'planned', intensity: 'moderate', notes: '8 km a 5:30/km.' },

  // ─── S2: Base (23-29 Jun) ───
  { id: 's2-1', date: '2026-06-23', title: 'Rodaje + técnica', sport: 'run', durationMinutes: 35, tss: 28, status: 'planned', intensity: 'low', notes: '5 km + drills de carrera.' },
  { id: 's2-2', date: '2026-06-24', title: 'Fuerza + estabilidad', sport: 'gym', durationMinutes: 45, tss: 30, status: 'planned', intensity: 'moderate', notes: 'Pierna + core.' },
  { id: 's2-3', date: '2026-06-25', title: 'Fartlek suave', sport: 'run', durationMinutes: 40, tss: 38, status: 'planned', intensity: 'moderate', notes: '6 km con cambios de ritmo suaves.' },
  { id: 's2-4', date: '2026-06-27', title: 'Fondo construcción', sport: 'run', durationMinutes: 60, tss: 52, status: 'planned', intensity: 'moderate', notes: '10 km a 5:20/km.' },
  { id: 's2-5', date: '2026-06-28', title: 'Recup. activa bici', sport: 'bike', durationMinutes: 45, tss: 20, status: 'planned', intensity: 'low', notes: '45 min suave.' },

  // ─── S3: Construcción (30 Jun-6 Jul) ───
  { id: 's3-1', date: '2026-06-30', title: 'Tempo run', sport: 'run', durationMinutes: 40, tss: 48, status: 'planned', intensity: 'high', notes: '3 km calentamiento + 5 km a 4:45/km + 1 km enfriamiento.' },
  { id: 's3-2', date: '2026-07-01', title: 'Fuerza funcional', sport: 'gym', durationMinutes: 50, tss: 35, status: 'planned', intensity: 'moderate', notes: 'Circuito de fuerza.' },
  { id: 's3-3', date: '2026-07-02', title: 'Rodaje regenerativo', sport: 'run', durationMinutes: 30, tss: 22, status: 'planned', intensity: 'low', notes: '5 km muy suaves.' },
  { id: 's3-4', date: '2026-07-04', title: 'Largo construcción', sport: 'run', durationMinutes: 75, tss: 68, status: 'planned', intensity: 'moderate', notes: '12 km a 5:15/km.' },
  { id: 's3-5', date: '2026-07-05', title: 'Bici recuperativa', sport: 'bike', durationMinutes: 60, tss: 25, status: 'planned', intensity: 'low', notes: 'Paseo activo.' },

  // ─── S4: Construcción (7-13 Jul) ───
  { id: 's4-1', date: '2026-07-07', title: 'Series 1000m', sport: 'run', durationMinutes: 45, tss: 55, status: 'planned', intensity: 'high', notes: "4x1000m a 4:15/km con 2' rec." },
  { id: 's4-2', date: '2026-07-08', title: 'Fuerza + técnica', sport: 'gym', durationMinutes: 50, tss: 35, status: 'planned', intensity: 'moderate', notes: 'Trabajo de fuerza reactiva.' },
  { id: 's4-3', date: '2026-07-09', title: 'Rodaje suave', sport: 'run', durationMinutes: 35, tss: 28, status: 'planned', intensity: 'low', notes: '6 km recuperación.' },
  { id: 's4-4', date: '2026-07-11', title: 'Fondo medio', sport: 'run', durationMinutes: 85, tss: 75, status: 'planned', intensity: 'moderate', notes: '13 km a 5:15/km.' },
  { id: 's4-5', date: '2026-07-12', title: 'Bici regenerativa', sport: 'bike', durationMinutes: 50, tss: 22, status: 'planned', intensity: 'low', notes: 'Recuperación activa.' },

  // ─── S5: Construcción pesada (14-20 Jul) ───
  { id: 's5-1', date: '2026-07-14', title: 'Tempo + cuestas', sport: 'run', durationMinutes: 50, tss: 62, status: 'planned', intensity: 'high', notes: '3x500m cuesta + 15 min tempo.' },
  { id: 's5-2', date: '2026-07-15', title: 'Gimnasio', sport: 'gym', durationMinutes: 55, tss: 38, status: 'planned', intensity: 'moderate', notes: 'Fuerza máxima + core.' },
  { id: 's5-3', date: '2026-07-16', title: 'Rodaje regenerativo', sport: 'run', durationMinutes: 30, tss: 22, status: 'planned', intensity: 'low', notes: '5 km suaves.' },
  { id: 's5-4', date: '2026-07-18', title: 'Largo 14K', sport: 'run', durationMinutes: 90, tss: 82, status: 'planned', intensity: 'moderate', notes: '14 km a 5:10/km.' },
  { id: 's5-5', date: '2026-07-19', title: 'Natación recup.', sport: 'swim', durationMinutes: 30, tss: 15, status: 'planned', intensity: 'low', notes: '30 min piscina suave.' },

  // ─── S6: Pico (21-27 Jul) ───
  { id: 's6-1', date: '2026-07-21', title: 'Series 1km + tempo', sport: 'run', durationMinutes: 50, tss: 65, status: 'planned', intensity: 'high', notes: "5x1000m a 4:10/km + 2' rec." },
  { id: 's6-2', date: '2026-07-22', title: 'Fuerza funcional', sport: 'gym', durationMinutes: 50, tss: 35, status: 'planned', intensity: 'moderate', notes: 'Circuito + pliometría.' },
  { id: 's6-3', date: '2026-07-23', title: 'Rodaje suave', sport: 'run', durationMinutes: 35, tss: 28, status: 'planned', intensity: 'low', notes: '6 km recuperación.' },
  { id: 's6-4', date: '2026-07-25', title: 'Largo 15K', sport: 'run', durationMinutes: 95, tss: 88, status: 'planned', intensity: 'moderate', notes: '15 km a 5:00/km — simulacro de carrera.' },
  { id: 's6-5', date: '2026-07-26', title: 'Bici regenerativa', sport: 'bike', durationMinutes: 45, tss: 20, status: 'planned', intensity: 'low', notes: '45 min muy suave.' },

  // ─── S7: Pico (28 Jul-3 Ago) ───
  { id: 's7-1', date: '2026-07-28', title: 'VO2 max corto', sport: 'run', durationMinutes: 40, tss: 52, status: 'planned', intensity: 'high', notes: "8x400m a 3:50/km con 1' rec." },
  { id: 's7-2', date: '2026-07-30', title: 'Tempo sostenido', sport: 'run', durationMinutes: 45, tss: 55, status: 'planned', intensity: 'high', notes: '10 km con 6 km a 4:35/km.' },
  { id: 's7-3', date: '2026-08-01', title: 'Largo 14K', sport: 'run', durationMinutes: 85, tss: 78, status: 'planned', intensity: 'moderate', notes: '14 km a 5:00/km — último largo.' },
  { id: 's7-4', date: '2026-08-02', title: 'Recup. activa', sport: 'bike', durationMinutes: 40, tss: 18, status: 'planned', intensity: 'low', notes: '40 min suave.' },

  // ─── S8: Tapering (4-10 Ago) ───
  { id: 's8-1', date: '2026-08-04', title: 'Rodaje corto', sport: 'run', durationMinutes: 25, tss: 18, status: 'planned', intensity: 'low', notes: '4 km suaves a 5:30/km.' },
  { id: 's8-2', date: '2026-08-05', title: 'Activación fuerza', sport: 'gym', durationMinutes: 30, tss: 20, status: 'planned', intensity: 'low', notes: 'Core + ejercicios de activación.' },
  { id: 's8-3', date: '2026-08-06', title: 'Fartlek corto', sport: 'run', durationMinutes: 30, tss: 32, status: 'planned', intensity: 'moderate', notes: '5 km con 3 cambios de ritmo.' },
  { id: 's8-4', date: '2026-08-08', title: 'Fondo ligero', sport: 'run', durationMinutes: 50, tss: 40, status: 'planned', intensity: 'low', notes: '8 km suaves — soltar piernas.' },
  { id: 's8-5', date: '2026-08-09', title: 'Bici muy suave', sport: 'bike', durationMinutes: 30, tss: 12, status: 'planned', intensity: 'low', notes: '30 min rodar suave.' },

  // ─── S9: Tapering + 🏁 Race (11-16 Ago) ───
  { id: 's9-1', date: '2026-08-11', title: 'Activación ligera', sport: 'run', durationMinutes: 20, tss: 14, status: 'planned', intensity: 'low', notes: '3 km con estiramientos.' },
  { id: 's9-2', date: '2026-08-12', title: 'Gimnasio suave', sport: 'gym', durationMinutes: 25, tss: 15, status: 'planned', intensity: 'low', notes: 'Solo movilidad y activación.' },
  { id: 's9-3', date: '2026-08-13', title: 'Pre-activación', sport: 'run', durationMinutes: 15, tss: 10, status: 'planned', intensity: 'low', notes: '2 km + 3 cambios de ritmo cortos.' },
  { id: 's9-4', date: '2026-08-14', title: 'Descanso total', sport: 'rest', durationMinutes: 0, tss: 0, status: 'planned', intensity: 'rest', notes: 'Descanso completo.' },
  { id: 's9-5', date: '2026-08-15', title: 'Pre-carrera', sport: 'run', durationMinutes: 15, tss: 8, status: 'planned', intensity: 'low', notes: 'Trote muy suave 2 km + strides.' },
  { id: 's9-race', date: '2026-08-16', title: '🏁 15K Race Day', sport: 'race', durationMinutes: 0, tss: 0, status: 'planned', intensity: 'high', notes: 'Carrera de 15 km — La Macarena, Colombia 🏆' },
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

export const initialSegments: StravaSegment[] = [
  {
    id: 'seg-1',
    name: 'Caño Cristales Climb',
    distanceKm: 4.8,
    elevationGain: 312,
    effort: '5:42/km',
    starred: true,
    sport: 'running',
  },
  {
    id: 'seg-2',
    name: 'Sierra de la Macarena Ascent',
    distanceKm: 12.4,
    elevationGain: 685,
    effort: '32 min',
    starred: true,
    sport: 'riding',
  },
  {
    id: 'seg-3',
    name: 'Río Güejar Trail',
    distanceKm: 6.1,
    elevationGain: 198,
    effort: '6:18/km',
    starred: false,
    sport: 'running',
  },
  {
    id: 'seg-4',
    name: 'Mirador Llano Grande',
    distanceKm: 9.7,
    elevationGain: 540,
    effort: '26 min',
    starred: false,
    sport: 'riding',
  },
  {
    id: 'seg-5',
    name: 'Bosque de las Acacias Loop',
    distanceKm: 3.2,
    elevationGain: 84,
    effort: '4:55/km',
    starred: true,
    sport: 'running',
  },
  {
    id: 'seg-6',
    name: 'Vereda El Tablazo Descent',
    distanceKm: 7.6,
    elevationGain: 410,
    effort: '21 min',
    starred: false,
    sport: 'riding',
  },
  {
    id: 'seg-7',
    name: 'Piedra del Cocuy Sprint',
    distanceKm: 1.4,
    elevationGain: 62,
    effort: '4:12/km',
    starred: false,
    sport: 'running',
  },
  {
    id: 'seg-8',
    name: 'Cuchilla de Santo Domingo',
    distanceKm: 18.2,
    elevationGain: 920,
    effort: '48 min',
    starred: true,
    sport: 'riding',
  },
  {
    id: 'seg-9',
    name: 'Sendero Las Delicias',
    distanceKm: 5.5,
    elevationGain: 224,
    effort: '6:02/km',
    starred: false,
    sport: 'running',
  },
  {
    id: 'seg-10',
    name: 'Tramo Caño Yarumales',
    distanceKm: 14.3,
    elevationGain: 612,
    effort: '37 min',
    starred: false,
    sport: 'riding',
  },
]

export const hermesStatus: HermesStatus = {
  connected: false,
  stravaConnected: false,
  weeklyReportEnabled: false,
}
