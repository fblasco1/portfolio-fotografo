# Migración a API Orders - Guía de Despliegue

## Resumen

Esta guía documenta la migración exitosa de **Checkout API (v1/payments)** a **API Orders (v1/orders)** para el portfolio fotográfico.

## Cambios Implementados

### ✅ Fase 1: Backend (Completada)
- **`lib/payment/mercadopago.service.ts`**: Refactorizado con flujo de 2 pasos
  - Paso A: Crear orden (`v1/orders`)
  - Paso B: Asociar pago (`v1/payments`)
- **`app/types/payment.ts`**: Agregado `currency_id` opcional

### ✅ Fase 2: Webhooks (Completada)
- **`app/api/payment/webhook/mercadopago/route.ts`**: 
  - Nueva función `processOrderNotification`
  - Nueva función `processApprovedOrder`
  - Nueva función `extractProductsFromOrder`
  - Actualizado switch para manejar `topic_merchant_order_wh`

### ✅ Fase 3: Frontend (Completada)
- **`components/payment/PaymentForm.tsx`**:
  - Agregado `currency_id` al payload
  - Mejorado manejo de errores específicos de órdenes

### ✅ Fase 4: Despliegue (En Progreso)
- **`app/api/payment/v2/create-payment/route.ts`**: Nuevo endpoint v2
- **`scripts/test-orders-api.js`**: Script de pruebas

## Estrategia de Despliegue

### Opción A: Versionado de Endpoints (IMPLEMENTADA)

1. **Endpoint v2 creado**: `/api/payment/v2/create-payment`
2. **Frontend sin cambios**: Mantiene compatibilidad
3. **Webhook actualizado**: Maneja ambos tipos de notificación

### Pasos para Activar

#### 1. Configurar Webhook en Mercado Pago
```bash
# En el panel de Mercado Pago (Sandbox/Producción):
URL: https://TU_DOMINIO/api/payment/webhook/mercadopago
Eventos: 
- topic_merchant_order_wh ✅ (activar)
- payment ✅ (mantener para compatibilidad)
```

#### 2. Cambiar Frontend a v2
```typescript
// En components/payment/PaymentForm.tsx, línea 182:
const response = await fetch('/api/payment/v2/create-payment', {
```

#### 3. Probar en Sandbox
```bash
# Ejecutar script de pruebas
node scripts/test-orders-api.js

# Probar con tarjetas de Sandbox:
# Aprobada: 5031 7557 3453 0604 (CVV: 123, Vence: 11/25)
# Rechazada: 5031 4332 1540 6351 (CVV: 123, Vence: 11/25)
```

#### 4. Verificar en Panel de MP
- ✅ Deben aparecer **ÓRDENES** y **PAGOS** vinculados
- ✅ Webhooks llegan como `topic_merchant_order_wh`
- ✅ Emails se envían correctamente

#### 5. Migración Final (Después de 1-2 semanas de monitoreo)
```bash
# Reemplazar contenido de v1 con v2
cp app/api/payment/v2/create-payment/route.ts app/api/payment/create-payment/route.ts

# Revertir frontend a ruta original
# En PaymentForm.tsx:
const response = await fetch('/api/payment/create-payment', {

# Eliminar endpoint v2
rm -rf app/api/payment/v2/
```

## Flujo de Datos

### Antes (Checkout API)
```
Frontend → /api/payment/create-payment → v1/payments → Webhook (payment)
```

### Después (API Orders)
```
Frontend → /api/payment/v2/create-payment → v1/orders → v1/payments → Webhook (topic_merchant_order_wh)
```

## Consideraciones Técnicas

### 1. Idempotencia
- **Órdenes**: `X-Idempotency-Key: order_{orderId}_{timestamp}`
- **Pagos**: `X-Idempotency-Key: payment_{orderId}_{timestamp}`
- **Comportamiento**: Si falla el pago, se crea nueva orden en reintento

### 2. Webhooks
- **`topic_merchant_order_wh`**: Notificación principal (llega después)
- **`payment`**: Mantenido para compatibilidad durante transición
- **Prioridad**: `topic_merchant_order_wh` tiene información completa

### 3. Órdenes Huérfanas
- **Escenario**: Orden creada, pago falla
- **Impacto**: Mínimo (no hay cobro)
- **Mitigación futura**: Job para cancelar órdenes `pending` > 1 hora

### 4. Compatibilidad
- **Frontend**: Sin cambios en interfaz pública
- **Tipos**: `PaymentResponse` mantiene compatibilidad
- **Webhooks**: Ambos tipos manejados durante transición

## Monitoreo Post-Despliegue

### Métricas a Verificar
- [ ] Logs de webhooks durante primeras 48 horas
- [ ] Panel de MP: órdenes y pagos vinculados
- [ ] Emails enviados correctamente
- [ ] Tiempo de respuesta del endpoint v2
- [ ] Tasa de errores vs endpoint v1

### Alertas Recomendadas
- Webhook `topic_merchant_order_wh` no llega
- Órdenes creadas sin pagos asociados
- Errores en `processApprovedOrder`
- Tiempo de respuesta > 5 segundos

## Rollback

### Si es Necesario Revertir
```bash
# Opción 1: Cambiar frontend a v1
# En PaymentForm.tsx:
const response = await fetch('/api/payment/create-payment', {

# Opción 2: Desactivar webhook topic_merchant_order_wh en panel de MP
```

## Archivos Modificados

### Nuevos Archivos
- `app/api/payment/v2/create-payment/route.ts`
- `scripts/test-orders-api.js`
- `docs/orders-api-migration.md`

### Archivos Modificados
- `lib/payment/mercadopago.service.ts`
- `app/types/payment.ts`
- `app/api/payment/webhook/mercadopago/route.ts`
- `components/payment/PaymentForm.tsx`

## Próximos Pasos

1. **Configurar webhook** en panel de Mercado Pago
2. **Cambiar frontend** a endpoint v2
3. **Probar en Sandbox** con tarjetas de prueba
4. **Monitorear producción** durante 1-2 semanas
5. **Migración final** reemplazando v1 con v2
6. **Limpieza** eliminando endpoint v2

---

**Fecha de Implementación**: $(date)  
**Versión**: API Orders v3.0.0  
**Estado**: ✅ Listo para despliegue
