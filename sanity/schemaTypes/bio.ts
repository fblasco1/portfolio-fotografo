export default {
  name: 'bio',
  title: 'Biografía',
  type: 'document',
  fields: [
    { name: 'profileImage', title: 'Imagen de perfil', type: 'image', options: { hotspot: true }, description: 'Foto de perfil del fotógrafo' },
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
            { name: 'paragraphs', title: 'Párrafos', type: 'array', of: [{ type: 'text' }], validation: (Rule: any) => Rule.required().min(1) }
          ]
        },
        {
          name: 'en',
          title: 'English',
          type: 'object',
          fields: [
            { name: 'title', title: 'Title', type: 'string', validation: (Rule: any) => Rule.required() },
            { name: 'paragraphs', title: 'Paragraphs', type: 'array', of: [{ type: 'text' }], validation: (Rule: any) => Rule.required().min(1) }
          ]
        }
      ]
    }
  ],
  preview: {
    select: {
      title: 'content.es.title',
      media: 'profileImage'
    }
  }
}
