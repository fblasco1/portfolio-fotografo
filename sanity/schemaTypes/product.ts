export default {
  name: 'product',
  title: 'Producto',
  type: 'document',
  fields: [
    { 
      name: 'image', 
      title: 'Imagen', 
      type: 'image', 
      options: { 
        hotspot: true,
        metadata: ['blurhash', 'lqip', 'palette', 'exif', 'location']
      }, 
      validation: (Rule: any) => Rule.required().error('La imagen es obligatoria') 
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
      }, 
      validation: (Rule: any) => Rule.required().error('La categoría es obligatoria') 
    },
    { 
      name: 'isAvailable', 
      title: 'Disponible', 
      type: 'boolean', 
      initialValue: true, 
      description: 'Si el producto está disponible para la venta' 
    },
    { 
      name: 'order', 
      title: 'Orden', 
      type: 'number', 
      description: 'Orden de aparición en la tienda (números menores aparecen primero)',
      validation: (Rule: any) => Rule.min(0).integer().error('El orden debe ser un número entero positivo')
    },
    {
      name: 'description',
      title: 'Descripción',
      type: 'object',
      description: 'Descripción detallada del producto en diferentes idiomas',
      fields: [
        {
          name: 'es',
          title: 'Español',
          type: 'text',
          rows: 3,
          description: 'Descripción en español'
        },
        {
          name: 'en',
          title: 'English',
          type: 'text',
          rows: 3,
          description: 'Description in English'
        }
      ]
    },
    {
      name: 'content',
      title: 'Contenido',
      type: 'object',
      fields: [
        {
          name: 'es',
          title: 'Español',
          type: 'object',
          fields: [
            { 
              name: 'title', 
              title: 'Título', 
              type: 'string', 
              validation: (Rule: any) => Rule.required().max(100).error('El título es obligatorio y no puede exceder 100 caracteres') 
            },
            { 
              name: 'subtitle', 
              title: 'Subtítulo', 
              type: 'string', 
              description: 'Ubicación y fecha de la foto',
              validation: (Rule: any) => Rule.max(200).error('El subtítulo no puede exceder 200 caracteres')
            }
          ]
        },
        {
          name: 'en',
          title: 'English',
          type: 'object',
          fields: [
            { 
              name: 'title', 
              title: 'Title', 
              type: 'string', 
              validation: (Rule: any) => Rule.required().max(100).error('The title is required and cannot exceed 100 characters') 
            },
            { 
              name: 'subtitle', 
              title: 'Subtitle', 
              type: 'string', 
              description: 'Location and date of the photo',
              validation: (Rule: any) => Rule.max(200).error('The subtitle cannot exceed 200 characters')
            }
          ]
        }
      ]
    },
    {
      name: 'tags',
      title: 'Etiquetas',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags'
      },
      description: 'Etiquetas para categorizar y filtrar productos'
    },
    {
      name: 'metadata',
      title: 'Metadatos',
      type: 'object',
      fields: [
        {
          name: 'createdAt',
          title: 'Fecha de Creación',
          type: 'datetime',
          readOnly: true,
          initialValue: () => new Date().toISOString()
        },
        {
          name: 'updatedAt',
          title: 'Última Actualización',
          type: 'datetime',
          readOnly: true
        },
        {
          name: 'featured',
          title: 'Destacado',
          type: 'boolean',
          initialValue: false,
          description: 'Si el producto debe aparecer como destacado'
        }
      ]
    }
  ],
  preview: {
    select: {
      title: 'content.es.title',
      category: 'category',
      media: 'image',
      isAvailable: 'isAvailable',
      featured: 'metadata.featured',
    },
    prepare(selection: any) {
      try {
        const { title, category, media, isAvailable, featured } = selection || {}
        
        const status = [];
        if (featured) status.push('⭐ Destacado');
        if (!isAvailable) status.push('❌ No disponible');
        
        return {
          title: title || 'Sin título',
          subtitle: `${category === 'photo' ? 'Fotografía' : 'Postal'} ${status.length > 0 ? `- ${status.join(' ')}` : ''}`,
          media: media
        }
      } catch (error) {
        return {
          title: 'Error en preview',
          subtitle: 'Error al generar preview',
          media: null
        }
      }
    }
  },
  orderings: [
    {
      title: 'Orden personalizado',
      name: 'orderAsc',
      by: [
        { field: 'order', direction: 'asc' },
        { field: 'metadata.createdAt', direction: 'desc' }
      ]
    },
    {
      title: 'Destacados primero',
      name: 'featuredFirst',
      by: [
        { field: 'metadata.featured', direction: 'desc' },
        { field: 'order', direction: 'asc' }
      ]
    },
    {
      title: 'Más recientes',
      name: 'newestFirst',
      by: [
        { field: 'metadata.createdAt', direction: 'desc' }
      ]
    }
  ]
}
