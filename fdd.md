# FDD — Functional Design Document
## Peak Endurance Coach

> **Versión:** 1.1  
> **Fecha:** 18 de junio de 2026  
> **Basado en:** FRD v1.1, SDD existente, esquema Supabase actual  

---

## 1. Arquitectura General

```
┌─────────────────────────────────────────────────────┐
│                    HERMES AGENT                      │
│  ┌──────────────┐  ┌────────────┐  ┌──────────────┐ │
│  │ MCP Strava   │  │ Cronjob    │  │ Memoria      │ │
│  │ (datos reales)│  │ (reportes) │  │ (perfil atl.)│ │
│  └──────┬───────┘  └─────┬──────┘  └──────┬───────┘ │
│         │                │                │          │
└─────────┼────────────────┼────────────────┼──────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────┐
│              PEAK ENDURACE COACH (Web App)            │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ Frontend │  │ Backend  │  │ Cloudflare       │   │
│  │ React    │  │ Supabase │  │ Workers (IA)     │   │
│  │ + Vite   │  │ + Auth   │  │ + Proxy          │   │
│  └──────────┘  └──────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 2. Stack Tecnológico

| Capa | Tecnología | Versión/Nota |
|------|-----------|--------------|
| Frontend | React + TypeScript + Vite | Ya en `apps/web/` |
| UI Components | Lucide React + CSS custom | Ya instalado |
| **Design System** | **Linear-inspired (oscuro, preciso, violeta)** | **Basado en `popular-web-designs/templates/linear.app.md`** |
| Ruteo | React Router DOM | Ya en package.json |
| Backend/Datos | Supabase (PostgreSQL + Auth) | Schema listo en `supabase/schema.sql` |
| IA/Proxy | Cloudflare Workers + Ollama | Worker ya existe (`cloudflare-worker.js`) |
| Automatización | Hermes Agent (MCP + Cron) | Strava ya conectado |
| Estilos | CSS Modules + CSS variables (Linear tokens) | Rediseño planificado |
| Monorepo | Turborepo o manual | Estructura actual: apps/, packages/ |

---

## 3. Modelo de Datos (basado en schema.sql existente)

### 3.1 Perfil y Suscripción
```
profiles
├── id (uuid PK → auth.users)
├── display_name, email, avatar_url
├── preferred_language (default 'es')
└── created_at

subscriptions
├── id (uuid PK)
├── profile_id → profiles.id
├── plan_key ('free'), status
├── ai_quota_limit (20), ai_quota_window ('monthly')
└── created_at
```

### 3.2 Conexiones Deportivas
```
activity_sources
├── id (uuid PK)
├── source_type (unique: 'strava', 'garmin', etc.)
└── display_name

source_connections
├── id (uuid PK)
├── profile_id → profiles.id
├── source_id → activity_sources.id
├── external_athlete_id
├── access_token_encrypted, refresh_token_encrypted
├── status ('connected')
└── created_at
```

### 3.3 Actividades
```
imported_activities
├── id (uuid PK)
├── profile_id → profiles.id
├── source_connection_id → source_connections.id
├── external_activity_id (unique por source)
├── source_type, activity_date, title, sport
├── duration_minutes, distance_km, elevation_gain_m
├── avg_hr, max_hr
├── zone_breakdown (jsonb)
├── zone_precision ('insufficient')
└── raw_payload (jsonb)
```

### 3.4 Planificación
```
training_blocks
├── id (uuid PK)
├── profile_id → profiles.id
├── title, starts_on, ends_on, goal
└── created_at

training_sessions
├── id (uuid PK)
├── profile_id → profiles.id
├── block_id → training_blocks.id (nullable)
├── session_date, title, sport, status
├── intensity, duration_minutes, tss, notes
└── created_at
```

### 3.5 IA y Ajustes
```
pending_ai_actions
├── id (uuid PK)
├── profile_id → profiles.id
├── action_type, summary, reason, impact
├── payload (jsonb), status ('pending')
└── created_at

ai_preferences
├── profile_id (PK → profiles.id)
├── tone ('direct'), equipment ('heart-rate only')
├── autonomy_level ('proposal-only')
├── extra_context (text)
└── updated_at

