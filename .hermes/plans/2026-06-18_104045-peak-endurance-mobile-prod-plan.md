# Peak Endurance Mobile-First Production Plan

> **Para Hermes/OpenCode:** ejecutar por fases. No mezclar UI, auth, Strava y despliegue en una sola corrida. Validar build al final de cada fase.

**Objetivo:** convertir la app web actual en una experiencia mobile-first tipo TrainingPeaks/Strava móvil, sin datos demo, con login real por Supabase y conexión real con Strava, publicada en producción.

**Arquitectura:** mantener `apps/web` como SPA Vite + React. Usar Supabase para Auth + tablas de usuario/sesiones/credenciales de integración. Añadir un backend ligero para secretos/OAuth (Supabase Edge Functions o servidor mínimo) porque **Strava client secret no debe vivir en el frontend**.

**Stack actual confirmado:** Vite 8, React 19, React Router 7, `@supabase/supabase-js` 2.104.1, despliegue en Vercel.

---

## Estado actual auditado

### Confirmado hoy
- `apps/web/src/lib/supabase.ts` ya existe, pero solo usa:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- `apps/web/.env.example` está vacío salvo esas variables y `VITE_AI_PROXY_URL`.
- La pantalla de login sigue usando demo:
  - `App.tsx:410` → nombre por defecto `Andres`
  - `App.tsx:411` → correo por defecto `andres@peak.local`
  - `App.tsx:438` → botón demo que entra como `Andres`
- La app sigue mostrando estados mock y data mock de Strava en `src/lib/mock-data.ts`.
- El build local pasa, pero la UX no está lista para clientes.

### Decisiones obligatorias antes de implementar
1. **Eliminar demo mode** de producción.
2. **No usar OAuth Strava directo desde frontend**.
3. **Diseño mobile-first real**: bottom nav, cards compactas, métricas legibles, scroll vertical corto.
4. **Autenticación mínima** para v1: email magic link o email/password. Si se quiere “Conectar Strava” desde la cuenta del cliente, hacerlo después del login.

---

## Fase 0 — Credenciales y preparación

**Objetivo:** dejar todo listo para que OpenCode pueda implementar sin bloquearse.

**Necesario del usuario:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (solo para backend/funciones, nunca frontend)
- Si habrá OAuth con Strava real:
  - `STRAVA_CLIENT_ID`
  - `STRAVA_CLIENT_SECRET`
  - URL de redirect autorizada en Strava (producción + local)

**Archivos a tocar:**
- `apps/web/.env.local` (local, no commitear)
- `apps/web/.env.example`
- backend/función nueva para Strava

**Verificación:**
- `npm --workspace apps/web run build`
- variables cargadas sin romper el frontend

---

## Fase 1 — Limpiar producto para clientes

**Objetivo:** quitar toda huella demo/mock visible al usuario.

**Archivos:**
- Modificar: `apps/web/src/App.tsx`
- Modificar: `apps/web/src/lib/mock-data.ts`
- Buscar y eliminar cualquier copy demo adicional

**Trabajo exacto:**
1. Quitar defaults `Andres` / `andres@peak.local`.
2. Quitar botón de demo de la pantalla de acceso.
3. Quitar copy tipo “Bienvenido Andrés”.
4. Cambiar el estado inicial para que, sin sesión real, solo muestre login.
5. Marcar claramente “Strava no conectado” si no hay integración real.

**Verificación:**
- `search_files` sin coincidencias de `Andres|demo@peak.local|Bienvenido`
- build OK
- abrir la app y confirmar que ya no entra sin auth real

---

## Fase 2 — Auth real con Supabase

**Objetivo:** login funcional de clientes.

**Archivos:**
- Modificar: `apps/web/src/lib/supabase.ts`
- Crear: `apps/web/src/lib/auth.ts`
- Crear/modificar: `apps/web/src/hooks/useAuth.ts`
- Modificar: `apps/web/src/App.tsx`
- Crear: `apps/web/src/components/auth/*`

**Enfoque recomendado v1:**
- usar **magic link por email** o **email/password**
- persistir sesión con `supabase.auth.getSession()` + `onAuthStateChange`
- proteger rutas privadas

**Pasos:**
1. Crear provider/hook de auth.
2. Reemplazar `onEnter(...)` mock por `signInWithOtp()` o `signInWithPassword()`.
3. Añadir loading state de sesión.
4. Crear botón de logout.
5. Guardar perfil mínimo del atleta en Supabase (`profiles`).

**Verificación:**
- login real
- refrescar página conserva sesión
- logout funcional
- sin errores en consola

---

## Fase 3 — UI mobile-first tipo TrainingPeaks/Strava móvil

**Objetivo:** rehacer la experiencia visual para móvil.

**Archivos probables:**
- `apps/web/src/App.tsx`
- `apps/web/src/App.css`
- `apps/web/src/index.css`
- componentes nuevos en `apps/web/src/components/mobile/*`

**Patrón visual objetivo:**
- header corto
- resumen del día arriba
- métricas en tarjetas pequeñas (fatiga, carga, TSB, km, tiempo)
- calendario/semanario compacto
- bottom navigation fija
- CTA principal visible: `Conectar Strava` / `Ver plan de hoy`

**Pantallas mínimas de v1:**
1. Login
2. Home/dashboard móvil
3. Plan semanal
4. Actividades recientes
5. Conexiones (Strava / Hermes)
6. Perfil/ajustes

