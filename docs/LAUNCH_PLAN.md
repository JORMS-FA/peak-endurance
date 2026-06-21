# Peak Endurance — Plan de lanzamiento y monetización

> **Versión:** 1.0
> **Fecha:** 20 de junio de 2026
> **Audiencia:** equipo técnico (continúa en otra plataforma)
> **Objetivo:** publicar la app, recibir suscripciones con Stripe, soportar
> dos tiers (Free con BYO Google AI Studio key + Pro con créditos incluidos),
> lanzar al mercado.

---

## 🚦 Estado actual (lo que ya existe)

| Capa | Estado | Notas |
|------|--------|-------|
| Auth (Google OAuth + email/password) | ✅ Funcional | Falta confirmar Site URL en Supabase |
| Strava OAuth (`strava-auth` edge function) | ✅ Código en main | Falta `supabase functions deploy` |
| Importación de actividades (`strava-sync`) | ✅ Código en main | Falta `supabase functions deploy` |
| Cálculo PMC (TSS / CTL / ATL / TSB) | ✅ Cliente computa | — |
| Dashboard con datos reales | ✅ — | — |
| Training con filtros funcionales | ✅ — | — |
| AI Coach UI (sin motor) | ✅ — | Botones bloqueados hasta que haya IA |
| Landing v2 orientada a embudo | ✅ — | App store badges sin link real |
| RLS en todas las tablas de usuario | ✅ — | Migración 0001 aplicada |
| Dominio público | 🟡 `peak-endurance.vercel.app` | Falta dominio custom |
| Stripe | ❌ — | Pendiente todo |
| Motor de IA (LLM) | ❌ — | Pendiente todo |
| Apps móviles nativas | ❌ — | Pendiente todo |
| Legal (Privacy / ToS) | ❌ — | Obligatorio para cobrar |

---

## 0. 🛑 Bugs críticos a resolver ANTES de promocionar

### 0.1 Site URL apuntando a deployment viejo
**Síntoma:** después del login Google la app redirige a `peak-endurance-<hash>-jorms-fas-projects.vercel.app/app` en vez de `peak-endurance.vercel.app/app`.

**Causa:** en Supabase → Authentication → URL Configuration, el campo **"Site URL"** tiene la URL deployment-específica con hash en lugar del dominio canónico.

**Fix:**
1. Supabase → Authentication → URL Configuration
2. **Site URL:** `https://peak-endurance.vercel.app` (canónica, estable)
3. **Redirect URLs:** debe incluir `https://peak-endurance.vercel.app/**` y `http://localhost:5173/**`. Borrar cualquier entrada con hash de deployment.
4. Save changes.

### 0.2 Edge functions sin desplegar
**Síntoma:** al click en "Conectar Strava" aparecerá `Function not found` o `404`.

**Fix:** desde local, con Supabase CLI:
```bash
npm install -g supabase
supabase login
supabase link --project-ref uoxumppvhismnttfllzj
supabase functions deploy strava-auth --no-verify-jwt
supabase functions deploy strava-sync
```

### 0.3 Strava Client Secret comprometido
Se compartió en chat durante desarrollo. **Antes de lanzar:** rotarlo en developers.strava.com → tu app → "Generar nuevo secreto" → actualizar `STRAVA_CLIENT_SECRET` en Supabase Edge Functions Secrets.

### 0.4 Leaked Password Protection desactivado
Lint advisor de Supabase lo reporta. Activar en Authentication → Policies → "Prevent use of leaked passwords".

### 0.5 Custom domain
`peak-endurance.vercel.app` está bien para MVP pero para promoción profesional comprar dominio (`peakendurance.app`, `peakendurance.io`, etc) y configurarlo en Vercel + actualizar Site URL en Supabase + Redirect URI en Strava + redirect URI en Google OAuth.

---

## 1. 💳 Integración con Stripe (suscripciones)

### 1.1 Modelo de planes

