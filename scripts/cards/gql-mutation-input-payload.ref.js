const query = `
mutation CreateTeam($input: CreateTeamInput!) {
  createTeam(input: $input) {
    team {
      id
      name
      slug
      memberCount
    }
    userErrors {
      field
      message
      code
    }
  }
}
`;
