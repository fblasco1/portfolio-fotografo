# ✅ Checklist de Calidad - Producción Mercado Pago

## Objetivo
Verificar que la integración cumple los requisitos para superar la medición de calidad de Mercado Pago (mínimo 73 pts) antes de desplegar, y conocer cómo medir la calidad tras un pago de producción.

---

## 📊 Estado actual de la integración

| Criterio | Implementado | Ubicación |
|----------|--------------|-----------|
| **Payer completo** (email, nombre, apellido) | ✅ | CheckoutPage + PaymentForm |
| **Identificación** (DNI/tipo) | ✅ | CardForm + PaymentForm |
| **Teléfono** | ✅ | CheckoutPage (required) + PaymentForm |
| **Dirección** (calle, número, ciudad, CP) | ✅ | CheckoutPage (required) + sanitizePayerAddress |
| **External reference** único | ✅ | `order_${timestamp}_${random}_${items}items` |
| **Items con category_id válido** | ✅ | `art` (fotos) / `others` (postales) |
| **notification_url** | ✅ | getNotificationUrl() → cristianpirovano.com |
| **Webhook con firma** | ✅ | validateWebhookSignature en route |

---

## ⚠️ Pago que obtuvo 46 pts

El pago que Mercado Pago evaluó mostraba:
- `category_id: "photography"` → **Inválido**. Nuestra integración usa `art` y `others`.
- `payer` con campos null → Posible pago de prueba automática de MP o integración antigua.

**Con la configuración actual**, un pago real de tu checkout debería enviar todos los datos correctos.

---

## 🔧 Verificaciones antes de producción

### 1. Variables de entorno (Vercel/producción)

```
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-...
MERCADOPAGO_WEBHOOK_SECRET=...        ← Obligatorio para validar webhooks
NEXT_PUBLIC_BASE_URL=https://cristianpirovano.com
```

### 2. Webhook en panel de Mercado Pago

- **URL**: `https://cristianpirovano.com/api/payment/webhook/mercadopago`
- **Eventos**: payment, merchant_order (según integración)
- Configurar en: Tus integraciones → Tu app → Webhooks

### 3. Credenciales

- Usar **siempre** credenciales de producción (APP_USR-) en producción
- Public Key y Access Token del **mismo par** de credenciales

---

## 📋 Pasos para la próxima evaluación

1. **Desplegar** a producción con las variables configuradas.
2. **Realizar un pago real** (monto bajo) completando todos los campos:
   - Email, nombre, apellido
   - Teléfono
   - Dirección completa
3. **Anotar el Payment ID** del pago aprobado.
4. **Medir calidad** en el panel de MP:
   - Tus integraciones → Tu app → Medir calidad
   - Pegar el Payment ID
   - Clic en "Medir la calidad"

---

## 🎯 Resultado esperado

Con la configuración actual:
- Payer completo (email, nombre, apellido, teléfono, dirección)
- category_id válido (art/others)
- external_reference único
- notification_url configurada
- Webhook funcional

**Puntuación esperada**: 73+ pts (objetivo 85–100).

---

---

## 📋 Cómo medir la calidad (pasos en el panel)

1. Ir a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/panel/app) → Tu integración → Tu aplicación.
2. En "Detalles de la aplicación", buscar la sección **"Status"** o **"Medición de calidad"**.
3. Clic en **"Iniciar medición"** (primera vez) o **"Medir de nuevo"**.
4. Pegar el **Payment ID** del pago de producción realizado.
5. Clic en **"Medir la calidad"** y esperar el resultado.

### Interpretación

| Puntuación | Resultado |
|------------|-----------|
| 73-100 | ✅ Aprobado (objetivo) |
| 46-72 | ⚠️ Necesita mejoras |
| 0-45 | ❌ No aprobado |

---

## ❓ Si la puntuación sigue baja

1. Revisar el **detalle por aspecto** en el resultado de MP.
2. Cumplir las **acciones obligatorias** indicadas.
3. Implementar las **acciones recomendadas** que apliquen.
4. Contactar soporte de Mercado Pago si hay dudas específicas.
