# Checklist de Calidad - Producción Mercado Pago

Verificación para superar la medición de calidad de Mercado Pago (mín. 73 pts) y cómo medir tras un pago de producción.

## Estado actual

| Criterio | Implementado |
|----------|--------------|
| Payer completo (email, nombre, apellido, teléfono) | ✅ |
| Dirección completa | ✅ CheckoutPage + sanitizePayerAddress |
| External reference único | ✅ |
| category_id válido (art/others) | ✅ |
| notification_url | ✅ |
| Webhook con firma | ✅ |

## Verificaciones pre-producción

- **Variables**: `MERCADOPAGO_ACCESS_TOKEN`, `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` (APP_USR-), `MERCADOPAGO_WEBHOOK_SECRET`, `NEXT_PUBLIC_BASE_URL`
- **Webhook**: Panel MP → Notificaciones → URL `https://tu-dominio.com/api/payment/webhook/mercadopago` → Eventos: Pagos + Órdenes comerciales

## Cómo medir la calidad

1. Realizar un **pago real** (monto bajo) completando todos los campos.
2. Anotar el **Payment ID** del pago aprobado.
3. [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/panel/app) → Tu app → **Medir calidad** → pegar Payment ID.
4. Resultado: **73-100** ✅ | **46-72** ⚠️ | **0-45** ❌

Puntuación esperada con la configuración actual: **73+ pts**.

## Si la puntuación sigue baja

1. Revisar detalle por aspecto en el resultado.
2. Cumplir acciones obligatorias indicadas.
3. Contactar soporte MP si hay dudas.
