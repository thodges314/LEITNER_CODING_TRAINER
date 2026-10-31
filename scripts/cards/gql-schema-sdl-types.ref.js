const schema = `
type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  published: Boolean!
  author: User!
}

input CreatePostInput {
  title: String!
  authorId: ID!
  published: Boolean = false
}
`;
