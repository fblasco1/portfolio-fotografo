# Tarjetas de Prueba de Mercado Pago

## Tarjetas de Crédito de Prueba

### Visa
- **Número**: 4509 9535 6623 3704
- **CVV**: 123
- **Vencimiento**: 11/25
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

Si sigues teniendo problemas con `bin_exclusion`:

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
