# Normalizes nested JSON according to a schema (TypeScript Version)

> Inspired and rewrote from [Wormalize](https://github.com/shimohq/wormalize)

> With the help of [typescript-lib-starter](https://github.com/Hotell/typescript-lib-starter)

## Usage

### Normalize nested JSON data
``` JavaScript
  import { normalize, schema } from 'normalizer'

  const originalData = {
    "id": "123",
    "author":  {
      "uid": "1",
      "name": "Paul"
    },
    "title": "My awesome blog post",
    "comments": {
      total: 100,
      result: [{
        "id": "324",
        "commenter": {
          "uid": "2",
          "name": "Nicole"
        }
      }]
    }
  }

  // Define a users schema
  const user = new schema.Entity('users', {}, {
    idAttribute: 'uid'
  })

  // Define your comments schema
  const comment = new schema.Entity('comments', {
    commenter: user
  })

  // Define your article
  const article = new schema.Entity('articles', {
    author: user,
    comments: {
      result: [ comment ]
    }
  })

  const normalizedData = normalize(originalData, article)
```

output: `normalizedData`
``` JSON
  {
    result: "123",
    entities: {
      "articles": {
        "123": {
          id: "123",
          author: "1",
          title: "My awesome blog post",
          comments: {
            total: 100,
            result: [ "324" ]
          }
        }
      },
      "users": {
        "1": { "uid": "1", "name": "Paul" },
        "2": { "uid": "2", "name": "Nicole" }
      },
      "comments": {
        "324": { id: "324", "commenter": "2" }
      }
    }
  }
```

### Denormalize JSON data
``` JavaScript
  import { schema, denormalize } from 'normalizer'

  const { result, entities } = normalizedData
  const denormalizedData = denormalize(result, article, entities)
```

output:
`denormalizedData` must deeply equal to `originalData`

## Build Setup

``` bash
# install dependencies
npm install

# run jest test suites
npm test

# build for production libs
npm run build
```
