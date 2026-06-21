# FRD — Functional Requirements Document
## Peak Endurance

> **Versión:** 2.0
> **Fecha:** 20 de junio de 2026
> **Tagline:** la fusión de Strava y TrainingPeaks, con un coach de IA que vive contigo.

---

## 1. Propósito del producto

**Peak Endurance** es una plataforma multi-deporte para atletas de resistencia (running, ciclismo, natación, gimnasio, triatlón, trail) que combina:

1. **Ingesta de datos reales** desde Strava (OAuth 2.0 oficial) y, en el roadmap, Garmin / COROS / Wahoo / iGPSPORT.
2. **Planificación estructurada** por bloques (base, construcción, pico, tapering) inspirada en TrainingPeaks.
3. **Coach de IA adaptativo** que ajusta el plan día a día según fatiga real (CTL, ATL, TSB).

Producto multi-tenant, con apps web y móviles (iOS/Android) compartiendo el mismo backend (Supabase + Edge Functions).

---

## 2. Objetivos del sistema

| # | Objetivo | Prioridad |
|---|----------|-----------|
| 1 | Integración OAuth con Strava + sincronización automática de actividades | 🔴 Crítica |
| 2 | Cálculo PMC (TSS, CTL, ATL, TSB, Forma) sobre datos reales | 🔴 Crítica |
| 3 | Planificación multi-deporte (running, bike, swim, gym, triatlón, trail, multi) | 🔴 Crítica |
| 4 | Dashboard en tiempo real con métricas y serie semanal | 🔴 Crítica |
| 5 | Coach IA que modifica el plan sobre la marcha | 🔴 Crítica |
| 6 | Comparación plan vs ejecución real con desviaciones detectadas | 🟡 Alta |
| 7 | Soporte multi-idioma (es / en) | 🟢 Media |
| 8 | Límites de IA por plan (free / pro) | 🟢 Media |
| 9 | Apps móviles nativas (iOS / Android) | 🟡 Alta |
| 10 | Integraciones adicionales: Garmin / COROS / Wahoo / iGPSPORT | 🟢 Media |

---

## 3. Actores del sistema

| Actor | Descripción |
|-------|-------------|
| **Atleta** (usuario final) | Se registra, conecta sus fuentes, revisa métricas, confirma propuestas IA |
| **IA Coach** | Motor de recomendaciones (Cloudflare Workers + LLM) — corre dentro de la plataforma |
| **Edge Functions Supabase** | Capa server-side: `strava-auth` (OAuth) y `strava-sync` (importación + TSS) |
| **Fuentes externas** | Strava (OAuth), Garmin / COROS / Wahoo / iGPSPORT (próximamente) |

---

## 4. Requisitos funcionales

### 4.1 Módulo de conexión de fuentes (RF-01)

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-01.1 | El sistema debe conectar con Strava vía **OAuth 2.0 oficial**, server-side, mediante la edge function `strava-auth` | 🔴 |
| RF-01.2 | Importar actividades de Strava (running, ciclismo, natación, gym, etc.) y normalizarlas a un esquema común (`imported_activities`) | 🔴 |
| RF-01.3 | Refresco automático del access token cuando esté próximo a expirar | 🔴 |
| RF-01.4 | Permitir desconectar Strava (revocando el token y borrando de BD) | 🟡 |
| RF-01.5 | Diseño extensible para añadir Garmin, COROS, Wahoo, iGPSPORT | 🟢 |
| RF-01.6 | Mostrar estado real de la conexión (conectado / sin conectar / token vencido) | 🔴 |

### 4.2 Módulo de planificación (RF-02)

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-02.1 | Vista de calendario por mes/día/semana | 🔴 |
| RF-02.2 | Crear y editar sesiones manualmente (multi-deporte) | 🔴 |
| RF-02.3 | Bloques de entrenamiento con objetivos (macro / meso / microciclo) y fases (base, construcción, pico, tapering) | 🔴 |
| RF-02.4 | Estado de sesión: `planned`, `completed`, `skipped` | 🟡 |
| RF-02.5 | Plantillas de plan por evento (5K, 10K, half marathon, marathon, triatlón sprint/olímpico/half/full) | 🟢 |

### 4.3 Módulo de análisis (RF-03)

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-03.1 | Dashboard con métricas: TSS semanal, CTL (Forma/aptitud), ATL (fatiga), TSB (forma %) | 🔴 |
| RF-03.2 | Serie semanal de TSS por día con barras proporcionales | 🔴 |
| RF-03.3 | Lista de actividades recientes con sport icon, distancia, duración y TSS | 🔴 |
| RF-03.4 | Comparación plan vs real con cálculo de desviaciones | 🟡 |
| RF-03.5 | Desglose de zonas de FC (cuando hay datos) | 🟡 |
| RF-03.6 | Curva de forma histórica (90 días) | 🟢 |

