# Corrección: Error "order.type can't be null"

## 🔍 **Problema Identificado**

**Error:** `order.type can't be null`

**Causa:** Al asociar un pago a una orden en el segundo paso del flujo de API Orders, solo se estaba enviando el `id` de la orden, pero Mercado Pago también requiere el campo `type`.

## ✅ **Solución Implementada**

### **Antes (Incorrecto):**
```typescript
order: {
  id: mercadopagoOrderId,
},
```

### **Después (Correcto):**
```typescript
order: {
  id: mercadopagoOrderId,
  type: 'online', // ✅ Requerido: tipo de orden
},
```

## 📋 **Cambios Realizados**

### 1. **Corrección en `createPayment`**
- Agregado campo `type: 'online'` en la asociación de pago a orden
- Mantiene consistencia con el tipo de orden creada en el primer paso

### 2. **Caso de Prueba Agregado**
```typescript
test('createPayment debería incluir order.type en el payload del pago', async () => {
  // ... setup mocks ...
  
  await provider.createPayment(mockPaymentData);
  
  const paymentCall = (global.fetch as jest.Mock).mock.calls[1][1];
  const paymentPayload = JSON.parse(paymentCall.body);
  expect(paymentPayload.order.id).toBe(12345);
  expect(paymentPayload.order.type).toBe('online'); // ✅ Verificar que order.type esté incluido
});
```

### 3. **Documentación Actualizada**
- Agregada sección sobre asociación de pago a orden
- Especificado que `order.type` siempre debe ser "online"

## 🎯 **Resultado Esperado**

Con esta corrección:
- ✅ El error `order.type can't be null` se resuelve
- ✅ El pago se asocia correctamente a la orden
- ✅ El flujo completo de API Orders funciona correctamente
- ✅ Se mantiene la consistencia en el tipo de orden

## 🧪 **Flujo Completo Verificado**

1. **Paso 1 - Crear Orden:**
   ```typescript
   {
     type: 'online',
     items: [...],
     total_amount: '200',
     external_reference: 'order_123',
     transactions: { payments: [...] },
     payer: {...}
   }
   ```

2. **Paso 2 - Crear Pago:**
   ```typescript
   {
     token: 'token_123',
     transaction_amount: 200,
     installments: 1,
     order: {
       id: 'ORD123',
       type: 'online' // ✅ Ahora incluido
     },
     payer: {...}
   }
   ```

## 📊 **Logs Esperados**

### **Antes (Error):**
```
❌ Error creando pago con mercadopago: Error: No se pudo procesar el pago: Error de Mercado Pago: order.type can't be null
```

### **Después (Éxito):**
```
✅ Pago procesado con API Orders v2: {
  id: 'PAY123',
  status: 'approved',
  status_detail: 'accredited',
  amount: 200
}
```

## 🔧 **Validación**

Para verificar que la corrección funciona:

1. **Probar con tarjeta de débito** (`debvisa`)
2. **Verificar logs** - no debe aparecer el error `order.type can't be null`
3. **Confirmar pago exitoso** - status debe ser `approved`
4. **Verificar webhook** - debe recibir notificación de pago

La corrección es mínima pero crítica para el funcionamiento correcto del flujo de API Orders.