session_adjustments
├── id (uuid PK)
├── session_id → training_sessions.id
├── requested_by, reason
├── before_snapshot (jsonb), after_snapshot (jsonb)
└── created_at
```

### 3.6 UI
```
ui_preferences
├── profile_id (PK → profiles.id)
├── language ('es'), timezone ('America/Bogota')
├── density ('comfortable')
└── updated_at
```

---

## 4. Flujos Principales

### 4.1 Importación de Actividad (Strava → App)
```
[MCP Strava] → Hermes consulta actividades recientes
    ↓
Hermes escribe en imported_activities (vía API de la app o Supabase directo)
    ↓
App web muestra en Dashboard y Calendario
    ↓
Hermes analiza + genera recomendaciones para entrenamiento
```

### 4.2 Planificación de Bloques
```
Usuario (o Hermes) crea training_block con objetivo
    ↓
Plan de 15K: 9 semanas, 3 fases
    ↓
Sesiones planificadas con sport, duración, intensidad, TSS
    ↓
Cada día, se compara con lo importado de Strava
```

### 4.3 Propuesta IA Adaptativa
```
Usuario selecciona día/semana/bloque
    ↓
Sistema arma contexto completo: plan + actividades ejecutadas + ATL/CTL/TSB + fatiga acumulada + configuración IA
    ↓
Workers llama a modelo (vía Ollama/OpenRouter)
    ↓
**IA Coach evalúa si el plan actual sigue siendo óptimo**
    ↓
  ┌─ Si todo bien → confirma plan actual sin cambios
  └─ Si detecta desviación → genera propuesta de ajuste estructurada
       ↓
Propuesta → pending_ai_actions (status='pending')
       ↓
Usuario revisa y confirma/rechaza
       ↓
Si confirma → se aplica cambio + se guarda en session_adjustments + se actualiza ATL/CTL/TSB
```

### 4.4 Detección Automática de Cambios
- Si el usuario NO completa una sesión (actividad real ausente o muy por debajo del plan)
- Si el usuario completa una sesión extra no planificada
- Si la fatiga (ATL) supera umbral configurable
- Si hay N días consecutivos sin entrenar
→ La IA Coach recalcula el bloque y propone ajustes automáticamente

### 4.5 Supervisión Autónoma (Hermes)
```
Cronjob: cada lunes 8:00 AM
    ↓
Hermes lee imported_activities de la semana pasada
    ↓
Analiza: distancia total, TSS acumulado, fatiga, zonas HR, comparación con plan
    ↓
Genera reporte en lenguaje natural
    ↓
Entrega por chat + sugiere ajustes para la semana entrante
```

---

## 5. Mapa de Rutas (Routing — apps/web)

Basado en la estructura React existente:

```
/                  → Landing / Login (si no autenticado)
/dashboard         → Dashboard principal (métricas, última semana)
/calendar          → Calendario con plan vs real
/calendar/:date    → Detalle del día (plan + actividad real)
/blocks            → Bloques de entrenamiento (macrociclos)
/blocks/:id        → Detalle de bloque con progreso
/plan/15k-2026     → Plan específico para la carrera de 15K
/activities        → Historial de actividades importadas
/activities/:id    → Detalle de actividad con streams
/ai-settings       → Configuración de IA Coach
/settings          → Preferencias de usuario
/export            → Exportación de datos (JSON/CSV)
```

---

## 6. Pantallas Clave (Wireframes funcionales — Rediseño Linear)

> La interfaz será rediseñada con el sistema de diseño de **Linear**: fondo casi negro `#08090a`, tipografía Inter con peso 510 característico, bordes semitransparentes, acento violeta `#5e6ad2`/`#7170ff`, tarjetas con opacidad `rgba(255,255,255,0.02-0.05)`, sin colores cálidos en la UI.

### 6.1 Dashboard
```
┌─────────────────────────────────────────┐
│  📊 Resumen Semanal     │  📅 Hoy       │
│  Distancia: 42.5 km     │  Plan: 10 km  │
│  Tiempo: 3h 12m         │  Real: —      │
│  TSS: 245               │  🔘 Completar │
│  Días entrenados: 5/7   │               │
├─────────────────────────────────────────┤
│  📈 Comparativa Plan vs Real            │
│  ┌───────────────────────┐              │
│  │ [Gráfico de barras]   │              │
│  │ Sem 1 ████░░ 80%      │              │
│  │ Sem 2 ██████░ 92%     │              │
│  │ Sem 3 ███░░░░ 55%     │              │
│  └───────────────────────┘              │
├─────────────────────────────────────────┤
│  🤖 Propuestas IA Pendientes (2)        │
│  [Ajustar sesión viernes] [Ver...]      │
└─────────────────────────────────────────┘
```