| Plan | Precio | Acceso |
|------|--------|--------|
| **Free** | $0 / mes | Strava connection + dashboard real + 0 créditos IA. **Puede usar IA si trae su propia API key de Google AI Studio (BYOK)** |
| **Pro** | $10 / mes (anual: $100/año, 17% off) | Free + 200 créditos IA mensuales con la clave del proyecto + integraciones futuras (Garmin, COROS) + sin anuncios |

> **Lógica de fondo:** un crédito = una request al LLM (≈4-8k tokens promedio). Free se autofinancia con BYOK; Pro paga el costo de inferencia + margen.

### 1.2 Setup en Stripe Dashboard

1. Crear cuenta en [stripe.com](https://stripe.com) (modo test primero).
2. **Products → Add product:**
   - Nombre: `Peak Endurance Pro`
   - Pricing: $10 USD recurrente, mensual.
   - Metadata: `tier: pro`, `ai_quota: 200`.
3. Crear segundo precio anual ($100/año, 17% off) sobre el mismo producto.
4. Copiar el `Price ID` de cada uno (formato `price_xxx`).
5. **Developers → API keys:** copiar `Publishable key` y `Secret key`. La secret va a Supabase secrets, la publishable va a Vercel env vars.
6. **Developers → Webhooks → Add endpoint:**
   - URL: `https://uoxumppvhismnttfllzj.supabase.co/functions/v1/stripe-webhook`
   - Events a escuchar:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
   - Copiar el `Signing secret` (formato `whsec_xxx`).

### 1.3 Variables de entorno

**Supabase Edge Functions Secrets (server-side):**
```
STRIPE_SECRET_KEY=sk_test_xxx (luego sk_live_xxx)
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID_PRO_MONTHLY=price_xxx
STRIPE_PRICE_ID_PRO_YEARLY=price_xxx
```

**Vercel env vars (client-side):**
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx (luego pk_live_xxx)
```

### 1.4 Edge functions a crear

#### `stripe-checkout` (POST, autenticado)
Crea una checkout session de Stripe y devuelve la URL.
- Input: `{ priceId: 'monthly' | 'yearly' }`
- Output: `{ url: string }`
- Flujo: crea/recupera customer en Stripe (mapeado por `profile_id`), crea checkout session con `mode: 'subscription'`, success URL = `<APP_URL>/app/ajustes?upgrade=success`, cancel URL = `<APP_URL>/app/ajustes`.

#### `stripe-webhook` (POST, sin auth, valida firma)
Recibe eventos de Stripe y mantiene la tabla `subscriptions` en sync.
- `checkout.session.completed` → marca subscription `active`, llena `stripe_customer_id`, `stripe_subscription_id`, `tier='pro'`, asigna `ai_quota_limit=200`.
- `customer.subscription.updated` → actualiza fechas y status.
- `customer.subscription.deleted` → marca `cancelled`, downgrade a free.
- `invoice.payment_failed` → marca `past_due`, notifica usuario por email.

#### `stripe-portal` (POST, autenticado)
Abre el Customer Portal de Stripe (gestión de método de pago, cancelación, facturas).
- Output: `{ url: string }`
- Permite al usuario gestionar su suscripción sin intervención manual.

### 1.5 Tabla `subscriptions` (migración)

Ya existe en `schema.sql` pero hay que añadir columnas Stripe:
```sql
alter table subscriptions
  add column if not exists stripe_customer_id text unique,
  add column if not exists stripe_subscription_id text unique,
  add column if not exists current_period_end timestamptz,
  add column if not exists cancel_at_period_end boolean default false;

create index if not exists idx_subs_stripe_customer
  on subscriptions(stripe_customer_id);
create index if not exists idx_subs_stripe_subscription
  on subscriptions(stripe_subscription_id);
```

### 1.6 Frontend (página `/app/ajustes` → sección "Plan")

- Mostrar plan actual (`profile.subscription.tier`).
- Si es free: botones **"Upgrade a Pro mensual"** / **"Upgrade a Pro anual"** → llaman a `stripe-checkout` con el priceId correspondiente.
- Si es pro: botón **"Gestionar suscripción"** → llama a `stripe-portal`.
- Componente `useSubscription()` hook que lea la tabla y exponga `{ tier, status, expiresAt, isActive }`.

### 1.7 Test antes de live

1. Stripe Dashboard en modo **test**.
2. Usar tarjeta de prueba `4242 4242 4242 4242` con cualquier CVV / fecha futura.
3. Probar: upgrade → ver `tier='pro'` en BD → cancelar desde Customer Portal → ver `cancel_at_period_end=true` → simular paso del tiempo (puedes acelerar en Stripe test) → ver downgrade.
4. Cuando pase: cambiar todas las keys a `sk_live_*` / `pk_live_*` y desplegar.

---

## 2. 🤖 IA Coach: arquitectura BYOK + Premium

### 2.1 Concepto

| Camino | Free user | Pro user |
|--------|-----------|----------|
| Origen del API key | El usuario pega su propia clave de Google AI Studio | Clave del proyecto (servidor) |
| Modelo | Gemini 2.0 Flash (gratis hasta cuotas de Google) | Gemini 2.0 Pro o Flash (decisión nuestra) |
| Cuota | Limitada por la cuota gratuita que Google le da | 200 créditos / mes (o lo que definas) |
| Costo para nosotros | $0 | Costo real de tokens × volumen |
| Esfuerzo del usuario | Crear key una vez en AI Studio | Ninguno |

### 2.2 BYOK: configuración por el usuario

**Página `/app/ajustes` → sección "AI Coach":**

- Texto explicativo: _"Para usar el coach IA en plan gratuito, trae tu propia API key de Google AI Studio. Es gratis y toma 1 minuto."_
- Botón **"Get your free API key"** → linkout a `https://aistudio.google.com/app/apikey` (target=_blank).
- Input password tipo `<input type="password">` para pegar la key.
- Botón **"Save"** → guarda en tabla `user_api_keys` con cifrado (ver §2.4).
- Botón **"Test"** → llama a edge function que valida la key con un prompt mínimo.
- Botón **"Delete key"** → borra de BD.

### 2.3 Tabla `user_api_keys` (nueva migración)

```sql
create table if not exists user_api_keys (
  profile_id uuid primary key references profiles(id) on delete cascade,
  provider text not null default 'google_ai',
  encrypted_key text not null,  -- pgsodium-encrypted
  key_hint text,                -- last 4 chars for UI display
  status text not null default 'active', -- active | invalid | revoked
  last_validated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table user_api_keys enable row level security;

create policy "uak_select_own" on user_api_keys for select
  using (auth.uid() = profile_id);
create policy "uak_upsert_own" on user_api_keys for insert
  with check (auth.uid() = profile_id);
create policy "uak_update_own" on user_api_keys for update
  using (auth.uid() = profile_id);
create policy "uak_delete_own" on user_api_keys for delete
  using (auth.uid() = profile_id);
```

### 2.4 Cifrado de la API key

Supabase ya cifra al disco (rest), pero conviene cifrado adicional con `pgsodium`:

```sql
-- En Supabase SQL Editor, una sola vez:
create extension if not exists pgsodium;

-- Crear key del proyecto (server-side, no exportar):
select pgsodium.create_key(name => 'user_api_keys_key');
```

En la edge function, al insertar:
```ts
// pseudocode
const encrypted = await supabase.rpc('pgsodium_encrypt',
  { plaintext: userKey, key_name: 'user_api_keys_key' })
await supabase.from('user_api_keys').insert({
  profile_id: user.id,
  encrypted_key: encrypted,
  key_hint: userKey.slice(-4),
})
```

> Alternativa más simple para MVP: guardar como texto y confiar en RLS + cifrado at-rest de Supabase. Es razonable. Cuando crezca la base, migrar a pgsodium.

### 2.5 Cuota Pro (`ai_usage_counters`)

Ya existe. Extender:
```sql
alter table ai_usage_counters
  add column if not exists window_start date not null default (date_trunc('month', now())::date);

-- Reset mensual: ejecutar cron en Supabase (Database → Cron jobs) cada 1ro del mes:
-- update ai_usage_counters set used_queries = 0, window_start = date_trunc('month', now())::date;
```

### 2.6 Edge functions de IA

#### `ai-coach` (POST, autenticado)
Endpoint genérico para todas las acciones del coach (analyze-week, adjust-plan, detect-fatigue).

Pseudocódigo:
```ts
serve(async (req) => {
  const user = await getUser(req)
  if (!user) return 401

  const { action, context } = await req.json()
  // action: 'analyze_week' | 'adjust_plan' | 'detect_fatigue'

  const sub = await getSubscription(user.id)
  let apiKey: string
  let model: string

  if (sub.tier === 'pro') {
    const usage = await getUsage(user.id)
    if (usage.used_queries >= sub.ai_quota_limit) {
      return 429 // quota exceeded
    }
    apiKey = Deno.env.get('GOOGLE_AI_API_KEY')!  // server-side key
    model = 'gemini-2.0-pro'
    await incrementUsage(user.id)
  } else {
    // Free user → BYOK
    const userKey = await getUserApiKey(user.id)
    if (!userKey) return 402 // payment required, must provide key
    apiKey = userKey
    model = 'gemini-2.0-flash'
  }

  const prompt = buildPromptForAction(action, context)
  const response = await callGeminiApi(apiKey, model, prompt)
  const proposal = parseProposal(response)

  // Save proposal as pending action for user to confirm
  await supabase.from('pending_ai_actions').insert({
    profile_id: user.id,
    action_type: action,
    summary: proposal.summary,
    payload: proposal,
    status: 'pending',
  })

  return json(proposal)
})
```

#### `ai-validate-key` (POST, autenticado)
Valida que una API key del usuario funcione.
```ts
const { key } = await req.json()
const test = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${key}`)
return json({ valid: test.ok })
```

### 2.7 Prompts del coach (esqueleto)

**`analyze_week`:**
> "Analiza el siguiente contexto de un atleta de [SPORT] para la semana del [DATE]:
> - CTL=X, ATL=Y, TSB=Z
> - Plan: [BLOCKS]
> - Ejecutado: [SESSIONS]
>
> Devuelve JSON: { summary, deviations[], recommendations[] }"

**`adjust_plan`:**
> "Plan actual: [PLAN]. Fatiga real: [TSB]. Próxima carrera: [DATE/EVENT].
> Propón modificaciones a [N=2] sesiones de la próxima semana en JSON: { changes: [{ session_id, original, proposed, reason }] }"

**`detect_fatigue`:**
> "Histórico 28 días: [SERIES]. Detecta señales de overtraining.
> Devuelve JSON: { risk_level: 'low'|'medium'|'high', signals[], recommendations[] }"

### 2.8 Frontend del AI Coach

Hoy las cards están "bloqueadas" cuando no hay datos. Cuando exista la edge function:
- Click en card → llama a `ai-coach`.
- Loading state.
- Resultado se renderiza en un drawer / modal con la propuesta.
- Botón "Aplicar" → marca `pending_ai_actions.status='accepted'` y aplica los cambios a `training_sessions`.
- Botón "Rechazar" → marca `rejected`.

---

## 3. 🗓️ Plan de implementación por fases

### Fase 1 — MVP de producción (✅ HECHO en main hoy)
- Auth Google + email
- Strava OAuth
- Dashboard real
- Training real
- AI Coach UI (sin motor)
- Landing v2

### Fase 2 — Cerrar el loop legal y de pago (1-2 semanas)
1. **Legal:** redactar Privacy Policy, Terms of Service, Cookie Policy. Recomendado: usar [Termly](https://termly.io) o [Iubenda](https://iubenda.com) (~$10/mes) o redactar y revisar con un abogado.
2. **Páginas legales:** `/privacy`, `/terms`, `/cookies` accesibles desde el footer de la landing y desde Settings.
3. **Cookie consent banner:** `vanilla-cookieconsent` o similar.
4. **Stripe integration:** todo lo de §1.
5. **Email transaccional:** para reset de password, confirmación de email, recibos de Stripe. Usar **Resend** (gratis 3k/mes), **Postmark** o **SendGrid**.
6. **Custom domain.**
7. **Analytics:** Vercel Analytics (built-in, $20/mes para Pro plan) o **PostHog** (gratis hasta 1M eventos).
8. **Error monitoring:** **Sentry** (gratis hasta 5k errores/mes).

### Fase 3 — IA funcional (2-3 semanas)
1. Tabla `user_api_keys`.
2. Edge function `ai-validate-key`.
3. UI en Settings para BYOK.
4. Edge function `ai-coach` con prompts iniciales.
5. UI de propuestas en `/app/ia-coach` con drawer.
6. Cron mensual de reset de cuota.

### Fase 4 — Editor de planes (3-4 semanas)
1. CRUD completo de `training_blocks` y `training_sessions` desde la app.
2. Vista de calendario con drag & drop.
3. Plantillas de plan por evento (5K, 10K, half, marathon, triatlón sprint/oly/half/full).
4. Importar plantilla → genera bloques + sesiones.

### Fase 5 — Apps móviles (4-6 semanas)
**Recomendación:** **React Native con Expo** para compartir el máximo de código del web.
- Pantallas nativas.
- Notificaciones push (workout de hoy, propuesta IA pendiente, achievement).
- Strava OAuth con deep linking.
- Stripe móvil (in-app purchases o Stripe SDK).
- Publicación: Apple Developer ($99/año) + Google Play ($25 una vez).

### Fase 6 — Más integraciones (continuo)
- Garmin Connect (OAuth)
- COROS API
- Wahoo Cloud
- iGPSPORT (cuando exista API)

### Fase 7 — Crecimiento y comunidad
- Programa de afiliados / referidos.
- Comunidades en Strava (clubes oficiales).
- Blog SEO con artículos de entrenamiento.
- Newsletter semanal con tips.
- Partnerships con coaches / equipos / marcas.

---

## 4. 💰 Costos mensuales estimados (1000 usuarios)

| Proveedor | Plan | Costo mensual |
|-----------|------|---------------|
| Vercel | Hobby (suficiente hasta ~10k visitas/día) | $0 (o $20 Pro si crece) |
| Supabase | Pro | $25 |
| Stripe | 2.9% + $0.30 por tx | ≈ 5% efectivo (depende volumen) |
| Resend | Free hasta 3k emails/mes | $0 |
| Sentry | Free hasta 5k errores | $0 |
| PostHog | Free hasta 1M eventos | $0 |
| Dominio | .com | ~$1.25/mes ($15/año) |
| AI inference (Pro users) | Gemini 2.0 Pro | ≈ $5-15/mes con 100 usuarios Pro |
| **TOTAL fijo** | | **~$50/mes** |

**Break-even:** 5 usuarios Pro a $10/mes cubren costos fijos. A partir de 10+ todo es margen.

---

## 5. 📝 Marketing y promoción (post-launch)

### 5.1 Producto — terminar antes de promocionar

- Captura de pantalla del dashboard real con datos.
- Demo video de 30-45s mostrando: login → conectar Strava → ver dashboard → AI Coach.
- App store screenshots (5-8 por plataforma).

### 5.2 Canales prioritarios

1. **Reddit:** r/AdvancedRunning, r/triathlon, r/Velo (ciclismo), r/Strava. Posts de _"I built X, here's why"_ funcionan bien si son honestos.
2. **Strava clubs:** crear club oficial Peak Endurance.
3. **Instagram + TikTok:** videos cortos mostrando insights del dashboard.
4. **Twitter/X:** comunidad #RunChat y de coaches.
5. **Product Hunt launch** cuando esté pulido (genera 500-2000 visits en 24h si va bien).
6. **Indie Hackers:** post de building in public.
7. **SEO:** artículos sobre TSS, CTL, ATL, plan de marathon, etc. Apuntar a long-tail.

### 5.3 Pricing psicológico

- **$10/mes** es estándar (TrainingPeaks $19.95, Strava Premium $79.99/año, etc).
- Considera **prueba gratis 7 días** sin tarjeta (Stripe lo soporta nativamente con `subscription_data.trial_period_days: 7`).
- Anual con 17% off como ancla.

### 5.4 Estrategia de freemium con BYOK

El BYOK es **una ventaja competitiva** en marketing:
- _"Usa nuestro IA Coach gratis con tu propia clave de Google AI Studio (te toma 1 min)"_
- Atrae early adopters técnicos que después se convierten en evangelistas.
- Filtra users que no entienden el producto.

---

## 6. ⚖️ Legal y compliance

### 6.1 Obligatorio antes de cobrar

- **Privacy Policy** (qué datos guardas, cómo, terceros, derechos del usuario, contacto)
- **Terms of Service** (precio, cancelación, refunds, propiedad intelectual, limitación de responsabilidad)
- **Cookie Policy** + banner si tienes usuarios EU
- **GDPR compliance:** botón "borrar mi cuenta" funcional + export de datos en JSON
- **Strava brand guidelines:** seguir [strava.com/policy/api-agreement](https://www.strava.com/legal/api). Mostrar "Powered by Strava" y logo correcto.
- **Disclaimer médico:** _"This is not medical advice. Consult a doctor before starting a training program."_

### 6.2 Recomendado

- DPA si tienes usuarios EU (Supabase ofrece uno).
- 2FA para admins.
- Pen test antes de scale (~$1-3k).

---

## 7. 🛠️ Configuración técnica detallada

### 7.1 Variables de entorno consolidadas

**Supabase Edge Functions Secrets** (Dashboard → Edge Functions → Secrets):
```
# Strava (✅ ya configurado)
STRAVA_CLIENT_ID
STRAVA_CLIENT_SECRET
STRAVA_REDIRECT_URI
APP_URL

