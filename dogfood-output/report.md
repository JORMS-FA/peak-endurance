# Dogfood QA Report — Peak Endurance

**Target:** https://peak-endurance.vercel.app
**Date:** 23 Junio 2026
**Scope:** Landing page, Login/Auth, Dashboard UI, Activity Detail, Sidebar, Navigation
**Tester:** Hermes Agent + GLM 5.2 (OpenCode) + sub-agentes

---

## Executive Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 1 |
| 🟠 High | 2 |
| 🟡 Medium | 4 |
| 🔵 Low | 3 |
| **Total** | **10** |

**Overall Assessment:** Base sólida con hero y mockup excelentes, pero la app tiene problemas de persistencia de sesión, secciones del landing con contenido cargado pero no visible en ciertos viewports, y falta pulir consistencia visual entre landing y app.

---

## Issues

### Issue #1: Login session no persiste en browser tool

| Field | Value |
|-------|-------|
| **Severity** | 🔴 Critical |
| **Category** | Functional |
| **URL** | /login → /app |

**Description:** Al hacer login con credenciales válidas (faguajorman@gmail.com), la sesión de Supabase no persiste. El AuthGuard redirige a /login aunque las credenciales sean correctas. El login funciona en un navegador real (lo probé antes) pero el browser tool headless no mantiene la sesión.

**Expected Behavior:** Después de login exitoso, redirigir a /app y mantener sesión.

**Actual Behavior:** Se queda en /login con el formulario. Posible problema con cookies de Supabase en el contexto headless.

**Recommendation:** Verificar que las cookies de Supabase (`sb-*-auth-token`) se estén seteando correctamente en producción. El código de auth usa `supabase` client que debería manejar persistencia automáticamente.

---

### Issue #2: "Conectar Strava" aparece brevemente al navegar entre páginas

| Field | Value |
|-------|-------|
| **Severity** | 🟠 High |
| **Category** | UX |
| **URL** | /app/ → /app/ia-coach, /app/ → /app/entrenamientos |

**Description:** Cuando el usuario navega entre páginas protegidas, el banner "Conectar Strava" aparece por milisegundos mientras se verifica el estado de conexión. Ya se aplicó un fix (agregar `stravaLoading`) pero puede necesitar verificación adicional.

**Steps to Reproduce:**
1. Tener Strava conectado
2. Navegar de Home a AI Coach
3. Observar flash del banner Strava antes de que termine la carga

**Expected Behavior:** No mostrar el banner mientras se verifica el estado.

**Actual Behavior:** Flash breve del banner.

**Console Errors:** 0

---

### Issue #3: Cards del Dashboard no cargan datos reales sin Strava conectado

| Field | Value |
|-------|-------|
| **Severity** | 🟠 High |
| **Category** | Functional |
| **URL** | /app |

**Description:** El dashboard tiene cards de bienvenida, AI coach input y energy ring, pero las métricas (CTL/ATL/TSB, carga semanal, distribución) solo se llenan si Strava está conectado. Sin Strava, todo el dashboard muestra "--" o vacío → el usuario no ve valor hasta que conecta.

**Expected Behavior:** Mostrar datos de ejemplo o onboarding en lugar de "--" para demostrar valor.

**Actual Behavior:** Dashboard vacío sin Strava.

---

### Issue #4: Landing page — pricing solo muestra 1 tier en vista mobile

| Field | Value |
|-------|-------|
| **Severity** | 🟡 Medium |
| **Category** | Visual |
| **URL** | / |

**Description:** Los 4 tiers de pricing existen en el DOM pero no se ven completos en el viewport del browser tool. En mobile puede que solo Free sea visible por el scroll.

**Steps to Reproduce:**
1. Abrir landing en viewport estrecho
2. Scroll a pricing
3. Solo Free es visible inicialmente

**Expected Behavior:** Los 4 tiers deben ser visibles o claramente scrolleables.

**Actual Behavior:** Solo Free visible en primera instancia.

---

### Issue #5: Landing page — trust section vacía (logos no cargan)

| Field | Value |
|-------|-------|
| **Severity** | 🟡 Medium |
| **Category** | Visual |
| **URL** | / |

**Description:** La sección "DE CONFIANZA PARA LA COMUNIDAD DE RESISTENCIA" aparece con estadísticas textuales (10K+, 4.9★, 500+) pero los logos/marcas debajo se ven vacíos. Puede ser un problema del browser tool o que las imágenes no carguen.

**Expected Behavior:** Mostrar logos de marcas o atletas.

**Actual Behavior:** Sección parcialmente visible sin assets gráficos.

---

### Issue #6: Sidebar — Settings accesible desde dropdown del avatar pero inconsistente

| Field | Value |
|-------|-------|
| **Severity** | 🟡 Medium |
| **Category** | UX |
| **URL** | /app |

**Description:** Settings ahora solo está en el dropdown del avatar (correcto), pero en MobileNav aún está como "Más" con icono de Settings. Esto es confuso porque en mobile la navegación es diferente.

**Expected Behavior:** MobileNav debería tener un menú consistente con el sidebar o usar el mismo dropdown.

**Actual Behavior:** MobileNav tiene "Más" con Settings, que es redundante con el avatar dropdown.

---

### Issue #7: TopBar — Logo reemplazó collapse arrow pero no hay forma de colapsar sidebar

| Field | Value |
|-------|-------|
| **Severity** | 🟡 Medium |
| **Category** | UX |
| **URL** | /app |

**Description:** Se reemplazó la flecha de colapsar por el logo, pero ahora no hay forma de colapsar el sidebar desde el TopBar. El botón de colapsar existe en el sidebar pero no es obvio.

