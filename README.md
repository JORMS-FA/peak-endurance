# Peak Endurance

**Plataforma inteligente de entrenamiento para atletas de resistencia.**

Peak Endurance combina datos reales de Strava con planificación estructurada y un coach de IA adaptativo que ajusta tu plan según tu fatiga real.

---

## Características

- **Dashboard en tiempo real** — CTL, ATL, TSB, forma % calculados sobre tus actividades importadas
- **Conexión Strava** — OAuth oficial, importación automática de actividades con cálculo heurístico de TSS
- **Coach IA** — Análisis semanal, detección de fatiga, ajuste de plan (soporta Gemini, GPT, Claude)
- **BYOK (Bring Your Own Key)** — Plan gratuito con tu propia API key de IA
- **Suscripción Pro** — 500 consultas IA/mes vía Lemon Squeezy
- **Multi-deporte** — Running, ciclismo, natación, triatlón, gimnasio
- **Zonas FC personalizables** — Método Karvonen o manual
- **Onboarding** — Configuración guiada de datos corporales, ritmo 10K, zonas
- **Multi-idioma** — Español e inglés
- **Temas** — Dark, light, midnight, forest + colores de acento

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19 + TypeScript + Vite 8 |
| UI | Lucide React + framer-motion + CSS variables |
| Backend | Supabase (PostgreSQL + Auth + Edge Functions) |
| Pagos | Lemon Squeezy (Merchant of Record) |
| IA | Gemini 2.0 Flash / GPT-4o / Claude (multi-provider) |
| Integraciones | Strava OAuth 2.0 |
| Deploy | Vercel (frontend) + Supabase (backend) |

---

## Estructura

```
peak-endurance/
├── apps/web/               → Frontend React (producción)
│   ├── src/pages/          → Landing, Dashboard, Training, AI Coach, Settings...
│   ├── src/hooks/          → useStrava, useSubscription, useApiKey, useAiCoach...
│   ├── src/lib/            → supabase, auth, strava, i18n, types
│   └── src/providers/      → AuthProvider, ThemeProvider
├── supabase/
│   ├── schema.sql          → Esquema base
│   ├── migrations/         → 4 migraciones incrementales
│   └── functions/          → 7 edge functions desplegadas
│       ├── strava-auth/
│       ├── strava-sync/
│       ├── ai-coach/
│       ├── ai-validate-key/
│       ├── lemonsqueezy-checkout/
│       ├── lemonsqueezy-webhook/
│       └── lemonsqueezy-portal/
├── docs/
│   ├── LAUNCH_PLAN.md      → Plan maestro de lanzamiento
│   └── v2-architecture.md  → Arquitectura v2
├── frd.md                  → Requisitos funcionales
├── fdd.md                  → Diseño funcional
└── package.json            → Monorepo workspace
```

---

## Desarrollo local

```bash
# 1. Instalar dependencias
npm install

# 2. Variables de entorno
cp apps/web/.env.example apps/web/.env.local
# Editar con tus credenciales de Supabase

# 3. Iniciar dev server
npm run dev:web
```

### Variables requeridas (`apps/web/.env.local`)

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-key>
VITE_SITE_URL=http://localhost:5173
```

---

## Deploy

**Frontend:** Vercel (auto-deploy desde `main`)

**Edge Functions:**
```bash
npx supabase functions deploy strava-auth --no-verify-jwt --project-ref <ref>
npx supabase functions deploy strava-sync --project-ref <ref>
npx supabase functions deploy ai-coach --no-verify-jwt --project-ref <ref>
npx supabase functions deploy ai-validate-key --no-verify-jwt --project-ref <ref>
npx supabase functions deploy lemonsqueezy-checkout --no-verify-jwt --project-ref <ref>
npx supabase functions deploy lemonsqueezy-webhook --no-verify-jwt --project-ref <ref>
npx supabase functions deploy lemonsqueezy-portal --no-verify-jwt --project-ref <ref>
```

**Migraciones:**
```bash
npx supabase db push --linked
```

---

## Modelo de negocio

| Plan | Precio | Incluye |
|------|--------|---------|
| Free | $0 | Dashboard, Strava sync, 20 consultas IA/mes (BYOK) |
| Pro | COP$37.000/mes | 500 consultas IA/mes (server key), soporte prioritario |

Pagos procesados por Lemon Squeezy (Merchant of Record). No requiere empresa en USA.

---

## Licencia

Propietario. © 2026 Jorman Fagua.
