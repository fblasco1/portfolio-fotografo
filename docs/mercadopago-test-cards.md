# Tarjetas de Prueba de Mercado Pago

> Para la guía completa de pruebas de integración (cuentas de prueba, simulación paso a paso), ver **[01-PRUEBAS-INTEGRACION-MERCADOPAGO.md](./01-PRUEBAS-INTEGRACION-MERCADOPAGO.md)**.

## Modo prueba sin gastar dinero

Para probar sin cobros reales:

1. Usa **credenciales de prueba** (TEST-) en `.env.local`:
   ```
   MERCADOPAGO_ACCESS_TOKEN=TEST-xxx...
   NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-xxx...
   ```
2. El proyecto detecta credenciales TEST y usa la **Payments API** (acepta tarjetas de prueba)
3. En producción, usa credenciales APP_USR- y la **Orders API**

Las tarjetas de prueba (4509..., 5031..., etc.) **solo funcionan con credenciales TEST**.

---

## Tarjetas de Crédito de Prueba

> **Importante**: Para pagos aprobados usa **APRO** como nombre del titular y **12345678** como DNI (según docs de MP).

### Visa
- **Número**: 4509 9535 6623 3704
- **CVV**: 123
- **Vencimiento**: 11/30 (recomendado en docs MP actuales)
- **Titular**: APRO

### Mastercard
- **Número**: 5031 7557 3453 0604
- **CVV**: 123
- **Vencimiento**: 11/25
- **Titular**: APRO

### American Express
- **Número**: 3753 651535 56885
- **CVV**: 1234
- **Vencimiento**: 11/25
- **Titular**: APRO

## Tarjetas de Débito de Prueba

### Visa Débito
- **Número**: 4009 1753 3280 6176
- **CVV**: 123
- **Vencimiento**: 11/25
- **Titular**: APRO

### Mastercard Débito
- **Número**: 5204 1753 1338 8884
- **CVV**: 123
- **Vencimiento**: 11/25
- **Titular**: APRO

## Tarjetas que Simulan Errores

### Tarjeta Rechazada
- **Número**: 4000 0000 0000 0002
- **CVV**: 123
- **Vencimiento**: 11/25
- **Titular**: OTHE
- **Resultado**: Pago rechazado

### Tarjeta con Fondos Insuficientes
- **Número**: 4000 0000 0000 9995
- **CVV**: 123
- **Vencimiento**: 11/25
- **Titular**: OTHE
- **Resultado**: Fondos insuficientes

### Tarjeta Expirada
- **Número**: 4000 0000 0000 0069
- **CVV**: 123
- **Vencimiento**: 11/25
- **Titular**: OTHE
- **Resultado**: Tarjeta expirada

## Documentos de Prueba

### Argentina
- **Tipo**: DNI
- **Número**: 12345678

### Brasil
- **Tipo**: CPF
- **Número**: 12345678901

### Chile
- **Tipo**: RUT
- **Número**: 12345678-9

### Colombia
- **Tipo**: CC
- **Número**: 1234567890

### México
- **Tipo**: RFC
- **Número**: ABC123456T1B

### Perú
- **Tipo**: DNI
- **Número**: 12345678

### Uruguay
- **Tipo**: CI
- **Número**: 12345678

## Notas Importantes

1. **Solo para Sandbox**: Estas tarjetas solo funcionan en el entorno de pruebas (sandbox) de Mercado Pago.

2. **Datos del Titular**: Siempre usa "APRO" como nombre del titular para pagos exitosos.

3. **CVV**: Usa 123 para la mayoría de las tarjetas, excepto American Express que usa 1234.

4. **Vencimiento**: Usa cualquier fecha futura, por ejemplo 11/25.

5. **Email**: Usa cualquier email válido para las pruebas.

## Configuración del Entorno

Asegúrate de que tu aplicación esté configurada para usar el entorno de sandbox:

```env
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxxxx-xxxxxxxxxx-xxxxxxxxxx-xxxxxxxxxx-xxxxxxxxxx
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxxxx-xxxxxxxxxx-xxxxxxxxxx-xxxxxxxxxx-xxxxxxxxxx
```

## Troubleshooting

### Error "invalid_credentials" / "Test credentials are not supported"

**La API Orders de Mercado Pago ya no acepta credenciales de prueba (TEST-).** Debes usar **credenciales de producción** también para pruebas.

**Pasos:**

1. Ve a https://www.mercadopago.com.ar/developers/panel/app
2. Tu integración > **Credenciales** > **Credenciales de producción**
3. Si no están activadas: completa industria, sitio web y activa
4. Copia **Access Token** y **Public Key** de producción (ambos empiezan con `APP_USR-`)
5. En `.env.local`:
   ```
   MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx...
   NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxx...
   ```
6. Reinicia `npm run dev`

Para pruebas, crea **cuentas de prueba** (Seller y Buyer) en Tu integración > Cuentas de prueba. Las tarjetas de prueba funcionan con credenciales de producción.

---

### Error "invalid_card_token" / "The following transactions failed"

El token se generó en el frontend pero MP lo rechaza al crear la orden. **Causas habituales:**

1. **Credenciales no coinciden**: La `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` (frontend) y `MERCADOPAGO_ACCESS_TOKEN` (backend) deben ser del **mismo par** de credenciales de producción. Si una es de una app y la otra de otra, falla.
2. **Token expirado o ya usado**: Los tokens duran ~7 minutos y son de un solo uso. Si esperaste mucho o intentaste dos veces, genera uno nuevo completando el formulario de nuevo y pagando de inmediato.
3. **Datos de titular para tarjetas de prueba**: Usa **APRO** como nombre del titular y **12345678** como DNI para pagos aprobados. Ver tabla en esta misma doc.

