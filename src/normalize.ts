import deepAssign from 'deep-assign'
import Schema from './schema'

interface ResultAndEntities {
  result: object | string | string[] | null
  entities: object
}

export default function normalize(data: object | object[], schema: Schema | Schema[]): any | never {
  if (!data) {
    return { result: data, entities: {} }
  }
  if (Array.isArray(schema)) {
    return normalizeArray(data as object[], schema)
  }
  if (schema instanceof Schema) {
    return normalizeSchema(data, schema)
  }
  if (schema !== null && typeof schema === 'object') {
    return normalizeObject(data, schema)
  }

  throw new Error(`Invalid schema: ${JSON.stringify(schema)}`)
}

// match schema situation: x: { k: entity }
function normalizeObject(data: object, schema: object): ResultAndEntities {
  const result = {}
  const entities = {}
  Object.keys(schema).forEach(key => {
    const nested = normalize(data[key], schema[key])
    result[key] = nested.result
    deepAssign(entities, nested.entities)
  })
  Object.keys(data).forEach(key => {
    if (!schema.hasOwnProperty(key)) {
      result[key] = data[key]
    }
  })

  return { result, entities }
}

// match schema situation: x: entity
function normalizeSchema(data: object, schema: Schema): ResultAndEntities {
  const id: string = data[schema.idAttribute]
  if (typeof id === 'undefined') {
    return { result: null, entities: {} }
  }
  if (schema.isPlain) {
    return { result: id, entities: setEntity(data, schema.name, id) }
  }

  const override = { ...data }
  const entities = {}
  schema.forEachNestedSchema(([property, nestedSchema]) => {
    if (override.hasOwnProperty(property)) {
      const nested = normalize(override[property], nestedSchema)
      override[property] = nested.result
      deepAssign(entities, nested.entities)
      setEntity(override, schema.name, id, entities)
    }
  })

  return { result: id, entities }
}

// match schema situation: x: [entity]
function normalizeArray(data: object[], [schema]: Schema[]): ResultAndEntities {
  const result: string[] = []
  const entities = {}
  if (!Array.isArray(data)) {
    throw new Error('Array should be expected')
  }
  data.forEach(item => {
    const nested = normalize(item, schema)
    result.push(nested.result as string) // id
    deepAssign(entities, nested.entities)
  })

  return { result, entities }
}

function setEntity(data: object, schemaName: string, id: string, entities = {}): object {
  if (!entities.hasOwnProperty(schemaName)) {
    entities[schemaName] = Object.create(null)
  }
  entities[schemaName][id] = data

  return entities
}
