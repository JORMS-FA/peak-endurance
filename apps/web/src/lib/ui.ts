export const appBrand = {
  name: 'Peak Endurance',
  accent: '#5e6ad2',
  accentSoft: '#7170ff',
  surface: '#080a0c',
  surfaceRaised: '#0e1014',
  outline: '#1c1f26',
}

export const appNavigation = [
  { id: 'inicio', path: '/', icon: 'home' },
  { id: 'calendario', path: '/calendario', icon: 'calendar' },
  { id: 'entrenamientos', path: '/entrenamientos', icon: 'dumbbell' },
  { id: 'plan', path: '/plan', icon: 'flag' },
  { id: 'iaCoach', path: '/ia-coach', icon: 'sparkles' },
  { id: 'analisis', path: '/analisis', icon: 'chart' },
  { id: 'progreso', path: '/progreso', icon: 'trending' },
  { id: 'segmentos', path: '/segmentos', icon: 'search' },
  { id: 'hermes', path: '/hermes', icon: 'plug' },
  { id: 'ajustes', path: '/ajustes', icon: 'settings' },
] as const

export const mobileNavigation = [
  { id: 'inicio', path: '/', icon: 'home' },
  { id: 'calendario', path: '/calendario', icon: 'calendar' },
  { id: 'iaCoach', path: '/ia-coach', icon: 'sparkles' },
  { id: 'segmentos', path: '/segmentos', icon: 'search' },
  { id: 'mas', path: '/ajustes', icon: 'more' },
] as const

export const languages = [
  { value: 'es', label: 'ES' },
  { value: 'en', label: 'EN' },
] as const