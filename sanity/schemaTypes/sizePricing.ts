const sizeField = (name: string, title: string, description: string) => ({
  name,
  title,
  type: 'object',
  fields: [
    {
      name: 'priceUSD',
      title: 'Precio en USD',
      type: 'number',
      validation: (Rule: any) =>
        Rule.positive().error('El precio debe ser mayor a 0'),
      description
    },
    {
      name: 'enabled',
      title: 'Disponible',
      type: 'boolean',
      initialValue: true,
      description: 'Si este tamaño está disponible para la venta'
    }
  ]
});

export default {
  name: 'sizePricing',
  title: 'Precios por Tamaño',
  type: 'document',
  description:
    'Configuración global de precios en USD. Las fotos y las postales utilizan tarifas distintas y se convierten automáticamente a la moneda local según la región del usuario.',
  fields: [
    {
      name: 'photoPricing',
      title: 'Precios para Fotos',
      type: 'object',
      options: { collapsible: true, collapsed: false },
      fields: [
        {
          ...sizeField(
            'size15x21',
            '15x21 cm',
            'Precio en dólares estadounidenses para fotos tamaño 15x21 cm'
          )
        },
        {
          ...sizeField(
            'size20x30',
            '20x30 cm',
            'Precio en dólares estadounidenses para fotos tamaño 20x30 cm'
          )
        },
        {
          ...sizeField(
            'size30x45',
            '30x45 cm',
            'Precio en dólares estadounidenses para fotos tamaño 30x45 cm'
          )
        }
      ]
    },
    {
      name: 'postcardPricing',
      title: 'Precios para Postales',
      type: 'object',
      options: { collapsible: true, collapsed: false },
      fields: [
        {
          ...sizeField(
            'size15x21',
            '15x21 cm',
            'Precio en dólares estadounidenses para postales tamaño 15x21 cm'
          )
        }
      ]
    }
  ],
  validation: (Rule: any) =>
    Rule.custom((doc: any) => {
      if (!doc) return 'La configuración de precios es obligatoria';

      try {
        const photoPricing = doc.photoPricing || {};
        const postcardPricing = doc.postcardPricing || {};

        const photoSizes = ['size15x21', 'size20x30', 'size30x45'];
        const hasPhotoPrice = photoSizes.some(
          (size) => photoPricing[size]?.enabled && photoPricing[size]?.priceUSD > 0
        );

        const postcard = postcardPricing.size15x21;
        const hasPostcardPrice =
          postcard && postcard.enabled && postcard.priceUSD > 0;

        if (!hasPhotoPrice) {
          return 'Debes configurar al menos un tamaño habilitado para fotos con precio mayor a 0.';
        }

        if (!hasPostcardPrice) {
          return 'Debes configurar el precio del tamaño 15x21 para postales.';
        }

        return true;
      } catch (error) {
        return 'Error en la validación de precios';
      }
    }),
  preview: {
    select: {
      photo15x21: 'photoPricing.size15x21.priceUSD',
      photo20x30: 'photoPricing.size20x30.priceUSD',
      photo30x45: 'photoPricing.size30x45.priceUSD',
      photoEnabled15x21: 'photoPricing.size15x21.enabled',
      photoEnabled20x30: 'photoPricing.size20x30.enabled',
      photoEnabled30x45: 'photoPricing.size30x45.enabled',
      postcard15x21: 'postcardPricing.size15x21.priceUSD',
      postcardEnabled15x21: 'postcardPricing.size15x21.enabled'
    },
    prepare(selection: any) {
      try {
        const {
          photo15x21,
          photo20x30,
          photo30x45,
          photoEnabled15x21,
          photoEnabled20x30,
          photoEnabled30x45,
          postcard15x21,
          postcardEnabled15x21
        } = selection || {};

        const photoPrices = [];
        if (photoEnabled15x21 && photo15x21) photoPrices.push(`15x21: $${photo15x21}`);
        if (photoEnabled20x30 && photo20x30) photoPrices.push(`20x30: $${photo20x30}`);
        if (photoEnabled30x45 && photo30x45) photoPrices.push(`30x45: $${photo30x45}`);

        const postcardLabel =
          postcardEnabled15x21 && postcard15x21
            ? `Postales 15x21: $${postcard15x21}`
            : 'Postales sin precio';

        return {
          title: 'Precios globales',
          subtitle:
            photoPrices.length > 0
              ? `${photoPrices.join(', ')} • ${postcardLabel}`
              : postcardLabel
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

