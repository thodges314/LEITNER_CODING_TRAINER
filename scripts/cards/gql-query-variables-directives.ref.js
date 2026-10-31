const query = `
query GetProduct($id: ID!, $withReviews: Boolean = false, $skipPricing: Boolean = false) {
  product(id: $id) {
    id
    name
    price @skip(if: $skipPricing)
    reviews @include(if: $withReviews) {
      id
      rating
      comment
    }
  }
}
`;
