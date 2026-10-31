await (async () => {
  const userDoc = (typeof query === "string" ? query : typeof solution === "string" ? solution : "").trim();
  const testSchema = buildSchema(`
    type Query {
      project(id: ID!): Project
    }
    type User {
      id: ID!
      name: String!
      email: String!
    }
    type UserEdge {
      cursor: String!
      node: User!
    }
    type PageInfo {
      hasNextPage: Boolean!
      endCursor: String
    }
    type UserConnection {
      totalCount: Int!
      pageInfo: PageInfo!
      edges: [UserEdge!]!
    }
    type Project {
      id: ID!
      members(first: Int, after: String): UserConnection!
    }
  `);

  const root = {
    project: ({ id }) => ({
      id,
      members: ({ first, after }) => ({
        totalCount: 42,
        pageInfo: {
          hasNextPage: true,
          endCursor: "cursor_2",
        },
        edges: [
          { cursor: "cursor_1", node: { id: "u1", name: "Alice", email: "alice@example.com" } },
          { cursor: "cursor_2", node: { id: "u2", name: "Bob", email: "bob@example.com" } },
        ].slice(0, first || 10),
      }),
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

  const r1 = await runSafe({ projectId: "prj_1" });

  // Case 1: Queries totalCount and pageInfo
  $test.check("Queries totalCount and pageInfo with hasNextPage and endCursor", !r1.errors && r1.data?.project?.members?.totalCount === 42 && r1.data?.project?.members?.pageInfo?.hasNextPage === true && r1.data?.project?.members?.pageInfo?.endCursor === "cursor_2", r1);

  // Case 2: Queries edges with cursor and node { id, name, email }
  $test.check("Queries edges with cursor and node user details", !r1.errors && r1.data?.project?.members?.edges?.length === 2 && r1.data?.project?.members?.edges[0]?.cursor === "cursor_1" && r1.data?.project?.members?.edges[0]?.node?.name === "Alice", r1);

  // Case 3: Operation name is GetProjectMembers
  $test.check("Defines named query GetProjectMembers", /query\s+GetProjectMembers\b/.test(userDoc), userDoc);

  // Case 4: Default argument $first: Int! = 10
  $test.check("Sets default $first: Int! = 10 and optional $after: String", /\$first\s*:\s*Int!\s*=\s*10/.test(userDoc) && /\$after\s*:\s*String\b/.test(userDoc), userDoc);
})();
