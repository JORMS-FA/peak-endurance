import type { NavItem } from './types'

export const sidebarNav: NavItem[] = [
  { id: 'dashboard', path: '/app', icon: 'Home', label_es: 'Inicio', label_en: 'Dashboard' },
  { id: 'calendar', path: '/app/calendario', icon: 'CalendarDays', label_es: 'Calendario', label_en: 'Calendar' },
  { id: 'training', path: '/app/entrenamientos', icon: 'Dumbbell', label_es: 'Entrenamientos', label_en: 'Training' },
  { id: 'plan', path: '/app/plan', icon: 'Flag', label_es: 'Plan', label_en: 'Plan' },
  { id: 'ai-coach', path: '/app/ia-coach', icon: 'Sparkles', label_es: 'IA Coach', label_en: 'AI Coach' },
  { id: 'analysis', path: '/app/analisis', icon: 'LineChart', label_es: 'Analisis', label_en: 'Analysis' },
  { id: 'progress', path: '/app/progreso', icon: 'TrendingUp', label_es: 'Progreso', label_en: 'Progress' },
  { id: 'connections', path: '/app/conexiones', icon: 'Plug', label_es: 'Conexiones', label_en: 'Connections' },
  { id: 'segments', path: '/app/segmentos', icon: 'Mountain', label_es: 'Segmentos', label_en: 'Segments' },
  { id: 'settings', path: '/app/ajustes', icon: 'Settings', label_es: 'Ajustes', label_en: 'Settings' },
]

export const mobileNav: NavItem[] = [
  { id: 'dashboard', path: '/app', icon: 'Home', label_es: 'Inicio', label_en: 'Home' },
  { id: 'training', path: '/app/entrenamientos', icon: 'Dumbbell', label_es: 'Entrena', label_en: 'Train' },
  { id: 'ai-coach', path: '/app/ia-coach', icon: 'Sparkles', label_es: 'Coach', label_en: 'Coach' },
  { id: 'progress', path: '/app/progreso', icon: 'TrendingUp', label_es: 'Progreso', label_en: 'Progress' },
  { id: 'settings', path: '/app/ajustes', icon: 'Settings', label_es: 'Mas', label_en: 'More' },
]
