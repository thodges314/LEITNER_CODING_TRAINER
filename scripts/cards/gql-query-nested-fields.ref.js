const query = `
query GetArticle($slug: String!) {
  article(slug: $slug) {
    id
    title
    publishedAt
    author {
      id
      name
      avatarUrl
    }
    comments(limit: 3) {
      id
      text
      createdAt
      author {
        name
      }
    }
  }
}
`;
