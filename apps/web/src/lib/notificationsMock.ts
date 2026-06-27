export interface NotificationMock {
  id: string
  title: string
  description: string
  time: string
  read: boolean
  type?: 'achievement' | 'training' | 'system' | 'social'
}

export const mockNotifications: NotificationMock[] = [
  {
    id: '1',
    title: 'Nuevo logro desbloqueado',
    description: 'Has completado 10 entrenamientos consecutivos. ¡Sigue así!',
    time: 'Hace 10 min',
    read: false,
    type: 'achievement',
  },
  {
    id: '2',
    title: 'Entrenamiento programado',
    description: 'Tu sesión de mañana: 10 km de carrera continua (zona 2). ¡Prepárate!',
    time: 'Hace 45 min',
    read: false,
    type: 'training',
  },
  {
    id: '3',
    title: 'Nuevo follower',
    description: 'Ana García ha comenzado a seguirte. Puedes ver su perfil en Conexiones.',
    time: 'Hace 2 h',
    read: false,
    type: 'social',
  },
  {
    id: '4',
    title: 'Ajuste de plan sugerido',
    description: 'Basado en tu fatiga acumulada, la IA sugiere mover el entrenamiento de umbral al viernes.',
    time: 'Ayer',
    read: true,
    type: 'system',
  },
  {
    id: '5',
    title: 'Strava sincronizado',
    description: 'Tu actividad de ciclismo (42 km, 890 m D+) se ha importado correctamente.',
    time: 'Ayer',
    read: true,
    type: 'training',
  },
  {
    id: '6',
    title: 'Récord personal',
    description: 'Nuevo RP en el segmento "Subida a la Ermita" — 4:32, mejorando tu marca anterior en 12 segundos.',
    time: 'Hace 3 días',
    read: true,
    type: 'achievement',
  },
  {
    id: '7',
    title: 'Semana de descarga recomendada',
    description: 'Llevas 4 semanas de carga creciente. La IA recomienda reducir volumen un 40% la próxima semana.',
    time: 'Hace 5 días',
    read: true,
    type: 'system',
  },
  {
    id: '8',
    title: 'Conexión con Garmin',
    description: 'Tu cuenta de Garmin Connect ya está vinculada. Los datos de salud se importarán automáticamente.',
    time: 'Hace 1 sem',
    read: true,
    type: 'system',
  },
]
