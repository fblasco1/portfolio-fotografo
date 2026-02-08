# Flujo de Órdenes y Persistencia en Supabase

Documentación del flujo de órdenes: creación, persistencia y actualización vía webhooks.

---

## 1. Resumen

La información del cliente (payer) **no puede obtenerse** desde la API de Mercado Pago después de crear la orden (los IDs `PAY01...` de Online Payments no son compatibles con `GET /v1/payments/{id}`). Por eso:

1. **Al crear la orden**: se persiste toda la información en Supabase
2. **Webhooks**: actualizan solo el estado cuando Mercado Pago notifica cambios

---

## 2. Flujo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  CREACIÓN (Checkout)                                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. Usuario completa pago en checkout                                       │
│  2. POST /api/payment/v2/create-payment → MercadoPagoProvider.createPayment │
│  3. createOrder() → POST /v1/orders (Mercado Pago)                          │
│  4. saveOrderAtCreation() → INSERT en Supabase (payer, payment_info, items) │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  WEBHOOKS (Actualización de estado)                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│  1. Mercado Pago envía POST al webhook (order processed, refunded, etc.)    │
│  2. processOrderNotification() → GET /v1/orders/{id} (obtiene orden MP)     │
│  3. saveOrUpdateOrderFromOnlinePaymentOrder():                              │
│     - Busca orden existente por payment_id o mercadopago_order_id           │
│     - Si existe: UPDATE status, status_detail, updated_at                   │
│     - Si no existe: INSERT (fallback por si falló la persistencia al crear) │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  ADMIN                                                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  - Lista órdenes: GET /api/admin/orders → Lee desde Supabase                │
│  - Detalle orden: GET /api/admin/orders/[id] → Lee desde Supabase           │
│  - Reembolso: POST /api/admin/orders/[id]/refund → API Mercado Pago         │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Tabla `orders` en Supabase

### Columnas principales

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID | ID interno (PK) |
| `mercadopago_order_id` | TEXT | ID de la orden en MP (ORD01...) |
| `payment_id` | TEXT | ID del pago en MP (PAY01...) |
| `payer` | JSONB | Objeto completo del pagador (name, email, phone, address, identification) |
| `payment_info` | JSONB | Datos del pago (status, status_detail, amount, date_approved) |
| `customer_email` | TEXT | Email del cliente |
| `customer_name` | TEXT | Nombre completo |
| `customer_phone` | TEXT | Teléfono |
| `status` | TEXT | pending, approved, rejected, in_process, cancelled, refunded |
| `items` | JSONB | Array de items del carrito |
| `created_at` | TIMESTAMPTZ | Fecha de creación |
| `updated_at` | TIMESTAMPTZ | Última actualización |

### Migraciones

- `001_create_orders_tables.sql`: Tabla base
- `002_add_payer_and_payment_to_orders.sql`: Columnas `payer`, `payment_info` e índice en `mercadopago_order_id`

---

## 4. Archivos clave

| Archivo | Responsabilidad |
|---------|-----------------|
| `lib/orders/supabase-orders.ts` | `saveOrderAtCreation()` - Persiste orden al crear |
| `lib/payment/mercadopago.service.ts` | Llama a `saveOrderAtCreation()` tras `createOrder()` |
| `app/api/payment/webhook/mercadopago/route.ts` | `saveOrUpdateOrderFromOnlinePaymentOrder()` - Actualiza por webhook |
| `app/api/admin/orders/route.ts` | Lee órdenes desde Supabase |
| `app/api/admin/orders/[id]/route.ts` | Lee detalle desde Supabase |

---

## 5. Estados de órdenes (Online Payments)

| Status MP | Status en Supabase |
|-----------|--------------------|
| `processed` | approved |
| `refunded` | refunded |
| `canceled` | cancelled |
| `failed` | rejected |
| `created`, `open` | pending |
| `processing`, `action_required` | in_process |

---

## 6. Despliegue

Antes de desplegar:

1. Ejecutar migración `002_add_payer_and_payment_to_orders.sql` en Supabase (SQL Editor o `npx supabase db push`)
2. Verificar que `SUPABASE_SERVICE_ROLE_KEY` esté configurado
3. Los webhooks deben tener configurado el evento **order** (Órdenes comerciales)
