// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure = (S: any) => {
  try {
    return S.list()
      .title('Portfolio Cristian Pirovano')
      .items([
        // Productos
        S.listItem()
          .title('Productos')
          .icon(() => '📸')
          .child(
            S.documentList()
              .title('Productos')
              .filter('_type == "product"')
              .defaultOrdering([{ field: 'order', direction: 'asc' }])
          ),
        
        // Galerías
        S.listItem()
          .title('Galerías')
          .icon(() => '🖼️')
          .child(
            S.documentList()
              .title('Galerías')
              .filter('_type == "gallery"')
              .defaultOrdering([{ field: '_createdAt', direction: 'desc' }])
          ),
        
        S.divider(),
        
        // Biografía
        S.listItem()
          .title('Biografía')
          .icon(() => '👤')
          .child(
            S.document()
              .schemaType('bio')
              .documentId('bio')
          ),
        
        // Libro
        S.listItem()
          .title('Libro')
          .icon(() => '📖')
          .child(
            S.document()
              .schemaType('book')
              .documentId('book')
          ),
        
        // Configuración
        S.listItem()
          .title('Configuración')
          .icon(() => '⚙️')
          .child(
            S.document()
              .schemaType('settings')
              .documentId('settings')
          )
      ])
  } catch (error) {
    console.error('Error en estructura:', error)
    // Fallback a estructura básica
    return S.list()
      .title('Content')
      .items(S.documentTypeListItems())
  }
}
