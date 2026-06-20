# OpenAthlete vs Peak Endurance — Comparativa Técnica y Funcional

## 1. STACK

| Capa | OpenAthlete | Peak Endurance |
|------|------------|----------------|
| **Monorepo** | pnpm workspaces | npm workspaces |
| **Frontend** | Vite 6 + React 19 + TypeScript 5.7 | Vite 8 + React 19 + TypeScript 6 |
| **Backend** | NestJS 11 (modular monolith) + Swagger | Ninguno (solo Supabase client-side) |
| **Database** | PostgreSQL + Prisma 6 ORM (schema en `libs/database/prisma/schema/`) | Supabase (sin schema local — gestionado en consola Supabase) |
| **Auth** | Firebase Auth (Google/GitHub/Apple OAuth) + JWT backend + refresh tokens | Supabase Auth (magic link, Google OAuth, email/password) |
| **UI Framework** | Tailwind CSS 4 + shadcn/ui (Radix primitives) | CSS puro custom (2245 líneas, mobile-first dark theme) |
| **Iconos** | lucide-react + icons personalizados | lucide-react |
| **i18n** | inlang/paraglide (compilador paraglide-js, EN + FR, archivos JSON) | Custom dictionary (`lib/i18n.ts`, ES + EN) |
| **Estado** | TanStack React Query + Context API + Zustand | React useState + localStorage |
| **Formularios** | react-hook-form + zod schemas | manual (onChange + estado local) |
| **Routing** | react-router-dom v7 (layouts anidados, guards) | react-router-dom v7 (rutas planas en App.tsx) |
| **Real-time** | Socket.io + Redis adapter + WebSocket gateway | No |
| **Colas/Jobs** | Bull + BullMQ (procesamiento de actividades en background) | No |
| **Cache** | Redis | No |
| **Payments** | Stripe (Stripe webhook, prices, subscriptions) | No |
| **Mobile** | Capacitor 7 (Android + iOS nativo) | No |
| **Monitoreo** | Sentry + PostHog + Better Stack | No |
| **Infraestructura** | Terraform (Docker, RDS, Redis, Container Registry) | Vercel SPA |
| **Despliegue** | Docker Compose + GitHub Actions CI/CD | Vercel (git push) |
| **AI** | Mastra.ai agents + OpenAI SDK + Google AI | Mock (`createAiProposal` en `lib/ai-engine.ts`) |

---

## 2. FEATURES — Tabla Comparativa

