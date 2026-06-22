import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { AuthGuard } from './components/auth/AuthGuard'
import { AuthScreen } from './components/auth/AuthScreen'
import { Landing } from './pages/Landing'
import { Dashboard } from './pages/Dashboard'
import { Training } from './pages/Training'
import { Plan } from './pages/Plan'
import { AiCoach } from './pages/AiCoach'
import { Analysis } from './pages/Analysis'
import { Connections } from './pages/Connections'
import { Settings } from './pages/Settings'
import { Privacy } from './pages/Privacy'
import { Terms } from './pages/Terms'

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<AuthScreen />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />

      {/* Protected app routes */}
      <Route path="/app" element={<AuthGuard><AppLayout /></AuthGuard>}>
        <Route index element={<Dashboard />} />
        <Route path="ia-coach" element={<AiCoach />} />
        <Route path="entrenamientos" element={<Training />} />
        <Route path="plan" element={<Plan />} />
        {/* Calendar is now a view inside Plan */}
        <Route path="calendario" element={<Plan initialTab="calendar" />} />
        <Route path="analisis" element={<Analysis />} />
        {/* Progress merged into Analysis */}
        <Route path="progreso" element={<Navigate to="/app/analisis" replace />} />
        <Route path="conexiones" element={<Connections />} />
        {/* Segments hidden until implemented */}
        <Route path="segmentos" element={<Navigate to="/app/plan" replace />} />
        <Route path="ajustes" element={<Settings />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
