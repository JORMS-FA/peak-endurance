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
│   ├── config.toml         → Config del CLI (verify_jwt por función)
│   ├── migrations/         → 5 migraciones incrementales
│   └── functions/          → 10 edge functions desplegadas
│       ├── strava-auth/
│       ├── strava-sync/
│       ├── ai-coach/
│       ├── ai-validate-key/
│       ├── stripe-checkout/
│       ├── stripe-portal/
│       ├── stripe-webhook/
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

**Frontend:** Vercel (auto-deploy desde `main`).

**Edge Functions y migraciones:** automatizados vía GitHub Actions (ver sección
[CI/CD](#cicd) más abajo). Ya no hace falta desplegar a mano en cada push.

Los flags `verify_jwt` de cada función se controlan de forma declarativa en
`supabase/config.toml`, por lo que el deploy masivo respeta los mismos ajustes
que los antiguos comandos manuales con `--no-verify-jwt`.

### Deploy manual (fallback)

Solo necesario si los workflows fallan o quieres probar en local:

```bash
# Despliega TODAS las funciones respetando config.toml (verify_jwt por función)
npx supabase functions deploy --project-ref uoxumppvhismnttfllzj

# Aplica migraciones pendientes
npx supabase db push --linked
```

---

## CI/CD

El deploy del backend de Supabase está automatizado con GitHub Actions. Vercel
solo despliega el frontend, así que estos workflows cierran el hueco que dejaba
el código de las Edge Functions y las migraciones desactualizado en producción
tras cada push.

| Workflow | Archivo | Se dispara cuando | Acción |
|----------|---------|-------------------|--------|
| Edge Functions | `.github/workflows/deploy-supabase-functions.yml` | push a `main` que toca `supabase/functions/**` o `supabase/config.toml` | `supabase functions deploy --project-ref uoxumppvhismnttfllzj` |
| Migraciones | `.github/workflows/deploy-supabase-migrations.yml` | push a `main` que toca `supabase/migrations/**` | `supabase link` + `supabase db push` |

Ambos también se pueden ejecutar manualmente desde la pestaña **Actions**
(`workflow_dispatch`).

### Secrets de GitHub requeridos

Configúralos en **Settings > Secrets and variables > Actions** del repositorio:

| Secret | Obligatorio | Cómo obtenerlo |
|--------|-------------|----------------|
| `SUPABASE_ACCESS_TOKEN` | Sí | Token personal del CLI de Supabase. Ejecuta `supabase login` en local (lo genera y guarda) o créalo en el dashboard de Supabase: **Account > Access Tokens**. |
| `SUPABASE_DB_PASSWORD` | Solo para migraciones | Password de la base de datos del proyecto enlazado, necesario porque `supabase db push` se conecta a Postgres directamente. Está en **Project Settings > Database** del dashboard de Supabase. |

> Sin `SUPABASE_ACCESS_TOKEN` los dos workflows fallan en el paso de instalación
> del CLI. Sin `SUPABASE_DB_PASSWORD` solo falla el de migraciones.

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
