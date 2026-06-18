# FRD — Functional Requirements Document
## Peak Endurace Coach

> **Versión:** 1.1  
> **Fecha:** 18 de junio de 2026  
> **Autor:** Hermes Agent + Jorman Fagua  
> **Objetivo inmediato:** Carrera de 15 km — 16 de agosto de 2026

---

## 1. Propósito del Producto

**Peak Endurance Coach** es una plataforma personal de entrenamiento multi-deporte diseñada para atletas de resistencia que combinan **running y ciclismo como deportes principales**, además de gimnasio, triatlón y otras disciplinas. Integra datos reales de actividad (Strava, Garmin, Coros, etc.), planificación por calendario e **IA Coach adaptativa** que modifica el plan sobre la marcha, con supervisión autónoma de Hermes Agent.

---

## 2. Objetivos del Sistema

| # | Objetivo | Prioridad |
|---|----------|-----------|
| 1 | Importar y normalizar datos desde fuentes externas (Strava primero, luego Garmin, Coros, etc.) | 🔴 Crítica |
| 2 | Planificar sesiones de entrenamiento en calendario (día/bloque/mes) para running, ciclismo, gym y triatlón | 🔴 Crítica |
| 3 | **IA Coach adaptativa que modifique el plan sobre la marcha** según fatiga, rendimiento y disponibilidad | 🔴 Crítica |
| 4 | Comparar plan vs ejecución real con desviaciones detectadas automáticamente | 🟡 Alta |
| 5 | Reportes semanales autónomos vía Hermes con recomendaciones de ajuste | 🟡 Alta |
| 6 | Preparación para 15K (16 agosto 2026) como caso de uso principal | 🔴 Crítica |
| 7 | Soporte multi-idioma (español, inglés) | 🟢 Media |
| 8 | Límites de consultas IA según plan (free/premium) | 🟢 Media |

---

## 3. Actores del Sistema

| Actor | Descripción |
|-------|-------------|
| **Atleta (Jorman)** | Usuario principal. Planifica, entrena, revisa métricas y confirma/rechaza propuestas IA |
| **Hermes Agent** | Agente autónomo que supervisa, genera reportes, programa cronjobs y conecta MCP Strava |
| **IA Coach** | Motor de recomendaciones (dentro de la plataforma web, no confundir con Hermes) |
| **Fuentes Externas** | Strava (conectado vía MCP), Garmin, Coros, iGPSPORT, Coospo |

---

## 4. Requisitos Funcionales

### 4.1 Módulo de Conexión de Fuentes (RF-01)
| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-01.1 | El sistema debe conectar con Strava vía OAuth2 | 🔴 |
| RF-01.2 | El sistema debe importar actividades deportivas desde Strava (running y ciclismo como prioritarios, además de natación, gym, triatlón) | 🔴 |
| RF-01.3 | Las actividades se normalizan en un esquema común multi-fuente (Strava, Garmin, Coros, iGPSPORT, Coospo) | 🟡 |
| RF-01.4 | El sistema debe permitir seleccionar fuente principal o mezcla por rango de fechas | 🟢 |

### 4.2 Módulo de Planificación (RF-02)
| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-02.1 | Vista de calendario por mes/día/semana | 🔴 |
| RF-02.2 | Crear y editar sesiones manualmente | 🔴 |
| RF-02.3 | Bloques de entrenamiento con objetivos (macrociclo, mesociclo, microciclo) | 🔴 |
| RF-02.4 | Plan específico "15K 16 Agosto 2026" con fases de base, construcción y tapering | 🔴 |
| RF-02.5 | Marcar sesiones como completada, fallida, cancelada | 🟡 |

### 4.3 Módulo de Análisis (RF-03)
| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-03.1 | Dashboard con métricas semanales/mensuales | 🔴 |
| RF-03.2 | Comparación plan vs real con desviaciones | 🟡 |
| RF-03.3 | Desglose de zonas de frecuencia cardíaca | 🟡 |
| RF-03.4 | Visualización de carga de entrenamiento (TSS, fatiga acumulada) | 🟡 |
| RF-03.5 | Calendario de calor por intensidad (distancia/tiempo/esfuerzo) | 🟢 |

