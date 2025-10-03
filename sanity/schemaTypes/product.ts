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
      name: 'pricing',
      title: 'Precios por Región',
      type: 'object',
      description: 'Precios específicos para cada país/moneda',
      fields: [
        {
          name: 'argentina',
          title: 'Argentina (ARS)',
          type: 'object',
          fields: [
            { 
              name: 'price', 
              title: 'Precio en ARS', 
              type: 'number', 
              validation: (Rule: any) => Rule.positive().error('El precio debe ser mayor a 0'),
              description: 'Precio en pesos argentinos'
            },
            { 
              name: 'enabled', 
              title: 'Disponible en Argentina', 
              type: 'boolean', 
              initialValue: true 
            }
          ]
        },
        {
          name: 'brazil',
          title: 'Brasil (BRL)',
          type: 'object',
          fields: [
            { 
              name: 'price', 
              title: 'Precio en BRL', 
              type: 'number', 
              validation: (Rule: any) => Rule.positive().error('El precio debe ser mayor a 0'),
              description: 'Precio en reales brasileños'
            },
            { 
              name: 'enabled', 
              title: 'Disponible en Brasil', 
              type: 'boolean', 
              initialValue: true 
            }
          ]
        },
        {
          name: 'chile',
          title: 'Chile (CLP)',
          type: 'object',
          fields: [
            { 
              name: 'price', 
              title: 'Precio en CLP', 
              type: 'number', 
              validation: (Rule: any) => Rule.positive().error('El precio debe ser mayor a 0'),
              description: 'Precio en pesos chilenos'
            },
            { 
              name: 'enabled', 
              title: 'Disponible en Chile', 
              type: 'boolean', 
              initialValue: true 
            }
          ]
        },
        {
          name: 'colombia',
          title: 'Colombia (COP)',
          type: 'object',
          fields: [
            { 
              name: 'price', 
              title: 'Precio en COP', 
              type: 'number', 
              validation: (Rule: any) => Rule.positive().error('El precio debe ser mayor a 0'),
              description: 'Precio en pesos colombianos'
            },
            { 
              name: 'enabled', 
              title: 'Disponible en Colombia', 
              type: 'boolean', 
              initialValue: true 
            }
          ]
        },
        {
          name: 'mexico',
          title: 'México (MXN)',
          type: 'object',
          fields: [
            { 
              name: 'price', 
              title: 'Precio en MXN', 
              type: 'number', 
              validation: (Rule: any) => Rule.positive().error('El precio debe ser mayor a 0'),
              description: 'Precio en pesos mexicanos'
            },
            { 
              name: 'enabled', 
              title: 'Disponible en México', 
              type: 'boolean', 
              initialValue: true 
            }
          ]
        },
        {
          name: 'peru',
          title: 'Perú (PEN)',
          type: 'object',
          fields: [
            { 
              name: 'price', 
              title: 'Precio en PEN', 
              type: 'number', 
              validation: (Rule: any) => Rule.positive().error('El precio debe ser mayor a 0'),
              description: 'Precio en soles peruanos'
            },
            { 
              name: 'enabled', 
              title: 'Disponible en Perú', 
              type: 'boolean', 
              initialValue: true 
            }
          ]
        },
        {
          name: 'uruguay',
          title: 'Uruguay (UYU)',
          type: 'object',
          fields: [
            { 
              name: 'price', 
              title: 'Precio en UYU', 
              type: 'number', 
              validation: (Rule: any) => Rule.positive().error('El precio debe ser mayor a 0'),
              description: 'Precio en pesos uruguayos'
            },
            { 
              name: 'enabled', 
              title: 'Disponible en Uruguay', 
              type: 'boolean', 
              initialValue: true 
            }
          ]
        }
      ],
      validation: (Rule: any) => Rule.custom((pricing: any) => {
        // Verificar que al menos una región tenga precio
        const regions = ['argentina', 'brazil', 'chile', 'colombia', 'mexico', 'peru', 'uruguay'];
        const hasAtLeastOnePrice = regions.some(region => 
          pricing?.[region]?.enabled && pricing[region].price > 0
        );
        
        if (!hasAtLeastOnePrice) {
          return 'Debe configurar al menos un precio para una región habilitada';
        }
        
        // Verificar que los precios habilitados sean válidos
        const invalidRegions = regions.filter(region => {
          const regionData = pricing?.[region];
          return regionData?.enabled && (!regionData.price || regionData.price <= 0);
        });
        
        if (invalidRegions.length > 0) {
          return `Las regiones habilitadas deben tener precios válidos: ${invalidRegions.join(', ')}`;
        }
        
        return true;
      })
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
      argentinaPrice: 'pricing.argentina.price',
      brazilPrice: 'pricing.brazil.price',
      mexicoPrice: 'pricing.mexico.price'
    },
    prepare(selection: any) {
      const { title, category, media, isAvailable, featured, argentinaPrice, brazilPrice, mexicoPrice } = selection
      const prices = [];
      if (argentinaPrice) prices.push(`ARS: ${argentinaPrice}`);
      if (brazilPrice) prices.push(`BRL: ${brazilPrice}`);
      if (mexicoPrice) prices.push(`MXN: ${mexicoPrice}`);
      
      const status = [];
      if (featured) status.push('⭐ Destacado');
      if (!isAvailable) status.push('❌ No disponible');
      
      return {
        title: title || 'Sin título',
        subtitle: `${category === 'photo' ? 'Fotografía' : 'Postal'} ${prices.length > 0 ? `- ${prices.join(', ')}` : ''} ${status.length > 0 ? `- ${status.join(' ')}` : ''}`,
        media: media
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
