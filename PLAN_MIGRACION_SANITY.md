# 📋 Plan de Migración a Sanity CMS - Portfolio Fotógrafo

## 🎯 **Objetivo**
Migrar todo el contenido del portfolio de Cristian Pirovano desde archivos estáticos a Sanity CMS, incluyendo imágenes, textos y configuración de productos.

---

## 📊 **Análisis del Contenido Actual**

### **Contenido a migrar:**

#### 1. **Imágenes del Slideshow (Home)**
- 12 imágenes de fondo rotativas
- URLs de Cloudinary actuales
- **Ubicación**: `constants/images.ts` → `imagesSlide`

#### 2. **Galerías de Fotos**
- 8 colecciones fotográficas principales:
  - La era Milei (12 fotos)
  - Yerba Mate
  - Elecciones Argentina 2023
  - Vida bajo ocupación
  - El muro del apartheid
  - Festejos Copa del Mundo
  - COVID-19
  - Motín Cárcel Devoto
  - Retratos
  - Comunidad Qom
  - Laos
- **Ubicación**: `constants/images.ts` → `imagesGallery`

#### 3. **Tienda (Productos)**
- **Fotos**: 17 fotografías con precios
- **Postales**: 5 postales con precios
- **Ubicación**: `constants/images.ts` → `products`

#### 4. **Biografía**
- Texto personal del fotógrafo
- Imagen de perfil
- Video de YouTube embebido
- **Ubicación**: `app/[locale]/bio/page.tsx` + `locales/es.ts`

#### 5. **Página del Libro**
- Información del libro "Del Otro Lado Del Muro"
- Formulario de suscripción
- **Ubicación**: `app/[locale]/book/page.tsx` + `locales/es.ts`

#### 6. **Traducciones**
- Textos en español e inglés
- **Ubicación**: `locales/es.ts` y `locales/en.ts`

---

## 🚀 **Fase 1: Configuración de Sanity**

### **1.1 Instalación y Configuración**
```bash
# Instalar dependencias
npm install @sanity/client @sanity/image-url next-sanity sanity

# Inicializar Sanity Studio
npx sanity@latest init --template clean --create-project "portfolio-fotografo" --dataset production
```

