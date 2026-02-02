# 📸 Portfolio Fotográfico

Portfolio fotográfico con tienda online integrada con **Mercado Pago Checkout API** (Orders API v2).

## Características

- **Next.js 15** · App Router · TypeScript · Tailwind
- **Sanity CMS** para contenido (galerías, libro, documentales)
- **Mercado Pago** pagos con tarjeta (crédito/débito)
- **Panel admin** con auth Supabase: órdenes desde API MP + Sanity Studio
- **i18n** (ES/EN)

## Inicio rápido

```bash
git clone <repo>
cd portfolio-fotografo
npm install
cp env.example .env.local
# Configurar .env.local (Sanity, Mercado Pago, Supabase)
npm run dev
```

### Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SANITY_*` | Sanity CMS |
| `MERCADOPAGO_ACCESS_TOKEN` | Access Token MP (APP_USR- en prod) |
| `NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY` | Public Key MP |
| `NEXT_PUBLIC_BASE_URL` | URL base (ej. `http://localhost:3000`) |
| `NEXT_PUBLIC_SUPABASE_*` | Supabase (auth admin) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role para admin |
| `RESEND_API_KEY` | Emails de notificación |

Ver `env.example` y [docs/CONFIGURACION-SUPABASE.md](docs/CONFIGURACION-SUPABASE.md) para el panel admin.

## Panel Admin

- **Login**: `/admin/login` (email configurado en Supabase)
- **Hub**: `/admin` → Órdenes | Contenido
- **Órdenes**: `/admin/dashboard` (datos desde API Mercado Pago)
- **Sanity Studio**: `/admin/studio`

Configuración: [docs/CONFIGURACION-SUPABASE.md](docs/CONFIGURACION-SUPABASE.md)

## Testing y producción

| Recurso | Documento |
|---------|-----------|
| Pruebas de integración MP | [docs/01-PRUEBAS-INTEGRACION-MERCADOPAGO.md](docs/01-PRUEBAS-INTEGRACION-MERCADOPAGO.md) |
| Tarjetas de prueba | [docs/mercadopago-test-cards.md](docs/mercadopago-test-cards.md) |
| Calidad y medición MP | [docs/CHECKLIST-CALIDAD-PRODUCCION.md](docs/CHECKLIST-CALIDAD-PRODUCCION.md) |
| Webhook | [docs/webhook-setup.md](docs/webhook-setup.md) |
| Deploy | [docs/production-checklist.md](docs/production-checklist.md) |

### Flujo de prueba rápido

1. Tienda → `/es/gallery` → agregar al carrito
2. Checkout → seleccionar tamaño → contacto → tarjeta
3. Titular: `APRO`, DNI: `12345678` (pago aprobado)

## Estructura

```
app/
├── [locale]/        # Rutas públicas (gallery, checkout, etc.)
├── admin/           # Panel (login, dashboard, studio)
└── api/
    ├── payment/     # Crear pago, webhook
    └── admin/       # Órdenes, reembolsos (proxy a MP)
components/payment/  # PaymentForm, CardForm, MercadoPagoScript
lib/
├── payment/         # mercadopago.service
├── mercadopago-admin # API órdenes MP
└── supabase/        # Auth admin
```

## Comandos

```bash
npm run dev          # Desarrollo
npm run build        # Build producción
npm run sanity:dev   # Sanity Studio (standalone)
```

## Documentación

Índice completo: [docs/README.md](docs/README.md)
