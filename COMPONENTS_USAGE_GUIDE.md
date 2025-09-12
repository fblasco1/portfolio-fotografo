# 🛒 Guía de Uso de Componentes de Checkout

## 📋 Resumen

Esta guía explica cómo usar los componentes de checkout implementados para el sistema de pagos con Mercado Pago. Los componentes están diseñados para integrarse fácilmente con el carrito existente y proporcionar una experiencia de usuario completa.

## 🎯 Componentes Disponibles

### 1. **CheckoutForm** - Formulario de Checkout Completo
```tsx
import { CheckoutForm } from '@/components/payment';

<CheckoutForm
  items={cartItems}
  onClose={() => setShowCheckout(false)}
  locale="es"
/>
```

**Características:**
- ✅ Formulario completo de información del cliente
- ✅ Validación de campos requeridos
- ✅ Resumen de pedido con totales
- ✅ Integración con Mercado Pago
- ✅ Soporte para múltiples idiomas

### 2. **OrderSummary** - Resumen de Pedido
```tsx
import { OrderSummary } from '@/components/payment';

<OrderSummary
  items={cartItems}
  locale="es"
  showCheckoutButton={true}
  onCheckout={handleCheckout}
  checkoutLoading={false}
/>
```

**Características:**
- ✅ Lista de productos con precios
- ✅ Cálculo automático de totales
- ✅ Información de región y moneda
- ✅ Botón de checkout opcional

### 3. **EnhancedCart** - Carrito Mejorado
```tsx
import { EnhancedCart } from '@/components/payment';

<EnhancedCart locale="es" />
```

**Características:**
- ✅ Drawer lateral con productos
- ✅ Controles de cantidad
- ✅ Integración con sistema de pagos
- ✅ Validación de región

### 4. **CartButton** - Botón de Carrito
```tsx
import { CartButton } from '@/components/payment';

<CartButton locale="es" className="ml-4" />
```

**Características:**
- ✅ Contador de items
- ✅ Indicador de estado
- ✅ Validación de región

### 5. **AddToCartButton** - Botón Agregar al Carrito
```tsx
import { AddToCartButton } from '@/components/payment';

<AddToCartButton
  product={product}
  locale="es"
  variant="default"
  size="md"
/>
```

**Características:**
- ✅ Estados visuales (agregando, agregado, en carrito)
- ✅ Validación de región
- ✅ Múltiples variantes y tamaños

### 6. **RegionSelector** - Selector de Región
```tsx
import { RegionSelector } from '@/components/payment';

<RegionSelector showLabel={true} />
```

**Características:**
- ✅ Lista de países de Latinoamérica
- ✅ Detección automática
- ✅ Validación de región soportada

## 🪝 Hooks Disponibles

### 1. **useCart** - Gestión del Carrito
```tsx
import { useCart } from '@/hooks/useCart';

const {
  items,
  isOpen,
  setIsOpen,
  addItem,
  removeItem,
  updateQuantity,
  clearCart,
  getTotals,
  getTotalItems,
  isEmpty
} = useCart();
```

### 2. **useRegion** - Gestión de Región
```tsx
import { useRegion } from '@/hooks/useRegion';

const {
  region,
  loading,
  setRegion
} = useRegion();
```

### 3. **usePayment** - Gestión de Pagos
```tsx
import { usePayment } from '@/hooks/usePayment';

const {
  createPaymentIntent,
  processPayment,
  loading
} = usePayment();
```

## 🚀 Ejemplos de Integración

### 1. **Integración Básica en la Tienda**
```tsx
"use client";

import { CartButton, EnhancedCart, AddToCartButton } from '@/components/payment';
import { useCart } from '@/hooks/useCart';

export default function ShopPage() {
  const { addItem } = useCart();

  return (
    <div>
      {/* Header con carrito */}
      <header className="flex justify-between items-center p-4">
        <h1>Mi Tienda</h1>
        <CartButton locale="es" />
      </header>

      {/* Productos */}
      <div className="grid grid-cols-3 gap-4 p-4">
        {products.map(product => (
          <div key={product.id} className="border p-4">
            <img src={product.image} alt={product.title} />
            <h3>{product.title}</h3>
            <AddToCartButton
              product={product}
              locale="es"
            />
          </div>
        ))}
      </div>

      {/* Carrito */}
      <EnhancedCart locale="es" />
    </div>
  );
}
```

