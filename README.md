<<<<<<< ours
<<<<<<< ours
<<<<<<< ours
# Peak Endurace Coach

Aplicacion web para planificar, comparar y ajustar entrenamientos de endurance con ayuda de IA.

## Contexto general

- Proyecto en evolucion desde prototipo estatico (`index.html`) hacia producto escalable.
- Publicacion actual en GitHub Pages.
- Integracion inicial con Strava y arquitectura pensada para sumar mas fuentes.
- IA como capa central del producto, no solo como chat.

## Principios del proyecto

1. La IA puede proponer y editar entrenamientos, pero siempre con confirmacion del usuario antes de aplicar cambios.
2. La plataforma debe soportar multiples fuentes de datos deportivas: Strava, Garmin, Coros, iGPSPORT, Coospo y otras.
3. El plan gratis tendra limites de consultas IA.
4. Idiomas iniciales: espanol e ingles.
5. No exponer secretos en frontend ni en repositorio.

## Estructura minima actual

- `apps/web`: frontend React + Vite de la v2.
- `packages/ui`: tokens y configuracion compartida.
- `supabase`: esquema base de datos y modelo inicial.
- `workers`: workers edge para IA e integraciones.
- `index.html`: referencia legacy del prototipo anterior.
- `cloudflare-worker.js`: proxy legacy original.
- `sdd peak endurace.md`: especificacion base del producto.
- `README.md`: este contexto general.

## IA y despliegue con proxy

GitHub Pages ejecuta en navegador; por CORS conviene usar proxy.

Flujo recomendado:

1. Crear Cloudflare Worker.
2. Pegar `cloudflare-worker.js`.
3. Guardar `OLLAMA_API_KEY` como secreto del Worker.
4. Publicar Worker.
5. Configurar la URL del Worker en Ajustes IA de la app.
=======
=======
>>>>>>> theirs
=======
>>>>>>> theirs
# Nuevo Shopping (Android MVP)

Aplicación Android para organizar compras por categorías y guardar múltiples URLs por cada producto.

## Qué puedes probar manualmente

La app ahora incluye **datos demo automáticos** para que al abrirla ya veas ejemplos reales:

- Categorías: Ropa, Tecnología, Accesorios.
- Productos ya creados dentro de cada categoría.
- Links de distintas tiendas por producto.
- Un botón para **restaurar los datos demo** y volver a empezar.
- Botón para **abrir links** directamente desde la app.

## Cómo testearla manualmente sin saber programar

### Opción recomendada: con Android Studio

1. Instala **Android Studio**.
2. Abre este proyecto.
3. Espera a que termine la sincronización.
4. Crea o inicia un emulador Android.
5. Pulsa el botón **Run**.
6. Si prefieres instalar el APK manualmente, lo encontrarás en `app/build/outputs/apk/debug/app-debug.apk` después de compilar.
7. Cuando se abra la app:
   - toca una categoría,
   - luego un producto,
   - revisa sus links,
   - prueba el botón `Abrir link`,
   - y usa `Restaurar datos demo` si quieres reiniciar la prueba.

## Ejecución local por consola

```bash
./gradlew tasks
./gradlew :app:assembleDebug
```

> Nota: necesitas Android SDK instalado y configurado (`ANDROID_HOME` o `ANDROID_SDK_ROOT`) para compilar.

## Flujo manual de prueba sugerido

1. Abrir la app.
2. Ver la sección **Prueba manual rápida**.
3. Seleccionar la categoría **Ropa**.
4. Tocar el producto **Tenis blancos**.
5. Abrir uno de sus links.
6. Marcar el producto como comprado.
7. Marcar otro link como preferido.
8. Crear una categoría nueva.
9. Crear un producto nuevo.
10. Agregarle varios links.
11. Pulsar **Restaurar datos demo** para volver al estado inicial.

## Stack

- Kotlin
- Jetpack Compose
- Room
- MVVM

## Arquitectura pensada para migrar a cloud

Se definió una abstracción `ShoppingDataSource` para no acoplar la UI a Room directamente. Esto facilita cambiar de almacenamiento local a almacenamiento remoto por cuenta sin reescribir toda la UI.

## Siguiente fase recomendada

- edición y borrado de datos
- validación más fuerte de URLs
- autenticación por cuenta
- backend cloud compartido
- futura web app para escritorio
<<<<<<< ours
<<<<<<< ours
>>>>>>> theirs
=======
>>>>>>> theirs
=======
>>>>>>> theirs