### 4.4 Módulo de IA Coach adaptativa (RF-04)

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-04.1 | La IA debe **modificar el plan sobre la marcha** en función de fatiga y rendimiento real | 🔴 |
| RF-04.2 | Toda propuesta queda en estado `pending` hasta que el usuario la confirma | 🔴 |
| RF-04.3 | La IA considera contexto global: CTL, ATL, TSB, carga semanal, próxima carrera, deportes activos | 🔴 |
| RF-04.4 | La IA detecta: sobreentrenamiento, fatiga acumulada, días sin entrenar, sesiones extra no planificadas | 🟡 |
| RF-04.5 | Configuración: tono (directo / empático), equipo disponible (FC / potencia / pace), nivel de autonomía (proposal-only / semi-auto) | 🟢 |
| RF-04.6 | Límite de consultas IA por plan (free: 20/mes, pro: ilimitado) | 🟢 |

### 4.5 Módulo de cuenta y privacidad (RF-05)

| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-05.1 | Auth con Google OAuth y email/password (Supabase Auth) | 🔴 |
| RF-05.2 | RLS habilitado en todas las tablas de usuario (cada usuario ve solo lo suyo) | 🔴 |
| RF-05.3 | Tokens OAuth de proveedores (Strava, etc.) almacenados server-side, no expuestos al frontend | 🔴 |
| RF-05.4 | Activación de Leaked Password Protection (HaveIBeenPwned) | 🔴 |
| RF-05.5 | Borrado de cuenta + datos (cumplimiento GDPR/LOPD) | 🟡 |

---

## 5. Requisitos no funcionales

| ID | Requisito | Detalle |
|----|-----------|---------|
| RNF-01 | Seguridad | Tokens de proveedores cifrados, sólo accesibles desde edge functions con `SERVICE_ROLE_KEY` |
| RNF-02 | Privacidad | Datos de Strava aislados por usuario vía RLS |
| RNF-03 | UX | Mobile-first, dark mode por defecto, idioma persistente, animaciones respetan `prefers-reduced-motion` |
| RNF-04 | Trazabilidad | Cada propuesta IA y cada confirmación se registran en `pending_ai_actions` y `session_adjustments` |
| RNF-05 | Disponibilidad | Frontend deployado en Vercel (CDN global), backend en Supabase (Postgres + Edge Functions) |
| RNF-06 | Idioma | Español (default) e inglés con dictionary externo (`lib/i18n.ts`) |
| RNF-07 | Performance | Dashboard <2 s con 90 días de actividades cacheados |
| RNF-08 | Multi-plataforma | Web responsive (desktop, tablet, móvil) + apps nativas iOS/Android (roadmap) |

---

## 6. Plan de implementación

### Fase 1 — OAuth real + dashboard real (✅ HECHO)
- [x] Auth con Google + Email/Password
- [x] Edge function `strava-auth` (auth, callback, status, refresh, disconnect)
- [x] Edge function `strava-sync` (importar actividades + TSS heurístico)
- [x] Dashboard con CTL/ATL/TSB/Forma calculados sobre datos reales
- [x] Connections page con integración Strava real
- [x] Landing v2 orientada a embudo de descarga
- [x] RLS en todas las tablas de usuario

### Fase 2 — Planificación multi-deporte (en progreso)
- [ ] CRUD de `training_blocks` y `training_sessions` desde la app
- [ ] Calendario editable con drag & drop entre días
- [ ] Plantillas de plan por evento
- [ ] Comparación plan vs real con desviaciones automáticas

### Fase 3 — IA Coach adaptativa
- [ ] Cloudflare Worker + proxy a OpenRouter / Ollama
- [ ] Prompt engineering con contexto PMC + historial
- [ ] Panel de propuestas con confirmación manual
- [ ] Configuración de autonomía y tono

### Fase 4 — Apps móviles
- [ ] App iOS (React Native o nativa)
- [ ] App Android (React Native o nativa)
- [ ] Notificaciones push (sesión de hoy, nueva propuesta IA)

### Fase 5 — Más integraciones
- [ ] Garmin Connect (OAuth)
- [ ] COROS API
- [ ] Wahoo Cloud
- [ ] iGPSPORT (cuando exista API pública)

---

## 7. Criterios de aceptación del MVP

- [x] Strava conectado vía OAuth (no MCP) y sincronizando actividades
- [x] Dashboard con TSS/CTL/ATL/TSB calculados y reactivos
- [x] Auth con Google + email/password funcionando
- [x] RLS habilitado en todas las tablas
- [x] Landing profesional orientada a descarga de la app
- [ ] Usuario puede editar sesiones del calendario desde la app
- [ ] IA propone cambios editables sin aplicar nada sin confirmación
- [ ] Apps iOS/Android publicadas (nuevo MVP móvil)
