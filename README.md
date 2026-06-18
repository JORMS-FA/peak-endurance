# Peak Endurance Coach

Aplicación web para planificar, comparar y ajustar entrenamientos de endurance con ayuda de IA y supervisión autónoma de Hermes Agent.

---

## 🎯 Contexto

- Proyecto en evolución desde prototipo estático (`index.html`) hacia producto escalable v2 (`apps/web/`).
- Integración activa con Strava vía MCP y arquitectura para sumar más fuentes (Garmin, Coros, iGPSPORT, Coospo).
- IA Coach adaptativa como capa central: modifica el plan sobre la marcha según fatiga (ATL/CTL/TSB).
- Rediseño inspirado en **Linear** (oscuro, preciso, violeta).

## 🏁 Objetivo inmediato

Preparación para **carrera de 15 km — 16 de agosto de 2026** (La Macarena, Colombia).

## 🏗️ Estructura del proyecto

```
peak-endurance/
├── apps/web/              → Frontend React + Vite (v2)
├── packages/ui/           → Tokens visuales y configuración compartida
├── supabase/              → Esquema base de datos (schema.sql)
├── workers/               → Workers edge para IA e integraciones
├── docs/                  → Documentación de arquitectura
├── index.html             → Referencia legacy del prototipo anterior
├── cloudflare-worker.js   → Proxy legacy original
├── frd.md                 → Documento de Requisitos Funcionales
├── fdd.md                 → Documento de Diseño Funcional
├── sdd peak endurance.md  → Especificación base del producto
├── redesign.html          → Prototipo del rediseño Linear
└── README.md              → Este archivo
```

## 🧠 Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | React + TypeScript + Vite |
| UI | Lucide React + CSS Modules (Linear tokens) |
| Diseño | Linear-inspired (fondo `#08090a`, acento `#7170ff`) |
| Backend | Supabase (PostgreSQL + Auth) |
| IA/Proxy | Cloudflare Workers + Ollama/OpenRouter |
| Automatización | Hermes Agent (MCP Strava + Cron) |

## 🏃 Plan 15K — 9 Semanas

| Semana | Fechas | Fase | Volumen |
|--------|--------|------|---------|
| S1 | 16-22 Jun | Base | 15-20 km |
| S2 | 23-29 Jun | Base | 18-22 km |
| S3 | 30 Jun-6 Jul | Construcción | 22-28 km |
| S4 | 7-13 Jul | Construcción | 25-30 km |
| S5 | 14-20 Jul | Construcción | 28-33 km |
| S6 | 21-27 Jul | Pico | 30-35 km |
| S7 | 28 Jul-3 Ago | Pico | 28-32 km |
| S8 | 4-10 Ago | Tapering | 20-25 km |
| S9 | 11-16 Ago | Tapering + 🏁 15K | 10-15 km |

## 🔌 Conexiones deportivas

- **Strava** ✅ Conectado vía MCP
- **Garmin** 🟡 Próximamente
- **Coros** 🟡 Próximamente
- **iGPSPORT** 🟡 Próximamente
- **Coospo** 🟡 Próximamente

## 📋 Documentos base

| Documento | Descripción |
|-----------|-------------|
| `frd.md` | Requisitos funcionales del producto |
| `fdd.md` | Diseño funcional y arquitectura |
| `sdd peak endurance.md` | Especificación de diseño de software |

## 🤖 Supervisión autónoma

Hermes Agent ejecuta un cronjob semanal (lunes 8 AM) que:
1. Lee actividades de Strava vía MCP
2. Analiza ATL/CTL/TSB y carga semanal
3. Compara plan vs ejecución real
4. Genera reporte con recomendaciones de ajuste

---

*Versión: 1.1 — Actualizado: 18 de junio de 2026*