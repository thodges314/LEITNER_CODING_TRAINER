const query = `
query GetProjectMembers($projectId: ID!, $first: Int! = 10, $after: String) {
  project(id: $projectId) {
    members(first: $first, after: $after) {
      totalCount
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        cursor
        node {
          id
          name
          email
        }
      }
    }
  }
}
`;
