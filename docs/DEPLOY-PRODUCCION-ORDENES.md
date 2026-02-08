# Despliegue a Producción - Persistencia de Órdenes

Pasos para implementar los cambios de órdenes en Supabase en producción.

---

## 1. Pre-requisitos

- [ ] `docs/MERGE-PRODUCCION.md` — variables y checklist revisado
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurado en Vercel/producción

---

## 2. Migración Supabase (OBLIGATORIO antes del deploy)

Ejecutar en **Supabase Dashboard** → SQL Editor → New Query:

```sql
-- Migración 002: payer y payment_info
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payer JSONB DEFAULT '{}'::jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_info JSONB DEFAULT '{}'::jsonb;
CREATE INDEX IF NOT EXISTS idx_orders_mercadopago_order_id ON orders(mercadopago_order_id);
```

O con Supabase CLI desde el proyecto:

```bash
npx supabase db push
```

---

## 3. Merge a producción

```bash
# Desde develop (rama actual)
git checkout master
git pull origin master
git merge develop
git push origin master
```

Si usas Vercel conectado a `master`, el deploy se dispara automáticamente.

---

## 4. Verificación post-deploy

1. **Login admin**: `https://tu-dominio.com/admin/login`
2. **Dashboard**: `/admin/dashboard` — debe cargar órdenes (vacío si no hay aún)
3. **Pago de prueba**: Realizar un pago de prueba → verificar que se cree la orden en Supabase
4. **Webhook**: Confirmar que el webhook actualice el estado cuando MP notifique (processed, etc.)

---

## 5. Notas

- Las órdenes **nuevas** se persisten al crear el pago.
- Las órdenes **antiguas** (antes de este deploy) no aparecerán en el admin hasta que haya nuevos pagos.
- El webhook debe tener configurado el evento **order** (Órdenes comerciales).
