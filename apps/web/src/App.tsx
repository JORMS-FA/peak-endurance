import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { AuthGuard } from './components/auth/AuthGuard'
import { AuthScreen } from './components/auth/AuthScreen'
import { Landing } from './pages/Landing'
import { Dashboard } from './pages/Dashboard'
import { Training } from './pages/Training'
import ActivityDetail from './pages/ActivityDetail'
import { Plan } from './pages/Plan'
import { AiCoach } from './pages/AiCoach'
import { Analysis } from './pages/Analysis'
import { Connections } from './pages/Connections'
import { Segments } from './pages/Segments'
import Notifications from './pages/Notifications'
import { Profile } from './pages/Profile'
import { Settings } from './pages/Settings'
import { Privacy } from './pages/Privacy'
import { Terms } from './pages/Terms'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<AuthScreen />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />

      <Route path="/app" element={<AuthGuard><AppLayout /></AuthGuard>}>
        <Route index element={<Dashboard />} />
        <Route path="ia-coach" element={<AiCoach />} />
        <Route path="entrenamientos" element={<Training />} />
        <Route path="entrenamientos/:id" element={<ActivityDetail />} />
        <Route path="plan" element={<Plan />} />
        <Route path="calendario" element={<Plan initialTab="calendar" />} />
        <Route path="analisis" element={<Analysis />} />
        <Route path="progreso" element={<Navigate to="/app/analisis" replace />} />
        <Route path="conexiones" element={<Connections />} />
        <Route path="segmentos" element={<Segments />} />
        <Route path="notificaciones" element={<Notifications />} />
        <Route path="perfil" element={<Profile />} />
        <Route path="configuracion" element={<Settings />} />
        <Route path="ajustes" element={<Navigate to="/app/configuracion" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}
