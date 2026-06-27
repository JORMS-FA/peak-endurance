import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { AuthGuard } from './components/auth/AuthGuard'
import { AuthScreen } from './components/auth/AuthScreen'
import { Landing } from './pages/Landing'

const Dashboard = lazy(() => import('./pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const Training = lazy(() => import('./pages/Training').then((m) => ({ default: m.Training })))
const ActivityDetail = lazy(() => import('./pages/ActivityDetail').then((m) => ({ default: m.default })))
const Plan = lazy(() => import('./pages/Plan').then((m) => ({ default: m.Plan })))
const AiCoach = lazy(() => import('./pages/AiCoach').then((m) => ({ default: m.AiCoach })))
const Analysis = lazy(() => import('./pages/Analysis').then((m) => ({ default: m.Analysis })))
const Connections = lazy(() => import('./pages/Connections').then((m) => ({ default: m.Connections })))
const Segments = lazy(() => import('./pages/Segments').then((m) => ({ default: m.Segments })))
const Notifications = lazy(() => import('./pages/Notifications').then((m) => ({ default: m.default })))
const Profile = lazy(() => import('./pages/Profile').then((m) => ({ default: m.Profile })))
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })))
const Privacy = lazy(() => import('./pages/Privacy').then((m) => ({ default: m.Privacy })))
const Terms = lazy(() => import('./pages/Terms').then((m) => ({ default: m.Terms })))

function RouteFallback() {
  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255,255,255,0.55)',
        fontSize: '0.9rem',
        letterSpacing: '0.04em',
      }}
    >
      Cargando…
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<AuthScreen />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* Authenticated app shell — all /app/* routes share TopBar + Sidebar */}
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
          <Route path="configuracion" element={<Settings />} />
          <Route path="ajustes" element={<Navigate to="/app/configuracion" replace />} />

          {/* Public profile — accessible inside the shell (handle or own profile) */}
          <Route path="perfil" element={<Profile />} />
          <Route path="perfil/:handle" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  )
}
