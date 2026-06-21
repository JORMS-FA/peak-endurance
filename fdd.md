# FDD — Functional Design Document
## Peak Endurance

> **Versión:** 2.0
> **Fecha:** 20 de junio de 2026
> **Basado en:** FRD v2.0, schema actual de Supabase, edge functions desplegadas.

---

## 1. Arquitectura general

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CLIENTES                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐               │
│  │  Web (React) │  │   iOS (RN)   │  │ Android (RN) │  (roadmap)    │
│  │  Vite + TS   │  │   roadmap    │  │   roadmap    │               │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘               │
│         │                  │                  │                      │
└─────────┼──────────────────┼──────────────────┼─────────────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │ Supabase JS Client
                             ▼
┌──────────────────────────────────────────────────────────────────────┐
│                       SUPABASE                                        │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────────┐   │
│  │   PostgreSQL   │  │      Auth      │  │   Edge Functions     │   │
│  │  + RLS por     │  │  Google OAuth  │  │  - strava-auth       │   │
│  │   profile_id   │  │  Email+Pass    │  │  - strava-sync       │   │
│  │                │  │                │  │  - (futuro: ai-*)    │   │
│  └────────┬───────┘  └────────────────┘  └──────────┬───────────┘   │
└───────────┼─────────────────────────────────────────┼────────────────┘
            │                                          │
            │                                          │ HTTPS
            │                                          ▼
            │                            ┌─────────────────────────┐
            │                            │     Strava API v3       │
            │                            │  (OAuth + activities)   │
            │                            └─────────────────────────┘
            ▼
   (futuro) Cloudflare Worker → OpenRouter/Ollama → IA Coach
```

---

## 2. Stack tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend (web) | React 19 + TypeScript + Vite 8 | actual |
| Animaciones | framer-motion | 12.x |
| Iconos | lucide-react | 1.x |
| Routing | react-router-dom | 7.x |
| State auth | Context API + Supabase Auth | — |
| Backend | Supabase (PostgreSQL 15 + Auth + Edge Functions Deno) | hosted |
| Edge runtime | Deno | última estable de Supabase |
| IA (futuro) | Cloudflare Workers + LLM (OpenRouter/Ollama) | — |
| Mobile (futuro) | React Native (probable) | — |
| Hosting web | Vercel | — |

---

## 3. Modelo de datos

### 3.1 Auth y perfil

```sql
profiles
  id (uuid PK → auth.users)
  display_name, email, avatar_url
  preferred_language ('es'|'en')
  created_at

subscriptions
  id (uuid PK)
  profile_id → profiles.id
  plan_key ('free'|'pro')
  ai_quota_limit, ai_quota_window
  created_at

ai_usage_counters (profile_id, window_key, used_queries)
ui_preferences (profile_id, language, timezone, density)
ai_preferences (profile_id, tone, equipment, autonomy_level, extra_context)
```

### 3.2 Conexiones deportivas

```sql
activity_sources           -- catálogo: strava, garmin, coros, etc.
  id, source_type (unique), display_name

source_connections          -- una por (profile, source)
  id, profile_id, source_id, external_athlete_id, status

strava_oauth_states         -- CSRF para OAuth (efímero, expira en 10 min)
  state (PK), profile_id, created_at

strava_tokens               -- tokens OAuth cifrados de Strava
  profile_id (PK)
  athlete_id, athlete_name
  access_token, refresh_token (encrypted at rest by Supabase)
  expires_at, scopes
  created_at, updated_at
```

### 3.3 Actividades importadas

```sql
imported_activities
  id, profile_id, source_connection_id
  external_activity_id, source_type (unique pair)
  activity_date, title, sport
  duration_minutes, distance_km, elevation_gain_m
  avg_hr, max_hr
  tss                      -- calculado heurísticamente al importar
  zone_breakdown (jsonb)
  zone_precision ('real'|'estimated'|'insufficient')
  raw_payload (jsonb)      -- payload completo de Strava
  created_at
```

### 3.4 Planificación

```sql
training_blocks
  id, profile_id
  title, starts_on, ends_on, goal

training_sessions
  id, profile_id, block_id (nullable)
  session_date, title, sport
  status ('planned'|'completed'|'skipped')
  intensity, duration_minutes, tss, notes

session_adjustments
  id, session_id, requested_by, reason
  before_snapshot (jsonb), after_snapshot (jsonb)

