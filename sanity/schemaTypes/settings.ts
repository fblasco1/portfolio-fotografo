export default {
  name: 'settings',
  title: 'Configuración',
  type: 'document',
  fields: [
    { name: 'homeSlideshow', title: 'Imágenes del slideshow', type: 'array', of: [{ type: 'image' }], validation: (Rule: any) => Rule.max(12), description: 'Imágenes para el slideshow de la página principal (máximo 12)' },
    {
      name: 'favicon',
      title: 'Icono del sitio (Favicon)',
      type: 'image',
      options: {
        hotspot: true
      },
      description: 'Icono que aparecerá en la pestaña del navegador. Si se deja vacío, se usará la foto de la biografía por defecto.'
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
    },
    {
      name: 'socialMedia',
      title: 'Redes Sociales',
      type: 'object',
      fields: [
        {
          name: 'instagram',
          title: 'Instagram',
          type: 'url',
          description: 'URL de tu perfil de Instagram'
        },
        {
          name: 'facebook',
          title: 'Facebook',
          type: 'url',
          description: 'URL de tu perfil de Facebook'
        },
        {
          name: 'twitter',
          title: 'Twitter/X',
          type: 'url',
          description: 'URL de tu perfil de Twitter/X'
        },
        {
          name: 'linkedin',
          title: 'LinkedIn',
          type: 'url',
          description: 'URL de tu perfil de LinkedIn'
        },
        {
          name: 'youtube',
          title: 'YouTube',
          type: 'url',
          description: 'URL de tu canal de YouTube'
        },
        {
          name: 'tiktok',
          title: 'TikTok',
          type: 'url',
          description: 'URL de tu perfil de TikTok'
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
