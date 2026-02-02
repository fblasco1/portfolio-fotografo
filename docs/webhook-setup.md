# 🔗 Configuración de Webhook de Mercado Pago

Este proyecto usa **Checkout API con Orders API v2**. La `notification_url` se envía en cada orden y el webhook se configura en el panel de Mercado Pago para recibir notificaciones de órdenes y pagos.

## 📋 **Configuración**

### **1. Configuración Automática en Código**
El webhook se configura automáticamente en el código cuando se crea cada pago:

```typescript
// En lib/payment/mercadopago.service.ts
private getNotificationUrl(): string | null {
  // Solo en producción
  if (!this.baseUrl || this.baseUrl.includes('localhost')) {
    return null;
  }

  const webhookUrl = `${this.baseUrl}/api/payment/webhook/mercadopago`;
  const params = new URLSearchParams({
    source_news: 'webhooks',
    integration_type: 'orders_api',
    version: '3.0.0'
  });

  return `${webhookUrl}?${params.toString()}`;
}
```

### **2. Configurar en el panel de Mercado Pago**

1. Ir a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers) → Tu integración → Tu aplicación.
2. Ir a **"Notificaciones webhooks"**.
3. Clic en **"Configurar notificaciones"**.
4. URL: `https://tu-dominio.com/api/payment/webhook/mercadopago`
5. Eventos: **Pagos** y **Órdenes comerciales** (topic_merchant_order_wh).
6. Guardar.

### **3. Eventos manejados**
- **payment** – Notificaciones de pagos
- **topic_merchant_order_wh** – Notificaciones de órdenes (Orders API)

### **4. Variables de Entorno Requeridas**
```bash
# URL base de tu aplicación (para generar notification_url)
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com

# Webhook Secret para validación (opcional pero recomendado)
MERCADOPAGO_WEBHOOK_SECRET=tu_webhook_secret_aqui
```

## 🧪 **Testing del Webhook**

### **1. Testing en Desarrollo (Localhost)**
```bash
# En desarrollo, los webhooks NO se configuran automáticamente
# Para testing, usar ngrok:

# Instalar ngrok
npm install -g ngrok

# Exponer tu servidor local
ngrok http 3000

# Configurar temporalmente la URL de ngrok en .env.local
NEXT_PUBLIC_BASE_URL=https://abc123.ngrok.io
```

### **2. Testing en Producción**
```bash
# En producción, los webhooks se configuran automáticamente
# Solo necesitas configurar:
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com

# Los webhooks se configurarán automáticamente en cada pago
```

### **3. Verificar Configuración**
```bash
# Verificar que la notification_url se genere correctamente
# En los logs de desarrollo verás:
# notification_url: https://tu-dominio.com/api/payment/webhook/mercadopago?source_news=webhooks&integration_type=checkout_api&version=2.0.0
```

### **4. Verificar Logs**
```bash
# En tu servidor, verifica los logs del webhook
tail -f logs/webhook.log

# O en la consola de tu aplicación
# Deberías ver logs como:
# ✅ Webhook recibido: payment
# ✅ Pago procesado: 123456789
# ✅ Email enviado al fotógrafo
```

## 🔒 **Validación de Seguridad**

### **1. Validación HMAC**
El webhook incluye validación HMAC para verificar la autenticidad:

```typescript
// El webhook valida automáticamente la firma
const isValid = validateWebhookSignature(payload, signature, secret);
```

### **2. Validación de Origen**
- Solo acepta notificaciones de Mercado Pago
- Valida la estructura del payload
- Verifica que el evento sea válido

## 📊 **Monitoreo del Webhook**

### **1. Logs de Webhook**
```typescript
// Logs automáticos en el webhook
console.log('Webhook recibido:', {
  event: payload.type,
  paymentId: payload.data?.id,
  timestamp: new Date().toISOString()
});
```

### **2. Métricas Importantes**
- **Tasa de éxito**: % de webhooks procesados correctamente
- **Tiempo de respuesta**: < 5 segundos recomendado
- **Errores**: Monitorear fallos en el procesamiento

### **3. Alertas**
Configurar alertas para:
- Webhooks fallidos
- Tiempo de respuesta alto
- Errores de validación

## 🚨 **Resolución de Problemas**

### **Problema: Webhook no llega**
**Soluciones:**
1. Verificar que la URL esté configurada en el panel de Mercado Pago
2. Verificar que la URL sea accesible desde internet (HTTPS)
3. Verificar que el endpoint responda con 200 OK
4. Revisar logs del servidor
5. Confirmar que los eventos "Pagos" y "Órdenes comerciales" estén seleccionados

### **Problema: Webhook llega pero falla**
**Soluciones:**
1. Verificar logs de error en el servidor
2. Verificar variables de entorno (`NEXT_PUBLIC_BASE_URL`)
3. Verificar conexión a servicios externos (Resend, Sanity)
4. Verificar validación HMAC

### **Problema: Emails no se envían**
**Soluciones:**
1. Verificar `RESEND_API_KEY`
2. Verificar `RESEND_FROM_EMAIL`
3. Verificar que el dominio esté verificado en Resend
4. Revisar logs de Resend

## 📝 **Comandos de Verificación**

### **Verificar Webhook Localmente**
```bash
# Usar ngrok para testing
ngrok http 3000

# Configurar webhook en Mercado Pago con URL de ngrok
# Hacer un pago de prueba
# Verificar que llegue la notificación
```

### **Verificar Webhook en Producción**
```bash
# Verificar que el endpoint responda
curl -X POST https://tu-dominio.com/api/payment/webhook/mercadopago \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'

# Debería responder con 400 (Bad Request) pero no 404 (Not Found)
```

### **Verificar Variables de Entorno**
```bash
# Verificar que todas las variables estén configuradas
echo $MERCADOPAGO_WEBHOOK_SECRET
echo $RESEND_API_KEY
echo $RESEND_FROM_EMAIL
```

## ✅ **Checklist de Webhook**

- [ ] Webhook configurado en panel de Mercado Pago
- [ ] URL correcta: `https://tu-dominio.com/api/payment/webhook/mercadopago`
- [ ] Eventos: Pagos + Órdenes comerciales
- [ ] `NEXT_PUBLIC_BASE_URL` configurado (para notification_url en órdenes)
- [ ] Validación HMAC funcionando
- [ ] Webhook responde en menos de 5 segundos
- [ ] Emails se envían correctamente
- [ ] Logs de webhook funcionando
- [ ] Testing con pagos de prueba completado
- [ ] Monitoreo y alertas configurados
- [ ] Verificar que `notification_url` se genere automáticamente en cada pago

## 🔄 **Reintentos de Mercado Pago**

Mercado Pago reintenta automáticamente los webhooks fallidos:
- **Primer reintento**: 1 minuto
- **Segundo reintento**: 5 minutos
- **Tercer reintento**: 15 minutos
- **Cuarto reintento**: 1 hora
- **Quinto reintento**: 4 horas
- **Sexto reintento**: 24 horas

**Importante**: Si el webhook falla 6 veces, Mercado Pago deja de intentar.

## 📞 **Soporte**

Si tienes problemas con el webhook:
1. Revisar logs del servidor
2. Verificar configuración en el panel de Mercado Pago
3. Contactar soporte de Mercado Pago si es necesario
4. Verificar documentación oficial: [Webhooks de Mercado Pago](https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks)
