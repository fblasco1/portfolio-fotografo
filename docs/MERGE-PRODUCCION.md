# Verificación Pre-Merge a Producción

Checklist rápido antes de hacer merge a la rama de producción.

## Variables en Vercel (ya cargadas)

Verificar que estén configuradas:

| Variable | Requerida |
|----------|-----------|
| `NEXT_PUBLIC_BASE_URL` | ✅ URL de producción (ej. https://cristianpirovano.com) |
| `MERCADOPAGO_ACCESS_TOKEN` | ✅ APP_USR-... |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | ✅ APP_USR-... |
| `MERCADOPAGO_WEBHOOK_SECRET` | ✅ Para validar webhooks |
| `NEXT_PUBLIC_SANITY_*` | ✅ Sanity configurado |
| `RESEND_API_KEY` | ✅ Para emails |
| `RESEND_FROM_EMAIL` | ✅ Formato: Nombre <email@dominio.com> |
| `PHOTOGRAPHER_EMAIL` | ✅ Email que recibe ventas y contacto |
| `NEXT_PUBLIC_SUPABASE_*` | ✅ Auth admin |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ |

## Webhook en Mercado Pago

- URL: `{NEXT_PUBLIC_BASE_URL}/api/payment/webhook/mercadopago`
- Eventos: Pagos + Órdenes comerciales

## Migración Supabase (obligatoria)

Antes del deploy, ejecutar en Supabase SQL Editor:

```sql
-- Contenido de supabase/migrations/002_add_payer_and_payment_to_orders.sql
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payer JSONB DEFAULT '{}'::jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_info JSONB DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS idx_orders_mercadopago_order_id ON orders(mercadopago_order_id);
```

O: `npx supabase db push`

## Build

```bash
npm run build
```

## Post-merge

1. Verificar que el deploy en Vercel complete sin errores
2. Probar login en `/admin/login`
3. Probar un pago de prueba (monto bajo)
4. Verificar que lleguen los emails
