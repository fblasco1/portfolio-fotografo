export default {
  name: 'bio',
  title: 'Biografía',
  type: 'document',
  fields: [
    { name: 'profileImage', title: 'Imagen de perfil', type: 'image', options: { hotspot: true }, description: 'Foto de perfil del fotógrafo' },
    { name: 'videoUrl', title: 'URL del video', type: 'url', description: 'URL del video de YouTube' },
    { name: 'videoTitle', title: 'Título del video', type: 'string', description: 'Título del video para el atributo alt' },
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