| Feature | OpenAthlete | Peak Endurance |
|---------|-------------|----------------|
| **Dashboard atleta** | ✅ Vista resumen con métricas, calendario, progreso | ✅ Dashboard con hero card, métricas, calendario, rail lateral |
| **Calendario de entrenamiento** | ✅ Vista semanal/mensual, drag & drop, creación de eventos | ✅ CalendarBoard con meses, días, sesiones, actividades |
| **Plan de entrenamiento** | ✅ Períodos (base/construcción/pico/taper), ciclos, semanas, disponibilidad del atleta | ✅ PlanPage agrupado por bloques mensuales |
| **Workout builder (intervalos)** | ✅ WorkoutBuilder con steps, repeats, targets, gráfico de intensidad | ❌ No |
| **Zonas de entrenamiento** | ✅ Por deporte (HR/power/pace), editor visual con tabla, bulk editor | ❌ Solo zoneBreakdown en actividades importadas |
| **CTL/ATL/TSB** | ✅ Cálculo server-side, chart interactivo con Recharts | ✅ SparklineSets mock en DashboardPage, sin cálculo real |
| **Importación de actividades** | ✅ Strava, Garmin, Polar, Suunto, Coros (OAuth + webhooks + streams GPS) | ✅ Solo Strava (via Edge Function) |
| **Exportación a dispositivos** | ✅ Exporta workouts a Garmin, Polar, Suunto, Coros | ❌ No |
| **Segmentos Strava** | ✅ vía API de Strava | ✅ Mock data con 10 segmentos, filtro por deporte, toggle starred |
| **AI Coach** | ✅ Mastra.ai agents: generación/modificación de eventos, Q&A, extracción de fatiga, estimación TRIMP, feedback post-actividad | ✅ Mock AI con 3 acciones (analyze_week, adjust_plan, detect_fatigue), flujo proposal → confirm |
| **Coach/Human messaging** | ✅ Sistema de mensajería atleta-coach con threads, read receipts, notificaciones push | ❌ No |
| **Invitación de coaches** | ✅ CoachAthlete, invite-coach-dialog | ❌ No |
| **Feedback post-actividad** | ✅ ActivityFeedbackQuestion, embeddings AI | ❌ No |
| **Injuries/Lesiones** | ✅ AthleteInjury tracking, AI extraction | ❌ No |
| **Equipamiento** | ✅ Equipment (zapatillas/bicis con tracking de distancia) | ❌ Solo `aiSettings.equipment` como string |
| **Records personales** | ✅ Record tracking (mejores marcas por distancia) | ❌ No |
| **Métricas de salud** | ✅ AthleteMetric (HRV, sleep, weight, etc.) | ❌ Solo mock en mini-ring (sueño 7h45, HRV 78, FC 48) |
| **Weather** | ✅ OpenMeteo provider (clima asociado a actividades) | ❌ No |
| **Mapa** | ✅ Leaflet map para rutas GPS | ❌ No |
| **Autonomous Agent (Hermes)** | ❌ No | ✅ HermesIntegrationPage con toggle connection, weekly report |
| **Conexiones externas** | ✅ ProviderAccount OAuth (Strava/Garmin/Polar/Suunto/Coros) + import/export | ✅ ConnectStrava + 4 sources mock (Garmin, Coros, iGPSPORT, Coospo) |
| **Suscripciones/Paywall** | ✅ Stripe integration, feature-access guard, plan cards | ❌ Solo `aiUsage.plan` como tipo (free/pro) |
| **Onboarding** | ✅ Onboarding view para nuevos usuarios | ❌ No |
| **Estadísticas** | ✅ Statistics service con múltiples métricas | ❌ Solo AnalysisPage con zone precision cards |
| **Progreso** | ✅ Progression service + records view | ✅ ProgressPage con MetricCards (form, carga, fatiga) |
| **SEO / Marketing** | ✅ Next.js website separado con blog, training plans | ❌ Solo landing page (LandingPage.tsx) |
| **Notificaciones push** | ✅ Push notifications (iOS/Android via Capacitor) | ❌ No |
| **Exportación de datos** | ✅ Native export de todos los datos | ❌ No |
| **Modo offline** | ✅ Capacitaor plugin + chunk recovery | ❌ No |

---

## 3. UI/UX

| Aspecto | OpenAthlete | Peak Endurance |
|---------|-------------|----------------|
| **Estilo** | shadcn/ui (Tailwind, componentes Radix, diseño profesional, claro/oscuro vía ThemeProvider) | Dark theme CSS puro, mobile-first, gradientes sutiles, glow effects |
| **Componentes** | Biblioteca completa: dialog, sheet, dropdown, command palette, calendar, date-picker, tabs, sidebar, skeleton, tooltip, etc. | Componentes inline en App.tsx (DashboardPage, CalendarBoard, MonthCard, MetricCard) sin reutilización externa |
| **Responsive** | Tailwind responsive utilities | CSS media queries (641px tablet, 1024px desktop) |
| **Animaciones** | Framer Motion | CSS @keyframes fadeUp + transiciones simples |
| **Layout** | Dashboard.layout, Compact.layout, Auth.layout (rutas anidadas con layout persistente) | app-shell → app-stage (single column, bottom-nav fijo) |
| **Bottom Nav** | Sidebar (escritorio) + bottom nav responsive | Fixed 5-tab bottom nav con backdrop-filter |
| **Tema** | Provider ThemeProvider, soporte claro/oscuro | Dark theme único |
| **Densidad** | Más contenido por página (sidebar, múltiples paneles) | Enfoque mobile-first, más vertical scrolling, tarjetas grandes |
| **Tipografía** | Inter + Tailwind typography | Inter (Google Fonts import) |
| **Formularios** | react-hook-form + zod (validación robusta) | onChange manual sin validación de schema |
| **Loading states** | Skeleton components + spinners | Spinner CSS simple |
| **Empty states** | Diseño estándar shadcn | Empty state personalizado con icono + título + descripción |
| **Modales** | Dialog (Radix) con overlay, focus trap, keyboard | ModalLogin simple con overlay CSS |

---

## 4. AUTH