### **1.2 Configuración del Proyecto**
- Crear proyecto en [sanity.io](https://sanity.io)
- Configurar dataset de producción
- Configurar variables de entorno

### **1.3 Variables de Entorno**
```env
NEXT_PUBLIC_SANITY_PROJECT_ID=tu_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=tu_api_token
```

---

## 🏗️ **Fase 2: Esquemas de Contenido**

### **2.1 Esquema de Imagen Base**
```typescript
// schemas/image.ts
export default {
  name: 'image',
  title: 'Imagen',
  type: 'image',
  options: {
    hotspot: true,
  },
  fields: [
    {
      name: 'alt',
      title: 'Texto alternativo',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'caption',
      title: 'Descripción',
      type: 'text'
    }
  ]
}
```

### **2.2 Esquema de Galería**
```typescript
// schemas/gallery.ts
export default {
  name: 'gallery',
  title: 'Galería',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'titleKey',
      title: 'Clave de traducción',
      type: 'string'
    },
    {
      name: 'location',
      title: 'Ubicación',
      type: 'string'
    },
    {
      name: 'cover',
      title: 'Imagen de portada',
      type: 'image',
      options: { hotspot: true }
    },
    {
      name: 'photos',
      title: 'Fotografías',
      type: 'array',
      of: [{ type: 'image' }]
    },
    {
      name: 'description',
      title: 'Descripción',
      type: 'text'
    },
    {
      name: 'descriptionKey',
      title: 'Clave de descripción',
      type: 'string'
    },
    {
      name: 'order',
      title: 'Orden',
      type: 'number'
    },
    {
      name: 'isActive',
      title: 'Activa',
      type: 'boolean',
      initialValue: true
    }
  ]
}
```

### **2.3 Esquema de Producto**
```typescript
// schemas/product.ts
export default {
  name: 'product',
  title: 'Producto',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'titleKey',
      title: 'Clave de traducción',
      type: 'string'
    },
    {
      name: 'subtitle',
      title: 'Subtítulo',
      type: 'string'
    },
    {
      name: 'image',
      title: 'Imagen',
      type: 'image',
      options: { hotspot: true },
      validation: Rule => Rule.required()
    },
    {
      name: 'category',
      title: 'Categoría',
      type: 'string',
      options: {
        list: [
          {title: 'Fotografía', value: 'photo'},
          {title: 'Postal', value: 'postcard'}
        ]
      }
    },
    {
      name: 'price',
      title: 'Precio',
      type: 'number',
      validation: Rule => Rule.required()
    },
    {
      name: 'isAvailable',
      title: 'Disponible',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'order',
      title: 'Orden',
      type: 'number'
    }
  ]
}
```

### **2.4 Esquema de Biografía**
```typescript
// schemas/bio.ts
export default {
  name: 'bio',
  title: 'Biografía',
  type: 'document',
  fields: [
    {
      name: 'profileImage',
      title: 'Imagen de perfil',
      type: 'image',
      options: { hotspot: true }
    },
    {
      name: 'paragraphs',
      title: 'Párrafos',
      type: 'array',
      of: [{ type: 'text' }]
    },
    {
      name: 'videoUrl',
      title: 'URL del video',
      type: 'url'
    },
    {
      name: 'videoTitle',
      title: 'Título del video',
      type: 'string'
    }
  ]
}
```

### **2.5 Esquema de Libro**
```typescript
// schemas/book.ts
export default {
  name: 'book',
  title: 'Libro',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Título',
      type: 'string'
    },
    {
      name: 'author',
      title: 'Autor',
      type: 'string'
    },
    {
      name: 'description',
      title: 'Descripción',
      type: 'text'
    },
    {
      name: 'comingSoon',
      title: 'Próximo lanzamiento',
      type: 'string'
    },
    {
      name: 'availability',
      title: 'Disponibilidad',
      type: 'text'
    },
    {
      name: 'coverImage',
      title: 'Imagen de portada',
      type: 'image'
    }
  ]
}
```

### **2.6 Esquema de Configuración Global**
```typescript
// schemas/settings.ts
export default {
  name: 'settings',
  title: 'Configuración',
  type: 'document',
  fields: [
    {
      name: 'homeSlideshow',
      title: 'Imágenes del slideshow',
      type: 'array',
      of: [{ type: 'image' }],
      validation: Rule => Rule.max(12)
    },
    {
      name: 'siteTitle',
      title: 'Título del sitio',
      type: 'string'
    },
    {
      name: 'siteDescription',
      title: 'Descripción del sitio',
      type: 'text'
    }
  ]
}
```

---

## 🔄 **Fase 3: Migración de Datos**

### **3.1 Script de Migración**
Crear script para migrar datos existentes:

```typescript
// scripts/migrate-to-sanity.ts
import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'tu_project_id',
  dataset: 'production',
  token: 'tu_token',
  apiVersion: '2024-01-01',
  useCdn: false
})

// Migrar galerías
async function migrateGalleries() {
  // Migrar cada galería desde imagesGallery
}

// Migrar productos
async function migrateProducts() {
  // Migrar fotos y postales desde products
}

// Migrar configuración
async function migrateSettings() {
  // Migrar slideshow y configuración global
}
```

### **3.2 Migración Manual**
1. **Subir imágenes a Sanity** desde Cloudinary
2. **Crear documentos** para cada galería
3. **Configurar productos** con precios
4. **Migrar textos** de biografía y libro

---

## 🔧 **Fase 4: Actualización del Frontend**

### **4.1 Configuración del Cliente Sanity**
```typescript
// lib/sanity.ts
import { createClient } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  apiVersion: '2024-01-01',
  useCdn: true
})

const builder = imageUrlBuilder(client)
export const urlFor = (source: any) => builder.image(source)
```

### **4.2 Queries de Sanity**
```typescript
// lib/queries.ts
export const galleriesQuery = `
  *[_type == "gallery" && isActive == true] | order(order asc) {
    _id,
    title,
    titleKey,
    location,
    cover,
    photos,
    description,
    descriptionKey
  }
`

export const productsQuery = `
  *[_type == "product" && isAvailable == true] | order(order asc) {
    _id,
    title,
    titleKey,
    subtitle,
    image,
    category,
    price
  }
`

export const bioQuery = `
  *[_type == "bio"][0] {
    profileImage,
    paragraphs,
    videoUrl,
    videoTitle
  }
`

export const bookQuery = `
  *[_type == "book"][0] {
    title,
    author,
    description,
    comingSoon,
    availability,
    coverImage
  }
`

export const settingsQuery = `
  *[_type == "settings"][0] {
    homeSlideshow,
    siteTitle,
    siteDescription
  }
`
```

### **4.3 Actualización de Componentes**

#### **Home Page**
```typescript
// app/[locale]/page.tsx
import { client } from '@/lib/sanity'
import { settingsQuery } from '@/lib/queries'

export default async function Home() {
  const settings = await client.fetch(settingsQuery)
  const slideshowImages = settings?.homeSlideshow || []
  
  // Usar slideshowImages en lugar de imagesSlide
}
```

#### **Galería**
```typescript
// app/[locale]/gallery/page.tsx
import { client } from '@/lib/sanity'
import { galleriesQuery } from '@/lib/queries'

export default async function Gallery() {
  const galleries = await client.fetch(galleriesQuery)
  
  // Usar galleries en lugar de imagesGallery
}
```

#### **Tienda**
```typescript
// app/[locale]/shop/page.tsx
import { client } from '@/lib/sanity'
import { productsQuery } from '@/lib/queries'

export default async function Shop() {
  const products = await client.fetch(productsQuery)
  
  // Usar products en lugar de constants
}
```

#### **Biografía**
```typescript
// app/[locale]/bio/page.tsx
import { client } from '@/lib/sanity'
import { bioQuery } from '@/lib/queries'

export default async function Bio() {
  const bio = await client.fetch(bioQuery)
  
  // Usar bio.paragraphs en lugar de traducciones estáticas
}
```

---

## 🎨 **Fase 5: Sanity Studio Personalizado**

### **5.1 Configuración del Studio**
```typescript
// sanity.config.ts
import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas'

export default defineConfig({
  name: 'default',
  title: 'Portfolio Fotógrafo',
  
  projectId: 'tu_project_id',
  dataset: 'production',
  
  plugins: [deskTool(), visionTool()],
  
  schema: {
    types: schemaTypes,
  },
  
  studio: {
    components: {
      // Componentes personalizados
    }
  }
})
```

### **5.2 Vistas Personalizadas**
- **Dashboard** con estadísticas
- **Vista de galerías** con preview de imágenes
- **Gestión de productos** con precios
- **Editor de biografía** con preview

---

## 🧪 **Fase 6: Testing y Optimización**

### **6.1 Testing**
- [ ] Verificar migración de datos
- [ ] Testear queries de Sanity
- [ ] Validar imágenes y optimización
- [ ] Probar internacionalización
- [ ] Verificar rendimiento

### **6.2 Optimización**
- [ ] Implementar ISR (Incremental Static Regeneration)
- [ ] Optimizar queries de Sanity
- [ ] Configurar CDN
- [ ] Implementar cache

---

## 🚀 **Fase 7: Despliegue**

### **7.1 Preparación**
- [ ] Configurar variables de entorno en producción
- [ ] Migrar datos finales
- [ ] Configurar webhooks de Sanity

### **7.2 Despliegue**
- [ ] Deploy en Vercel/Netlify
- [ ] Configurar dominio personalizado
- [ ] Configurar SSL

---

## 📋 **Checklist de Migración**

### **Preparación**
- [ x ] Crear proyecto Sanity
- [ x ] Instalar dependencias
- [ x ] Configurar variables de entorno
- [ x ] Crear esquemas de contenido

### **Migración de Datos**
- [ x ] Migrar imágenes del slideshow
- [ x ] Migrar galerías de fotos
- [ x ] Migrar productos de la tienda
- [ x ] Migrar biografía
- [ x ] Migrar información del libro

### **Desarrollo**
- [ x ] Actualizar queries de datos
- [ x ] Modificar componentes
- [ x ] Implementar optimización de imágenes
- [ x ] Configurar internacionalización

### **Testing**
- [ ] Probar todas las páginas
- [ ] Verificar imágenes
- [ ] Testear formularios
- [ ] Validar rendimiento

### **Despliegue**
- [ ] Configurar producción
- [ ] Migrar datos finales
- [ ] Deploy y verificar

---

## ⏱️ **Estimación de Tiempo**

- **Fase 1-2**: 2-3 días (Configuración y esquemas)
- **Fase 3**: 1-2 días (Migración de datos)
- **Fase 4**: 3-4 días (Actualización frontend)
- **Fase 5**: 1-2 días (Studio personalizado)
- **Fase 6-7**: 1-2 días (Testing y deploy)

**Total estimado**: 8-13 días

---

## 💰 **Costos Estimados**

- **Sanity**: ~$25-50/mes (dependiendo del uso)
- **Desarrollo**: 8-13 días de trabajo
- **Mantenimiento**: Reducción significativa vs gestión manual

---

## 🎯 **Beneficios Post-Migración**

1. **Gestión independiente** del contenido por el fotógrafo
2. **Actualizaciones en tiempo real** sin necesidad de código
3. **Optimización automática** de imágenes
4. **Mejor organización** del contenido
5. **Escalabilidad** para futuras funcionalidades
6. **Reducción de costos** de mantenimiento a largo plazo

---

¿Te parece bien este plan? ¿Quieres que ajuste alguna parte o procedemos con la implementación?
