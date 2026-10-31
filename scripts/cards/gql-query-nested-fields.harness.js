await (async () => {
  const userDoc = (typeof query === "string" ? query : typeof solution === "string" ? solution : "").trim();
  const testSchema = buildSchema(`
    type Query {
      article(slug: String!): Article
    }
    type Author {
      id: ID!
      name: String!
      avatarUrl: String
    }
    type Comment {
      id: ID!
      text: String!
      createdAt: String!
      author: CommentAuthor!
    }
    type CommentAuthor {
      name: String!
    }
    type Article {
      id: ID!
      title: String!
      publishedAt: String!
      author: Author!
      comments(limit: Int): [Comment!]!
    }
  `);

  const root = {
    article: ({ slug }) => ({
      id: "a1",
      title: "Article: " + slug,
      publishedAt: "2026-10-31",
      author: { id: "u1", name: "Alice", avatarUrl: "https://example.com/a.png" },
      comments: ({ limit }) => [
        { id: "c1", text: "First", createdAt: "2026-10-31T01:00:00Z", author: { name: "Bob" } },
        { id: "c2", text: "Second", createdAt: "2026-10-31T02:00:00Z", author: { name: "Carol" } },
        { id: "c3", text: "Third", createdAt: "2026-10-31T03:00:00Z", author: { name: "Dave" } },
        { id: "c4", text: "Fourth", createdAt: "2026-10-31T04:00:00Z", author: { name: "Eve" } },
      ].slice(0, limit),
    }),
  };

  async function runSafe(vars) {
    try {
      const res = await graphql({ schema: testSchema, source: userDoc, rootValue: root, variableValues: vars });
      return res;
    } catch (e) {
      return { errors: [e] };
    }
  }

  // Case 1: Valid execution returning article and author details
  const r1 = await runSafe({ slug: "intro" });
  $test.check("Queries article by slug with nested author details", !r1.errors && r1.data?.article?.id === "a1" && r1.data?.article?.author?.name === "Alice", r1);

  // Case 2: Limits comments to 3 with text and nested comment author name
  $test.check("Limits comments to 3 and selects nested author name", !r1.errors && Array.isArray(r1.data?.article?.comments) && r1.data?.article?.comments?.length === 3 && r1.data?.article?.comments[0]?.author?.name === "Bob", r1);

  // Case 3: Operation name is GetArticle
  $test.check("Defines named query GetArticle", /query\s+GetArticle\b/.test(userDoc), userDoc);

  // Case 4: Correctly parameterizes $slug variable
  $test.check("Accepts non-null variable $slug: String!", /\$slug\s*:\s*String!/.test(userDoc), userDoc);
})();
