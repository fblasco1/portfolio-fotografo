# Guía de Pruebas de Integración - Checkout API con Orders API v2

Documentación técnica para probar el flujo de Checkout API utilizando la API Orders v2 de Mercado Pago. Basada exclusivamente en la [documentación oficial de Mercado Pago](https://www.mercadopago.com.ar/developers/es/docs/checkout-api-orders).

---

## 1. Control de Pruebas de Integración

### 1.1 Requisitos según documentación oficial

La API Orders de Mercado Pago requiere:

| Etapa | Credenciales | API utilizada | Referencia |
|-------|--------------|---------------|------------|
| **Pruebas sin cobro real** | `TEST-` (prueba) | Payments API (fallback) | Este proyecto usa fallback automático |
| **Pruebas con Orders API** | `APP_USR-` (producción) | Orders API + cuentas de prueba | [Compra de prueba con tarjetas](https://www.mercadopago.com.ar/developers/es/docs/checkout-api-orders/integration-test/cards) |
| **Producción** | `APP_USR-` (producción) | Orders API | [Salir a producción](https://www.mercadopago.com.ar/developers/es/docs/checkout-api-orders/go-to-production) |

### 1.2 Comportamiento de este proyecto

- **Con credenciales `TEST-`**: El backend detecta y usa la Payments API. Permite tarjetas de prueba sin cobros reales.
- **Con credenciales `APP_USR-`**: Usa la Orders API. Para pruebas necesitas cuentas de prueba (vendedor + comprador) y HTTPS.

### 1.3 Verificación de compra de prueba

Según la documentación oficial, para verificar una compra de prueba se envía un **GET** al endpoint `/v1/orders/{id}` reemplazando `id` por la identificación de la orden recibida en la respuesta a su creación. El campo `status` indica el resultado del pago.

---

## 2. Creación de Usuarios de Prueba

Fuente: [Cuentas de prueba - Mercado Pago](https://www.mercadopago.com.ar/developers/es/docs/your-integrations/test/accounts)

### 2.1 Pasos para crear cuentas

1. Ir a [Mercado Pago Developers](https://www.mercadopago.com.ar/developers/es/docs) → **Tus integraciones** → seleccionar la aplicación.
2. En la sección **Cuentas de prueba**, clic en **Crear cuenta de prueba**.
3. Seleccionar **País**: Argentina (no se puede editar después).
4. Los usuarios Vendedor y Comprador deben ser del **mismo país**.

### 2.2 Cuenta Vendedor (pruebas Orders)

| Campo | Valor |
|-------|-------|
| **Descripción** | `pruebas orders` |
| **Tipo** | Vendedor |
| **País** | Argentina |

Esta cuenta se usa para configurar la aplicación y las credenciales.

### 2.3 Cuenta Comprador

| Campo | Valor |
|-------|-------|
| **Descripción** | `comprador orders` |
| **Tipo** | Comprador |
| **País** | Argentina |

Esta cuenta simula al comprador en el proceso de pago.

### 2.4 Datos que asigna Mercado Pago

Tras crear cada cuenta, Mercado Pago muestra:

- **User ID**: Identificador numérico.
- **Usuario**: Nombre de usuario para iniciar sesión.
- **Contraseña**: Generada automáticamente.

**Importante**: Para compras de prueba con Orders API, debes usar el **email que Mercado Pago asigna** a la cuenta Comprador. Ese email aparece en la tabla de cuentas de prueba del panel.

> Si la documentación indica `test@testuser.com` como email permitido, verifica en la [documentación actual de Orders API](https://www.mercadopago.com.ar/developers/es/docs/checkout-api-orders/integration-test/cards). En integraciones con cuentas de prueba, suele ser obligatorio usar el email de la cuenta Comprador creada en el panel.

---

## 3. Simulación Paso a Paso del Pago

### 3.1 Orden lógico (según flujo del checkout)

1. **Seleccionar tamaño de la imagen** → Define el producto y precio.
2. **Completar información de contacto del payer** → Datos requeridos por la Orders API.
3. **Completar datos de la tarjeta** → Tokenización y pago.

### 3.2 Justificación del orden

- El **tamaño** determina el precio unitario y el total de la orden.
- Los **datos del payer** (email, nombre, apellido, teléfono, dirección) son obligatorios para la Orders API y para validación anti-fraude.
- La **tarjeta** se tokeniza en el cliente y se envía como token al backend; el backend no recibe el número de tarjeta.

### 3.3 Instrucciones detalladas

#### Paso 1: Finalizar compra y acceder al checkout

1. Agregar productos al carrito desde la galería (`/es/gallery` o `/es/shop`).
2. Ir al carrito y pulsar **Finalizar compra**.
3. Ser redirigido a la página de checkout (`/es/checkout`).

#### Paso 2: Seleccionar tamaño de la imagen

1. En la sección **Revisar Pedido**, cada item muestra opciones de tamaño.
2. Elegir el tamaño deseado (ej. 15x21, 20x30).
3. Asegurarse de que todos los ítems tengan tamaño seleccionado antes de continuar.

#### Paso 3: Completar información de contacto del payer

Completar todos los campos obligatorios:

| Campo | Valor para prueba (Orders API) | Notas |
|-------|--------------------------------|-------|
| **Email** | Email de la cuenta Comprador creada en el panel | O `test@testuser.com` si la doc actual lo permite |
| **Nombre** | Cualquier nombre válido | Ej. del usuario de prueba |
| **Apellido** | Cualquier apellido válido | |
| **Teléfono** | Ej. +54 11 1234-5678 | Formato con código de área |
| **Calle** | Ej. Falsa 123 | |
| **Número** | Ej. 123 | |
| **Ciudad** | Ej. Ciudad Autónoma de Buenos Aires | |
| **Código postal** | Ej. C1406 | Formato argentino (con C para CABA) |
| **Provincia/Estado** | Ej. Buenos Aires | |

Pulsar **Continuar al Pago** cuando todos los campos estén completos.

#### Paso 4: Completar datos de la tarjeta

Según la [documentación oficial de tarjetas de prueba](https://www.mercadopago.com.ar/developers/es/docs/checkout-api-orders/integration-test/cards):

**Tarjetas de prueba (Mercado Pago):**

| Tipo | Bandeira | Número | CVV | Vencimiento |
|------|----------|--------|-----|-------------|
| Crédito | Mastercard | 5031 7557 3453 0604 | 123 | 11/30 |
| Crédito | Visa | 4509 9535 6623 3704 | 123 | 11/30 |
| Crédito | American Express | 3711 803032 57522 | 1234 | 11/30 |
| Débito | Mastercard | 5287 3383 1025 3304 | 123 | 11/30 |
| Débito | Visa | 4002 7686 9439 5619 | 123 | 11/30 |

**Titular de la tarjeta (define el resultado del pago):**

| Estado de pago | Nombre y apellido | Documento |
|----------------|-------------------|-----------|
| **Pago aprobado** | `APRO` | DNI 12345678 |
| Rechazado por error general | `OTHE` | DNI 12345678 |
| Pendiente de pago | `CONT` | — |
| Rechazado por fondos insuficientes | `FUND` | — |
| Rechazado por CVV inválido | `SECU` | — |
| Rechazado por fecha vencida | `EXPI` | — |

Para simular un **pago aprobado**:
- **Nombre del titular**: `APRO`
- **DNI**: `12345678`

#### Paso 5: Procesar el pago

1. Pulsar **Pagar ahora**.
2. Esperar la respuesta (aprobado, pendiente o rechazado).
3. Verificar el resultado en el modal y, si aplica, en el dashboard de órdenes.

---

## 4. Requisitos Técnicos para Pruebas

### 4.1 HTTPS (obligatorio para tokenización)

Mercado Pago exige HTTPS para procesar datos de tarjeta. En desarrollo local:

- Usar **ngrok**, **devtunnels** o similar para exponer `localhost` por HTTPS.
- Configurar `NEXT_PUBLIC_BASE_URL` con la URL pública (ej. `https://xxx.ngrok.io`).

### 4.2 Variables de entorno

```env
# Para pruebas con tarjetas de prueba (sin cobro real)
MERCADOPAGO_ACCESS_TOKEN=TEST-xxx...
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-xxx...

# Para pruebas con Orders API (requiere cuentas de prueba)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxx...
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxx...
NEXT_PUBLIC_BASE_URL=https://tu-tunnel.ngrok.io
```

### 4.3 Recursos oficiales

- [Compra de prueba con tarjetas - Orders API](https://www.mercadopago.com.ar/developers/es/docs/checkout-api-orders/integration-test/cards)
- [Cuentas de prueba](https://www.mercadopago.com.ar/developers/es/docs/your-integrations/test/accounts)
- [Referencia API Orders](https://www.mercadopago.com.ar/developers/es/reference)

---

## 5. Errores Comunes y Soluciones

| Error | Causa | Solución |
|-------|-------|----------|
| `invalid_credentials` | Orders API no acepta credenciales TEST- | Usar credenciales APP_USR- y cuentas de prueba |
| `invalid_users_involved` | Email no corresponde a cuenta de prueba | Usar el email de la cuenta Comprador del panel |
| `invalid_card_token` | Token inválido o credenciales no coinciden | Verificar que Public Key y Access Token sean del mismo par |
| `processing_error` | Datos incorrectos (titular, CP, etc.) | Usar APRO como titular, CP formato C1406 |
| `rejected_by_issuer` | Tarjeta de prueba con credenciales de producción | Con APP_USR-, usar cuentas de prueba y email correcto |
| `public key not found` | Public Key mal configurada | Verificar NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY en .env.local |

---

*Última actualización según documentación Mercado Pago. Consultar siempre la [documentación oficial](https://www.mercadopago.com.ar/developers/es/docs) para cambios recientes.*