pending_ai_actions
  id, profile_id, action_type
  summary, reason, impact, payload (jsonb)
  status ('pending'|'accepted'|'rejected')
```

### 3.5 RLS

Todas las tablas tienen RLS habilitado (migración `0001_rls_and_imported_activities.sql`).
Las políticas siguen el patrón **"el usuario solo ve lo suyo"**: `auth.uid() = profile_id`.
Las edge functions usan `SERVICE_ROLE_KEY`, que bypasea RLS para operaciones server-side.

---

## 4. Edge Functions

### 4.1 `strava-auth` — OAuth flow

| Acción | Body / método | Descripción |
|---|---|---|
| `auth` | `POST { action: 'auth' }` | Genera state CSRF, devuelve URL de autorización de Strava |
| callback | `GET /callback?code=...&state=...` | Intercambia code por tokens, los persiste en `strava_tokens`, redirige a `${APP_URL}/app/conexiones?strava=success` |
| `status` | `POST { action: 'status' }` | Devuelve `{ connected, athlete, expiresAt, scopes, needsRefresh }` |
| `refresh` | `POST { action: 'refresh' }` | Refresca el access token usando el refresh token |
| `disconnect` | `POST { action: 'disconnect' }` | Llama a `/oauth/deauthorize` de Strava y borra el token |

Variables de entorno requeridas en Supabase Edge Functions Secrets:
- `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`
- `STRAVA_REDIRECT_URI` = `https://<project>.supabase.co/functions/v1/strava-auth/callback`
- `APP_URL` = URL pública del frontend

### 4.2 `strava-sync` — importación de actividades

`POST { days?: number }` (default 60, max 180)

Flujo:
1. Verifica auth del usuario.
2. Lee `strava_tokens` por `profile_id`. Si está expirado, refresca antes de continuar.
3. Crea/recupera la fila en `source_connections` (Strava) para enlazarla.
4. Llama a `GET /api/v3/athlete/activities?after=<unix>&per_page=100` (paginado, hasta 5 páginas / 500 actividades).
5. Para cada actividad:
   - Mapea `sport_type` → `sport` interno (`run`, `bike`, `swim`, `gym`, `other`).
   - Calcula TSS heurístico (ver §5).
   - Hace upsert sobre `imported_activities` (`onConflict: 'source_type,external_activity_id'`).
6. Devuelve `{ synced, skipped, total, since }`.

---

## 5. Cómputo de métricas (PMC)

### 5.1 TSS heurístico (server-side, en `strava-sync`)

```
Path 1 — HR-based (preferido):
  duration = moving_time || elapsed_time
  threshold_hr = 0.85 × (max_hr_actividad || 185)
  IF = avg_hr / threshold_hr
  TSS = (duration_seconds / 3600) × IF² × 100
  TSS = clamp(TSS, 0, 600)

Path 2 — Strava suffer_score (solo subscribers):
  TSS = min(suffer_score, 600)

Path 3 — Solo duración (fallback):
  TSS = horas × 0.65² × 100        (≈ Z2 conservador)
```

### 5.2 PMC client-side (en `useDashboardMetrics`)

```ts
// Sobre la serie diaria (90 días) de TSS:
ctl = ctl + (tss_today - ctl) / 42      // CTL = EMA42 (aptitud / fitness)
atl = atl + (tss_today - atl) / 7       // ATL = EMA7  (fatiga aguda)
tsb = ctl - atl                          // TSB = forma
formPct = round(clamp(tsb, -20, 20) / 20 × 100)
```

---

## 6. Mapa de rutas (frontend)

```
/                  → Landing (público, embudo de descarga)
/login             → Auth screen (Google + email/pass)

/app               → Dashboard (protegido, AuthGuard)
/app/calendario    → Calendario (planning vs ejecutado)
/app/entrenamientos→ Lista de sesiones
/app/plan          → Plan + bloques
/app/ia-coach      → Panel IA Coach
/app/analisis      → Análisis avanzado / curva de forma
/app/progreso      → Tendencias semanales
/app/conexiones    → Strava + futuras integraciones
/app/segmentos     → Segmentos Strava
/app/ajustes       → Tema, idioma, perfil

*                  → Redirect a /
```

---

## 7. Flujos principales

