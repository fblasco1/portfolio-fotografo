# 📸 Portfolio Fotográfico - E-commerce con Mercado Pago

Portfolio fotográfico profesional con tienda online integrada con **Mercado Pago Checkout API**.

## 🚀 Características

- ✅ **Next.js 15** con App Router
- ✅ **Sanity CMS** para gestión de contenido
- ✅ **Mercado Pago Checkout API** 
- ✅ **Internacionalización** (ES/EN)
- ✅ **Responsive Design**
- ✅ **Pago único** sin cuotas
- ✅ **Sin envío/IVA** 

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **CMS**: Sanity
- **Pagos**: Mercado Pago Checkout API
- **Deploy**: Vercel/Netlify

## 📋 Requisitos Previos

- Node.js 18+
- npm/yarn
- Cuenta de Mercado Pago (Sandbox/Producción)
- Proyecto Sanity configurado

## ⚙️ Instalación

1. **Clonar repositorio**
```bash
git clone <repository-url>
cd portfolio-fotografo
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp env.example .env.local
```

4. **Configurar .env.local**
```env
# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=tu_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-08-18
SANITY_API_TOKEN=tu_api_token

# Mercado Pago (Sandbox para desarrollo)
MERCADOPAGO_ACCESS_TOKEN=TEST-tu_access_token
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-tu_public_key

# Base URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

## 🧪 Testing - Pruebas de Integración

Para una guía completa de pruebas (cuentas de prueba, credenciales, simulación paso a paso), consulta:

**[docs/01-PRUEBAS-INTEGRACION-MERCADOPAGO.md](docs/01-PRUEBAS-INTEGRACION-MERCADOPAGO.md)**

### Flujo rápido

1. Ir a la tienda (`/es/gallery`)
2. Agregar productos al carrito
3. Ir al checkout (`/es/checkout`)
4. Seleccionar tamaño de la imagen
5. Completar información de contacto
6. Completar datos de tarjeta (titular: `APRO`, DNI: `12345678` para pago aprobado)

## 🚀 Deploy a Producción

### 1. Configurar Variables de Producción

```env
# Mercado Pago (Producción)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-tu_access_token_prod
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-tu_public_key_prod

# Base URL de producción
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com
```

### 2. Deploy en Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### 3. Configurar Webhook en Mercado Pago

1. **Ir a tu panel de Mercado Pago**
2. **Configurar webhook**:
   - URL: `https://tu-dominio.com/api/payment/webhook/mercadopago`
   - Eventos: `payment`
   - **Secret (opcional)**: Configurar `MERCADOPAGO_WEBHOOK_SECRET` para validación de firmas

### 4. Configurar Notificaciones por Email

1. **Configurar Resend**:
   - Obtener API key de [Resend](https://resend.com)
   - Configurar `RESEND_API_KEY` en variables de entorno

2. **Probar emails automáticos**:
   ```bash
   node scripts/test-email-notifications.js
   ```

## 🛒 Sistema de Carrito Unificado

El proyecto utiliza un sistema de carrito unificado que integra:

### 🎯 **Componentes Principales:**
- **`Cart.tsx`**: Carrito principal con integración completa
- **`ProductCard.tsx`**: Tarjeta de producto unificada para ambos tipos
- **`AddToCartButton.tsx`**: Botón para agregar productos al carrito
- **`CartButton.tsx`**: Botón flotante del carrito
- **`CheckoutPage.tsx`**: Página dedicada de checkout

### 🔄 **Flujo Unificado:**
```
Tienda → AddToCartButton → Cart → CheckoutPage → Mercado Pago → Webhook → Emails
```

### ✅ **Beneficios:**
- **Sistema único**: Un solo carrito y ProductCard para toda la aplicación
- **Integración completa**: Con hooks de región y pagos
- **UX consistente**: Misma experiencia en todas las páginas
- **Mantenimiento simple**: Un solo sistema que mantener
- **Sin duplicación**: Componentes unificados para ambos tipos de productos

## 🔔 Sistema de Notificaciones Automáticas

El sistema envía emails automáticamente cuando un pago es aprobado:

### 📧 Email al Fotógrafo
- **Contenido**: Detalles del pago, información del cliente, productos comprados, dirección de envío
- **Propósito**: Notificar nueva venta y coordinar envío
- **Destinatario**: `pirovanofotografia@gmail.com`

### 📧 Email al Cliente
- **Contenido**: Confirmación de compra, detalles de productos, próximos pasos
- **Propósito**: Confirmar compra y generar confianza
- **Destinatario**: Email del cliente que realizó la compra

### 🧪 Probar Notificaciones

#### Probar solo los emails:
```bash
node scripts/test-email-notifications.js
```

#### Probar el webhook completo:
```bash
# Configurar variables de entorno (opcional)
export WEBHOOK_URL="http://localhost:3000/api/payment/webhook/mercadopago"
export MERCADOPAGO_WEBHOOK_SECRET="tu_secret_aqui"

# Ejecutar prueba del webhook
node scripts/test-webhook-complete.js
```

#### Probar en producción:
```bash
export WEBHOOK_URL="https://tu-dominio.com/api/payment/webhook/mercadopago"
node scripts/test-webhook-complete.js
```

## 📁 Estructura del Proyecto

```
├── app/
│   ├── [locale]/          # Rutas internacionalizadas
│   │   ├── shop/          # Tienda
│   │   ├── checkout/      # Checkout
│   │   └── components/    # Componentes UI
│   ├── api/
│   │   └── payment/       # APIs de pago
│   │       └── webhook/   # Webhook de Mercado Pago
│   └── types/             # Tipos TypeScript
├── components/
│   └── payment/           # Componentes de pago unificados
├── lib/
│   ├── email/             # Servicio de notificaciones por email
│   └── payment/           # Servicios de pago
├── scripts/
│   ├── test-email-notifications.js  # Script de prueba de emails
│   └── test-webhook-complete.js     # Script de prueba del webhook completo
├── hooks/                 # React hooks
├── contexts/              # React contexts
└── sanity/                # Configuración Sanity
```

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Sanity Studio
npm run sanity:dev

# Deploy Sanity
npm run sanity:deploy
```

## 📞 Soporte

- **Mercado Pago**: [Documentación oficial](https://www.mercadopago.com.ar/developers)
- **Sanity**: [Documentación oficial](https://www.sanity.io/docs)
- **Next.js**: [Documentación oficial](https://nextjs.org/docs)

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.

---

**¡Tu tienda online está lista para recibir pagos!** 🎉