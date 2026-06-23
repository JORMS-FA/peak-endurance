# Peak Endurance — Roadmap de Funciones y Arquitectura

> Inspirado en el informe TestSprite (22 Jun 2026) — 14/27 tests pasados, 73.7% pass rate.
> Documento de planificación para llevar la app a producción compitiendo con TrainingPeaks.

---

## 1. Resumen Ejecutivo

| Métrica | Valor |
|---------|-------|
| Tests totales (TestSprite) | 27 |
| Pasados | 14 (73.7% de ejecutables) |
| Fallados | 5 |
| Bloqueados | 8 |
| Issues QA internos resueltos | 7/7 ✅ |
| Estado general | Beta — listo para producción con fixes de backend |

---

## 2. Arquitectura de Distribución de Elementos

### 2.1 Estructura de Archivos (Actual + Propuesta)

```
peak-endurance/
├── apps/
│   └── web/                          # Frontend Vite + React 19
│       └── src/
│           ├── components/
│           │   ├── auth/              # AuthScreen, AuthGuard
│           │   ├── layout/            # Sidebar, TopBar, MobileNav, AppLayout
│           │   └── ui/               # Logo, SportIcon, StoreBadges, CoachBot, LevelCard, AnimatedNumber
│           ├── hooks/                 # useAuth, useStrava, useActivities, useDashboardMetrics, etc.
│           ├── lib/                   # supabase, auth, strava, types, i18n, navigation, constants
│           ├── pages/                 # Landing, Dashboard, Training, ActivityDetail, AiCoach, Plan, etc.
│           ├── providers/             # AuthProvider, ThemeProvider
│           └── components/           # (new) feature-specific components
│               ├── dashboard/         # WelcomeCard, EnergyRing, MetricsGrid, PmcChart
│               ├── training/          # ActivityList, ActivityDetailView, PolylineMap
│               ├── ai-coach/          # ChatWindow, SuggestionChips, UsageMeter
│               └── settings/          # ProfileForm, SubscriptionCard, StravaCard, RgbSpeedSlider
├── supabase/
│   ├── functions/                    # Edge Functions (strava-auth, strava-sync, subscriptions)
│   └── migrations/                   # DB schema
└── docs/
    ├── PRD.md
    ├── FDD.md
    ├── dogfood-output/report.md
    └── ROADMAP.md                    # ← Este documento
```

### 2.2 Principio de Distribución

Cada **función** debe tener:
1. **Un componente de página** (pages/) — ruta, layout, orquestación
2. **Uno o más componentes de UI** (components/) — presentación reutilizable
3. **Un hook** (hooks/) — lógica de estado y datos
4. **Servicios** (lib/) — API calls, utilidades
5. **Pruebas** (tests/) — casos de uso críticos

---

## 3. Roadmap de Funciones a Crear (Priorizado)

## 🔴 URGENTE — Landing Page Redesign (Prioridad Cero)

| # | Tarea | Descripción | Estado |
|---|-------|-------------|--------|
| 0.1 | **Rediseño visual completo** | Menos texto, más imágenes. Hero con gallery de deportes B&N con transiciones espectaculares | ⏳ |
| 0.2 | **Imágenes IA por deporte** | Running, ciclismo, natación, gym, trail, triatlón — 1 imagen B&N cada una | ⏳ |
| 0.3 | **Branding B&W** | Logo Peak Endurance en blanco y negro. Todos los iconos B&W | ⏳ |
| 0.4 | **Texto multi-color** | Gradiente RGB attenuado en vez de verde plano | ⏳ |
| 0.5 | **Logos Strava + TP** | Visibles y prominentes en el hero | ⏳ |

### 🔴 FASE 1 — Core Funcional (Semana 1-2)

| # | Función | Archivos | Dependencias | Esfuerzo |
|---|---------|----------|-------------|----------|
| 1.1 | **Fix Edge Functions** (Strava OAuth + Sync) | `supabase/functions/strava-auth/`, `strava-sync/` | Config env vars Supabase | 🟠 Medio |
| 1.2 | **Fix Lemon Squeezy Checkout** | `supabase/functions/checkout/`, `lib/stripe.ts` | Config Lemon Squeezy | 🟠 Medio |
| 1.3 | **BYOK — Save AI Key** | `hooks/useApiKey.ts`, `lib/api.ts` | Edge Function fix | 🟢 Fácil |
| 1.4 | **Dashboard onboarding** | Ya implementado ✅ | — | ✅ Hecho |
| 1.5 | **Activity Detail con datos reales** | Conectar con streams Strava | Edge Function sync | 🟡 Medio |

**Criterio de éxito:** 27/27 tests TestSprite pasan.

### 🟡 FASE 2 — Experiencia Premium (Semana 2-3)

| # | Función | Descripción | Archivos | Esfuerzo |
|---|---------|-------------|----------|----------|
| 2.1 | **Plan de entrenamiento semanal** | Vista calendario con planificación, arrastrar sesiones | `pages/Plan.tsx` → refactor | 🟠 Medio |
| 2.2 | **AI Coach persistente** | Chat con historial por sesión, respuestas guardadas | `components/ai-coach/ChatHistory.tsx` | 🟠 Medio |
| 2.3 | **Energy Ring con datos reales** | Conectar con HRV, sueño (Garmin/Apple Health API) | `components/dashboard/EnergyRing.tsx` | 🔴 Alto |
| 2.4 | **Segmentos Strava** | Lista de segmentos cercanos, KOM/QOM tracking | `pages/Segments.tsx` + MCP Strava | 🟡 Medio |
| 2.5 | **Notificaciones funcionales** | Panel de notificaciones con eventos reales | `components/layout/NotificationsPanel.tsx` | 🟢 Fácil |

