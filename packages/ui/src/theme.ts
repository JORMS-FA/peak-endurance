export const appBrand = {
  name: 'Peak Endurance',
  accent: '#ff6a1a',
  accentSoft: '#ff914d',
  surface: '#111418',
  surfaceRaised: '#171b22',
  outline: '#262d39',
}

export const appNavigation = [
  { id: 'inicio', path: '/', icon: 'home' },
  { id: 'calendario', path: '/calendario', icon: 'calendar' },
  { id: 'entrenamientos', path: '/entrenamientos', icon: 'dumbbell' },
  { id: 'plan', path: '/plan', icon: 'flag' },
  { id: 'iaCoach', path: '/ia-coach', icon: 'sparkles' },
  { id: 'analisis', path: '/analisis', icon: 'chart' },
  { id: 'progreso', path: '/progreso', icon: 'trending' },
  { id: 'conexiones', path: '/conexiones', icon: 'plug' },
  { id: 'ajustes', path: '/ajustes', icon: 'settings' },
] as const

export const mobileNavigation = [
  { id: 'inicio', path: '/', icon: 'home' },
  { id: 'calendario', path: '/calendario', icon: 'calendar' },
  { id: 'entrenamientos', path: '/entrenamientos', icon: 'dumbbell' },
  { id: 'iaCoach', path: '/ia-coach', icon: 'sparkles' },
  { id: 'mas', path: '/ajustes', icon: 'more' },
] as const

export const languages = [
  { value: 'es', label: 'ES' },
  { value: 'en', label: 'EN' },
] as const
