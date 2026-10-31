await (async () => {
  const userDoc = (typeof query === "string" ? query : typeof solution === "string" ? solution : "").trim();
  const testSchema = buildSchema(`
    input CreateTeamInput {
      name: String!
      slug: String!
      description: String
    }
    type UserError {
      field: [String!]
      message: String!
      code: String
    }
    type Team {
      id: ID!
      name: String!
      slug: String!
      memberCount: Int!
    }
    type CreateTeamPayload {
      team: Team
      userErrors: [UserError!]!
    }
    type Query {
      _dummy: String
    }
    type Mutation {
      createTeam(input: CreateTeamInput!): CreateTeamPayload!
    }
  `);

  const root = {
    createTeam: ({ input }) => ({
      team: {
        id: "team_1",
        name: input.name,
        slug: input.slug,
        memberCount: 1,
      },
      userErrors: [],
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

  const r1 = await runSafe({ input: { name: "Core Eng", slug: "core-eng" } });

  // Case 1: Executes mutation and returns created team
  const t = r1.data?.createTeam?.team;
  $test.check("Executes mutation and selects team fields (id, name, slug, memberCount)", !r1.errors && t?.id === "team_1" && t?.name === "Core Eng" && t?.slug === "core-eng" && t?.memberCount === 1, r1);

  // Case 2: Selects userErrors payload fields
  $test.check("Selects userErrors array with field, message, and code", !r1.errors && Array.isArray(r1.data?.createTeam?.userErrors), r1);

  // Case 3: Operation name is CreateTeam
  $test.check("Defines named mutation CreateTeam", /mutation\s+CreateTeam\b/.test(userDoc), userDoc);

  // Case 4: Accepts $input: CreateTeamInput!
  $test.check("Accepts non-null variable $input: CreateTeamInput!", /\$input\s*:\s*CreateTeamInput!/.test(userDoc), userDoc);
})();