**Verificación rápida en .env.local:**
- Ambos deben empezar con `APP_USR-`
- Ambos deben venir de la misma sección "Credenciales de producción" en el panel

---

### Error "invalid_users_involved"

El email del comprador no corresponde a una cuenta de prueba válida. Para compras de prueba con Orders API debes:

1. **Crear cuenta Comprador** en https://www.mercadopago.com.ar/developers/panel/app
2. Ir a **Tu integración** > **Cuentas de prueba** > **+ Crear cuenta de prueba**
3. Tipo: **Comprador**, País: Argentina
4. MP te mostrará **Usuario** y datos de la cuenta
5. **Usa como email** el que MP asigne para esa cuenta de prueba
6. **Titular de tarjeta** (nombre en el formulario de tarjeta): **APRO** | DNI: **12345678** para pago aprobado (no uses "Test User" u otros)
7. **NEXT_PUBLIC_BASE_URL** en .env.local debe coincidir con la URL del checkout (ej. `https://ql7z1nkz-3000.brs.devtunnels.ms`)

Referencia: [Compra de prueba con tarjetas - Orders API](https://www.mercadopago.com.ar/developers/es/docs/checkout-api-orders/integration-test/cards)

---

### Error "processing_error"

Error genérico del procesador. Revisa:

1. **Titular de la tarjeta** (en el formulario de tarjeta): debe ser **APRO** para pago aprobado. No uses el username del test user como titular.
2. **Código postal**: usa formato argentino, ej. **C1406** (con C para CABA), no solo "1406".
3. **Reintentar**: a veces es temporal; espera 1–2 minutos y prueba de nuevo.
4. **Datos del payer**: first_name/last_name pueden ser los del test user; el titular de tarjeta (APRO) es independiente.

---

### Error "rejected_by_issuer"

El emisor de la tarjeta rechazó el pago. **Con credenciales de producción** (`APP_USR-`), las tarjetas de prueba (4509 9535 6623 3704, etc.) **no funcionan** porque se procesan como pago real y esos números no son tarjetas válidas.

**Opciones para probar:**
1. **Prueba mínima real**: Usa una tarjeta real con un monto bajo (ej. 1 producto barato) para verificar que el flujo funciona.
2. **Test users de Mercado Pago**: Crea cuentas de prueba (Buyer) en Tu integración > Cuentas de prueba. Algunos flujos permiten probar con el email del test user; consulta la documentación actual de MP.
3. **Paso a producción**: Una vez desplegado con HTTPS, el flujo está listo; las pruebas con tarjetas reales de bajo monto son la forma estándar de validar.

---

### Error "public key not found"

Si Mercado Pago rechaza la Public Key al tokenizar o cargar el formulario:

1. **Genera credenciales nuevas** en https://www.mercadopago.com.ar/developers/panel/app
2. Entra a **Tu integración** > **Credenciales**
3. En **Credenciales de prueba**, copia la **Public Key** (NO el Access Token)
4. Actualiza `.env.local`: `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-xxx...`
5. Reinicia el servidor: `Ctrl+C` y luego `npm run dev`

Las credenciales pueden expirar o haber sido renovadas por Mercado Pago.

---

### Si sigues teniendo problemas con `bin_exclusion`:

1. **Verifica el entorno**: Asegúrate de estar usando el entorno de sandbox
2. **Usa tarjetas oficiales**: Asegúrate de que las tarjetas de prueba sean las oficiales de Mercado Pago
3. **Revisa los logs**: Verifica en la consola del navegador que se detecte correctamente el `payment_type_id`
4. **API de Mercado Pago**: El sistema ahora usa la API de Mercado Pago para detectar automáticamente el tipo de tarjeta
5. **No detección manual**: Ya no se usa detección manual de BIN, todo se maneja por la API oficial

### Logs Esperados

Cuando uses una tarjeta de débito de prueba, deberías ver:

```
🔍 Detectando método de pago para BIN: 4009
📋 Respuesta completa de métodos de pago: {paging: {...}, results: [{id: "debvisa", name: "Visa Débito", ...}]}
📋 Tipo de respuesta: object false
📋 Array de métodos procesado: [{id: "debvisa", name: "Visa Débito", payment_type_id: "debit_card", ...}]
✅ Método de pago detectado: {id: "debvisa", name: "Visa Débito", payment_type_id: "debit_card"}
✅ Usando payment_method_id de la API: debvisa
💳 Datos del pago a enviar: {paymentMethod: "debvisa", paymentType: "debit_card"}
```

**Para Mastercard de débito:**
```
🔍 Detectando método de pago para BIN: 528733
📋 Respuesta completa de métodos de pago: {paging: {...}, results: [{id: "debmaster", name: "Mastercard Débito", ...}]}
📋 Tipo de respuesta: object false
📋 Array de métodos procesado: [{id: "debmaster", name: "Mastercard Débito", payment_type_id: "debit_card", ...}]
✅ Método de pago detectado: {id: "debmaster", name: "Mastercard Débito", payment_type_id: "debit_card"}
✅ Usando payment_method_id de la API: debmaster
💳 Datos del pago a enviar: {paymentMethod: "debmaster", paymentType: "debit_card"}
```
