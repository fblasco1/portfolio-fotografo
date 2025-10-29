# Checklist de Configuración de Webhook - Mercado Pago

## ✅ Configuración Completada

### 1. URL del Webhook Configurada
- **URL de Producción**: `https://cristianpirovano.com/api/payment/webhook/mercadopago`
- **URL Completa con Parámetros**: `https://cristianpirovano.com/api/payment/webhook/mercadopago?source_news=webhooks&integration_type=orders_api&version=3.0.0`
- **Estado**: ✅ Configurada en el código

### 2. Eventos Configurados
- **`payment`**: Notificaciones de pagos (compatibilidad)
- **`topic_merchant_order_wh`**: Notificaciones de órdenes (API Orders)
- **Estado**: ✅ Configurado en el código

### 3. Código Actualizado
- **Servicio de Mercado Pago**: ✅ Actualizado con URL de producción
- **Documentación**: ✅ Actualizada con instrucciones
- **Script de Configuración**: ✅ Creado

## 🔧 Pasos Pendientes (Manual)

### 1. Configurar en Panel de Mercado Pago
- [ ] Ir a https://www.mercadopago.com.ar/developers
- [ ] Iniciar sesión con cuenta de Mercado Pago
- [ ] Seleccionar la aplicación
- [ ] Ir a "Notificaciones webhooks"
- [ ] Hacer clic en "Configurar notificaciones"
- [ ] Ingresar URL: `https://cristianpirovano.com/api/payment/webhook/mercadopago`
- [ ] Seleccionar eventos: "Pagos" y "Órdenes comerciales"
- [ ] Guardar configuración

### 2. Verificar Configuración
- [ ] El webhook aparece como "Activo"
- [ ] La URL es correcta
- [ ] Los eventos están seleccionados

### 3. Probar Webhook
- [ ] Realizar transacción de prueba en sandbox
- [ ] Verificar que llegue la notificación
- [ ] Revisar logs del servidor

## 🧪 Pruebas Recomendadas

### 1. Prueba de Conectividad
```bash
# Ejecutar script de prueba
node scripts/configure-webhook-production.js
```

### 2. Prueba de Transacción
1. Realizar pago de prueba con tarjeta de sandbox
2. Verificar que se cree la orden
3. Verificar que se procese el pago
4. Verificar que llegue la notificación webhook

### 3. Verificación de Logs
```bash
# Buscar logs de webhook
grep "webhook" logs/app.log

# Buscar logs de pago
grep "💳 Procesando pago" logs/app.log

# Buscar errores
grep "❌ Error" logs/app.log
```

## 📊 Monitoreo Post-Configuración

### Métricas a Verificar
- [ ] Tasa de entrega de webhooks
- [ ] Tiempo de respuesta del endpoint
- [ ] Errores de webhook
- [ ] Volumen de notificaciones

### Alertas Recomendadas
- [ ] Webhook no responde (HTTP != 200)
- [ ] Tiempo de respuesta > 5 segundos
- [ ] Errores de procesamiento de webhook
- [ ] Falta de notificaciones por más de 1 hora

## 🔒 Consideraciones de Seguridad

### Validaciones Implementadas
- [x] Validación de datos del pagador
- [x] Sanitización de entrada
- [x] Manejo seguro de errores
- [x] Logging sin datos sensibles

### Recomendaciones Adicionales
- [ ] Implementar validación de firma de webhook
- [ ] Configurar idempotencia para notificaciones duplicadas
- [ ] Implementar rate limiting
- [ ] Configurar monitoreo de seguridad

## 📞 Soporte y Troubleshooting

### Enlaces Útiles
- **Documentación**: https://www.mercadopago.com.ar/developers
- **Soporte**: https://www.mercadopago.com.ar/ayuda
- **Estado del Servicio**: https://status.mercadopago.com/

### Errores Comunes
1. **Webhook no llega**: Verificar URL y configuración
2. **Error 404**: Verificar que el endpoint existe
3. **Error 500**: Revisar logs del servidor
4. **Timeout**: Verificar conectividad y rendimiento

## ✅ Checklist Final

- [ ] Webhook configurado en panel de Mercado Pago
- [ ] URL correcta configurada
- [ ] Eventos seleccionados correctamente
- [ ] Prueba de conectividad exitosa
- [ ] Transacción de prueba exitosa
- [ ] Webhook recibido correctamente
- [ ] Logs verificados
- [ ] Monitoreo configurado
- [ ] Documentación actualizada

---

**Fecha de Configuración**: 29 de Octubre de 2024  
**Responsable**: Portfolio Fotográfico Team  
**Estado**: En Progreso - Pendiente configuración manual en panel de Mercado Pago
