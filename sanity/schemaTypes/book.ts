export default {
  name: 'book',
  title: 'Libro',
  type: 'document',
  fields: [
    { name: 'coverImage', title: 'Imagen de portada', type: 'image', options: { hotspot: true }, description: 'Imagen de portada del libro' },
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
            { name: 'author', title: 'Autor', type: 'string', validation: (Rule: any) => Rule.required() },
            { name: 'description', title: 'Descripción', type: 'text', validation: (Rule: any) => Rule.required() },
            { name: 'comingSoon', title: 'Próximo lanzamiento', type: 'string', validation: (Rule: any) => Rule.required() },
            { name: 'availability', title: 'Disponibilidad', type: 'text', validation: (Rule: any) => Rule.required() },
            { name: 'emailPlaceholder', title: 'Placeholder del email', type: 'string', validation: (Rule: any) => Rule.required() },
            { name: 'subscribe', title: 'Texto del botón suscribir', type: 'string', validation: (Rule: any) => Rule.required() }
          ]
        },
        {
          name: 'en',
          title: 'English',
          type: 'object',
          fields: [
            { name: 'title', title: 'Title', type: 'string', validation: (Rule: any) => Rule.required() },
            { name: 'author', title: 'Author', type: 'string', validation: (Rule: any) => Rule.required() },
            { name: 'description', title: 'Description', type: 'text', validation: (Rule: any) => Rule.required() },
            { name: 'comingSoon', title: 'Coming Soon', type: 'string', validation: (Rule: any) => Rule.required() },
            { name: 'availability', title: 'Availability', type: 'text', validation: (Rule: any) => Rule.required() },
            { name: 'emailPlaceholder', title: 'Email placeholder', type: 'string', validation: (Rule: any) => Rule.required() },
            { name: 'subscribe', title: 'Subscribe button text', type: 'string', validation: (Rule: any) => Rule.required() }
          ]
        }
      ]
    }
  ],
  preview: {
    select: {
      title: 'content.es.title',
      author: 'content.es.author',
      media: 'coverImage'
    },
    prepare(selection: any) {
      const { title, author, media } = selection
      return {
        title: title || 'Sin título',
        subtitle: author,
        media: media
      }
    }
  }
}
