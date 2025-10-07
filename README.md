# 📸 Portfolio de Fotografía - Cristian Pirovano

Sistema completo de portfolio fotográfico con tienda online, CMS Sanity y procesamiento de pagos con Mercado Pago.

## 🚀 Inicio Rápido

### 1. Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp env.example .env.local
# Editar .env.local con tus credenciales
```

### 2. Variables de Entorno Requeridas

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Configuración de Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=tu-project-id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-08-18
SANITY_API_TOKEN=tu-token-de-sanity

# Mercado Pago (Pagos para Latinoamérica)
MERCADOPAGO_ACCESS_TOKEN=tu-access-token

# Resend (Emails - opcional)
RESEND_API_KEY=tu-resend-api-key

# URL de la aplicación
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Ejecutar el Proyecto

```bash
# Modo desarrollo
npm run dev

# Compilar para producción
npm run build
npm start
```

### 4. Acceder a la Aplicación

- **Frontend**: http://localhost:3000
- **Panel de Admin (Sanity Studio)**: http://localhost:3000/admin

## 📋 Características Principales

### ✅ Portfolio y Galerías
- Sistema de galerías organizadas por colección
- Visualización optimizada de imágenes con next/image
- Slideshow automático en página principal
- Responsive design (móvil y escritorio)
- Soporte multiidioma (Español/Inglés)

### ✅ Tienda Online
- Productos (Fotografías y Postales)
- Carrito de compras con persistencia en localStorage
- Precios específicos por país/moneda
- Sistema de checkout completo
- Integración con Mercado Pago

### ✅ CMS Sanity
- Panel de administración completo
- Gestión de productos con precios por región
- Gestión de galerías
- Configuración de biografía
- Configuración del libro
- Sistema de metadatos y ordenamiento

### ✅ Sistema de Pagos
- **Mercado Pago** para Latinoamérica
- Detección automática de región por IP
- Conversión de precios automática
- Soporte para 7 países:
  - 🇦🇷 Argentina (ARS)
  - 🇧🇷 Brasil (BRL)
  - 🇨🇱 Chile (CLP)
  - 🇨🇴 Colombia (COP)
  - 🇲🇽 México (MXN)
  - 🇵🇪 Perú (PEN)
  - 🇺🇾 Uruguay (UYU)

### ✅ Internacionalización
- Español (es)
- Inglés (en)
- Cambio de idioma dinámico
- Rutas localizadas

## 📁 Estructura del Proyecto

```
portfolio-fotografo/
├── app/                          # Aplicación Next.js 15
│   ├── [locale]/                 # Rutas localizadas
│   │   ├── bio/                  # Página de biografía
│   │   ├── book/                 # Página del libro
│   │   ├── gallery/              # Galerías
│   │   ├── shop/                 # Tienda
│   │   ├── checkout/             # Proceso de checkout
│   │   └── contact/              # Contacto
│   ├── admin/                    # Panel de Sanity Studio
│   └── api/                      # API Routes
│       ├── contact/              # Envío de emails
│       ├── geolocation/          # Detección de región
│       ├── payment/              # Procesamiento de pagos
│       ├── send-order/           # Envío de órdenes
│       └── subscribe/            # Newsletter
│
├── components/                   # Componentes reutilizables
│   └── payment/                  # Componentes de pago
│       ├── AddToCartButton.tsx
│       ├── CartButton.tsx
│       ├── CheckoutForm.tsx
│       ├── EnhancedCart.tsx
│       ├── OrderSummary.tsx
│       ├── PaymentConfirmation.tsx
│       ├── RegionSelector.tsx
│       └── ShopIntegration.tsx
│
├── hooks/                        # Custom React Hooks
│   ├── useCart.ts               # Gestión del carrito
│   ├── usePayment.ts            # Procesamiento de pagos
│   └── useRegion.ts             # Detección de región
│
├── lib/                          # Utilidades y configuración
│   ├── payment/                  # Sistema de pagos
│   │   ├── config.ts            # Configuración de precios
│   │   ├── mercadopago.service.ts
│   │   ├── payment-factory.ts
│   │   └── region-detector.ts
│   ├── sanity.ts                # Cliente de Sanity
│   ├── sanity-safe.ts           # Wrapper seguro de Sanity
│   ├── sanity-products.ts       # Helpers de productos
│   └── queries.ts               # Queries de Sanity
│
├── sanity/                       # Configuración de Sanity CMS
│   ├── schemaTypes/             # Schemas de Sanity
│   │   ├── bio.ts
│   │   ├── book.ts
│   │   ├── gallery.ts
│   │   ├── product.ts
│   │   └── settings.ts
│   └── structure.ts             # Estructura del Studio
│
├── locales/                      # Traducciones
│   ├── es.ts                    # Español
│   └── en.ts                    # Inglés
│
└── constants/                    # Constantes del proyecto
    ├── store.ts
    └── locales.ts
```

## 🔧 Configuración de Sanity CMS

### 1. Crear Proyecto en Sanity

1. Ve a https://sanity.io y crea una cuenta
2. Crea un nuevo proyecto
3. Obtén el `Project ID` y `Dataset`
4. Genera un `API Token` con permisos de editor

### 2. Configurar Variables de Entorno

Agrega las credenciales de Sanity a tu `.env.local`:

```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=tu-project-id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_API_VERSION=2025-08-18
SANITY_API_TOKEN=tu-token
```

### 3. Acceder al Panel de Administración

```bash
# Iniciar el servidor
npm run dev