# Stripe (📝 falta)
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_ID_PRO_MONTHLY
STRIPE_PRICE_ID_PRO_YEARLY

# AI / Pro tier (📝 falta)
GOOGLE_AI_API_KEY  # nuestra clave del proyecto, solo para Pro users

# Email (📝 falta)
RESEND_API_KEY
```

**Vercel env vars** (Settings → Environment Variables):
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_SITE_URL
VITE_STRIPE_PUBLISHABLE_KEY  # 📝 falta
```

### 7.2 Cron jobs en Supabase

Database → Cron jobs:
```sql
-- Reset mensual de cuota de IA (1ro de cada mes)
select cron.schedule(
  'reset-ai-quota',
  '0 0 1 * *',
  $$
    update ai_usage_counters
    set used_queries = 0,
        window_start = date_trunc('month', now())::date;
  $$
);

-- Limpiar oauth_states viejos (cada hora)
select cron.schedule(
  'clean-oauth-states',
  '0 * * * *',
  $$
    delete from strava_oauth_states
    where created_at < now() - interval '15 minutes';
  $$
);
```

### 7.3 Backups

- Supabase Pro hace backups diarios automáticamente (7 días retención).
- Considera export semanal a un bucket S3/R2 si quieres más historia.

---

## 8. 📂 Estructura del repo (futura)

