import type { NavItem } from './types'

export const sidebarNav: NavItem[] = [
  { id: 'dashboard', path: '/app', icon: 'Home', label_es: 'Inicio', label_en: 'Dashboard' },
  { id: 'ai-coach', path: '/app/ia-coach', icon: 'Sparkles', label_es: 'IA Coach', label_en: 'AI Coach' },
  { id: 'training', path: '/app/entrenamientos', icon: 'Dumbbell', label_es: 'Entrenamientos', label_en: 'Training' },
  { id: 'plan', path: '/app/plan', icon: 'CalendarDays', label_es: 'Plan', label_en: 'Plan' },
  { id: 'analysis', path: '/app/analisis', icon: 'LineChart', label_es: 'Análisis', label_en: 'Analysis' },
  { id: 'connections', path: '/app/conexiones', icon: 'Plug', label_es: 'Conexiones', label_en: 'Connections' },
  { id: 'segments', path: '/app/segmentos', icon: 'Mountain', label_es: 'Segmentos', label_en: 'Segments' },
]

export const mobileNav: NavItem[] = [
  { id: 'dashboard', path: '/app', icon: 'Home', label_es: 'Inicio', label_en: 'Home' },
  { id: 'ai-coach', path: '/app/ia-coach', icon: 'Sparkles', label_es: 'Coach', label_en: 'Coach' },
  { id: 'training', path: '/app/entrenamientos', icon: 'Dumbbell', label_es: 'Entrena', label_en: 'Train' },
  { id: 'plan', path: '/app/plan', icon: 'CalendarDays', label_es: 'Plan', label_en: 'Plan' },
]