| Aspecto | OpenAthlete | Peak Endurance |
|---------|-------------|----------------|
| **Proveedor** | Firebase Auth (web + Capacitor native) para OAuth + JWT backend propio | Supabase Auth (SDK `@supabase/supabase-js`) |
| **Google OAuth** | ✅ `signInWithPopup` (web) / `FirebaseAuthentication` plugin (native) | ✅ `signInWithOAuth({ provider: 'google' })` |
| **Magic Link** | ❌ No | ✅ `signInWithOtp` (email OTP/magic link) |
| **Email + Password** | ❌ No | ✅ `signInWithPassword` / `signUp` |
| **Apple OAuth** | ✅ | ❌ |
| **GitHub OAuth** | ✅ | ❌ |
| **JWT** | ✅ Backend JWT con refresh tokens | ❌ Supabase maneja sesión internamente |
| **Auth Guard** | ✅ AuthGuard con role checking y feature-access | ✅ AuthGuard simple (si `configured && authenticated` muestra app, si no → LandingPage) |
| **Profile upsert** | ✅ `ensureProfile()` sincroniza con tabla `profiles` | ✅ `ensureProfile()` hace upsert a `profiles` en Supabase |
| **Session persistence** | Custom storage (JWT + refresh token) | Supabase maneja sesión (auto-refresh) |
| **Logout** | ✅ Firebase signOut + storage clear + navegación a login | ✅ Supabase signOut + page refresh |
| **Password reset** | ✅ Vista dedicada (password-reset-request + password-reset) | ❌ No |
| **Auth routes** | ✅ `/login`, `/create-account`, `/oauth/callback`, `/password-reset` | ❌ LandingPage (si no auth) o ModalLogin |

---

## 5. STRAVA INTEGRATION

| Aspecto | OpenAthlete | Peak Endurance |
|---------|-------------|----------------|
| **OAuth** | Código NestJS en `providers-sync/providers/strava.provider.service.ts` (648 líneas) — intercambio de código, refresh automático | Supabase Edge Function `strava-auth` |
| **Scopes** | `read, activity:read_all` | No especificado |
| **Import activities** | ✅ Paginación por API, webhooks para actividades nuevas, streams (time, distance, latlng, altitude, heartrate, cadence, watts, temp) almacenados como JSON comprimido | ✅ vía Edge Function |
| **Sport type mapping** | ✅ `mapStravaSportType()` mapea 50+ tipos a `SportType` enum interno | No, usa sourceType directo |
| **Webhooks** | ✅ Webhook handler Endpoint que recibe notificaciones de Strava y crea/importa actividades automáticamente | ❌ No |
| **Token refresh** | ✅ Automático en 401 con retry | ✅ `refreshStravaToken()` manual (Edge Function) |
| **Multiple accounts** | ✅ ProviderAccount (varias cuentas por proveedor) | ❌ Una sola conexión |
| **Export a Strava** | ✅ Exporta workouts creados en OpenAthlete a Strava | ❌ Solo import |
| **UI de conexión** | Settings > Connectors > Strava connect | ConnectStrava.tsx (componente dedicado con estados: loading, idle, connecting, connected, error) |
| **Segmentos** | ❌ No implementado en código importado | ✅ 10 segmentos mock con toggle starred, filtro running/riding |

---

## 6. QUÉ FALTA — Features de OpenAthlete que Peak Endurance no tiene

### 6.1 Backend / Infraestructura
- API server (NestJS) — Peak no tiene backend propio, solo Supabase client-side
- Base de datos relacional con schema versionado (Prisma migrations)
- Colas de procesamiento (Bull) para importación de actividades y estimación de carga
- Redis para caché y pub/sub
- Procesamiento de streams GPS
- WebSocket para mensajería en tiempo real
- Webhooks de proveedores (Strava, etc.)
- Sistema de permisos y roles (CASL)
- Subscription/Paywall con Stripe
- Exportación de datos a dispositivos (Garmin, Polar, etc.)
- Servicio de clima (OpenMeteo)

