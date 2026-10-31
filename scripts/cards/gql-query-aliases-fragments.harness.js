await (async () => {
  const userDoc = (typeof query === "string" ? query : typeof solution === "string" ? solution : "").trim();
  const testSchema = buildSchema(`
    type Query {
      user(id: ID!): User
    }
    type User {
      id: ID!
      name: String!
      email: String!
      role: String!
    }
  `);

  const users = {
    "1": { id: "1", name: "Alice", email: "alice@example.com", role: "ADMIN" },
    "2": { id: "2", name: "Bob", email: "bob@example.com", role: "MEMBER" },
  };
  const root = {
    user: ({ id }) => users[id] || null,
  };

  async function runSafe(vars) {
    try {
      const res = await graphql({ schema: testSchema, source: userDoc, rootValue: root, variableValues: vars });
      return res;
    } catch (e) {
      return { errors: [e] };
    }
  }

  const r1 = await runSafe({ primaryId: "1", secondaryId: "2" });

  // Case 1: Queries primary user alias with fragment
  const p = r1.data?.primary;
  $test.check("Queries primary alias with UserSummary fragment", !r1.errors && p?.id === "1" && p?.name === "Alice" && p?.email === "alice@example.com" && p?.role === "ADMIN", r1);

  // Case 2: Queries secondary user alias with fragment
  const s = r1.data?.secondary;
  $test.check("Queries secondary alias with UserSummary fragment", !r1.errors && s?.id === "2" && s?.name === "Bob" && s?.email === "bob@example.com" && s?.role === "MEMBER", r1);

  // Case 3: Defines UserSummary fragment
  $test.check("Defines fragment UserSummary on User", /fragment\s+UserSummary\s+on\s+User\b/.test(userDoc), userDoc);

  // Case 4: Spreads fragment into both aliases
  $test.check("Spreads ...UserSummary into user selections", userDoc.includes("...UserSummary"), userDoc);
})();
