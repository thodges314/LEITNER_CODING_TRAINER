import { c } from './part1.mjs';

export default {
  'sql-second-highest-salary': [
    c(
      'Returns second highest salary when multiple distinct salaries exist',
      'query',
      '[{"SecondHighestSalary": 200}]'
    ),
    c(
      'Returns null when only 1 record exists',
      'query',
      '[{"SecondHighestSalary": null}]'
    ),
    c(
      'Returns null when table is empty',
      'query',
      '[{"SecondHighestSalary": null}]'
    ),
    c(
      'Handles duplicate highest salaries correctly',
      'query',
      '[{"SecondHighestSalary": 400}]'
    ),
  ],

  'sql-department-highest-salary': [
    c(
      'Returns department top earners preserving ties',
      'query',
      '[{"Department": "IT", "Employee": "Jim", "Salary": 90000}, {"Department": "IT", "Employee": "Max", "Salary": 90000}, {"Department": "Sales", "Employee": "Henry", "Salary": 80000}]'
    ),
    c(
      'Works with single department',
      'query',
      '[{"Department": "Engineering", "Employee": "Alice", "Salary": 120000}]'
    ),
    c(
      'Returns empty list when tables are empty',
      'query',
      '[]'
    ),
    c(
      'Returns highest earner across distinct non-tied departments',
      'query',
      '[{"Department": "Finance", "Employee": "Bob", "Salary": 75000}, {"Department": "HR", "Employee": "Amy", "Salary": 50000}]'
    ),
  ],

  'sql-department-average-salary': [
    c(
      'Returns employees strictly above department average',
      'query',
      '[{"Employee": "Alice", "Salary": 100, "DepartmentId": 1}, {"Employee": "Charlie", "Salary": 120, "DepartmentId": 2}]'
    ),
    c(
      'Returns empty when all salaries are equal to average',
      'query',
      '[]'
    ),
    c(
      'Returns empty when table has no records',
      'query',
      '[]'
    ),
    c(
      'Filters out solo department employees matching average and keeps above-average in multi-employee departments',
      'query',
      '[{"Employee": "High", "Salary": 150, "DepartmentId": 2}]'
    ),
  ],

  'sql-customer-order-frequency': [
    c(
      'Returns customers with >= 2 orders sorted by total spent',
      'query',
      '[{"email": "alice@example.com", "order_count": 2, "total_spent": 120}, {"email": "carol@example.com", "order_count": 2, "total_spent": 70}]'
    ),
    c(
      'Returns empty when no customer has at least 2 orders',
      'query',
      '[]'
    ),
    c(
      'Returns empty when no orders exist',
      'query',
      '[]'
    ),
    c(
      'Breaks ties in total spent by customer email ascending',
      'query',
      '[{"email": "aaron@example.com", "order_count": 2, "total_spent": 100}, {"email": "zoe@example.com", "order_count": 2, "total_spent": 100}]'
    ),
  ],

  'sql-running-total-sales': [
    c(
      'Computes cumulative running total',
      'query',
      '[{"order_date": "2024-01-01", "amount": 100, "running_total": 100}, {"order_date": "2024-01-02", "amount": 150, "running_total": 250}, {"order_date": "2024-01-03", "amount": 200, "running_total": 450}]'
    ),
    c(
      'Breaks ties on same date using id',
      'query',
      '[{"order_date": "2024-02-01", "amount": 50, "running_total": 50}, {"order_date": "2024-02-01", "amount": 25, "running_total": 75}, {"order_date": "2024-02-02", "amount": 25, "running_total": 100}]'
    ),
    c(
      'Returns empty when no orders exist',
      'query',
      '[]'
    ),
    c(
      'Computes running total correctly for a single order',
      'query',
      '[{"order_date": "2024-05-10", "amount": 42, "running_total": 42}]'
    ),
  ],

  'sql-cancellation-rate': [
    c(
      'Computes cancellation rate for unbanned users',
      'query',
      '[{"Day": "2024-03-01", "Cancellation Rate": 0.5}, {"Day": "2024-03-02", "Cancellation Rate": 0}]'
    ),
    c(
      'Returns 0 when all trips are completed',
      'query',
      '[{"Day": "2024-03-05", "Cancellation Rate": 0}]'
    ),
    c(
      'Returns empty when no trips exist',
      'query',
      '[]'
    ),
    c(
      'Returns 1 when all unbanned trips are cancelled',
      'query',
      '[{"Day": "2024-04-01", "Cancellation Rate": 1}]'
    ),
  ],
};
