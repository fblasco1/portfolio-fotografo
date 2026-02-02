# Configuración de Supabase - Panel Admin

## Inicio rápido (5 min)

1. **Instalar**: `npm install @supabase/supabase-js @supabase/ssr`
2. **SERVICE_ROLE_KEY**: Supabase Dashboard → Settings → API → copiar `service_role` key (no `anon`)
3. **`.env.local`** (valores en Settings → API de Supabase):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
   SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
   ```
4. **Migración**: SQL Editor → ejecutar `supabase/migrations/001_create_orders_tables.sql`
5. **Usuario admin**: Authentication → Users → Add user → Email `pirovanofotografia@gmail.com`, Auto Confirm ON
6. **Probar**: `npm run dev` → `http://localhost:3000/admin/login`

Tras login: **Panel** (`/admin`) → Órdenes (`/admin/dashboard`) | Contenido (`/admin/studio`).

---

## Pasos detallados

### 1. Obtener SERVICE_ROLE_KEY

- Supabase Dashboard: https://app.supabase.com
- Proyecto: `ycucfyjhnnuhyggazzud`
- Settings → API → Project API keys → copiar **`service_role`** (no exponer al cliente)

### 2. Variables de entorno

Crear `.env.local`. Obtener URL y keys en Supabase Dashboard → Settings → API. Reemplazar `SUPABASE_SERVICE_ROLE_KEY`.

### 3. Migración SQL

- SQL Editor → New Query
- Pegar contenido de `supabase/migrations/001_create_orders_tables.sql`
- Run. Verificar tablas `orders` y `order_status_history`.

### 4. Usuario admin

- Authentication → Users → Add User
- Email: `pirovanofotografia@gmail.com`
- Password segura, **Auto Confirm: ON**

### 5. Verificación

- [ ] SERVICE_ROLE_KEY en `.env.local`
- [ ] Migración ejecutada
- [ ] Usuario admin con Auto Confirm
- [ ] Login en `/admin/login` funciona

---

## Troubleshooting

| Error | Solución |
|-------|----------|
| Missing Supabase env | Verificar `.env.local`, reiniciar `npm run dev` |
| No permisos admin | Email exacto `pirovanofotografia@gmail.com`, Auto Confirm ON |
| relation 'orders' does not exist | Ejecutar migración SQL |
| Invalid API key | Usar `service_role` key, no `anon` |
