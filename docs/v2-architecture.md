# Peak Endurace V2

## Estructura

- `apps/web`: frontend React de la nueva version.
- `packages/ui`: tokens visuales y config compartida.
- `supabase`: base de datos y modelo inicial.
- `workers`: proxies y conectores edge.

## Despliegue recomendado

- Frontend: Cloudflare Pages
- Base de datos y auth: Supabase
- IA/integraciones sensibles: Cloudflare Workers

## Legacy

- `index.html` queda como referencia temporal.
- La evolucion activa del producto ocurre en `apps/web`.