```
peak-endurance/
├── apps/
│   ├── web/                  # React + Vite (✅ existe)
│   ├── mobile/               # React Native + Expo (📝 fase 5)
│   └── docs/                 # Astro/Next docs (opcional)
├── supabase/
│   ├── schema.sql
│   ├── seed.sql
│   ├── migrations/
│   │   ├── 0001_rls_and_imported_activities.sql       (✅)
│   │   ├── 0002_stripe_subscriptions.sql              (📝)
│   │   ├── 0003_user_api_keys.sql                     (📝)
│   │   └── 0004_ai_quota_reset_cron.sql               (📝)
│   └── functions/
│       ├── strava-auth/                               (✅)
│       ├── strava-sync/                               (✅)
│       ├── stripe-checkout/                           (📝)
│       ├── stripe-webhook/                            (📝)
│       ├── stripe-portal/                             (📝)
│       ├── ai-coach/                                  (📝)
│       └── ai-validate-key/                           (📝)
├── packages/
│   └── shared/               # tipos, utils compartidos web↔mobile (📝 fase 5)
├── docs/
│   ├── LAUNCH_PLAN.md        # ← este archivo
│   └── legacy/
├── README.md
├── frd.md
├── fdd.md
└── sdd peak endurance.md
```

---

## 9. 🚀 Próximos pasos en orden de prioridad

