export default {
  name: 'settings',
  title: 'Configuración',
  type: 'document',
  fields: [
    { name: 'homeSlideshow', title: 'Imágenes del slideshow', type: 'array', of: [{ type: 'image' }], validation: (Rule: any) => Rule.max(12), description: 'Imágenes para el slideshow de la página principal (máximo 12)' },
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
            { name: 'siteTitle', title: 'Título del sitio', type: 'string', validation: (Rule: any) => Rule.required() },
            { name: 'siteDescription', title: 'Descripción del sitio', type: 'text', validation: (Rule: any) => Rule.required() }
          ]
        },
        {
          name: 'en',
          title: 'English',
          type: 'object',
          fields: [
            { name: 'siteTitle', title: 'Site Title', type: 'string', validation: (Rule: any) => Rule.required() },
            { name: 'siteDescription', title: 'Site Description', type: 'text', validation: (Rule: any) => Rule.required() }
          ]
        }
      ]
    }
  ],
  preview: {
    select: {
      title: 'content.es.siteTitle',
      media: 'homeSlideshow.0'
    },
    prepare(selection: any) {
      const { title, media } = selection
      return {
        title: title || 'Configuración del sitio',
        subtitle: 'Configuración global',
        media: media
      }
    }
  }
}
