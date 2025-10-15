# 🔗 Configuración de Webhook de Mercado Pago

## 📋 **Configuración en el Panel de Mercado Pago**

### **1. Acceder al Panel de Desarrolladores**
1. Ve a [Mercado Pago Developers](https://www.mercadopago.com/developers/panel/app)
2. Selecciona tu aplicación
3. Ve a la sección **"Notificaciones webhook"**

### **2. Configurar Webhook de Producción**

#### **URL del Webhook:**
```
https://tu-dominio.com/api/payment/webhook/mercadopago
```

#### **Eventos a Suscribir:**
- ✅ **payment** - Notificaciones de pagos
- ✅ **merchant_order** - Notificaciones de órdenes

#### **Configuración Adicional:**
- **Método HTTP**: POST
- **Formato**: JSON
- **Autenticación**: HMAC (configurar secret)

### **3. Obtener Webhook Secret**
1. Después de configurar el webhook, Mercado Pago generará un **Webhook Secret**
2. Copia este secret y configúralo en tu variable de entorno:
```bash
MERCADOPAGO_WEBHOOK_SECRET=tu_webhook_secret_aqui
```

## 🧪 **Testing del Webhook**

### **1. Usando ngrok (Desarrollo)**
```bash
# Instalar ngrok
npm install -g ngrok

# Exponer tu servidor local
ngrok http 3000

# Usar la URL de ngrok en Mercado Pago
# Ejemplo: https://abc123.ngrok.io/api/payment/webhook/mercadopago
```

### **2. Simular Notificaciones**
1. En el panel de Mercado Pago, ve a **"Notificaciones webhook"**
2. Haz clic en **"Probar notificación"**
3. Selecciona el evento **"payment"**
4. Ingresa un ID de pago de prueba
5. Verifica que la notificación llegue correctamente

### **3. Verificar Logs**
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
1. Verificar que la URL sea accesible desde internet
2. Verificar que el endpoint responda con 200 OK
3. Revisar logs del servidor
4. Verificar configuración en el panel de Mercado Pago

### **Problema: Webhook llega pero falla**
**Soluciones:**
1. Verificar logs de error en el servidor
2. Verificar variables de entorno
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
- [ ] URL del webhook accesible desde internet
- [ ] Eventos "payment" y "merchant_order" suscritos
- [ ] Webhook Secret configurado en variables de entorno
- [ ] Validación HMAC funcionando
- [ ] Webhook responde en menos de 5 segundos
- [ ] Emails se envían correctamente
- [ ] Logs de webhook funcionando
- [ ] Testing con pagos de prueba completado
- [ ] Monitoreo y alertas configurados

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
