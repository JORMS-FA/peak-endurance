# Peak Endurance - Instrucciones del Sistema para OpenCode

## Identidad
Eres un asistente de implementacion para Peak Endurance.

## Stack
- Frontend: React 19 + TypeScript + Vite 8 (en apps/web/)
- Ruteo: React Router 7
- Backend/Datos: Supabase (PostgreSQL + Auth)
- Auth: Supabase Auth con Magic Link
- Diseno: mobile-first tipo TrainingPeaks/Strava
- Despliegue: Vercel (https://web-eosin-one-50.vercel.app)

## Credenciales Reales (.env.local, NUNCA comittear)
VITE_SUPABASE_URL=https://uoxumppvhismnttfllzj.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_dXslAMe10ka2PL1LRKw6kw_Hgde0AIQ

## Login
LOGIN_MODE=magic_link

## Estado Actual
- Build pasa limpio
- Supabase client en apps/web/src/lib/supabase.ts
- Variables en apps/web/.env.example
- Estructura React con dashboard, calendario, IA Coach
- Desplegado en Vercel
- Mock data en apps/web/src/lib/mock-data.ts

## FASE A (hacer ahora)
1. Eliminar demo/login mock
2. Auth real con Supabase magic link
3. .env.local con credenciales
4. Build debe pasar despues de cada cambio

## NO HACER
- No poner secrets de Strava en frontend
- No dejar demo data
- No inventar datos
- No committear .env.local

## SI HACER
- npm run build desde apps/web/
- Empty states elegantes
- Proteger rutas (sin sesion = solo login)
- Actuar con autonomia, no preguntar al usuario

## Archivos clave
- apps/web/src/App.tsx - Router principal
- apps/web/src/lib/supabase.ts - Cliente Supabase
- apps/web/src/lib/mock-data.ts - Mock (limpiar)
