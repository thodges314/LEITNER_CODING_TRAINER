const schema: string = `
enum TicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}

type Bug {
  id: ID!
  title: String!
  severity: Int!
}

type Feature {
  id: ID!
  title: String!
  targetRelease: String!
}

union TaskItem = Bug | Feature

type Project {
  id: ID!
  status: TicketStatus!
  tasks: [TaskItem!]!
}
`;
