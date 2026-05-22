# SDD - Peak Endurace Coach

## 1. Vision del producto

Peak Endurace Coach es una aplicacion para atletas de endurance que combina planificacion, analitica deportiva e IA para tomar decisiones diarias de entrenamiento con rapidez y contexto real.

## 2. Objetivo del MVP

Entregar una version util para uso real que permita:

1. Planificar y editar entrenamientos por calendario.
2. Conectar fuentes externas de actividad.
3. Comparar plan vs ejecucion real.
4. Usar IA para analizar, recomendar y ajustar el plan con confirmacion del usuario.

## 3. Alcance funcional inicial

### 3.1 Calendario y sesiones

- Vista por meses en panel deslizable interno.
- Seleccion de dia con detalle de plan y actividad real.
- Edicion manual de sesiones.
- Persistencia local inicial y preparacion para backend.

### 3.2 IA accionable (requisito clave)

- La IA puede proponer cambios concretos sobre entrenamientos.
- La IA puede preparar modificaciones automaticas por dia o bloque semanal.
- Toda modificacion queda en estado pendiente.
- El usuario debe confirmar o descartar antes de aplicar.
- Debe existir apartado de configuraciones IA para estilo de respuesta, contexto del atleta y permisos de accion.

### 3.3 Integraciones de datos deportivas

Fuentes objetivo iniciales para arquitectura multifuente:

- Strava
- Garmin
- Coros
- iGPSPORT
- Coospo

Reglas:

- El sistema no debe asumir una sola fuente.
- Los datos se normalizan a un esquema comun de actividades.
- La UI debe permitir seleccionar fuente principal o mezcla por rango de fechas.

### 3.4 Planes y limites

- Plan gratis con limite de consultas IA por periodo.
- Limites visibles en UI (contador restante).
- Al llegar al limite: bloquear nuevas consultas IA y mostrar mensaje de upgrade o espera de reinicio.

### 3.5 Idioma

- Version inicial solo en espanol e ingles.
- Textos desacoplados del codigo para permitir i18n.
- No agregar mas idiomas en esta fase.

## 4. Requisitos no funcionales

- Seguridad: secretos fuera del frontend, uso de proxy o backend para llaves sensibles.
- UX: respuestas IA cortas, claras y accionables.
- Trazabilidad: registrar propuestas IA y confirmaciones del usuario.
- Escalabilidad: estructura preparada para migrar de HTML estatico a arquitectura React + backend.

## 5. Arquitectura objetivo (transicion)

Fase actual:

- Frontend React en `apps/web`.
- Base de datos y modelo en `supabase`.
- Workers edge en `workers`.
- `index.html` mantenido como legacy temporal.

Fase siguiente:

- Backend con Supabase.
- Persistencia centralizada, autenticacion y reglas de acceso.

## 6. Modelo de datos minimo (conceptual)

- `athlete_profile`
- `training_session`
- `planned_calendar_day`
- `imported_activity`
- `activity_source`
- `ai_settings`
- `ai_query_usage`
- `pending_ai_changes`
- `app_language_preferences`

## 7. Flujos criticos

### 7.1 Analisis diario

1. Usuario selecciona dia o rango.
2. Sistema arma contexto con plan, actividades y configuracion.
3. IA responde con analisis y propuesta estructurada.
4. Usuario confirma o descarta.
5. Si confirma, se aplica el cambio y se guarda historial.

### 7.2 Importacion multifuente

1. Usuario conecta una o mas fuentes.
2. Sistema importa actividades.
3. Normaliza campos y elimina duplicados basicos.
4. Muestra datos agregados por dia y por rango.

## 8. Criterios de aceptacion del MVP

- Usuario puede editar sesiones manualmente.
- Usuario puede conectar al menos una fuente (Strava) y arquitectura lista para mas.
- IA propone cambios editables y no aplica nada sin confirmacion.
- Limite de consultas IA del plan gratis visible y funcional.
- App operativa en espanol e ingles.

## 9. Prioridades inmediatas

1. Estabilizar base documental y estructura de proyecto.
2. Fortalecer contexto IA global (no solo dia seleccionado).
3. Mejorar exactitud de distribucion por zonas en actividades reales.
4. Consolidar arquitectura multimes y multifuente.
