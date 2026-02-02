# 🚀 QUICK START - Implementación Supabase + Panel Admin

## ⚡ INICIO RÁPIDO (5 minutos)

### **1. Instalar Dependencias**
```bash
npm install @supabase/supabase-js @supabase/ssr
```

### **2. Obtener SERVICE_ROLE_KEY**
1. Ir a https://app.supabase.com
2. Seleccionar proyecto: `ycucfyjhnnuhyggazzud`
3. Settings > API > Project API keys
4. Copiar el **`service_role` key** (⚠️ NO el `anon` key)

### **3. Configurar Variables de Entorno**
Crear o actualizar `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://ycucfyjhnnuhyggazzud.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InljdWNmeWpobm51aHlnZ2F6enVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1MTY2MjIsImV4cCI6MjA4NTA5MjYyMn0.RLdj2Nt0CNpJwn8VOmIPPg7Sn09TmF0DpcVjZSXMsbg
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui
```
**⚠️ Reemplazar** `tu-service-role-key-aqui` con el SERVICE_ROLE_KEY del paso 2.

### **4. Ejecutar Migración SQL**
1. Supabase Dashboard > SQL Editor > New Query
2. Copiar contenido de `supabase/migrations/001_create_orders_tables.sql`
3. ✅ El email admin ya está configurado: `pirovanofotografia@gmail.com`
4. Ejecutar script (Run o Ctrl+Enter)

### **5. Crear Usuario Admin**
1. Supabase Dashboard > Authentication > Users
2. "Add User" > "Create new user"
3. Email: `pirovanofotografia@gmail.com`
4. Password: (crear una segura)
5. **Auto Confirm:** ✅ ON (muy importante)

### **6. Probar**
```bash
npm run dev
```
Ir a: `http://localhost:3000/admin/login`
- Email: `pirovanofotografia@gmail.com`
- Password: (la que creaste)

Tras iniciar sesión verás el **Panel** (`/admin`), donde puedes:
- **Gestionar órdenes** → `/admin/dashboard` (pedidos, estados, ingresos)
- **Gestionar contenido** → `/admin/studio` (Sanity: galerías, libro, documentales)

Todas las rutas bajo `/admin` (salvo `/admin/login`) están protegidas por login.

---

## 📚 DOCUMENTACIÓN

- **Índice:** `docs/README.md`
- **Pruebas Mercado Pago:** `docs/01-PRUEBAS-INTEGRACION-MERCADOPAGO.md`
- **Funcionalidades:** `docs/02-PROYECTO-FUNCIONALIDADES.md`
- **Configuración Supabase:** `CONFIGURACION-SUPABASE.md`

---

## ✅ VERIFICACIÓN

- [x] SERVICE_ROLE_KEY configurado en `.env.local`
- [x] Migración SQL ejecutada
- [x] Usuario admin creado con email `pirovanofotografia@gmail.com`
- [x] Login funciona correctamente

---

**¡Listo para empezar! 🎉**