### 🟢 FASE 3 — Social & Gamificación (Semana 3-4)

| # | Función | Descripción | Esfuerzo |
|---|---------|-------------|----------|
| 3.1 | **Amigos / Seguir atletas** | Buscar usuarios, seguir, feed de actividades | 🔴 Alto |
| 3.2 | **Leaderboards semanales** | Ranking por TSS, distancia, horas entre amigos | 🟠 Medio |
| 3.3 | **Logros / Insignias** | Sistema de logros (racha, volumen, PRs) | 🟡 Medio |
| 3.4 | **Planes generados por IA** | El AI Coach crea un plan semanal personalizado | 🟠 Medio |
| 3.5 | **Comparativa con TrainingPeaks** | Tabla visual "Peak vs Strava vs TP" en landing | 🟢 Fácil |

### 🔵 FASE 4 — Crecimiento (Mes 2+)

| # | Función | Descripción | Esfuerzo |
|---|---------|-------------|----------|
| 4.1 | **Landing page multi-idioma** | EN/PT/FR además de ES | 🟡 Medio |
| 4.2 | **Video demo / GIF en hero** | Video corto mostrando dashboard en acción | 🟢 Fácil |
| 4.3 | **PWA / Mobile app** | Service worker + manifest para instalación | 🟠 Medio |
| 4.4 | **Integración Garmin Connect** | Además de Strava, sincronizar directo desde Garmin | 🔴 Alto |
| 4.5 | **Zones de FC automáticas** | Cálculo de zonas por método Karvonen o Lactato | 🟡 Medio |
| 4.6 | **Exportar a PDF** | Reporte de entrenamiento descargable | 🟢 Fácil |

---

## 4. Tests Críticos (Basado en TestSprite)

### 4.1 Tests Fallados (Prioridad Absoluta)

| Test | Causa | Fix |
|------|-------|-----|
| 🔴 Strava OAuth desde Conexiones | Edge Function non-2xx | Verificar env vars + logs |
| 🔴 Lemon Squeezy checkout 404 | URL de checkout inválida | Revisar store ID en Lemon Squeezy |
| 🟠 Save personal AI Studio key | Edge Function non-2xx | Mismo fix que Edge Functions |
| 🟠 View PMC metrics on dashboard | "--" porque no hay datos de Strava | Ya fixeado con onboarding ✅ |
| 🟠 Open Pro checkout | Edge Function non-2xx | Mismo fix que Edge Functions |

### 4.2 Tests Bloqueados

| Test | Bloqueador | Solución |
|------|-----------|----------|
| Strava connection shown on dashboard | Edge Function + OAuth | Fix Edge Functions primero |
| Access AI coach chat | Strava no conectado | Fix Edge Functions |
| Mobile-friendly portrait mode | Browser tool limitation | Probar en dispositivo real |
| Use server-side AI with Pro | Lemon Squeezy + Edge Function | Fix ambos |
| Create account with Google | Google OAuth browser check | Probar en entorno real |
| Create account with email | Rate limiting | Ajustar rate limits Supabase |
| Sync updates imported activities | Edge Function non-2xx | Fix Edge Functions |

---

## 5. Principios de Diseño (Estructura adecuada)

### 5.1 Para cada nueva función

```
1. Hook (hooks/) → estado + side effects
2. Componente (components/) → presentación pura
3. Página (pages/) → ruta que combina hook + componente
4. CSS (index.css) → estilos con variables del sistema
5. i18n (lib/i18n.ts) → textos ES/EN
6. Test (tests/) → caso de uso crítico
```

### 5.2 Reglas de UI

- **Fondo**: Negro puro AMOLED (#000) — Vercel/Linear style
- **Cards**: Liquid Glass (backdrop-filter blur 20px, rgba white 3%)
- **Esquinas**: 16px radius en cards, 10px en botones, 50% en avatares
- **Iconos**: strokeWidth 1.5, tamaños: nav 20px, acciones 22px, cards 18px
- **Tipografía**: Inter, jerarquía clara por weight (800/700/600/400)
- **Colores**: RGB multi-color atenuado por sección (no verde único)
- **Animaciones**: Spring physics en hovers, ease-out en transiciones

### 5.3 Responsive

| Breakpoint | Comportamiento |
|-----------|---------------|
| < 480px | Single column, nav inferior (MobileNav) |
| 480-768px | 2 columnas grids, sidebar colapsado |
| 768-1200px | Split layout, sidebar expandido |
| > 1200px | Layout completo, max-width 1200px contenido |

---

## 6. Priorización Semanal

| Semana | Foco | Features |
|--------|------|----------|
| **Semana 1** | 🔴 Backend | Fix Edge Functions (Strava, Lemon Squeezy, AI Key) → Tests pasan |
| **Semana 2** | 🟡 Dashboard | AI Coach persistente, Plan semanal, Energy Ring real |
| **Semana 3** | 🟢 Social | Amigos, Leaderboards, Logros, Planes IA |
| **Semana 4** | 🔵 Crecimiento | Multi-idioma, PWA, Garmin, Export PDF |

---

## 7. Conclusión

La app tiene una **base sólida** (UI premium, dark mode, Liquid Glass, RGB multi-color)
pero **depende críticamente de las Edge Functions de Supabase** para Strava, Lemon Squeezy y AI.

**Prioridad #1**: Hacer que los 27 tests de TestSprite pasen.
**Prioridad #2**: Conectar Energy Ring con datos reales de sueño/HRV.
**Prioridad #3**: AI Coach persistente con historial de conversaciones.
**Prioridad #4**: Social features (amigos, leaderboards, logros).

Con esto, Peak Endurance compite directamente con TrainingPeaks.
