// https://www.sanity.io/docs/structure-builder-cheat-sheet
export const structure = (S: any) => {
  try {
    return S.list()
      .title('Portfolio Cristian Pirovano')
      .items([
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
        
        // Documentales
        S.listItem()
          .title('Documentales')
          .icon(() => '🎬')
          .child(
            S.documentList()
              .title('Documentales')
              .filter('_type == "documentary"')
              .defaultOrdering([{ field: 'order', direction: 'asc' }])
          ),
        
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
            S.list()
              .title('Configuración')
              .items([
                S.listItem()
                  .title('Configuración General')
                  .child(
                    S.document()
                      .schemaType('settings')
                      .documentId('settings')
                  ),
                S.listItem()
                  .title('Precios por Tamaño')
                  .icon(() => '💰')
                  .child(
                    S.document()
                      .schemaType('sizePricing')
                      .documentId('sizePricing')
                  )
              ])
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
