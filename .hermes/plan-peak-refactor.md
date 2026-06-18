# Plan de Refactorización — Peak Endurance

## Diagnóstico
La app web tiene 3 problemas principales:
1. **No es responsive** — Layouts se rompen en tablets/móviles, sidebar no funciona bien, grids tienen min-widths fijos que desbordan
2. **Diseño naranja antiguo** — El FDD especifica estilo Linear (oscuro #08090a, violeta #5e6ad2/#7170ff, sin colores cálidos)
3. **Faltan features clave** — Vista de segmentos Strava vía MCP, panel de integración con Hermes Agent

## Archivos a modificar

### `packages/ui/src/theme.ts` — Nuevos colores Linear
```ts
export const appBrand = {
  name: 'Peak Endurance',
  accent: '#5e6ad2',
  accentSoft: '#7170ff',
  surface: '#080a0c',
  surfaceRaised: '#0e1014',
  outline: '#1c1f26',
}
```

### `apps/web/src/index.css` — Reescribir completamente
- **CSS Variables**: Reemplazar naranja → violeta, fondos → negro profundo `#08090a`
- **Layouts responsive**: Eliminar min-widths fijos, usar `minmax(0, 1fr)` y `auto-fit`
- **Breakpoints**:
  - `max-width: 1400px` → dashboard/hero apilados
  - `max-width: 980px` → barra lateral oculta, navegación móvil inferior
  - `max-width: 640px` → móvil pequeño (teléfono)
- **Sidebar**: 240px fijo en desktop, oculto en mobile
- **Mobile nav**: Barra inferior fija con 5 iconos (Inicio, Calendario, IA Coach, Segmentos, +)
- **Dashboard**:
  - Hero card: stacked en mobile (imagen debajo del texto)
  - Métricas: grid `repeat(auto-fit, minmax(140px, 1fr))` en desktop, `repeat(2, 1fr)` en tablet, `1fr` en móvil
  - Rail (columna derecha): pasa abajo en tablet/mobile
- **Calendario**: Horizontal scroll en desktop, vertical en mobile con `grid-template-columns: repeat(7, 1fr)` adaptativo
- **Month card**: En móvil, las celdas se reducen proporcionalmente
- **Header/topbar**: Apilado en mobile, acciones a la derecha
- **Sign-in screen**: Full viewport centrado, panel responsive
- **Tarjetas**: Padding responsive (`clamp(10px, 2vw, 14px)`)
- **Fuente**: Inter como principal (peso 510 característico de Linear), Lexend solo para titulares grandes
- **Transiciones**: Animaciones sutiles, bordes semitransparentes `rgba(255,255,255,0.02-0.05)`
- **Body**: `padding: 0` por defecto, sin padding lateral en mobile

### `apps/web/src/App.tsx` — Refactorizar
- Agregar nueva ruta: `/segmentos` (Strava Segments)
- Agregar nueva ruta: `/hermes` (Hermes Integration)
- Actualizar navegación en `mobileNavigation` para incluir "segmentos"
- Componentes nuevos: `StravaSegmentsPage`, `HermesIntegrationPage`
- Color scheme: Reemplazar todos los naranjas por violetas

### `apps/web/src/lib/types.ts` — Nuevos tipos
- `StravaSegment` type: nombre, id, distancia, desnivel, esfuerzo estimado, estrella
- `HermesConfig` type: conexión, comandos, estado

### `apps/web/src/lib/mock-data.ts` — Agregar datos
- `initialSegments`: Array de 8-10 segmentos simulados de Strava (La Macarena, Colombia)
  - Nombre realista, distancia, desnivel positivo, esfuerzo aprox, estrellado o no
- `hermesConnection`: Estado de conexión con Hermes

### `apps/web/src/lib/i18n.ts` — Nuevas traducciones
- `segments`: 'Segmentos' / 'Segments'
- `segmentDescription`: 'Explora segmentos Strava populares cerca de ti' / 'Explore popular Strava segments near you'
- `hermes`: 'Hermes Agent' / 'Hermes Agent'
- `hermesDescription`: 'Conecta tu agente Hermes para supervisión autónoma' / 'Connect your Hermes agent for autonomous supervision'
- `starred`: 'Favorito' / 'Starred'
- `effort`: 'Esfuerzo estimado' / 'Estimated effort'
- `elevation`: 'Desnivel' / 'Elevation'
- `connect`: 'Conectar' / 'Connect'
- `disconnect`: 'Desconectar' / 'Disconnect'
- `connectedTo`: 'Conectado a' / 'Connected to'
- `autonomousReports`: 'Reportes autónomos' / 'Autonomous reports'
- `weeklyReport`: 'Reporte semanal (lunes 8am)' / 'Weekly report (Monday 8am)'
- `stravaSync`: 'Sincronización Strava' / 'Strava sync'

### `apps/web/index.html` — Meta tags
- Agregar `meta name="theme-color" content="#08090a"`
- Agregar viewport (ya existe)

## Nuevos componentes en App.tsx

### StravaSegmentsPage
```
- Grid de tarjetas de segmentos
- Cada tarjeta: nombre, distancia (km), desnivel (m), estrella/no estrella, esfuerzo estimado
- Botón para "Explorar en Strava" (link)
- Filtro por Running/Ciclismo
- Estado: "Cargando segmentos..." -> "15 segmentos cerca de La Macarena"
```

### HermesIntegrationPage
```
- Estado de conexión (Conectado / Desconectado)
- Botón conectar/desconectar
- Info: "Hermes Agent puede supervisar tu entrenamiento y generar reportes autónomos"
- Sección "Capacidades": Reportes semanales, Alertas de fatiga, Ajustes de plan
- Estado de conexión Strava (conectado ✅)
- Botón "Configurar cronjob semanal"
```

## CSS: enfoque mobile-first
El CSS debe ser reescrito completamente con mobile-first:
- Base styles = mobile
- `@media (min-width: 641px)` = tablet landscape
- `@media (min-width: 981px)` = desktop
- `@media (min-width: 1401px)` = wide

## Reglas de estilo Linear (del FDD)
- Fondo: `#08090a`
- Superficie elevada: `#0e1014`
- Tarjetas: `rgba(255,255,255,0.02)` con borde `rgba(255,255,255,0.06)`
- Acento primario: `#5e6ad2`
- Acento hover: `#7170ff`
- Texto primario: `#e8eaed`
- Texto secundario: `#9098a5`
- Borde sutil: `rgba(255,255,255,0.06)`
- Sin colores cálidos en la UI (naranjas, amarillos)
- Tipografía: Inter, peso 510 para body
- Fuente para titulares: Inter (no Lexend) con peso 600-700
- Sombras sutiles: `box-shadow: 0 1px 3px rgba(0,0,0,0.3)`

## Criterios de éxito
1. ✅ App se ve bien en móvil (320px+) y desktop (1920px)
2. ✅ Diseño oscuro violeta (Linear) implementado consistentemente
3. ✅ Página de Segmentos Strava funcional con datos mock
4. ✅ Página de integración Hermes Agent funcional
5. ✅ Navegación móvil inferior funcional
6. ✅ Sin errores de compilación (`npm run build` exitoso)
7. ✅ `npm run dev` arranca sin errores
