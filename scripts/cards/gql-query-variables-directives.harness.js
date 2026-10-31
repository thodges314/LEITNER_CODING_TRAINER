await (async () => {
  const userDoc = (typeof query === "string" ? query : typeof solution === "string" ? solution : "").trim();
  const testSchema = buildSchema(`
    type Query {
      product(id: ID!): Product
    }
    type Review {
      id: ID!
      rating: Int!
      comment: String!
    }
    type Product {
      id: ID!
      name: String!
      price: Float!
      reviews: [Review!]!
    }
  `);

  const root = {
    product: ({ id }) => ({
      id,
      name: "Mechanical Keyboard",
      price: 149.99,
      reviews: [{ id: "r1", rating: 5, comment: "Great tactile feedback" }],
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

  // Case 1: Default execution skips reviews and includes price
  const r1 = await runSafe({ id: "p1" });
  $test.check("Default variables include price and omit reviews", !r1.errors && r1.data?.product?.price === 149.99 && r1.data?.product?.reviews === undefined, r1);

  // Case 2: withReviews=true includes reviews
  const r2 = await runSafe({ id: "p1", withReviews: true });
  $test.check("@include(if: $withReviews) includes reviews when true", !r2.errors && r2.data?.product?.reviews?.length === 1 && r2.data?.product?.reviews[0]?.rating === 5, r2);

  // Case 3: skipPricing=true skips price
  const r3 = await runSafe({ id: "p1", skipPricing: true });
  $test.check("@skip(if: $skipPricing) omits price when true", !r3.errors && r3.data?.product?.price === undefined, r3);

  // Case 4: Variable defaults declared in operation signature
  $test.check("Declares default values for $withReviews and $skipPricing", /\$withReviews\s*:\s*Boolean\s*=\s*false/.test(userDoc) && /\$skipPricing\s*:\s*Boolean\s*=\s*false/.test(userDoc), userDoc);
})();
