export default class Schema {
  readonly name: string // required, should not pass null or undefined.
  readonly idAttribute: string
  private nestedSchemas: Array<[string, Schema]>

  constructor(name: string, entityParams = {}, entityConfig = { idAttribute: 'id' }) {
    this.name = name
    this.nestedSchemas = Object.entries(entityParams)
    this.idAttribute = entityConfig.idAttribute
  }

  get isPlain(): boolean {
    return this.nestedSchemas.length === 0
  }

  forEachNestedSchema(iter: (item: [string, Schema]) => void): void {
    this.nestedSchemas.forEach(iter)
  }
}
