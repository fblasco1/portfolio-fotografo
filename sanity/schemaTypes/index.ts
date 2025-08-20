import { type SchemaTypeDefinition } from 'sanity'
import bio from './bio'
import book from './book'
import gallery from './gallery'
import product from './product'
import settings from './settings'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [bio, book, gallery, product, settings],
}
