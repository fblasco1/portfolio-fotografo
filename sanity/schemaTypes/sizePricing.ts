export default {
  name: 'sizePricing',
  title: 'Precios por Tamaño',
  type: 'document',
  description: 'Configuración global de precios en USD para cada tamaño disponible. Los precios son los mismos para todos los productos (fotos y postales) y se convierten automáticamente a la moneda local según la ubicación del usuario.',
  // Documento singleton - solo debe existir un documento de este tipo
  // Se identifica por el documentId fijo 'sizePricing'
  fields: [
    {
      name: 'size15x21',
      title: '15x21 cm',
      type: 'object',
      fields: [
        {
          name: 'priceUSD',
          title: 'Precio en USD',
          type: 'number',
          validation: (Rule: any) => Rule.positive().error('El precio debe ser mayor a 0'),
          description: 'Precio en dólares estadounidenses para tamaño 15x21 cm'
        },
        {
          name: 'enabled',
          title: 'Disponible',
          type: 'boolean',
          initialValue: true,
          description: 'Si este tamaño está disponible para la venta'
        }
      ]
    },
    {
      name: 'size20x30',
      title: '20x30 cm',
      type: 'object',
      fields: [
        {
          name: 'priceUSD',
          title: 'Precio en USD',
          type: 'number',
          validation: (Rule: any) => Rule.positive().error('El precio debe ser mayor a 0'),
          description: 'Precio en dólares estadounidenses para tamaño 20x30 cm'
        },
        {
          name: 'enabled',
          title: 'Disponible',
          type: 'boolean',
          initialValue: true,
          description: 'Si este tamaño está disponible para la venta'
        }
      ]
    },
    {
      name: 'size30x45',
      title: '30x45 cm',
      type: 'object',
      fields: [
        {
          name: 'priceUSD',
          title: 'Precio en USD',
          type: 'number',
          validation: (Rule: any) => Rule.positive().error('El precio debe ser mayor a 0'),
          description: 'Precio en dólares estadounidenses para tamaño 30x45 cm'
        },
        {
          name: 'enabled',
          title: 'Disponible',
          type: 'boolean',
          initialValue: true,
          description: 'Si este tamaño está disponible para la venta'
        }
      ]
    }
  ],
  validation: (Rule: any) => Rule.custom((doc: any) => {
    if (!doc) return 'La configuración de precios es obligatoria';
    
    try {
      // Verificar que al menos un tamaño tenga precio habilitado
      const sizes = ['size15x21', 'size20x30', 'size30x45'];
      const hasAtLeastOnePrice = sizes.some(size => 
        doc[size]?.enabled && doc[size].priceUSD > 0
      );
      
      if (!hasAtLeastOnePrice) {
        return 'Debe configurar al menos un tamaño con precio habilitado';
      }
      
      return true;
    } catch (error) {
      return 'Error en la validación de precios';
    }
  }),
  preview: {
    select: {
      price15x21: 'size15x21.priceUSD',
      price20x30: 'size20x30.priceUSD',
      price30x45: 'size30x45.priceUSD',
      enabled15x21: 'size15x21.enabled',
      enabled20x30: 'size20x30.enabled',
      enabled30x45: 'size30x45.enabled'
    },
    prepare(selection: any) {
      try {
        const { price15x21, price20x30, price30x45, enabled15x21, enabled20x30, enabled30x45 } = selection || {};
        const prices = [];
        
        if (enabled15x21 && price15x21) prices.push(`15x21: $${price15x21}`);
        if (enabled20x30 && price20x30) prices.push(`20x30: $${price20x30}`);
        if (enabled30x45 && price30x45) prices.push(`30x45: $${price30x45}`);
        
        return {
          title: 'Precios por Tamaño',
          subtitle: prices.length > 0 ? prices.join(', ') : 'Sin precios configurados'
        };
      } catch (error) {
        return {
          title: 'Error en preview',
          subtitle: 'Error al generar preview'
        };
      }
    }
  }
}