### 6.2 Calendario
```
┌─────────────────────────────────────────┐
│  ← Agosto 2026 →        [Plan/Real]     │
│  L   M   X   J   V   S   D              │
│      1   2   3   4   5   6               │
│      5km 8km DES 10km 6km  DES          │
│      5km 8km  —  10km 6km   —           │
│  7   8   9  10  11  12  13              │
│ DES 10km 6km 12km 8km  DES 15K🏁       │
│  —  10km 7km 12km 8km   —   🏆          │
├─────────────────────────────────────────┤
│  📊 Leyenda: █ 0-50% █ 51-80% █ >80%   │
└─────────────────────────────────────────┘
```

---

## 7. Integración Hermes ↔ Peak Endurace

### 7.1 Canales de Comunicación
| Dirección | Medio | Frecuencia |
|-----------|-------|------------|
| Strava → Hermes | MCP Strava (cada consulta) | Bajo demanda |
| Hermes → Usuario | Chat (Telegram/Discord/CLI) | Semanal (cron) |
| Hermes → Peak App | API REST o Supabase directo | Cuando genere propuestas |
| Peak App → Usuario | Web UI | Diario |

### 7.2 Comandos Hermes para el Usuario
```
"¿Cómo fue mi semana de entrenamiento?"     → Resumen ejecutivo
"¿Estoy en riesgo de sobreentrenamiento?"    → Alerta de fatiga
"¿Qué tal mi plan para el 15K?"              → Progreso vs plan
"Ajusta la sesión del jueves a 8 km suaves"  → Propuesta IA
"Conecta mi Strava"                           → OAuth2
"Am I connected to Strava?"                   → Verificar conexión
```

---

## 8. Carrera 15K — Plan de 9 Semanas (16 Jun → 16 Ago 2026)

| Semana | Fechas | Fase | Volumen | Sesiones Clave |
|--------|--------|------|---------|----------------|
| S1 | 16-22 Jun | Base | 15-20 km | 3-4 rodajes suaves |
| S2 | 23-29 Jun | Base | 18-22 km | Rodajes + 1 fartlek |
| S3 | 30 Jun-6 Jul | Construcción | 22-28 km | Rodajes + 1 tempo run |
| S4 | 7-13 Jul | Construcción | 25-30 km | Rodajes + 1 series 1km |
| S5 | 14-20 Jul | Construcción | 28-33 km | Rodaje largo 12-14km |
| S6 | 21-27 Jul | Pico | 30-35 km | Rodaje largo 14-15km |
| S7 | 28 Jul-3 Ago | Pico | 28-32 km | Último largo 15km |
| S8 | 4-10 Ago | Tapering | 20-25 km | Reducción de volumen |
| S9 | 11-16 Ago | Tapering | 10-15 km | Afinamiento + carrera |

---

## 9. Seguridad

| Aspecto | Implementación |
|---------|---------------|
| Tokens Strava | Almacenados en `~/.config/strava-mcp/config.json` (local) |
| API Keys | En Cloudflare Workers (secretos), no en frontend |
| Auth de usuarios | Supabase Auth (magic link, email) |
| Datos sensibles | No se incluyen en exportaciones JSON |
| CORS | Proxy vía Cloudflare Worker |
| Secretos en frontend | Prohibido — solo URL del Worker |

---

## 10. Pendientes Técnicos Inmediatos

- [x] Conectar MCP Strava ✅
- [ ] Limpiar README.md (conflictos de merge del proyecto "Nuevo Shopping")
- [ ] Verificar que `apps/web` compila (tiene node_modules y dist)
- [ ] Decidir entre Tailwind o CSS Modules para estilos v2
- [ ] Configurar variable de entorno de Supabase en `apps/web/.env`
- [ ] Migrar de localStorage a Supabase para datos persistentes
- [ ] Conectar Cloudflare Worker con OpenRouter/Ollama para IA Coach
- [ ] Crear plan de 15K en la base de datos (training_blocks + training_sessions)