### 4.4 Módulo de IA Coach Adaptativa (RF-04)
| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-04.1 | La IA Coach debe **modificar el plan sobre la marcha** proponiendo ajustes a sesiones futuras basándose en fatiga, rendimiento real y disponibilidad del atleta | 🔴 |
| RF-04.2 | Toda propuesta queda en estado "pendiente" hasta confirmación del usuario | 🔴 |
| RF-04.3 | La IA debe considerar contexto global completo (no solo el día seleccionado): fatiga acumulada (ATL), aptitud (CTL), forma (TSB), carga semanal | 🔴 |
| RF-04.4 | La IA debe adaptar el plan automáticamente si detecta sobreentrenamiento, lesión o cambios en la disponibilidad semanal | 🟡 |
| RF-04.5 | Panel de configuración IA: tono, equipo disponible, nivel de autonomía (proposal-only / semi-auto / supervisado) | 🟢 |
| RF-04.6 | Límite de consultas IA para plan gratuito | 🟢 |

### 4.5 Módulo de Reportes Autónomos (RF-05)
| ID | Requisito | Prioridad |
|----|-----------|-----------|
| RF-05.1 | Hermes Agent leerá datos vía MCP Strava | 🟡 |
| RF-05.2 | Cronjob semanal (lunes 8am) con análisis de rendimiento | 🟡 |
| RF-05.3 | Alertas de sobreentrenamiento o fatiga acumulada | 🟢 |
| RF-05.4 | Recomendación de ajuste semanal | 🟢 |

---

## 5. Requisitos No Funcionales

| ID | Requisito | Detalle |
|----|-----------|---------|
| RNF-01 | Seguridad | Secretos fuera del frontend (proxy o Cloudflare Workers) |
| RNF-02 | Privacidad | Datos de Strava almacenados localmente, no compartidos |
| RNF-03 | UX | Respuestas IA cortas, claras y accionables |
| RNF-04 | Trazabilidad | Registrar propuestas IA y confirmaciones del usuario |
| RNF-05 | Disponibilidad | App funcional offline con datos cacheados (PWA opcional) |
| RNF-06 | Idioma | Español como principal, inglés como secundario; textos desacoplados |
| RNF-07 | Performance | Dashboard debe cargar < 2s con datos típicos de un atleta |

---

## 6. Plan de Implementación

### Fase 0 — Fundación Documental (ESTA FASE)
- [x] Revisar estado actual del proyecto
- [ ] Crear `frd.md` (este documento)
- [ ] Crear `fdd.md` (diseño funcional)
- [x] Conectar MCP Strava con Hermes Agent

### Fase 1 — Preparación 15K (16 Jun — 16 Ago 2026)
- [ ] Planificar bloque de entrenamiento de 9 semanas
- [ ] Configurar cronjob de supervisión semanal
- [ ] Primera semana de datos reales

### Fase 2 — Reconstrucción del Proyecto (+ Rediseño UI)
- [ ] Limpiar README.md (conflictos de merge)
- [ ] Consolidar apps/web (v2 React)
- [ ] **Rediseñar interfaz con estética Linear (oscuro, preciso, violeta)**
- [ ] Conectar Supabase (schema.sql existente)
- [ ] Implementar calendario, sesiones e IA Coach

### Fase 3 — IA Coach Adaptativa
- [ ] Motor de recomendaciones que modifica el plan sobre la marcha
- [ ] Cálculo de ATL, CTL, TSB en tiempo real
- [ ] Detección automática de fatiga y sobreentrenamiento
- [ ] Panel de propuestas pendientes con confirmación del usuario
- [ ] Integración con Hermes para supervisión dual
- [ ] Configuración de autonomía IA (proposal-only / semi-auto / supervisado)

---

## 7. Criterios de Aceptación del MVP

- [x] Strava conectado y leyendo datos (✅ 17/06/2026)
- [ ] Usuario puede editar sesiones manualmente en calendario
- [ ] Usuario puede ver plan vs ejecución real
- [ ] IA propone cambios editables y no aplica nada sin confirmación
- [ ] Límite de consultas IA funcional
- [ ] App operativa en español e inglés
- [ ] Hermes Agent genera reporte semanal autónomo
- [ ] Plan de 15K activo con progreso visible