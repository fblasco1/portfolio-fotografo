export default {
  name: 'gallery',
  title: 'Galería',
  type: 'document',
  fields: [
    { name: 'location', title: 'Ubicación', type: 'string', description: 'Ubicación donde se tomaron las fotos' },
    { name: 'cover', title: 'Imagen de portada', type: 'image', options: { hotspot: true }, validation: (Rule: any) => Rule.required() },
    { name: 'photos', title: 'Fotografías', type: 'array', of: [{ type: 'image' }], description: 'Todas las fotos de la galería' },
    { name: 'order', title: 'Orden', type: 'number', description: 'Orden de aparición en la galería' },
    { name: 'isActive', title: 'Activa', type: 'boolean', initialValue: true, description: 'Si la galería debe mostrarse en el sitio' },
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
            { name: 'description', title: 'Descripción', type: 'text', description: 'Descripción de la galería' }
          ]
        },
        {
          name: 'en',
          title: 'English',
          type: 'object',
          fields: [
            { name: 'title', title: 'Title', type: 'string', validation: (Rule: any) => Rule.required() },
            { name: 'description', title: 'Description', type: 'text', description: 'Gallery description' }
          ]
        }
      ]
    }
  ],
  preview: {
    select: {
      title: 'content.es.title',
      location: 'location',
      media: 'cover'
    },
    prepare(selection: any) {
      const { title, location, media } = selection
      return {
        title: title || 'Sin título',
        subtitle: location,
        media: media
      }
    }
  }
}
