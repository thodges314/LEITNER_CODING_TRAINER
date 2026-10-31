const query = `
query CompareUsers($primaryId: ID!, $secondaryId: ID!) {
  primary: user(id: $primaryId) {
    ...UserSummary
  }
  secondary: user(id: $secondaryId) {
    ...UserSummary
  }
}

fragment UserSummary on User {
  id
  name
  email
  role
}
`;
