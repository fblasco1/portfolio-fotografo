# Portfolio Fotográfico - Funcionalidades del Proyecto

Documentación técnica de las funcionalidades implementadas en el proyecto.

---

## 1. Visión General

Portfolio fotográfico con tienda online integrada. Tecnologías principales:

- **Next.js 15** (App Router)
- **Sanity CMS** (contenido)
- **Mercado Pago** (Checkout API + Orders API v2)
- **Supabase** (auth admin)
- **Tailwind CSS** (estilos)

---

## 2. Rutas Públicas

| Ruta | Descripción |
|------|-------------|
| `/[locale]` | Inicio |
| `/[locale]/gallery` | Galería de fotos / tienda |
| `/[locale]/bio` | Biografía |
| `/[locale]/book` | Libro |
| `/[locale]/documentaries` | Documentales |
| `/[locale]/checkout` | Checkout de pago |
| `/[locale]/payment/success` | Pago exitoso |
| `/[locale]/payment/pending` | Pago pendiente |
| `/[locale]/payment/failure` | Pago rechazado |
| `/[locale]/contact` | Contacto |

### Internacionalización

- Locales: `es`, `en`
- Todas las rutas públicas soportan prefijo de idioma.

---

## 3. Flujo de Compra

```
Galería → Agregar al carrito → Carrito → Checkout → Pago MP → Resultado
```

### 3.1 Carrito

- Contexto global (`CartContext`)
- Persistencia en `localStorage`
- Items: fotos con tipo (foto/postal) y tamaño seleccionable

### 3.2 Checkout

1. **Revisar pedido**: items, tamaños, precios
2. **Información de contacto**: email, nombre, apellido, teléfono, dirección (obligatorios)
3. **Formulario de pago**: tarjeta (Mercado Pago SDK v2)

### 3.3 Pago

- **Endpoint**: `/api/payment/v2/create-payment`
- **Flujo**: Crear orden en MP → Asociar pago con token de tarjeta
- **Modo prueba** (credenciales TEST-): usa Payments API para tarjetas de prueba sin cobro real
- **Modo producción** (credenciales APP_USR-): usa Orders API

---

## 4. Panel de Administración

| Ruta | Descripción | Protección |
|------|-------------|------------|
| `/admin` | Hub: elegir Órdenes o Contenido | Login |
| `/admin/login` | Inicio de sesión | Pública |
| `/admin/dashboard` | Dashboard de órdenes (API MP) | Login |
| `/admin/orders/[id]` | Detalle de orden + Reembolsar | Login |
| `/admin/studio` | Sanity Studio (gestión de contenido) | Login |

### Auth Admin

- Supabase Auth
- Email permitido: `pirovanofotografia@gmail.com`
- Middleware protege `/admin/*` (excepto `/admin/login`)

### Dashboard de Órdenes

- Alimentado por **Supabase** (órdenes persistidas)
- La orden se guarda **al crear el pago** (info del cliente que la API MP no devuelve después)
- Los **webhooks** actualizan el estado (processed, refunded, etc.)
- Filtro por rango de fechas (Desde / Hasta, máx. 30 días)
- Filtro por estado (Todas, Pending, Approved, Rejected)
- Detalle: info del pagador y del pago (desde Supabase)
- Botón **Reembolsar** en órdenes aprobadas (vía API Mercado Pago)

Ver `docs/FLUJO-ORDENES-SUPABASE.md`.

### Sanity Studio

- Base path: `/admin/studio`
- Gestión de: galerías, libro, biografía, documentales, precios, configuraciones

---

## 5. APIs Internas

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/payment/v2/create-payment` | POST | Crear pago (Orders API o Payments API) |
| `/api/payment/webhook/mercadopago` | POST | Webhook de notificaciones MP |
| `/api/admin/orders` | GET | Listar órdenes (desde Supabase) |
| `/api/admin/orders/[id]` | GET | Detalle de orden (desde Supabase) |
| `/api/admin/orders/[id]/refund` | POST | Reembolsar orden |
| `/api/admin/payments/[id]` | GET | Consultar pago por ID |
| `/api/pricing` | GET | Precios desde Sanity |
| `/api/contact` | POST | Formulario de contacto |

---

## 6. Webhooks y Notificaciones

### Webhook Mercado Pago

- URL: `{BASE_URL}/api/payment/webhook/mercadopago`
- Eventos: `payment`, `merchant_order` (topic_merchant_order_wh)
- Validación de firma con `MERCADOPAGO_WEBHOOK_SECRET`

### Emails automáticos

- Envío al aprobar un pago (Resend)
- Email al fotógrafo: detalles de venta
- Email al cliente: confirmación de compra

---

## 7. Estructura de Archivos Clave

```
app/
├── [locale]/           # Rutas públicas con i18n
│   ├── checkout/       # CheckoutPage, flujo de pago
│   ├── gallery/        # Tienda
│   └── ...
├── admin/              # Panel admin
│   ├── dashboard/      # Órdenes
│   ├── orders/[id]     # Detalle + reembolso
│   └── studio/         # Sanity
└── api/
    ├── payment/v2/     # Create payment
    ├── payment/webhook/mercadopago
    └── admin/          # Orders, payments

components/
└── payment/            # PaymentForm, CardForm, MercadoPagoScript

lib/
├── payment/            # mercadopago.service, payment-factory
├── orders/             # supabase-orders (persistir órdenes al crear)
├── mercadopago-admin   # API admin (refunds)
└── email/              # Notificaciones

contexts/
├── CartContext
└── RegionContext
```

---

## 8. Variables de Entorno

| Variable | Uso |
|----------|-----|
| `MERCADOPAGO_ACCESS_TOKEN` | Backend (crear pagos, admin API) |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | Frontend (tokenizar tarjeta) |
| `MERCADOPAGO_WEBHOOK_SECRET` | Validar firma webhook |
| `NEXT_PUBLIC_BASE_URL` | URLs de callback, webhook |
| `NEXT_PUBLIC_SANITY_*` | Sanity CMS |
| `RESEND_API_KEY` | Envío de emails |
| `NEXT_PUBLIC_SUPABASE_*` | Auth admin |

---

*Para pruebas de integración, ver `01-PRUEBAS-INTEGRACION-MERCADOPAGO.md`.*
