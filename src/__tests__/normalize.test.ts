import { normalize, schema } from '..'

const originalData = {
  id: '123',
  author: {
    uid: '1',
    name: 'Paul',
  },
  title: 'My awesome blog post',
  comments: {
    total: 100,
    result: [
      {
        id: '324',
        commenter: {
          uid: '2',
          name: 'Nicole',
        },
      },
    ],
  },
}

// Define a users schema
const user = new schema.Entity(
  'users',
  {},
  {
    idAttribute: 'uid',
  }
)

// Define your comments schema
const comment = new schema.Entity('comments', {
  commenter: user,
})

// Define an unexist entity
const page = new schema.Entity('page', {})
const book = new schema.Entity('book', {
  pages: [page],
})

// Define your article
const article = new schema.Entity('articles', {
  author: user,
  book,
  comments: {
    result: [comment],
  },
})

test('[normalize] array schema', () => {
  expect(
    normalize(
      [
        {
          uid: '1',
          name: 'Paul',
        },
        {
          uid: '2',
          name: 'Nicole',
        },
      ],
      [user]
    )
  ).toEqual({
    result: ['1', '2'],
    entities: {
      users: {
        '1': {
          uid: '1',
          name: 'Paul',
        },
        '2': {
          uid: '2',
          name: 'Nicole',
        },
      },
    },
  })
})

test('[normalize] complex schema', () => {
  expect(normalize(originalData, article)).toEqual({
    result: '123',
    entities: {
      articles: {
        '123': {
          id: '123',
          author: '1',
          title: 'My awesome blog post',
          comments: {
            total: 100,
            result: ['324'],
          },
        },
      },
      users: {
        '1': { uid: '1', name: 'Paul' },
        '2': { uid: '2', name: 'Nicole' },
      },
      comments: {
        '324': { id: '324', commenter: '2' },
      },
    },
  })
})
