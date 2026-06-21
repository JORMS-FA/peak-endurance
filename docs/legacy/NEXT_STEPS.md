# Plan técnico de evolución a nube + web

## Objetivo
Mantener la app móvil como cliente principal ahora, y evolucionar después a un ecosistema móvil + web con datos compartidos por cuenta.

## Contrato de datos actual
La interfaz `ShoppingDataSource` ya permite desacoplar UI/casos de uso de la persistencia concreta.

## Diseño recomendado (cuando llegue fase cloud)

- `LocalShoppingDataSource` (Room) -> caché/offline.
- `RemoteShoppingDataSource` (API) -> fuente remota.
- `SyncShoppingRepository` -> merge/sincronización entre local y remoto.

## Entidades en backend sugeridas

- `users`
- `categories` (con `user_id`)
- `products` (con `category_id`, `user_id`)
- `product_links` (con `product_id`, `user_id`)

## Reglas de negocio importantes

- Un usuario solo puede leer/escribir sus propios datos.
- Un producto puede tener N links, pero solo 1 preferido.
- Soft delete opcional para sincronización más robusta.

## API mínima sugerida

- `GET /categories`
- `POST /categories`
- `GET /categories/{id}/products`
- `POST /products`
- `PATCH /products/{id}`
- `GET /products/{id}/links`
- `POST /products/{id}/links`
- `POST /products/{id}/preferred-link/{linkId}`

## Stack backend sugerido

- Kotlin (Ktor/Spring) o Node.js (NestJS)
- PostgreSQL
- JWT/OAuth2

## Stack web app sugerido

- React + TypeScript
- TanStack Query para estado remoto
- UI lib (MUI/Tailwind)

