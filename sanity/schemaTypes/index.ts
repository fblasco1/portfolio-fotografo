import { type SchemaTypeDefinition } from 'sanity'
import bio from './bio'
import book from './book'
import documentary from './documentary'
import gallery from './gallery'
import settings from './settings'
import sizePricing from './sizePricing'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [bio, book, documentary, gallery, settings, sizePricing],
}
