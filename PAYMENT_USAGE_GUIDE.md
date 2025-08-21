# Guía de Uso - Sistema de Pagos

## 🚀 Configuración Inicial

### 1. Variables de Entorno

Agrega las siguientes variables a tu archivo `.env.local`:

```bash
# Mercado Pago (Latinoamérica)
MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_access_token

# Stripe (Internacional)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# URL base de la aplicación
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. Instalación de Dependencias

```bash
npm install
```

## 📱 Uso en Componentes

### 1. Detección de Región

```tsx
import { useRegion } from '@/hooks/useRegion';

function MyComponent() {
  const { region, loading, error, setRegion } = useRegion();

  if (loading) return <div>Detectando ubicación...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <p>País: {region?.country}</p>
      <p>Moneda: {region?.currency}</p>
      <p>Proveedor: {region?.paymentProvider}</p>
    </div>
  );
}
```

### 2. Procesamiento de Pagos

```tsx
import { usePayment } from '@/hooks/usePayment';

function CheckoutComponent() {
  const { loading, error, createPaymentIntent, processPayment } = usePayment();

  const handleCheckout = async () => {
    const items = [
      { id: '1', title: 'Foto 1', price: 50, quantity: 1 },
      { id: '2', title: 'Postal 1', price: 15, quantity: 2 }
    ];

    const customerInfo = {
      name: 'Juan Pérez',
      email: 'juan@example.com'
    };

    // Crear sesión de pago
    const paymentIntent = await createPaymentIntent(items, customerInfo);
    
    if (paymentIntent) {
      // Procesar pago según el proveedor
      if (paymentIntent.provider === 'mercadopago') {
        // Redirigir a Mercado Pago
        window.location.href = paymentIntent.paymentUrl;
      } else {
        // Usar Stripe Elements
        // Implementar lógica de Stripe
      }
    }
  };

  return (
    <button 
      onClick={handleCheckout}
      disabled={loading}
    >
      {loading ? 'Procesando...' : 'Pagar'}
    </button>
  );
}
```

### 3. Selector de Región

```tsx
import RegionSelector from '@/components/payment/RegionSelector';

function CheckoutPage() {
  return (
    <div>
      <h1>Checkout</h1>
      <RegionSelector />
      {/* Resto del formulario */}
    </div>
  );
}
```

## 🔧 APIs Disponibles

### 1. Detección de Región

**GET** `/api/payment/region`
- Detecta automáticamente la región del usuario por IP

**POST** `/api/payment/region`
- Establece manualmente la región
- Body: `{ "countryCode": "AR" }`

### 2. Creación de Sesión de Pago

**POST** `/api/payment/create-intent`
- Crea una sesión de pago
- Body: `{ "region": {...}, "items": [...], "customerInfo": {...} }`

### 3. Procesamiento de Pago

**POST** `/api/payment/process`
- Procesa el pago
- Body: `{ "region": {...}, "paymentData": {...} }`

## 🌍 Regiones Soportadas

### Latinoamérica (Mercado Pago)
- 🇦🇷 Argentina (ARS)
- 🇧🇷 Brasil (BRL)
- 🇨🇱 Chile (CLP)
- 🇨🇴 Colombia (COP)
- 🇲🇽 México (MXN)
- 🇵🇪 Perú (PEN)
- 🇺🇾 Uruguay (UYU)

### Internacional (Stripe)
- 🇺🇸 Estados Unidos (USD)
- 🇨🇦 Canadá (CAD)
- 🇪🇸 España (EUR)
- 🇫🇷 Francia (EUR)
- 🇩🇪 Alemania (EUR)
- 🇮🇹 Italia (EUR)
- 🇬🇧 Reino Unido (GBP)
- 🇦🇺 Australia (AUD)

## 💰 Configuración de Precios

Los precios se configuran en `lib/payment/config.ts`:

```typescript
export const PRICE_CONFIG = {
  photos: {
    USD: 50,
    ARS: 50000,
    BRL: 250,
    // ... más monedas
  },
  postcards: {
    USD: 15,
    ARS: 15000,
    BRL: 75,
    // ... más monedas
  }
};
```

## 🚚 Envío e Impuestos

### Envío
- **Internacional**: $10 USD
- **Nacional**: Varía por país

### Impuestos
- **Argentina**: 21% IVA
- **Brasil**: 17% ICMS
- **Chile**: 19% IVA
- **Colombia**: 19% IVA
- **México**: 16% IVA
- **Perú**: 18% IGV
- **Uruguay**: 22% IVA
- **Internacional**: Sin impuestos

## 🔒 Seguridad

### Validaciones Implementadas
- ✅ Validación de datos en frontend y backend
- ✅ Sanitización de inputs
- ✅ Rate limiting en APIs
- ✅ HTTPS obligatorio

### Cumplimiento
- ✅ PCI-DSS compliance
- ✅ Protección de datos personales
- ✅ Leyes locales de comercio electrónico

## 🧪 Testing

### Mercado Pago Sandbox
```bash
# Usar tarjetas de prueba de Mercado Pago
# Ejemplo: 4509 9535 6623 3704
```

### Stripe Test Mode
```bash
# Usar tarjetas de prueba de Stripe
# Ejemplo: 4242 4242 4242 4242
```

## 📞 Soporte

### Logs
Los logs se muestran en la consola del navegador y del servidor:
- 🌍 Detección de región
- 💳 Creación de sesiones de pago
- ✅ Confirmación de pagos
- ❌ Errores y excepciones

### Debug
Para debuggear problemas:
1. Verificar variables de entorno
2. Revisar logs en consola
3. Verificar conectividad con APIs
4. Validar datos de entrada

## 🚀 Próximos Pasos

1. **Configurar cuentas de pago** en Mercado Pago y Stripe
2. **Personalizar precios** según tus necesidades
3. **Implementar webhooks** para confirmación de pagos
4. **Agregar gestión de órdenes** en base de datos
5. **Implementar notificaciones** por email
6. **Agregar analytics** de conversión

