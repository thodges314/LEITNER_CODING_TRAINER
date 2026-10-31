import { c } from './part1.mjs';

export default {
  'sql-consecutive-numbers': [
    c(
      'Finds single number appearing three consecutive times',
      'query',
      '[{"ConsecutiveNums": 1}]'
    ),
    c(
      'Finds multiple numbers that appear at least three consecutive times',
      'query',
      '[{"ConsecutiveNums": 1}, {"ConsecutiveNums": 3}]'
    ),
    c(
      'Returns empty list when no numbers repeat consecutively',
      'query',
      '[]'
    ),
    c(
      'Handles runs of four or more consecutive identical numbers without duplicate rows',
      'query',
      '[{"ConsecutiveNums": 5}]'
    ),
  ],

  'sql-top-three-salaries': [
    c(
      'Selects top three unique salaries preserving ties across departments',
      'query',
      '[{"Department": "IT", "Employee": "Max", "Salary": 90000}, {"Department": "IT", "Employee": "Joe", "Salary": 85000}, {"Department": "IT", "Employee": "Randy", "Salary": 85000}, {"Department": "IT", "Employee": "Will", "Salary": 70000}, {"Department": "Sales", "Employee": "Henry", "Salary": 80000}, {"Department": "Sales", "Employee": "Sam", "Salary": 60000}]'
    ),
    c(
      'Includes all employees when department has fewer than three distinct salaries',
      'query',
      '[{"Department": "Engineering", "Employee": "Alice", "Salary": 120000}, {"Department": "Engineering", "Employee": "Bob", "Salary": 110000}]'
    ),
    c(
      'Returns empty list when employees table is empty',
      'query',
      '[]'
    ),
    c(
      'Filters out rank 4 and lower salaries when more than three unique salary tiers exist',
      'query',
      '[{"Department": "R&D", "Employee": "Lead", "Salary": 150000}, {"Department": "R&D", "Employee": "SeniorA", "Salary": 130000}, {"Department": "R&D", "Employee": "SeniorB", "Salary": 130000}, {"Department": "R&D", "Employee": "Mid", "Salary": 110000}]'
    ),
  ],

  'sql-org-hierarchy-cte': [
    c(
      'Traverses multi-level organization reporting hierarchy with correct depths and root leaders',
      'query',
      '[{"id": 1, "name": "Satya", "depth": 0, "root_leader": "Satya"}, {"id": 3, "name": "Amy", "depth": 1, "root_leader": "Satya"}, {"id": 2, "name": "Kevin", "depth": 1, "root_leader": "Satya"}, {"id": 4, "name": "Phil", "depth": 2, "root_leader": "Satya"}]'
    ),
    c(
      'Handles multiple disjoint trees with separate root leaders',
      'query',
      '[{"id": 10, "name": "Alice", "depth": 0, "root_leader": "Alice"}, {"id": 20, "name": "Carol", "depth": 0, "root_leader": "Carol"}, {"id": 11, "name": "Bob", "depth": 1, "root_leader": "Alice"}, {"id": 21, "name": "Dan", "depth": 1, "root_leader": "Carol"}, {"id": 22, "name": "Eve", "depth": 2, "root_leader": "Carol"}]'
    ),
    c(
      'Returns depth 0 for an isolated executive without reports',
      'query',
      '[{"id": 1, "name": "Solo", "depth": 0, "root_leader": "Solo"}]'
    ),
    c(
      'Returns empty list when employees table is empty',
      'query',
      '[]'
    ),
  ],

  'sql-deduplicate-keep-lowest-id': [
    c(
      'Deduplicates multiple identical emails retaining the row with lowest id',
      'query',
      '[{"id": 1, "name": "Alice Smith", "email": "alice@example.com"}, {"id": 2, "name": "Bob Jones", "email": "bob@example.com"}, {"id": 4, "name": "Charlie Brown", "email": "charlie@example.com"}]'
    ),
    c(
      'Preserves all records when all emails are already distinct',
      'query',
      '[{"id": 10, "name": "Dave", "email": "dave@example.com"}, {"id": 20, "name": "Eve", "email": "eve@example.com"}]'
    ),
    c(
      'Returns empty array when contacts table is empty',
      'query',
      '[]'
    ),
    c(
      'Correctly chooses lowest id when duplicate records appear out of order',
      'query',
      '[{"id": 5, "name": "Zoe First", "email": "zoe@example.com"}]'
    ),
  ],

  'sql-pivot-monthly-sales': [
    c(
      'Pivots Q1 sales across products with zero-filled gaps',
      'query',
      '[{"product": "Gadget", "jan_sales": 0, "feb_sales": 300, "mar_sales": 400}, {"product": "Widget", "jan_sales": 250, "feb_sales": 200, "mar_sales": 0}]'
    ),
    c(
      'Handles single product with sales in all three months',
      'query',
      '[{"product": "Alpha", "jan_sales": 50, "feb_sales": 60, "mar_sales": 70}]'
    ),
    c(
      'Returns empty array when product_sales table is empty',
      'query',
      '[]'
    ),
    c(
      'Ignores sales dates outside Q1 2024',
      'query',
      '[{"product": "Beta", "jan_sales": 80, "feb_sales": 0, "mar_sales": 0}]'
    ),
  ],

  'sql-customers-who-never-order': [
    c(
      'Identifies customers with no orders in orders table',
      'query',
      '[{"customer_name": "Henry"}, {"customer_name": "Max"}]'
    ),
    c(
      'Returns empty array when all customers have placed at least one order',
      'query',
      '[]'
    ),
    c(
      'Returns all customers when orders table is completely empty',
      'query',
      '[{"customer_name": "Yvonne"}, {"customer_name": "Zack"}]'
    ),
    c(
      'Returns empty array when customers table is empty',
      'query',
      '[]'
    ),
  ],

  'sql-seat-swap-consecutive': [
    c(
      'Swaps seats for odd count keeping last student seat unchanged',
      'query',
      '[{"id": 1, "student": "Doris"}, {"id": 2, "student": "Abbot"}, {"id": 3, "student": "Green"}, {"id": 4, "student": "Emerson"}, {"id": 5, "student": "Jeames"}]'
    ),
    c(
      'Swaps seats for even count swapping every pair',
      'query',
      '[{"id": 1, "student": "Bob"}, {"id": 2, "student": "Alice"}, {"id": 3, "student": "Diana"}, {"id": 4, "student": "Charlie"}]'
    ),
    c(
      'Leaves single student seat unchanged',
      'query',
      '[{"id": 1, "student": "Solo"}]'
    ),
    c(
      'Returns empty array when seat table is empty',
      'query',
      '[]'
    ),
  ],

  'sql-monthly-active-users-retention': [
    c(
      'Calculates month-over-month retained users across consecutive months',
      'query',
      '[{"month": "2024-02", "retained_users": 1}, {"month": "2024-03", "retained_users": 2}]'
    ),
    c(
      'Returns empty array when users are active in non-consecutive months only',
      'query',
      '[]'
    ),
    c(
      'Only counts each user once even with multiple actions in each month',
      'query',
      '[{"month": "2024-06", "retained_users": 1}]'
    ),
    c(
      'Returns empty array when user_actions table is empty',
      'query',
      '[]'
    ),
  ],

  'sql-user-session-timeout': [
    c(
      'Sessionizes user events into distinct sessions based on 30-minute inactivity gap',
      'query',
      '[{"event_id": 1, "user_id": 1, "session_id": "1-1"}, {"event_id": 2, "user_id": 1, "session_id": "1-1"}, {"event_id": 3, "user_id": 1, "session_id": "1-2"}, {"event_id": 4, "user_id": 2, "session_id": "2-1"}]'
    ),
    c(
      'Groups all events into single session when intervals never exceed 30 minutes',
      'query',
      '[{"event_id": 10, "user_id": 5, "session_id": "5-1"}, {"event_id": 11, "user_id": 5, "session_id": "5-1"}, {"event_id": 12, "user_id": 5, "session_id": "5-1"}]'
    ),
    c(
      'Creates separate session for every event when gap between each event exceeds 30 minutes',
      'query',
      '[{"event_id": 21, "user_id": 9, "session_id": "9-1"}, {"event_id": 22, "user_id": 9, "session_id": "9-2"}, {"event_id": 23, "user_id": 9, "session_id": "9-3"}]'
    ),
    c(
      'Returns empty array when user_events table is empty',
      'query',
      '[]'
    ),
  ],
};
