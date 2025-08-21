# 🌟 Rama Feature/Payment - Sistema de Pagos con Mercado Pago

## 📋 Resumen

Esta rama contiene la implementación del sistema de pagos con Mercado Pago para el portfolio del fotógrafo. El sistema está optimizado para Latinoamérica y soporta 7 países de la región.

## 🎯 Características Implementadas

### ✅ **Detección Automática de Región**
- Geolocalización por IP
- Detección por navegador
- Selección manual de país
- Configuración automática de moneda

### ✅ **Proveedor de Pago**
- **Mercado Pago** para Latinoamérica
- Factory pattern para gestión unificada
- Integración completa con API de Mercado Pago

### ✅ **APIs del Backend**
- `/api/payment/region` - Detección de región
- `/api/payment/create-intent` - Creación de sesiones de pago
- Estructura preparada para webhooks

### ✅ **Componentes Frontend**
- `RegionSelector` - Selector de país (solo Latinoamérica)
- Hooks personalizados para región y pagos
- Integración con el carrito existente

### ✅ **Configuración Regional**
- Precios por moneda y región
- Impuestos locales por país
- Costos de envío diferenciados

## 🌍 Regiones Soportadas

### Latinoamérica (Mercado Pago)
| País | Moneda | Código | Impuesto |
|------|--------|--------|----------|
| 🇦🇷 Argentina | Peso Argentino | ARS | 21% IVA |
| 🇧🇷 Brasil | Real Brasileño | BRL | 17% ICMS |
| 🇨🇱 Chile | Peso Chileno | CLP | 19% IVA |
| 🇨🇴 Colombia | Peso Colombiano | COP | 19% IVA |
| 🇲🇽 México | Peso Mexicano | MXN | 16% IVA |
| 🇵🇪 Perú | Sol Peruano | PEN | 18% IGV |
| 🇺🇾 Uruguay | Peso Uruguayo | UYU | 22% IVA |

**Nota**: Solo se soportan países de Latinoamérica. Para otras regiones se mostrará un mensaje de región no soportada.

## 📁 Estructura de Archivos

```
feature/payment/
├── 📄 PAYMENT_INTEGRATION_PLAN.md     # Plan completo de implementación
├── 📄 PAYMENT_USAGE_GUIDE.md          # Guía de uso para desarrolladores
├── 📄 PAYMENT_BRANCH_README.md        # Este archivo
├── 🔧 lib/payment/
│   ├── config.ts                      # Configuración de precios e impuestos
│   ├── payment-factory.ts             # Factory pattern para Mercado Pago
│   ├── region-detector.ts             # Detección de región
│   └── mercadopago.service.ts         # Servicio de Mercado Pago
├── 🪝 hooks/
│   ├── useRegion.ts                   # Hook para gestión de región
│   └── usePayment.ts                  # Hook para gestión de pagos
├── 🎨 components/payment/
│   └── RegionSelector.tsx             # Selector de país (solo Latinoamérica)
└── 🔌 app/api/payment/
    ├── region/route.ts                # API de detección de región
    └── create-intent/route.ts         # API de creación de sesiones
```

## 🚀 Configuración Requerida

### Variables de Entorno
```bash
# Mercado Pago (Latinoamérica)
MERCADOPAGO_ACCESS_TOKEN=your_mercadopago_access_token

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
# Nombre: APRO
```

## 📖 Uso Rápido

### 1. Detección de Región
```tsx
import { useRegion } from '@/hooks/useRegion';

function MyComponent() {
  const { region, loading } = useRegion();
  
  if (loading) return <div>Detectando...</div>;
  
  if (!region?.isSupported) {
    return <div>Región no soportada</div>;
  }
  
  return (
    <div>
      <p>País: {region.country}</p>
      <p>Moneda: {region.currency}</p>
      <p>Proveedor: Mercado Pago</p>
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
      { id: '1', title: 'Foto 1', price: 50000, quantity: 1 }
    ];

    const paymentIntent = await createPaymentIntent(items);
    
    if (paymentIntent) {
      // Redirigir a Mercado Pago
      window.location.href = paymentIntent.paymentUrl;
    }
  };

  return (
    <button onClick={handleCheckout} disabled={loading}>
      {loading ? 'Procesando...' : 'Pagar con Mercado Pago'}
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
- [ ] Crear cuenta en Mercado Pago
- [ ] Obtener token de acceso

### 2. **Testing Local**
- [ ] Probar detección de región
- [ ] Verificar creación de sesiones de pago
- [ ] Testear flujo de Mercado Pago

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

## 💰 Configuración de Precios

Los precios se configuran en `lib/payment/config.ts`:

```typescript
export const PRICE_CONFIG = {
  photos: {
    ARS: 50000,  // $50 USD en pesos argentinos
    BRL: 250,    // $50 USD en reales brasileños
    CLP: 47500,  // $50 USD en pesos chilenos
    // ... más monedas
  },
  postcards: {
    ARS: 15000,  // $15 USD en pesos argentinos
    BRL: 75,     // $15 USD en reales brasileños
    // ... más monedas
  }
};
```

## 🚀 Próximos Pasos

1. **Configurar cuenta de Mercado Pago** y obtener token de acceso
2. **Personalizar precios** según necesidades del negocio
3. **Implementar webhooks** para confirmación de pagos
4. **Agregar gestión de órdenes** en base de datos
5. **Implementar notificaciones** por email
6. **Agregar analytics** de conversión

## 📞 Soporte

Para dudas o problemas:
1. Revisar logs en consola del navegador y servidor
2. Verificar variables de entorno
3. Consultar documentación oficial de Mercado Pago
4. Revisar `PAYMENT_USAGE_GUIDE.md` para ejemplos detallados

---

**Rama creada**: `feature/payment`  
**Último commit**: `e77aa96` - docs: agregar README específico para rama feature/payment  
**Estado**: ✅ Listo para testing y configuración con Mercado Pago