### 2. **Integración con Carrito Existente**
```tsx
"use client";

import { CheckoutForm, OrderSummary } from '@/components/payment';
import { useCart } from '@/hooks/useCart';

export default function ExistingCart() {
  const { items, getTotals } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  return (
    <div>
      {/* Tu carrito existente */}
      <div className="cart-items">
        {items.map(item => (
          <div key={item.id}>
            {/* Tu lógica de carrito existente */}
          </div>
        ))}
      </div>

      {/* Resumen de pedido */}
      <OrderSummary
        items={items}
        locale="es"
        showCheckoutButton={true}
        onCheckout={() => setShowCheckout(true)}
      />

      {/* Formulario de checkout */}
      {showCheckout && (
        <CheckoutForm
          items={items}
          onClose={() => setShowCheckout(false)}
          locale="es"
        />
      )}
    </div>
  );
}
```

### 3. **Integración con Sanity Products**
```tsx
"use client";

import { AddToCartButton } from '@/components/payment';
import { urlFor } from '@/lib/sanity';

export default function SanityProductCard({ product, locale }) {
  const productData = {
    id: product._id,
    title: product.content[locale].title,
    subtitle: product.content[locale].subtitle,
    image: urlFor(product.image).width(300).height(300).url(),
    productType: product.category
  };

  return (
    <div className="product-card">
      <img src={productData.image} alt={productData.title} />
      <h3>{productData.title}</h3>
      <p>{productData.subtitle}</p>
      
      <AddToCartButton
        product={productData}
        locale={locale}
        variant="outline"
        size="lg"
      />
    </div>
  );
}
```

## 🎨 Personalización

### **Variantes de Botones**
```tsx
// Botón por defecto
<AddToCartButton variant="default" />

// Botón con borde
<AddToCartButton variant="outline" />

// Botón fantasma
<AddToCartButton variant="ghost" />
```

### **Tamaños de Botones**
```tsx
// Pequeño
<AddToCartButton size="sm" />

// Mediano (por defecto)
<AddToCartButton size="md" />

// Grande
<AddToCartButton size="lg" />
```

### **Estilos Personalizados**
```tsx
<CartButton 
  locale="es" 
  className="bg-blue-600 hover:bg-blue-700" 
/>
```

## 🔧 Configuración Requerida

### **Variables de Entorno**
```bash
MERCADOPAGO_ACCESS_TOKEN=your_token
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### **Inicialización de Proveedores**
```tsx
// En tu layout o _app.tsx
import { initializePaymentProviders } from '@/lib/payment/config';

useEffect(() => {
  initializePaymentProviders();
}, []);
```

## 📱 Responsive Design

Todos los componentes están optimizados para dispositivos móviles:

- ✅ **Mobile First**: Diseño optimizado para móviles
- ✅ **Touch Friendly**: Botones y controles táctiles
- ✅ **Responsive Grid**: Adaptación automática a diferentes pantallas
- ✅ **Drawer Mobile**: Carrito como drawer en móviles

## 🌍 Internacionalización

Los componentes soportan múltiples idiomas:

```tsx
// Español
<CheckoutForm locale="es" />

// Inglés
<CheckoutForm locale="en" />
```

**Textos soportados:**
- ✅ Formularios de checkout
- ✅ Mensajes de error
- ✅ Botones y acciones
- ✅ Información de región

## 🧪 Testing

### **Testing de Componentes**
```tsx
import { render, screen } from '@testing-library/react';
import { CartButton } from '@/components/payment';

test('renders cart button', () => {
  render(<CartButton locale="es" />);
  expect(screen.getByText('Carrito')).toBeInTheDocument();
});
```

### **Testing de Hooks**
```tsx
import { renderHook, act } from '@testing-library/react';
import { useCart } from '@/hooks/useCart';

test('adds item to cart', () => {
  const { result } = renderHook(() => useCart());
  
  act(() => {
    result.current.addItem(mockProduct);
  });
  
  expect(result.current.items).toHaveLength(1);
});
```

## 🚀 Próximos Pasos

1. **Integrar con tu carrito existente**
2. **Personalizar estilos según tu diseño**
3. **Configurar webhooks de confirmación**
4. **Implementar gestión de órdenes**
5. **Agregar analytics de conversión**

## 📞 Soporte

Para dudas o problemas:
1. Revisar logs en consola del navegador
2. Verificar variables de entorno
3. Consultar documentación de Mercado Pago
4. Revisar ejemplos en esta guía

---

**Versión**: 1.0.0  
**Última actualización**: Diciembre 2024  
**Compatibilidad**: Next.js 15, React 18, TypeScript
