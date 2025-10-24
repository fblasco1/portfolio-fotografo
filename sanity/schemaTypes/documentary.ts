export default {
  name: 'documentary',
  title: 'Documental',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Título',
      type: 'object',
      fields: [
        {
          name: 'es',
          title: 'Español',
          type: 'string',
          validation: (Rule: any) => Rule.required()
        },
        {
          name: 'en',
          title: 'English',
          type: 'string',
          validation: (Rule: any) => Rule.required()
        }
      ]
    },
    {
      name: 'year',
      title: 'Año',
      type: 'number',
      validation: (Rule: any) => Rule.required().min(1900).max(new Date().getFullYear() + 5)
    },
    {
      name: 'synopsis',
      title: 'Sinopsis',
      type: 'object',
      fields: [
        {
          name: 'es',
          title: 'Español',
          type: 'text',
          rows: 4,
          validation: (Rule: any) => Rule.required()
        },
        {
          name: 'en',
          title: 'English',
          type: 'text',
          rows: 4,
          validation: (Rule: any) => Rule.required()
        }
      ]
    },
    {
      name: 'trailerUrl',
      title: 'URL del Trailer',
      type: 'url',
      description: 'URL del trailer en YouTube o Vimeo'
    },
    {
      name: 'poster',
      title: 'Poster',
      type: 'image',
      options: { hotspot: true },
      description: 'Imagen del poster del documental'
    },
    {
      name: 'isActive',
      title: 'Activo',
      type: 'boolean',
      description: 'Marcar si el documental debe mostrarse en el sitio',
      initialValue: true
    },
    {
      name: 'order',
      title: 'Orden',
      type: 'number',
      description: 'Orden de visualización (menor número = aparece primero)',
      initialValue: 0
    }
  ],
  preview: {
    select: {
      title: 'title.es',
      year: 'year',
      media: 'poster'
    },
    prepare(selection: any) {
      const { title, year, media } = selection;
      return {
        title: title ? `${title} (${year})` : 'Sin título',
        media: media
      };
    }
  },
  orderings: [
    {
      title: 'Orden de visualización',
      name: 'orderAsc',
      by: [
        { field: 'order', direction: 'asc' },
        { field: 'year', direction: 'desc' }
      ]
    },
    {
      title: 'Año (más reciente)',
      name: 'yearDesc',
      by: [
        { field: 'year', direction: 'desc' }
      ]
    }
  ]
}