### 7.1 Conectar Strava
```
Usuario click "Conectar Strava"
  → POST strava-auth { action: 'auth' }
  → strava-auth genera state CSRF, lo guarda en strava_oauth_states
  → strava-auth devuelve URL https://www.strava.com/oauth/authorize?...
  → window.location.assign(url)
  → Usuario autoriza en Strava
  → Strava redirige a STRAVA_REDIRECT_URI (= edge function /callback)
  → strava-auth valida state, intercambia code → tokens
  → strava-auth persiste en strava_tokens
  → strava-auth redirige 302 a APP_URL/app/conexiones?strava=success
  → Connections.tsx detecta ?strava=success y dispara strava-sync(60)
  → Dashboard refresca métricas
```

### 7.2 Sincronización de actividades
```
useStravaSync → POST strava-sync { days: 60 }
  → strava-sync refresca token si vencido
  → strava-sync llama Strava API (paginado)
  → Para cada activity: computeTss() → upsert imported_activities
  → Devuelve { synced, skipped, total, since }
useDashboardMetrics → SELECT imported_activities WHERE profile_id = me
  → Construye serie diaria 90d, computa CTL/ATL/TSB
  → Renderiza dashboard
```

### 7.3 Propuesta IA (futuro, fase 3)
```
Usuario invoca "Analizar semana" / "Detectar fatiga"
  → POST ai-coach { context: { ctl, atl, tsb, recent, plan } }
  → ai-coach (Cloudflare Worker) llama LLM
  → Inserta pending_ai_actions con propuesta
  → Dashboard muestra "1 propuesta pendiente"
  → Usuario revisa y confirma
  → Se aplica change y se guarda en session_adjustments
```

---

## 8. Pantallas clave

### 8.1 Landing (`/`)
- Hero con tagline "Strava + TrainingPeaks fusion", CTAs a App Store / Google Play, secondary "Probar versión web".
- Mockup CSS del dashboard (no imagen, escala perfecto).
- Sección "para quién es" con chips de deportes.
- Features 6 con iconos lucide y reveal scroll.
- "Cómo funciona" en 3 pasos.
- Pricing con tier Free + Pro.
- CTA final con stores + footer.

### 8.2 Dashboard (`/app`)
- Hero AI Coach con saludo personalizado y 3 acciones.
- Banner de "Conecta Strava" si no está conectado (oculto si lo está).
- 4 metric cards animadas (Forma %, Carga TSS, Aptitud CTL, Fatiga ATL) con count-up.
- Today's session (de `training_sessions`).
- Quick read: TSB, horas/sem, km/sem.
- Weekly TSS bars proporcionales a TSS diario (current week).
- Recent activities (últimas 5 de Strava).

### 8.3 Connections (`/app/conexiones`)
- Card primaria de Strava con estado real.
- Botones según estado: Conectar / Sincronizar + Desconectar.
- Toast de éxito al volver del callback.
- Lista de "próximamente" (Garmin, COROS, Wahoo, iGPSPORT).

---

## 9. Seguridad

| Aspecto | Implementación |
|---|---|
| Tokens de Strava | En `strava_tokens` con RLS; sólo accesible por el dueño y por `service_role` |
| Secrets de OAuth | `STRAVA_CLIENT_*`, `APP_URL` — solo en Edge Functions Secrets, **nunca** en el frontend |
| RLS | Habilitado en todas las tablas de `public.*` que tocan datos de usuario |
| CSRF en OAuth | `strava_oauth_states` con state UUID por intento, validado en callback y borrado tras uso |
| Auth | Supabase Auth (Google OAuth + email/password con leaked password protection) |
| Datos en frontend | El frontend solo recibe lo que su `auth.uid()` puede leer (RLS) |

---

## 10. Internacionalización

- Diccionario en `apps/web/src/lib/i18n.ts` con dos lenguajes (`es` default, `en`).
- Hook `useI18n()` provee `t(key)` reactivo al idioma activo.
- Idioma persistido en `localStorage` y sincronizado a `<html lang>`.

---

## 11. Observabilidad y operación

- **Logs de edge functions:** Supabase Dashboard → Functions → Logs.
- **Errores frontend:** capturados en `console.warn` con prefijos `[auth]`, `[strava]`. (Próximo: integrar Sentry.)
- **Migraciones:** archivos numerados en `supabase/migrations/`. Idempotentes.
- **Despliegue:**
  - Frontend: push a `main` → auto-deploy Vercel.
  - Edge functions: `supabase functions deploy <nombre>` desde la CLI.
  - Migraciones SQL: ejecutadas manualmente en Supabase SQL Editor (próximo: GitHub Action).