# Abrir el panel de admin
http://localhost:3000/admin
```

### 4. Crear Productos

En el panel de Sanity Studio:

1. Ve a **Productos**
2. Crea un nuevo producto
3. Completa los campos:
   - Imagen
   - Categoría (Fotografía o Postal)
   - Contenido (Título y subtítulo en ES/EN)
   - **Precios por Región**: Configura al menos un precio
   - Disponibilidad

**Importante**: Debes configurar al menos un precio regional para que el producto sea válido.

## 💳 Sistema de Pagos

### Configuración de Mercado Pago

1. **Crear cuenta en Mercado Pago**
   - Ve a https://www.mercadopago.com/developers
   - Crea una aplicación
   - Obtén tu Access Token

2. **Configurar variables de entorno**
   ```bash
   # Para testing (Sandbox)
   MERCADOPAGO_ACCESS_TOKEN=TEST-xxxx-xxxx-xxxx-xxxx
   
   # Para producción
   MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxx-xxxx-xxxx-xxxx
   ```

3. **Tarjetas de prueba**
   - Tarjeta: 5031 7557 3453 0604
   - CVV: 123
   - Fecha: 11/25
   - Nombre: APRO

### Flujo de Compra

1. Usuario navega por la tienda
2. Agrega productos al carrito
3. Sistema detecta automáticamente el país del usuario
4. Precios se muestran en moneda local
5. Usuario completa el formulario de checkout
6. Se crea una sesión de pago en Mercado Pago
7. Usuario es redirigido a Mercado Pago para completar el pago
8. Confirmación y envío de orden por email

## 🌍 Precios por Región

Los precios se configuran directamente en Sanity CMS para cada producto. Cada producto puede tener precios diferentes en cada país:

```typescript
// Ejemplo de configuración en Sanity
pricing: {
  argentina: {
    price: 50000,    // ARS
    enabled: true
  },
  brazil: {
    price: 250,      // BRL
    enabled: true
  },
  mexico: {
    price: 1000,     // MXN
    enabled: true
  }
  // ... más países
}
```

## 📧 Sistema de Emails (Opcional)

El proyecto usa Resend para enviar emails:

1. **Crear cuenta en Resend**
   - Ve a https://resend.com
   - Crea una cuenta
   - Obtén tu API Key

2. **Configurar variable de entorno**
   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   ```

3. **Funcionalidades**
   - Envío de órdenes de compra
   - Formulario de contacto
   - Newsletter (opcional)

## 🧪 Testing

### Testing Local

```bash
# Ejecutar en modo desarrollo
npm run dev

# Verificar funcionalidades:
# - Navegación entre páginas
# - Cambio de idioma
# - Agregar productos al carrito
# - Proceso de checkout
# - Detección de región
```

### Testing de Pagos

```bash
# Usar las credenciales de sandbox de Mercado Pago
# Usar tarjetas de prueba proporcionadas por Mercado Pago
```

## 🚀 Despliegue

### Vercel (Recomendado)

1. **Conectar repositorio**
   - Ve a https://vercel.com
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente Next.js

2. **Configurar variables de entorno**
   - Agrega todas las variables de `.env.local` en el panel de Vercel
   - No olvides las variables de Sanity y Mercado Pago

3. **Desplegar**
   ```bash
   # Vercel desplegará automáticamente en cada push a main
   ```

### Otras plataformas

El proyecto es compatible con cualquier plataforma que soporte Next.js 15:
- Netlify
- AWS Amplify
- Railway
- Render

## 🔒 Seguridad

- ✅ Validación de datos en frontend y backend
- ✅ Sanitización de inputs
- ✅ Variables sensibles en variables de entorno
- ✅ HTTPS obligatorio en producción
- ✅ PCI-DSS compliance (Mercado Pago)
- ✅ Protección de datos personales

## 🐛 Solución de Problemas

### Panel de administración no carga

1. Verificar variables de entorno:
   ```bash
   node scripts/check-sanity-config.js
   ```

2. Verificar que el servidor esté corriendo:
   ```bash
   npm run dev
   ```

3. Limpiar caché:
   ```bash
   rm -rf .next
   npm run dev
   ```

### Productos no aparecen

1. Verificar que existan productos en Sanity
2. Verificar que tengan `isAvailable: true`
3. Verificar que tengan al menos un precio configurado
4. Revisar la consola del navegador por errores

### Pagos no funcionan

1. Verificar variables de entorno de Mercado Pago
2. Verificar que el token sea válido
3. Revisar logs en la consola del servidor
4. Verificar que el país del usuario esté soportado

### Errores de build

1. Verificar versiones de Node.js (>=18)
2. Limpiar node_modules:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Verificar que todas las dependencias estén instaladas

## 📚 Documentación Técnica

### Stack Tecnológico

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, TailwindCSS 4, shadcn/ui
- **CMS**: Sanity CMS v4
- **Pagos**: Mercado Pago
- **Emails**: Resend
- **i18n**: next-international
- **TypeScript**: Strict mode

### APIs Disponibles

- `GET/POST /api/payment/region` - Detección de región
- `POST /api/payment/create-intent` - Crear sesión de pago
- `POST /api/contact` - Enviar mensaje de contacto
- `POST /api/send-order` - Enviar orden por email
- `POST /api/subscribe` - Suscribirse a newsletter

## 🤝 Contribuir

Este proyecto está en la rama `feature/payment`. Para contribuir:

1. Hacer fork del repositorio
2. Crear una rama feature (`git checkout -b feature/nueva-caracteristica`)
3. Commit cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abrir un Pull Request

## 📄 Licencia

Todos los derechos reservados - Cristian Pirovano

## 📞 Soporte

Para dudas o problemas:
1. Revisar esta documentación
2. Revisar logs en consola
3. Verificar variables de entorno
4. Contactar al desarrollador

---

**Versión**: 1.0.0  
**Última actualización**: Octubre 2025  
**Estado**: ✅ Listo para producción (configuración pendiente de Mercado Pago)