| # | Tarea | Bloquea | Estimado |
|---|-------|---------|----------|
| 1 | Fix Site URL en Supabase (§0.1) | Login funcional | 30s |
| 2 | Deploy edge functions Strava (§0.2) | Strava connect | 5 min |
| 3 | Activar Leaked Password Protection (§0.4) | Lint | 30s |
| 4 | Rotar STRAVA_CLIENT_SECRET (§0.3) | Seguridad | 2 min |
| 5 | Comprar custom domain | Promoción profesional | 30 min |
| 6 | Privacy Policy + ToS (Termly o equivalente) | Cobrar legalmente | 1 día |
| 7 | Stripe products + webhooks + edge functions | Recibir suscripciones | 3-5 días |
| 8 | UI de Settings → Plan + BYOK | Self-service de subscription | 2 días |
| 9 | Edge function `ai-coach` con prompt MVP | AI Coach funcional | 3-5 días |
| 10 | Pruebas E2E + soft-launch a beta users | Validación | 1 semana |
| 11 | Marketing: Reddit, IH, Product Hunt | Adquisición | continuo |
| 12 | Apps móviles | Mercado mobile | 4-6 semanas |

---

## 10. 🤝 Para continuar en otra plataforma

Este repo está listo para entrar a cualquier IDE / agente. Los lugares donde seguir el trabajo son:

