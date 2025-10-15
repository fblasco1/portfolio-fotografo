# 📸 Portfolio Fotográfico - E-commerce con Mercado Pago

Portfolio fotográfico profesional con tienda online integrada con **Mercado Pago Checkout API (Transparente)**.

## 🚀 Características

- ✅ **Next.js 15** con App Router
- ✅ **Sanity CMS** para gestión de contenido
- ✅ **Mercado Pago Checkout API** (Transparente)
- ✅ **Internacionalización** (ES/EN)
- ✅ **Responsive Design**
- ✅ **Pago único** sin cuotas
- ✅ **Sin envío/IVA** (se acuerda con vendedor)

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

## 🧪 Testing - Tarjetas de Prueba

### Tarjetas de Prueba Mercado Pago

| Estado | Número | Titular | CVV | DNI |
|--------|--------|---------|-----|-----|
| ✅ Aprobado | `5031 7557 3453 0604` | `APRO` | `123` | `12345678` |
| ⏳ Pendiente | `5031 7557 3453 0604` | `CONT` | `123` | `12345678` |
| ❌ Rechazado | `5031 7557 3453 0604` | `OTHE` | `123` | `12345678` |

### Flujo de Prueba

1. **Ir a la tienda**: `http://localhost:3000/es/shop`
2. **Agregar productos** al carrito
3. **Ir al checkout**: `http://localhost:3000/es/checkout`
4. **Completar formulario** de contacto
5. **Datos de pago** con tarjeta de prueba
6. **Verificar resultado** en modal

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

## 📁 Estructura del Proyecto

```
├── app/
│   ├── [locale]/          # Rutas internacionalizadas
│   │   ├── shop/          # Tienda
│   │   ├── checkout/      # Checkout
│   │   └── components/    # Componentes UI
│   ├── api/
│   │   └── payment/       # APIs de pago
│   └── types/             # Tipos TypeScript
├── components/
│   └── payment/           # Componentes de pago
├── lib/
│   └── payment/           # Servicios de pago
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