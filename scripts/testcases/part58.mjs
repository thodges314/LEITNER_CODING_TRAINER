import { c } from './part1.mjs';
const r = (d, i, e, o = {}) => c(d, i, e, { v: false, note: 'covered by Next.js harness', ...o });

export default {
  'next-async-page-props': [
    r(
      'Resolves promises and parses single-string query params',
      'parseAsyncPageProps({ params: Promise.resolve({ category: "shoes" }), searchParams: Promise.resolve({ tag: "running", sort: "price_asc", page: "3" }) })',
      '{ category: "shoes", filters: { tags: ["running"], sort: "price_asc", page: 3 } }'
    ),
    r(
      'Normalizes multi-value array query params into trimmed string array',
      'parseAsyncPageProps({ params: Promise.resolve({ category: "apparel" }), searchParams: Promise.resolve({ tag: ["shoes", "sale"] }) })',
      '{ category: "apparel", filters: { tags: ["shoes", "sale"] } }'
    ),
    r(
      'Applies safe defaults when searchParams is empty',
      'parseAsyncPageProps({ params: Promise.resolve({ category: "gear" }), searchParams: Promise.resolve({}) })',
      '{ category: "gear", filters: { tags: [], sort: "featured", page: 1 } }'
    ),
    r(
      'Selects first valid sort entry and clamps negative page to 1',
      'parseAsyncPageProps({ params: Promise.resolve({ category: "electronics" }), searchParams: Promise.resolve({ sort: ["rating_desc", "price_asc"], page: "-2" }) })',
      '{ category: "electronics", filters: { sort: "rating_desc", page: 1 } }'
    ),
  ],

  'next-async-route-handler-context': [
    r(
      'Awaits context.params Promise and returns 200 with member data',
      'GET(req, { params: Promise.resolve({ orgId: "org_acme", memberId: "mem_1" }) })',
      '{ status: 200, data: { id: "mem_1", orgId: "org_acme", role: "owner" } }'
    ),
    r(
      'Returns 404 with error when member record does not exist',
      'GET(req, { params: Promise.resolve({ orgId: "org_acme", memberId: "mem_unknown" }) })',
      '{ status: 404, data: { error: "Member not found" } }'
    ),
    r(
      'Returns 400 when route parameters are empty strings',
      'GET(req, { params: Promise.resolve({ orgId: "", memberId: "   " }) })',
      '{ status: 400, data: { error: "Invalid route parameters" } }'
    ),
    r(
      'Returns 400 when context.params Promise rejects',
      'GET(req, { params: Promise.reject(...) })',
      '{ status: 400, data: { error: "Invalid route parameters" } }'
    ),
  ],

  'next-layout-template-composition': [
    r(
      'DashboardLayout renders children inside data-testid="dashboard-layout"',
      '<DashboardLayout><span>Layout Content</span></DashboardLayout>',
      'renders children in layout container'
    ),
    r(
      'DashboardTemplate renders children inside data-testid="dashboard-template"',
      '<DashboardTemplate><span>Template Content</span></DashboardTemplate>',
      'renders children in template container'
    ),
    r(
      'shouldRemountLayout preserves layout across sibling routes and remounts across roots',
      'coordinator.shouldRemountLayout("/dashboard/analytics", "/dashboard/settings")',
      'false (preserves layout state)'
    ),
    r(
      'shouldRemountTemplate triggers on navigation and produces distinct template keys',
      'coordinator.shouldRemountTemplate("/dashboard/analytics", "/dashboard/settings")',
      'true (forces template remount)'
    ),
  ],
};

