import type { NavItem } from './types'

export const sidebarNav: NavItem[] = [
  { id: 'dashboard', path: '/', icon: 'Home', label_es: 'Inicio', label_en: 'Dashboard' },
  { id: 'calendar', path: '/calendario', icon: 'CalendarDays', label_es: 'Calendario', label_en: 'Calendar' },
  { id: 'training', path: '/entrenamientos', icon: 'Dumbbell', label_es: 'Entrenamientos', label_en: 'Training' },
  { id: 'plan', path: '/plan', icon: 'Flag', label_es: 'Plan', label_en: 'Plan' },
  { id: 'ai-coach', path: '/ia-coach', icon: 'Sparkles', label_es: 'IA Coach', label_en: 'AI Coach' },
  { id: 'analysis', path: '/analisis', icon: 'LineChart', label_es: 'Analisis', label_en: 'Analysis' },
  { id: 'progress', path: '/progreso', icon: 'TrendingUp', label_es: 'Progreso', label_en: 'Progress' },
  { id: 'connections', path: '/conexiones', icon: 'Plug', label_es: 'Conexiones', label_en: 'Connections' },
  { id: 'segments', path: '/segmentos', icon: 'Mountain', label_es: 'Segmentos', label_en: 'Segments' },
  { id: 'settings', path: '/ajustes', icon: 'Settings', label_es: 'Ajustes', label_en: 'Settings' },
]

export const mobileNav: NavItem[] = [
  { id: 'dashboard', path: '/', icon: 'Home', label_es: 'Inicio', label_en: 'Home' },
  { id: 'training', path: '/entrenamientos', icon: 'Dumbbell', label_es: 'Entrena', label_en: 'Train' },
  { id: 'ai-coach', path: '/ia-coach', icon: 'Sparkles', label_es: 'Coach', label_en: 'Coach' },
  { id: 'progress', path: '/progreso', icon: 'TrendingUp', label_es: 'Progreso', label_en: 'Progress' },
  { id: 'settings', path: '/ajustes', icon: 'Settings', label_es: 'Mas', label_en: 'More' },
]
