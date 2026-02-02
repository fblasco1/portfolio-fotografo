# 🔧 CONFIGURACIÓN DE SUPABASE - PASOS COMPLETOS

## ✅ CREDENCIALES PROPORCIONADAS

- **URL:** `https://ycucfyjhnnuhyggazzud.supabase.co`
- **ANON KEY:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljdWNmeWpobm51aHlnZ2F6enVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MTY2MjIsImV4cCI6MjA4NTA5MjYyMn0.RLdj2Nt0CNpJwn8VOmIPPg7Sn09TmF0DpcVjZSXMsbg`
- **Email Admin:** `pirovanofotografia@gmail.com`

---

## 📋 PASO 1: OBTENER SERVICE_ROLE_KEY

1. Ir a **Supabase Dashboard**: https://app.supabase.com
2. Seleccionar tu proyecto: `ycucfyjhnnuhyggazzud`
3. Ir a **Settings** (⚙️) > **API**
4. Buscar la sección **Project API keys**
5. Copiar el **`service_role` key** (⚠️ NO el `anon` key)
6. Esta key tiene permisos completos, **NUNCA exponer al cliente**

---

## 📋 PASO 2: CONFIGURAR VARIABLES DE ENTORNO

Crear o actualizar `.env.local` en la raíz del proyecto:

```bash
# ===========================================
# SUPABASE
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=https://ycucfyjhnnuhyggazzud.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljdWNmeWpobm51aHlnZ2F6enVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MTY2MjIsImV4cCI6MjA4NTA5MjYyMn0.RLdj2Nt0CNpJwn8VOmIPPg7Sn09TmF0DpcVjZSXMsbg
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```

**⚠️ IMPORTANTE:** Reemplazar `tu-service-role-key-aqui` con el SERVICE_ROLE_KEY obtenido en el Paso 1.

---

## 📋 PASO 3: EJECUTAR MIGRACIÓN SQL

1. Ir a **Supabase Dashboard** > **SQL Editor**
2. Click en **New Query**
3. Copiar todo el contenido de `supabase/migrations/001_create_orders_tables.sql`
4. **Verificar** que el email admin está correcto: `pirovanofotografia@gmail.com`
5. Click en **Run** (o presionar `Ctrl+Enter`)

**✅ Verificar que se crearon las tablas:**
- Ir a **Table Editor**
- Deberías ver las tablas: `orders` y `order_status_history`

---

## 📋 PASO 4: CREAR USUARIO ADMIN

1. Ir a **Supabase Dashboard** > **Authentication** > **Users**
2. Click en **Add User** > **Create new user**
3. Completar:
   - **Email:** `pirovanofotografia@gmail.com`
   - **Password:** (crear una contraseña segura)
   - **Auto Confirm User:** ✅ **ON** (muy importante)
4. Click en **Create User**

**✅ Verificar:**
- El usuario debe aparecer en la lista con email confirmado
- El estado debe ser "Active"

---

## 📋 PASO 5: INSTALAR DEPENDENCIAS

```bash
npm install @supabase/supabase-js @supabase/ssr
```

---

## 📋 PASO 6: PROBAR LOCALMENTE

```bash
npm run dev
```

1. Ir a: `http://localhost:3000/admin/login`
2. Iniciar sesión con:
   - **Email:** `pirovanofotografia@gmail.com`
   - **Password:** (la que creaste en el Paso 4)
3. Verás el **Panel** (`/admin`). Desde ahí:
   - **Gestionar órdenes** → `/admin/dashboard`
   - **Gestionar contenido** → `/admin/studio` (Sanity)

---

## ✅ VERIFICACIÓN FINAL

### **Checklist:**

- [ ] SERVICE_ROLE_KEY obtenido y configurado en `.env.local`
- [ ] Migración SQL ejecutada correctamente
- [ ] Tablas `orders` y `order_status_history` creadas
- [ ] Usuario admin creado con email `pirovanofotografia@gmail.com`
- [ ] Usuario admin tiene "Auto Confirm" activado
- [ ] Dependencias instaladas (`@supabase/supabase-js`, `@supabase/ssr`)
- [ ] Login funciona correctamente
- [ ] Dashboard carga sin errores

---

## 🐛 TROUBLESHOOTING

### **Error: "Missing Supabase environment variables"**
- Verificar que `.env.local` existe y tiene todas las variables
- Reiniciar el servidor de desarrollo: `npm run dev`

### **Error: "No tienes permisos de administrador"**
- Verificar que el email del usuario es exactamente `pirovanofotografia@gmail.com`
- Verificar que el usuario tiene "Auto Confirm" activado
- Verificar que las RLS policies en Supabase tienen el email correcto

### **Error: "relation 'orders' does not exist"**
- Verificar que la migración SQL se ejecutó correctamente
- Ir a Table Editor y verificar que las tablas existen

### **Error: "Invalid API key"**
- Verificar que `SUPABASE_SERVICE_ROLE_KEY` es el `service_role` key, NO el `anon` key
- Verificar que no hay espacios extra en las variables de entorno

---

## 📞 PRÓXIMOS PASOS

Una vez configurado todo:

1. **Probar webhook:** Realizar un pago de prueba y verificar que se guarda en Supabase
2. **Verificar RLS:** Asegurarse que solo el admin puede ver todas las órdenes
3. **Configurar producción:** Agregar variables de entorno en Vercel

---

**¡Configuración completa! 🎉**
