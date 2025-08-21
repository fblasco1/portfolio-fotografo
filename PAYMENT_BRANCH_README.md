# 🌟 Rama Feature/Payment - Sistema de Pagos Multi-Plataforma

## 📋 Resumen

Esta rama contiene la implementación completa del sistema de pagos multi-plataforma para el portfolio del fotógrafo. El sistema soporta diferentes proveedores de pago según la región del usuario.

## 🎯 Características Implementadas

### ✅ **Detección Automática de Región**
- Geolocalización por IP
- Detección por navegador
- Selección manual de país
- Configuración automática de moneda y proveedor

### ✅ **Proveedores de Pago**
- **Latinoamérica**: Mercado Pago
- **Internacional**: Stripe
- Factory pattern para gestión unificada

### ✅ **APIs del Backend**
- `/api/payment/region` - Detección de región
- `/api/payment/create-intent` - Creación de sesiones de pago
- Estructura preparada para webhooks

### ✅ **Componentes Frontend**
- `RegionSelector` - Selector de país
- Hooks personalizados para región y pagos
- Integración con el carrito existente

### ✅ **Configuración Regional**
- Precios por moneda y región
- Impuestos locales por país
- Costos de envío diferenciados

## 🌍 Regiones Soportadas

### Latinoamérica (Mercado Pago)
| País | Moneda | Código |
|------|--------|--------|
| 🇦🇷 Argentina | Peso Argentino | ARS |
| 🇧🇷 Brasil | Real Brasileño | BRL |
| 🇨🇱 Chile | Peso Chileno | CLP |
| 🇨🇴 Colombia | Peso Colombiano | COP |
| 🇲🇽 México | Peso Mexicano | MXN |
| 🇵🇪 Perú | Sol Peruano | PEN |
| 🇺🇾 Uruguay | Peso Uruguayo | UYU |

### Internacional (Stripe)
| País | Moneda | Código |
|------|--------|--------|
| 🇺🇸 Estados Unidos | Dólar Estadounidense | USD |
| 🇨🇦 Canadá | Dólar Canadiense | CAD |
| 🇪🇸 España | Euro | EUR |
| 🇫🇷 Francia | Euro | EUR |
| 🇩🇪 Alemania | Euro | EUR |
| 🇮🇹 Italia | Euro | EUR |
| 🇬🇧 Reino Unido | Libra Esterlina | GBP |
| 🇦🇺 Australia | Dólar Australiano | AUD |

## 📁 Estructura de Archivos

```
feature/payment/
├── 📄 PAYMENT_INTEGRATION_PLAN.md     # Plan completo de implementación
├── 📄 PAYMENT_USAGE_GUIDE.md          # Guía de uso para desarrolladores
├── 📄 PAYMENT_BRANCH_README.md        # Este archivo
├── 🔧 lib/payment/
│   ├── config.ts                      # Configuración de precios e impuestos
│   ├── payment-factory.ts             # Factory pattern para proveedores
│   ├── region-detector.ts             # Detección de región
│   ├── mercadopago.service.ts         # Servicio de Mercado Pago
│   └── stripe.service.ts              # Servicio de Stripe
├── 🪝 hooks/
│   ├── useRegion.ts                   # Hook para gestión de región
│   └── usePayment.ts                  # Hook para gestión de pagos
├── 🎨 components/payment/
│   └── RegionSelector.tsx             # Selector de país
└── 🔌 app/api/payment/
    ├── region/route.ts                # API de detección de región
    └── create-intent/route.ts         # API de creación de sesiones
```

## 🚀 Configuración Requerida

### Variables de Entorno
```bash
# Mercado Pago (Latinoamérica)
MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_access_token

# Stripe (Internacional)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# URL base de la aplicación
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Dependencias
```bash
npm install
```

## 🧪 Testing

### Mercado Pago Sandbox
```bash
# Tarjeta de prueba: 4509 9535 6623 3704
# CVV: 123
# Fecha: 12/25
```

### Stripe Test Mode
```bash
# Tarjeta de prueba: 4242 4242 4242 4242
# CVV: 123
# Fecha: 12/25
```

## 📖 Uso Rápido

### 1. Detección de Región
```tsx
import { useRegion } from '@/hooks/useRegion';

function MyComponent() {
  const { region, loading } = useRegion();
  
  if (loading) return <div>Detectando...</div>;
  
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
  const { createPaymentIntent, loading } = usePayment();

  const handleCheckout = async () => {
    const items = [
      { id: '1', title: 'Foto 1', price: 50, quantity: 1 }
    ];

    const paymentIntent = await createPaymentIntent(items);
    
    if (paymentIntent?.provider === 'mercadopago') {
      window.location.href = paymentIntent.paymentUrl;
    }
  };

  return (
    <button onClick={handleCheckout} disabled={loading}>
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

## 🔄 Flujo de Desarrollo

### 1. **Configuración Inicial**
- [ ] Configurar variables de entorno
- [ ] Crear cuentas en Mercado Pago y Stripe
- [ ] Obtener tokens de acceso

### 2. **Testing Local**
- [ ] Probar detección de región
- [ ] Verificar creación de sesiones de pago
- [ ] Testear flujos de Mercado Pago y Stripe

### 3. **Integración con Carrito**
- [ ] Conectar con el carrito existente
- [ ] Implementar cálculo de precios por región
- [ ] Agregar validaciones de stock

### 4. **Webhooks y Confirmación**
- [ ] Implementar webhooks de confirmación
- [ ] Crear gestión de órdenes
- [ ] Agregar notificaciones por email

### 5. **Producción**
- [ ] Configurar variables de producción
- [ ] Testing en ambiente de producción
- [ ] Monitoreo y logs

## 📚 Documentación

- **`PAYMENT_INTEGRATION_PLAN.md`**: Plan detallado de implementación
- **`PAYMENT_USAGE_GUIDE.md`**: Guía completa de uso para desarrolladores
- **Comentarios en código**: Documentación inline en TypeScript

## 🔒 Seguridad

- ✅ Validación de datos en frontend y backend
- ✅ Sanitización de inputs
- ✅ Rate limiting en APIs
- ✅ HTTPS obligatorio
- ✅ PCI-DSS compliance
- ✅ Protección de datos personales

## 🚀 Próximos Pasos

1. **Configurar cuentas de pago** en Mercado Pago y Stripe
2. **Personalizar precios** según necesidades del negocio
3. **Implementar webhooks** para confirmación de pagos
4. **Agregar gestión de órdenes** en base de datos
5. **Implementar notificaciones** por email
6. **Agregar analytics** de conversión

## 📞 Soporte

Para dudas o problemas:
1. Revisar logs en consola del navegador y servidor
2. Verificar variables de entorno
3. Consultar documentación oficial de Mercado Pago y Stripe
4. Revisar `PAYMENT_USAGE_GUIDE.md` para ejemplos detallados

---

**Rama creada**: `feature/payment`  
**Último commit**: `f6e9862` - feat: implementar sistema de pagos multi-plataforma  
**Estado**: ✅ Listo para testing y configuración
