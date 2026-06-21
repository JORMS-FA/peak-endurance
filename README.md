# Peak Endurance

> **Tagline:** la fusión de Strava y TrainingPeaks, con un coach de IA que vive contigo.

Plataforma multi-deporte para atletas de resistencia (running, ciclismo, natación, gimnasio, triatlón) que combina:

- **Datos reales** de Strava (vía OAuth oficial, no MCP).
- **Planificación estructurada** por bloques (base, construcción, pico, tapering) tipo TrainingPeaks.
- **Coach de IA adaptativo** que ajusta tu plan según tu fatiga real (CTL, ATL, TSB).

---

## 🎯 Estado actual

| Capa | Estado |
|---|---|
| Auth (Google OAuth + email/password) | ✅ |
| Strava OAuth real (edge function `strava-auth`) | ✅ |
| Sincronización Strava → BD (edge function `strava-sync`) | ✅ |
| Cálculo PMC (TSS / CTL / ATL / TSB / Forma) en cliente | ✅ |
| Dashboard con datos reales y animaciones | ✅ |
| Landing v2 orientada a conversión de descarga | ✅ |
| RLS habilitado en todas las tablas de usuario | ✅ |
| Plan multi-deporte editable | 🟡 En progreso |
| IA Coach adaptativa (workers + LLM) | 🟡 Pendiente |
| Apps móviles nativas (iOS / Android) | 🟡 Pendiente |
| Garmin / COROS / Wahoo / iGPSPORT | 🟡 Próximamente |

---

## 🏗️ Estructura del proyecto

```
peak-endurance/
├── apps/web/                 → Frontend React + Vite (production)
│   ├── src/components/       → Layout, auth, UI
│   ├── src/pages/            → Landing, Dashboard, Connections, etc.
│   ├── src/hooks/            → useStrava, useDashboardMetrics, useAuth, useI18n
│   ├── src/lib/              → supabase, strava, auth, i18n
│   └── src/providers/        → AuthProvider, ThemeProvider
├── supabase/
│   ├── schema.sql            → Esquema base
│   ├── seed.sql              → Tablas Strava (oauth_states, tokens) + RLS
│   ├── migrations/           → 0001_rls_and_imported_activities.sql
│   └── functions/
│       ├── strava-auth/      → OAuth flow (auth/callback/status/refresh/disconnect)
│       └── strava-sync/      → Importar actividades + cómputo TSS heurístico
├── docs/                     → Arquitectura, OpenAthlete reference
├── docs/legacy/              → Docs históricos del prototipo legacy
├── frd.md                    → Functional Requirements
├── fdd.md                    → Functional Design
└── sdd peak endurance.md     → Software Design Doc base
```

---

## 🧠 Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + TypeScript + Vite 8 |
| UI | Lucide React + CSS variables (multi-theme) + framer-motion |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions Deno) |
| Integraciones | Strava OAuth 2.0 (oficial, server-side) |
| IA (futuro) | Cloudflare Workers + Ollama / OpenRouter |
| Auth providers | Google OAuth + Email/Password |

---

## 🔌 Conexiones deportivas

| Fuente | Estado | Notas |
|---|---|---|
| **Strava** | ✅ OAuth oficial vía edge function `strava-auth` | Importa actividades, refresca tokens, calcula TSS heurístico |
| Garmin Connect | 🟡 Próximamente | Vía Garmin OAuth |
| COROS | 🟡 Próximamente | API privada en evaluación |
| Wahoo | 🟡 Próximamente | Vía Wahoo Cloud API |
| iGPSPORT | 🟡 Próximamente | Sin API pública oficial todavía |

> Nota: este proyecto usó internamente un **MCP de Strava** durante prototipado, pero la conexión real para usuarios finales **siempre va por OAuth server-side** (única forma escalable y multi-tenant).

---

## 🚀 Puesta en marcha (local)

1. **Variables de entorno (frontend)** — `apps/web/.env.local`:
   ```bash
   VITE_SUPABASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon-key>
   VITE_SITE_URL=http://localhost:5173
   ```

2. **Secrets en Supabase Edge Functions** (Dashboard → Edge Functions → Secrets):
   ```
   STRAVA_CLIENT_ID=<tu-client-id>
   STRAVA_CLIENT_SECRET=<tu-client-secret>
   STRAVA_REDIRECT_URI=https://<project-ref>.supabase.co/functions/v1/strava-auth/callback
   APP_URL=https://<tu-dominio-en-producción>
   ```

3. **Aplicar migraciones**: en Supabase SQL Editor, ejecutar en orden:
   ```sql
   -- 1) supabase/schema.sql
   -- 2) supabase/seed.sql
   -- 3) supabase/migrations/0001_rls_and_imported_activities.sql
   ```

4. **Desplegar edge functions** (con Supabase CLI):
   ```bash
   supabase functions deploy strava-auth --no-verify-jwt
   supabase functions deploy strava-sync
   ```

5. **Configurar app de Strava** ([www.strava.com/settings/api](https://www.strava.com/settings/api)):
   - Authorization Callback Domain: `<project-ref>.supabase.co`
   - Website: tu dominio de producción

6. **Configurar Google OAuth** ([Google Cloud Console](https://console.cloud.google.com)):
   - OAuth Client (Web), redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
   - Pegar Client ID/Secret en Supabase → Authentication → Providers → Google.

7. **Frontend**:
   ```bash
   cd apps/web
   npm install
   npm run dev
   ```

---

## 📊 Cómputo de métricas

El dashboard calcula PMC (Performance Management Chart) **client-side** sobre `imported_activities`:

- **TSS** (heurístico, vía edge function al importar):
  - Si hay `avg_hr`: `TSS ≈ horas × (avg_hr / threshold_hr)² × 100`, con `threshold_hr ≈ 0.85 × max_hr`.
  - Fallback 1: `suffer_score` de Strava (solo subscribers).
  - Fallback 2: estimación conservadora a IF≈0.65 (Z2).
- **CTL** (aptitud, fitness): EMA 42 días sobre TSS diario.
- **ATL** (fatiga aguda): EMA 7 días.
- **TSB** (forma): CTL − ATL.
- **Forma %**: TSB normalizado a [-100, +100].

---

## 📋 Documentos

| Documento | Descripción |
|---|---|
| `frd.md` | Requisitos funcionales |
| `fdd.md` | Diseño funcional + arquitectura |
| `sdd peak endurance.md` | Diseño de software |
| `COMPARISON.md` | Análisis Peak vs OpenAthlete vs TrainingPeaks |
| `docs/legacy/*` | Documentación del prototipo previo (XCO Training Analyzer) |

---

*Versión: 2.0 — Actualizado: 20 de junio de 2026*
