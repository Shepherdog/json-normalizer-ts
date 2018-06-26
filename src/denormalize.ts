import Schema from './schema'

export default function denormalize(data: string | string[], schema: Schema | Schema[], entities: object): any | never {
  if (!data) {
    return data
  }
  if (Array.isArray(schema)) {
    return denormalizeArray(data as string[], schema, entities)
  }
  if (schema instanceof Schema) {
    return denormalizeSchema(data as string, schema, entities)
  }
  if (schema !== null && typeof schema === 'object') {
    return denormalizeObject(data as object, schema, entities)
  }

  throw new Error(`Invalid schema: ${JSON.stringify(schema)}`)
}

function denormalizeObject(data: object, schema: object, entities: object): object {
  const result = { ...data }
  Object.keys(schema).forEach(key => {
    result[key] = denormalize(data[key], schema[key], entities)
  })

  return result
}

function denormalizeSchema(data: string, schema: Schema, entities: object): object | null {
  const entity = getEntity(entities, schema.name, data)
  if (schema.isPlain || !entity) {
    return entity
  }
  const override = { ...entity }
  schema.forEachNestedSchema(([property, nestedSchema]) => {
    override[property] = denormalize(override[property], nestedSchema, entities)
  })

  return override
}

function denormalizeArray(data: string[], [schema]: Schema[], entities: object): object {
  return data.map(item => denormalize(item, schema, entities))
}

function getEntity(entities: object, schemaName: string, id: string): object | null {
  if (entities[schemaName] && entities[schemaName][id]) {
    return entities[schemaName][id]
  }

  return null
}