### 6.2 Modelos de Datos
| Modelo | OpenAthlete | Peak |
|--------|-------------|------|
| **Workout** (intervalos estructurados) | ✅ Workout → WorkoutStep → WorkoutTarget → WorkoutRepeat | ❌ |
| **Cycles** (periodización) | ✅ Cycle → TrainingWeek → TrainingPlan → AthleteAvailability | ❌ (solo agrupación por mes en PlanPage) |
| **Coach management** | ✅ CoachAthlete, invitations | ❌ |
| **Equipment tracking** | ✅ Equipment (shoes/bikes con mileage) | ❌ |
| **Records** | ✅ Record (PRs por distancia) | ❌ |
| **Injuries** | ✅ AthleteInjury | ❌ |
| **Health metrics** | ✅ AthleteMetric (HRV, sleep, weight, etc.) | ❌ (solo mock display) |
| **Messages** | ✅ Message + MessageThread + ReadReceipts | ❌ |
| **Activity feedback** | ✅ Feedback questions + embeddings + AI analysis | ❌ |
| **Training zones** | ✅ TrainingZone + TrainingZoneValue (HR/power/pace por deporte) | ❌ |
| **Agent threads** | ✅ AgentThread + AgentMessage + blocks (rich content) | ❌ (solo pending action simple) |
| **Subscription** | ✅ Planes, Stripe customer/subscription/price | ❌ |

### 6.3 Frontend Components
- **WorkoutBuilder**: Editor de entrenamientos con intervalos, repeats, targets, gráfico de intensidad
- **ZoneEditor**: Editor visual de zonas de entrenamiento (HR/power/pace) con tabla y bulk editor
- **TrainingLoadChart**: Gráficos interactivos (CTL/ATL/TSB) con Recharts
- **DatePicker / DateTimePicker**: Selectores de fecha robustos
- **MapComponent**: Mapa Leaflet con rutas GPS
- **Chat / Messaging**: Sistema de mensajes atleta-coach
- **Paywall**: Plan cards, dialog de suscripción
- **ImportPlanDialog**: Importar planes de entrenamiento externos
- **Auth Pages**: Login, create account, password reset, OAuth callback
- **Onboarding**: Flujo de onboarding para nuevos usuarios

### 6.4 Mobile (Capacitor)
- Compilación nativa Android/iOS
- Push notifications
- Offline support con chunk recovery
- Plugins nativos (Firebase Auth, camera, etc.)

### 6.5 AI / ML
- **Mastra.ai agents**: Agentes LLM para generación y modificación de entrenamientos
- **TRIMP estimation**: Estimación de TRIMP basada en métricas de actividad
- **Post-activity feedback**: Análisis automático post-entreno con preguntas generadas por AI
- **Injury extraction**: Detección de lesiones desde descripciones de actividades
- **Q&A agent**: Chatbot de preguntas y respuestas sobre entrenamiento
- **Activity feedback embeddings**: Embeddings para búsqueda semántica de feedback

---

## 7. MERGE PLAN — Qué se podría adaptar de OpenAthlete a Peak

### 7.1 Alta Prioridad (impacto inmediato)

| Componente | Archivo OpenAthlete | Adaptación |
|-----------|-------------------|------------|
| **Prisma Schema** | `libs/database/prisma/schema/*.prisma` | Adoptar las tablas `User`, `ProviderAccount`, `Athlete`, `Event` (EventTraining/EventActivity), `TrainingZone`, `Cycle`, `Workout` como base de datos real. Peak tiene un schema implícito en tipos TypeScript — migrar a Prisma permite migraciones, type safety, y un backend real |
| **Auth flow** | `apps/web/src/contexts/auth/` | El patrón AuthProvider + AuthGuard + auth context de OpenAthlete es más completo (multiple OAuth providers, JWT, refresh). Peak puede mantener Supabase pero adoptar el patrón de contexto |
| **Strava provider** | `apps/api/src/modules/providers-sync/providers/strava.provider.service.ts` | Reemplazar Edge Function por código NestJS dedicado con webhooks, paginación, streams, y auto-refresh |
| **Types compartidos** | `libs/shared/src/types/` | Migrar los tipos de Peak (`lib/types.ts`) a un paquete compartido con zod schemas — base para API y validación |

### 7.2 Prioridad Media (mejora significativa)

