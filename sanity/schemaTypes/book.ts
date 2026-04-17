export default {
  name: 'book',
  title: 'Libro',
  type: 'document',
  fields: [
    {
      name: 'presalePriceARS',
      title: 'Precio preventa (ARS)',
      type: 'number',
      description: 'Precio directo en pesos argentinos (ARS) para la preventa.',
      validation: (Rule: any) => Rule.min(0).precision(0),
    },
    {
      name: 'presalePriceUSD',
      title: 'Precio preventa (USD)',
      type: 'number',
      description: 'LEGACY: precio base en USD. Preferir configurar “Precio preventa (ARS)”.',
      validation: (Rule: any) => Rule.min(0).precision(2),
    },
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
            { name: 'subscribe', title: 'Texto del botón suscribir', type: 'string', validation: (Rule: any) => Rule.required() },
            { name: 'presaleButton', title: 'Texto botón preventa (opcional)', type: 'string', description: 'Si lo dejas vacío, se usa “Preventa”.' }
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
            { name: 'subscribe', title: 'Subscribe button text', type: 'string', validation: (Rule: any) => Rule.required() },
            { name: 'presaleButton', title: 'Pre-sale button label (optional)', type: 'string', description: 'If empty, “Pre-sale” is used.' }
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
