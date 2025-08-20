export default {
  name: 'product',
  title: 'Producto',
  type: 'document',
  fields: [
    { name: 'image', title: 'Imagen', type: 'image', options: { hotspot: true }, validation: (Rule: any) => Rule.required() },
    { name: 'category', title: 'Categoría', type: 'string', options: { list: [{title: 'Fotografía', value: 'photo'}, {title: 'Postal', value: 'postcard'}] }, validation: (Rule: any) => Rule.required() },
    { name: 'price', title: 'Precio', type: 'number', validation: (Rule: any) => Rule.required().positive() },
    { name: 'isAvailable', title: 'Disponible', type: 'boolean', initialValue: true, description: 'Si el producto está disponible para la venta' },
    { name: 'order', title: 'Orden', type: 'number', description: 'Orden de aparición en la tienda' },
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
            { name: 'title', title: 'Título', type: 'string', validation: (Rule: any) => Rule.required() },
            { name: 'subtitle', title: 'Subtítulo', type: 'string', description: 'Ubicación y fecha de la foto' }
          ]
        },
        {
          name: 'en',
          title: 'English',
          type: 'object',
          fields: [
            { name: 'title', title: 'Title', type: 'string', validation: (Rule: any) => Rule.required() },
            { name: 'subtitle', title: 'Subtitle', type: 'string', description: 'Location and date of the photo' }
          ]
        }
      ]
    }
  ],
  preview: {
    select: {
      title: 'content.es.title',
      category: 'category',
      media: 'image'
    },
    prepare(selection: any) {
      const { title, category, media } = selection
      return {
        title: title || 'Sin título',
        subtitle: `${category === 'photo' ? 'Fotografía' : 'Postal'}`,
        media: media
      }
    }
  }
}