**Verificación:**
- responsive útil a 390x844
- sin overflow horizontal
- botones táctiles > 44px
- Lighthouse mobile aceptable

---

## Fase 4 — Conexión real con Strava

**Objetivo:** conectar la cuenta Strava del cliente autenticado.

**Regla crítica:**
- **NO** poner `STRAVA_CLIENT_SECRET` en Vite/frontend.
- Implementar OAuth mediante backend seguro.

**Opciones válidas:**
1. **Supabase Edge Functions** (recomendado)
2. pequeño backend Node/worker para OAuth

**Flujo recomendado:**
1. Usuario autenticado pulsa `Conectar Strava`
2. frontend pide URL de autorización al backend
3. Strava redirige a callback seguro
4. backend intercambia `code` por tokens
5. backend guarda tokens por usuario
6. frontend consulta estado de conexión y sincroniza actividades

**Tablas mínimas sugeridas en Supabase:**
- `profiles`
- `user_integrations` (`provider`, `status`, `access_token`, `refresh_token`, `expires_at`)
- `activities`
- `activity_sync_runs`

**Verificación:**
- conectar Strava desde producción
- ver estado conectado
- traer actividades del usuario real
- renovar token sin intervención manual

---

## Fase 5 — Sustituir mocks por datos reales

**Objetivo:** que el dashboard se alimente de Supabase + Strava real.

**Archivos:**
- `apps/web/src/lib/mock-data.ts` → reducir o dejar solo fixtures de desarrollo
- crear repositorios reales de datos en `apps/web/src/lib/repositories/*`
- crear hooks `useActivities`, `usePlan`, `useIntegrations`

**Trabajo:**
1. separar capa mock de capa real
2. si no hay datos reales, mostrar empty states elegantes
3. no inventar métricas ni atletas demo
4. fallback visual: “Aún no hay actividades sincronizadas”

**Verificación:**
- cuenta nueva entra limpia
- cuenta conectada muestra solo sus datos
- no aparece data mezclada

---

## Fase 6 — Producción estable en Vercel

**Objetivo:** dejar una sola URL de producción útil.

**Hecho parcialmente hoy:**
- Vercel ya genera preview y producción.

**Pendiente:**
1. fijar nombre final del proyecto/dominio
2. configurar variables de entorno del frontend
3. si hay backend/edge functions, configurar variables también ahí
4. si se conserva este repo, dejar autodeploy solo para rama estable

**Verificación:**
- 1 URL final de producción
- login real funcionando en móvil
- conexión Strava funcionando en móvil
- navegación sin botones rotos

---

## Ejecución recomendada con OpenCode

**OpenCode está disponible** y autenticado. Ejecutar por corridas pequeñas.

### Corrida A — limpieza demo + auth shell
Prompt sugerido:
```text
Proyecto: C:/Users/fagua/Downloads/PROYECTOS DEV/peak-endurance/apps/web

Objetivo: eliminar toda la lógica demo del login en producción y preparar auth real con Supabase sin romper el build.

Requisitos:
- quitar defaults Andres/demo@peak.local
- quitar botón demo
- crear una capa auth mínima basada en supabase-js
- si faltan variables, mostrar estado vacío elegante, no entrar con usuario mock
- terminar con `npm run build` pasando en apps/web
```

### Corrida B — UI móvil
Prompt sugerido:
```text
Rediseña la app como mobile-first inspirada en TrainingPeaks/Strava móvil.
No desktop-first. Debe priorizar:
- bottom nav fija
- dashboard compacto
- tarjetas táctiles
- jerarquía visual deportiva
- empty states reales, sin demo data visible
Termina con `npm run build` pasando.
```

### Corrida C — Strava real
Prompt sugerido:
```text
Implementa la arquitectura segura para conectar Strava a usuarios autenticados.
No pongas secretos en frontend.
Diseña frontend + backend/edge function + storage model.
Termina documentando variables requeridas y con build del frontend pasando.
```

---

## Riesgos

1. **Querer hacer todo en una sola corrida de OpenCode** → alto riesgo de romper UX y auth a la vez.
2. **Usar Strava OAuth solo en frontend** → inseguro y no aceptable.
3. **Mantener mock-data acoplada al dashboard** → seguirán apareciendo estados falsos.
4. **Diseñar pensando en desktop** → no cumple tu objetivo real.

---

## Entregable v1 aceptable

Para considerar la v1 “publicable para clientes”:
- login real con Supabase
- cero texto demo / cero usuario ficticio
- dashboard móvil limpio
- botones principales funcionales
- conexión Strava real al menos para enlazar cuenta y mostrar estado
- una URL de producción estable

---

## Comandos de verificación

```bash
cd "C:/Users/fagua/Downloads/PROYECTOS DEV/peak-endurance/apps/web"
npm run build
```

```bash
cd "C:/Users/fagua/Downloads/PROYECTOS DEV/peak-endurance"
rg -n "Andres|andres@peak.local|Bienvenido|demo" apps/web/src
```

---

## Siguiente paso mínimo

1. Recibir credenciales de Supabase y Strava.
2. Ejecutar **Corrida A** con OpenCode.
3. Validar build.
4. Ejecutar **Corrida B**.
5. Luego integrar Strava real en backend seguro.
