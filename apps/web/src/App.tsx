import { Navigate, Route, Routes } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { AppLayout } from './components/layout/AppLayout'
import { AuthGuard } from './components/auth/AuthGuard'
import { AuthScreen } from './components/auth/AuthScreen'
import { Landing } from './pages/Landing'
import { Dashboard } from './pages/Dashboard'
import { Calendar } from './pages/Calendar'
import { Training } from './pages/Training'
import { Plan } from './pages/Plan'
import { AiCoach } from './pages/AiCoach'
import { Analysis } from './pages/Analysis'
import { Progress } from './pages/Progress'
import { Connections } from './pages/Connections'
import { Segments } from './pages/Segments'
import { Settings } from './pages/Settings'

export default function App() {
  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<AuthScreen />} />

        {/* Protected app routes */}
        <Route path="/app" element={<AuthGuard><AppLayout /></AuthGuard>}>
          <Route index element={<Dashboard />} />
          <Route path="calendario" element={<Calendar />} />
          <Route path="entrenamientos" element={<Training />} />
          <Route path="plan" element={<Plan />} />
          <Route path="ia-coach" element={<AiCoach />} />
          <Route path="analisis" element={<Analysis />} />
          <Route path="progreso" element={<Progress />} />
          <Route path="conexiones" element={<Connections />} />
          <Route path="segmentos" element={<Segments />} />
          <Route path="ajustes" element={<Settings />} />
        </Route>

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Analytics />
    </>
  )
}
