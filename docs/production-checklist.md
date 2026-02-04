# 🚀 Checklist para Despliegue en Producción

## ✅ **1. Variables de Entorno**

### **Frontend (.env.local)**
```bash
# Mercado Pago - Producción (ambos deben ser APP_USR- del mismo par)
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxx

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=tu_proyecto_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01
```

### **Backend (.env.local)**
```bash
# Mercado Pago - Producción
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxxxxxx
MERCADOPAGO_WEBHOOK_SECRET=tu_webhook_secret

# Resend (Emails)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=Ventas <noreply@tudominio.com>
PHOTOGRAPHER_EMAIL=tu-email@gmail.com

# Sanity CMS
SANITY_PROJECT_ID=tu_proyecto_id
SANITY_DATASET=production
SANITY_API_TOKEN=tu_api_token

# Base URL de producción
NEXT_PUBLIC_BASE_URL=https://tudominio.com
```

## ✅ **2. Configuración de Mercado Pago**

### **2.1. Credenciales de Producción**
- [ x ] Obtener `Access Token` de producción desde el panel de Mercado Pago
- [ x ] Obtener `Public Key` de producción
- [ x ] Verificar que las credenciales sean de **producción** (no test)

### **2.2. Webhook de Producción (Orders API)**
- [ x ] Configurar webhook en el panel de Mercado Pago (Tus integraciones → Notificaciones)
- [ x ] URL: `https://tu-dominio.com/api/payment/webhook/mercadopago`
- [ x ] Eventos: Pagos + Órdenes comerciales
- [ x ] Configurar `MERCADOPAGO_WEBHOOK_SECRET` para validación de firma
- [ ] Probar con un pago de prueba

### **2.3. Configuración de la Aplicación**
- [ x ] Verificar que `NEXT_PUBLIC_BASE_URL` apunte al dominio de producción

## ✅ **3. Configuración de Emails**

### **3.1. Resend**
- [ ] Crear cuenta en [Resend](https://resend.com)
- [ ] Verificar dominio para envío de emails
- [ ] Obtener API key de producción
- [ ] Configurar `RESEND_FROM_EMAIL` con dominio verificado

### **3.2. Templates de Email**
- [ ] Verificar que los templates de email funcionen correctamente
- [ ] Probar envío de emails de confirmación
- [ ] Verificar que los emails lleguen a spam/promociones

## ✅ **4. Sanity CMS**

### **4.1. Dataset de Producción**
- [ x ] Crear dataset de producción en Sanity
- [ x ] Migrar contenido desde dataset de desarrollo
- [ x ] Configurar `SANITY_DATASET=production`

### **4.2. API Token**
- [ x ] Crear API token con permisos de lectura
- [ x ] Configurar `SANITY_API_TOKEN` en variables de entorno
- [ x ] Verificar que el token tenga acceso al dataset de producción

## ✅ **5. Configuración del Servidor**

### **5.1. Dominio y SSL**
- [ x ] Configurar dominio personalizado
- [ x ] Instalar certificado SSL (Let's Encrypt recomendado)
- [ x ] Verificar que `NEXT_PUBLIC_BASE_URL` sea correcto

### **5.2. Variables de Entorno en el Servidor**
- [ x ] Configurar todas las variables de entorno en el servidor
- [ x ] Verificar que no haya variables de desarrollo en producción
- [ x ] Usar gestor de secretos (Vercel, Netlify, etc.)

## ✅ **6. Testing en Producción**

### **6.1. Pagos de Prueba**
- [ x ] Probar con tarjetas de prueba de Mercado Pago
- [ x ] Verificar que los pagos se procesen correctamente
- [ x ] Confirmar que los webhooks funcionen
- [ x ] Verificar que los emails se envíen

### **6.2. Funcionalidades**
- [ X ] Probar carrito de compras
- [ X ] Verificar galería de fotos
- [ X ] Probar formulario de contacto
- [ X ] Verificar newsletter
- [ X ] Probar cambio de idioma

## ✅ **7. Monitoreo y Logs**

### **7.1. Logs de Producción**
- [ ] Configurar logging apropiado para producción
- [ ] Monitorear errores de pagos
- [ ] Configurar alertas para fallos críticos

### **7.2. Analytics**
- [ ] Configurar Google Analytics (opcional)
- [ ] Monitorear conversiones de pagos
- [ ] Configurar métricas de rendimiento

## ✅ **8. Seguridad**

### **8.1. Validación de Webhooks**
- [ ] Verificar que la validación de webhooks funcione
- [ ] Probar con webhooks maliciosos
- [ ] Configurar rate limiting

### **8.2. Headers de Seguridad**
- [x] Configurar CSP (Content Security Policy) — configurado en `next.config.ts` (solo producción)
- [x] Configurar HSTS — configurado en `next.config.ts` (solo producción)
- [ ] Verificar headers de seguridad

## ✅ **9. Documentación**

### **9.1. Documentación Técnica**
- [ x ] Documentar proceso de despliegue
- [ x ] Documentar configuración de variables de entorno
- [ x ] Documentar proceso de backup

### **9.2. Documentación de Usuario**
- [ ] Guía de uso para el fotógrafo
- [ x ] Documentación de administración
- [ x ] Guía de resolución de problemas

## 🚨 **Comandos de Verificación**

### **Verificar Variables de Entorno**
```bash
# Verificar que todas las variables estén configuradas
echo $MERCADOPAGO_ACCESS_TOKEN
echo $RESEND_API_KEY
echo $SANITY_API_TOKEN
```

### **Verificar Conexiones**
```bash
# Probar conexión a Mercado Pago
curl -X GET "https://api.mercadopago.com/v1/payment_methods" \
  -H "Authorization: Bearer $MERCADOPAGO_ACCESS_TOKEN"

# Probar conexión a Sanity
curl -X GET "https://tu_proyecto_id.api.sanity.io/v2024-01-01/data/query/production?query=*[_type == 'product']"
```

### **Verificar Webhook**
```bash
# Verificar que el webhook esté configurado en el panel de Mercado Pago
# URL: https://tu-dominio.com/api/payment/webhook/mercadopago
# Ver docs/webhook-setup.md
```

## 📞 **Contactos de Emergencia**

- **Mercado Pago**: [Soporte Técnico](https://www.mercadopago.com.ar/developers/es/support)
- **Resend**: [Soporte](https://resend.com/support)
- **Sanity**: [Soporte](https://www.sanity.io/support)
- **Hosting**: [Contacto del proveedor]

---

## ✅ **Checklist Final**

- [ X ] Todas las variables de entorno configuradas
- [ X ] Credenciales de producción activas
- [ X ] Webhook configurado en panel de Mercado Pago
- [ ] Emails funcionando correctamente
- [ X ] Sanity configurado para producción
- [ X ] Dominio y SSL configurados
- [ ] Testing completo realizado
- [ ] Monitoreo configurado
- [ ] Seguridad implementada
- [ ] Backup configurado
- [ X ] Documentación actualizada

**🎉 ¡Listo para producción!**