| Componente | Archivo OpenAthlete | Adaptación |
|-----------|-------------------|------------|
| **Training load service** | `apps/api/src/modules/core/services/training-load.service.ts` | Reemplazar `sparklineSets` mock con cálculo real de CTL/ATL/TSB usando las fórmulas de `libs/database/prisma/schema/training_load.prisma` |
| **Workout builder** | `apps/web/src/components/workout/` | Componente de intervalos con steps, repeats, targets — reutilizable en Peak para crear sesiones estructuradas |
| **Training zone editor** | `apps/web/src/components/training-zone-editor/` | Editor visual de zonas (HR/power/pace) que Peak no tiene |
| **Training load chart** | `apps/web/src/components/training-load/` | Reemplazar sparklines SVG por gráficos Recharts interactivos con CTL/ATL/TSB |
| **Equipment tracking** | `libs/database/prisma/schema/equipment.prisma` + `apps/web/src/views/dashboard/settings-view/equipment-tab.tsx` | Modelo de equipamiento para tracking de kilometraje de zapatillas/bicis |
| **i18n system** | `apps/web/messages/` | El sistema inlang/paraglide de OpenAthlete es más mantenible que el diccionario custom de Peak. Adoptar archivos JSON + compilador |

### 7.3 Prioridad Baja (nice-to-have)

| Componente | Archivo OpenAthlete | Adaptación |
|-----------|-------------------|------------|
| **Chat/Coaching messages** | `apps/api/src/modules/messages/` + `libs/database/prisma/schema/message.prisma` | Sistema de mensajería atleta-coach si Peak quiere agregar la funcionalidad de coach |
| **Paywall/Stripe** | `apps/api/src/modules/subscription/` + `libs/database/prisma/schema/subscription.prisma` | Stripe integration cuando Peak necesite monetizar |
| **Weather service** | `apps/api/src/modules/core/services/weather/` | Asociar clima a actividades importadas |
| **Map component** | `apps/web/src/components/map/` | Mapa Leaflet para visualizar rutas GPS de actividades |
| **Post-activity feedback** | `libs/database/prisma/schema/feedback.prisma` + `apps/api/src/modules/agent/` | Análisis AI post-entreno |
| **Records** | `libs/database/prisma/schema/record.prisma` | Tracking de mejores marcas personales |
| **Onboarding** | `apps/web/src/views/dashboard/onboarding/` | Flujo de primer uso |
| **Mobile (Capacitor)** | `apps/web/` completo ya tiene Capacitor configurable | Compilar Peak como app nativa |
| **SEO / Marketing site** | `apps/website/` (Next.js) | LandingPage actual puede expandirse a sitio marketing separado |

### 7.4 Estrategia de Migración Recomendada

```
Fase 1 — Fundación
├── Adoptar Prisma schema de OpenAthlete (User, ProviderAccount, Event, Cycle)
├── Migrar tipos TypeScript a zod + shared package
└── Setup backend NestJS mínimo con Prisma + módulo de auth

Fase 2 — Datos Reales
├── Reemplazar mock-data.ts por llamadas API reales
├── Implementar Strava import real (usando strava.provider.service.ts)
├── Implementar CTL/ATL/TSB real (usando training-load.service.ts)
└── Migrar localStorage persistence a PostgreSQL via Prisma

Fase 3 — Features Faltantes
├── Workout builder + zone editor
├── Training load charts con Recharts
├── Equipment tracking
├── Messages / Coaching
└── Records + Health metrics

Fase 4 — Escalabilidad
├── Paywall / Stripe
├── Mobile (Capacitor)
├── Notificaciones push
├── Exportación de datos
└── Webhooks + procesamiento background (Bull)
```

### 7.5 Riesgos y Consideraciones

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| OpenAthlete usa Firebase Auth, Peak usa Supabase Auth — migración de usuarios | Alto | Usar el mismo patrón de auth context pero mantener Supabase. OpenAthlete abstrae auth vía `AuthProvider` |
| OpenAthlete tiene 20+ módulos NestJS — complejidad alta | Medio | Adoptar solo los módulos necesarios: core + providers-sync + training-load + agent |
| Peak usa CSS puro, OpenAthlete usa Tailwind — fricción de estilos | Alto | Mantener CSS de Peak pero adoptar componentes específicos de OpenAthlete con sus estilos Tailwind (convivencia posible con CSS layers) |
| OpenAthlete tiene deuda técnica (lint errors, missing types) | Bajo | Ignorar y solo adoptar código estable |
| Diferencia en filosofía de AI: OpenAthlete usa Mastra.ai agents, Peak tiene mock engine | Medio | Reemplazar `createAiProposal()` por llamadas a los agents de OpenAthlete (`event-generation.agent.ts`, `event-modification.agent.ts`) |
