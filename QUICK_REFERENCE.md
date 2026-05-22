# Quick Reference: Testing & Changelog

## 🧪 Testing Rápido (5 minutos)

### ✅ Checklist de Validación

```
PASOS DE VALIDACIÓN BÁSICA
┌─────────────────────────────┐
│ 1. Abrir app en navegador   │
│ 2. Conectar con Strava      │
│ 3. Verificar cada sección   │
└─────────────────────────────┘

FASE 1: Categorización
  ☐ DevTools → Console → Inspeccionar actividad → ¿Tiene .category?
  ☐ Categorías esperadas: Cycling, Running, Gym, Other
  
FASE 2: Export
  ☐ Click "📥 Descargar datos (todos)"
  ☐ ¿Se descargó archivo JSON?
  ☐ Abrir JSON en VSCode → ¿Está formateado (readable)?
  ☐ Buscar "access_token" en JSON → ¿NO debe estar presente?
  
FASE 3: Filtro fechas
  ☐ Recargar página
  ☐ ¿Aparece input "Cargar actividades desde:" en auth-screen?
  ☐ Cambiar fecha (ej: 7 días atrás)
  ☐ Conectar con Strava
  ☐ ¿Se cargaron menos actividades (de ese rango)?
  
FASE 4: Calendario
  ☐ Dashboard → Buscar sección "Calendario de Actividades"
  ☐ ¿Aparece grid 7 columnas con días?
  ☐ Click botones: 📏 Distancia → ⏱ Tiempo → 💪 Esfuerzo
  ☐ ¿Cambian colores y valores en celdas?
  ☐ Hover en celda → ¿Scale & opacity?
```

---

## 📝 Changelog (Comparado con original)

### Nuevas Funciones

| Función | Línea | Propósito |
|---------|-------|----------|
| `categorizeActivity(a)` | 841 | Mapea sport_type → categoría |
| `getSportCategoryMap()` | 830 | Lee mapeo de localStorage |
| `setSportCategoryMap()` | 836 | Guarda mapeo categorizado |
| `getFilterPrefs()` | 849 | Lee preferencias de filtros |
| `setFilterPrefs()` | 862 | Guarda preferencias |
| `buildExportJSON()` | 871 | Serializa datos para IA |
| `downloadJSON()` | 948 | Descarga JSON al cliente |
| `exportDataAsJSON()` | 1369 | Handler de botones export |
| `buildCalendarData()` | 1174 | Agrupa actividades/fecha |
| `getColorByIntensity()` | 1208 | Mapa de colores por valor |
| `renderCalendar()` | 1242 | Renderiza grid calendario |

### Funciones Modificadas

| Función | Cambios |
|---------|---------|
| `processActivities()` | ✏️ Aceptar todas actividades + asignar `.category` |
| `loadActivities()` | ✏️ Parámetro `fromDate` nuevo |
| `exchangeToken()` | ✏️ Recupera fecha, pasa a loadActivities |
| `authorizeStrava()` | ✏️ Guarda fecha en localStorage |
| `renderDashboard()` | ✏️ Almacena datos globales + renderiza calendario |
| `window.addEventListener('load')` | ✏️ Inicializa input date |

### Nuevos Elementos HTML

| Elemento | Ubicación | Propósito |
|----------|-----------|----------|
| Input date | auth-screen | Selector fecha inicio |
| Export buttons (x2) | Entre AI-Insight y Plan | Descargar JSON |
| Calendar container | Panel nuevo | Renderizar calendario |
| Calendar view buttons | Dentro calendar | Selector métrica |

### Variables Globales Nuevas

```javascript
lastLoadedActivities  // Almacena actividades para export
lastLoadedStats       // Almacena stats para export
lastLoadedAthlete     // Almacena athlete para export
```

### localStorage Keys Nuevas

```javascript
xco_sport_map         // Mapeo sport_type → categoría
xco_filter_prefs      // Preferencias (fecha, view, filter)
xco_filter_from_date  // Fecha inicio del rango
```

---

## 🐛 Troubleshooting Común

### ❌ "No descarga el JSON"
**Causa**: Navegador bloqueando downloads desde blob
**Solución**: 
- Verificar que `downloadJSON()` se ejecuta (DevTools)
- Probar en Chrome/Firefox (Safari a veces requiere enable)

### ❌ "Calendario no aparecer"
**Causa**: `calendar-container` no render
**Solución**:
- DevTools → Elements → ¿Existe `<div id="calendar-container">`?
- Consola → `console.log(document.getElementById('calendar-container'))`
- Si null, recargar página HTML

### ❌ "Categorías todas 'Other'"
**Causa**: Mapeo sport_type sin match
**Solución**:
- DevTools → Console: `console.log(getSportCategoryMap())`
- Verificar que las actividades Strava tienen `.sport_type`
- Agregar nuevas categorías en `DEFAULT_SPORT_MAP`

### ❌ "Fecha filtro no guardar"
**Causa**: localStorage desabilitado o error de parse
**Solución**:
- DevTools → Application → localStorage → ¿Existen keys `xco_*`?
- Si no, localStorage está desabilitado (incognito?)
- Probar en ventana normal

### ❌ "Calendario lento con muchas actividades"
**Causa**: Muchas actividades (>200) en renderizado
**Solución**:
- Normal esperado para datasets grandes
- Próxima iteración: virtualización con `DocumentFragment`

---

## 📊 Stats Post-Implementación

| Métrica | Valor |
|---------|-------|
| Líneas de código nuevas | ~370 |
| Funciones nuevas | 11 |
| Funciones modificadas | 6 |
| HTML elementos nuevos | 8 |
| localStorage keys nuevos | 3 |
| Complejidad de ciclomático | Bajo (max 5) |
| Test coverage (plan actual) | 0% (manual testing) |

---

## 🎯 Prioridad de Bugs a Fijar (si existen)

1. **P0 (breaking)**: Exportación incluye token → SEGURIDAD
2. **P1 (major)**: Calendario no renderiza → FEATURE BROKEN
3. **P2 (minor)**: Fecha no persiste → UX pobra
4. **P3 (cosmetic)**: Colores calendario meh → Ajustar paleta

---

## 📞 Contact Points para Integración

Si necesitas integrar esto con backend o pipeline:

1. **Export JSON endpoint**: POST `/api/export` con JSON generado
2. **Athlete sync**: GET `/api/athlete/{id}/sync?fromDate=YYYY-MM-DD`
3. **Category mapping API**: POST `/api/categories/map` para guardar custom mappings
4. **Calendar analytics**: GET `/api/calendar/stats?month=YYYY-MM`

---

## ✨ Mejoras Futuras Recomendadas

```
PRIORIDAD MEDIA:
  □ Modal al clickear celda calendario (ver detalles)
  □ Comparación mes-a-mes en charts
  □ Exportación a CSV además de JSON

PRIORIDAD BAJA:
  □ Drag & drop en calendario (requiere backend)
  □ Filtro ORM por categoría en calendar
  □ Dark/light mode toggle
  □ Mobile app versión
  □ Push notifications entrenamiento
```

---

## 📋 Sign-Off

**Implementado por**: GitHub Copilot
**Fecha**: 15 de abril de 2026
**Versión**: 1.0
**Estado**: ✅ QA READY

**Próximo paso**: Desplegar a GitHub Pages y monitorear logs