| Tarea | Archivos a tocar |
|-------|------------------|
| Stripe checkout | Crear `supabase/functions/stripe-checkout/index.ts` siguiendo el patrón de `strava-auth` |
| Stripe webhook | Crear `supabase/functions/stripe-webhook/index.ts` con verificación de signing secret |
| BYOK UI | Editar `apps/web/src/pages/Settings.tsx` añadiendo sección "AI Coach Configuration" |
| AI Coach engine | Crear `supabase/functions/ai-coach/index.ts` |
| Subscription hook | Crear `apps/web/src/hooks/useSubscription.ts` paralelo a `useStrava.ts` |
| Cron jobs | SQL migrations en `supabase/migrations/0004_*.sql` |
| Apps móviles | Nuevo workspace `apps/mobile/` con Expo |

Convenciones del proyecto:
- TypeScript estricto activado (`strict: true`).
- React 19, no usar `JSX.Element` — usar `ReactNode` de React.
- Edge functions: Deno + `@supabase/supabase-js@2` desde esm.sh.
- Idempotente: toda migración SQL usa `if not exists` / `drop policy if exists`.
- Mobile-first: empezar CSS desde 320px y subir con `@media (min-width)`.
- I18n: español por defecto, sin acentos en strings (convenio del proyecto).
- Animaciones: framer-motion para componentes, `.reveal*` CSS classes para landing.
- Auth: solo Google + email/password. Tokens Supabase en localStorage.

---

## 📞 Contactos clave

- **Supabase project ref:** `uoxumppvhismnttfllzj`
- **GitHub repo:** `JORMS-FA/peak-endurance`
- **Branch principal:** `main`
- **Vercel deployment:** auto desde `main`

---

*Última actualización: 20 de junio de 2026*
*Owner: Jorman Fagua*