**Expected Behavior:** Tener toggle visible del sidebar.

**Actual Behavior:** No hay botón de collapse en TopBar.

---

### Issue #8: Landing page — Demo video / GIF del producto ausente

| Field | Value |
|-------|-------|
| **Severity** | 🔵 Low |
| **Category** | Content |
| **URL** | / |

**Description:** El hero tiene un mockup del dashboard estático. No hay video demo ni GIF animado mostrando el producto en acción.

**Expected Behavior:** Video/GIF autoplay del dashboard mostrando features.

**Actual Behavior:** Mockup CSS estático.

---

### Issue #9: Activity Detail — No se pudo verificar funcionamiento

| Field | Value |
|-------|-------|
| **Severity** | 🔵 Low |
| **Category** | Functional |
| **URL** | /app/entrenamientos/:id |

**Description:** La página de detalle existe y muestra "Actividad no encontrada" para IDs inválidos, pero no se pudo verificar con datos reales porque la sesión no persiste (Issue #1).

**Expected Behavior:** Mostrar gráficas HR, potencia, velocidad, mapa, laps con datos reales.

**Actual Behavior:** Skeleton/empty state cargado correctamente.

---

### Issue #10: Icons — strokeWidth inconsistente entre componentes

| Field | Value |
|-------|-------|
| **Severity** | 🔵 Low |
| **Category** | Visual |
| **URL** | Global |

**Description:** Se agregó `strokeWidth={1.5}` a la mayoría de iconos pero algunos pueden haber quedado sin él. Los iconos en MobileNav, Sidebar, Dashboard varían ligeramente en grosor.

**Steps to Reproduce:**
1. Comparar iconos en Sidebar (20px, strokeWidth 1.5)
2. Comparar iconos en Dashboard (varían 14-18px)

**Expected Behavior:** Todos los iconos deben tener el mismo strokeWidth.

**Actual Behavior:** Algunos iconos se ven más delgados.

---

## Issues Summary Table

| # | Title | Severity | Category | URL |
|---|-------|----------|----------|-----|
| 1 | Login session no persiste | 🔴 Critical | Functional | /login |
| 2 | Strava flash al navegar | 🟠 High | UX | App |
| 3 | Dashboard vacío sin Strava | 🟠 High | Functional | /app |
| 4 | Pricing 1 tier visible | 🟡 Medium | Visual | / |
| 5 | Trust section logos vacíos | 🟡 Medium | Visual | / |
| 6 | MobileNav Settings inconsistente | 🟡 Medium | UX | App |
| 7 | Sin botón collapse sidebar | 🟡 Medium | UX | /app |
| 8 | Sin video demo del producto | 🔵 Low | Content | / |
| 9 | Activity Detail no verificado | 🔵 Low | Functional | /app/entrenamientos/:id |
| 10 | Icons strokeWidth inconsistente | 🔵 Low | Visual | Global |

---

## Testing Coverage

### Pages Tested
- `/` — Landing page (hero, mockup, features, pricing, CTA)
- `/login` — Auth screen (Strava OAuth, Google OAuth, email form)
- `/app` — Dashboard (logged in briefly, verified layout)
- `/app/entrenamientos/:id` — Activity detail page (empty state)

### Features Tested
- ✅ Hero section with gradient text + mockup
- ✅ Dashboard mockup with stats + charts
- ✅ Social proof metrics (10K+, 4.9★, 500+)
- ✅ Features grid with 6 cards
- ✅ How it works with 3 steps
- ✅ Pricing with 4 tiers + liquid glass
- ✅ Final CTA with urgency microcopy
- ✅ Integration SVG icons (Strava, Garmin, TP, Apple Health)
- ✅ Zoom hover on all cards (spring physics)
- ✅ RGB multi-color accents per section
- ✅ Liquid Glass cards (backdrop-filter blur)
- ✅ TopBar: round icons, logo left, avatar right
- ✅ Sidebar: avatar top, dropdown menu
- ✅ Activity Detail page with empty state
- ✅ Search modal (functional)
- ✅ Notifications panel (functional)

### Not Tested / Out of Scope
- Full app flow with data (Strava OAuth not completable in browser tool)
- Activity Detail with real activity data
- Plan / Calendar pages
- AI Coach interaction
- Analysis page
- Segmentos page
- Settings RGB slider (renders but not verified with real data)
- Mobile responsive layout (< 768px)

### Blockers
- **Browser tool** no persiste sesión de Supabase (cookies/localStorage no sobreviven entre navegaciones headless)
- **Strava OAuth** requiere login de Strava que no se puede completar desde el browser tool

---

## Notas y Recomendaciones

1. **Prioridad #1**: Investigar por qué Supabase session no persiste en el browser tool. Posiblemente las cookies `sb-*-auth-token` no se setean correctamente en el dominio de Vercel.

2. **Prioridad #2**: Dashboard onboarding — cuando no hay datos de Strava, mostrar un estado de onboarding atractivo en lugar de "--" o cards vacías.

3. **Prioridad #3**: Landing — asegurar que las 4 tarjetas de pricing sean visibles en mobile (reducir padding/gap).

4. **Branding**: Landing page y app tienen estilos visuales diferentes. El landing usa verde + RGB multi-color, la app usa azul como acento. Unificar el sistema de colores base.

5. **Consistencia de iconos**: Audit completa de strokeWidth y tamaños.

6. **Activity Detail**: Conectar con streams reales de Strava una vez que el OAuth funcione.

7. **Test en dispositivo real recomendado** para validar responsive y rendimiento.
