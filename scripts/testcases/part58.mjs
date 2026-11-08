import { c } from './part1.mjs';
const r = (d, i, e, o = {}) => c(d, i, e, { v: false, note: 'covered by Next.js harness', ...o });

export default {
  'next-async-page-props': [
    r(
      'Awaits params and searchParams to render category title, sort, and page',
      '<CategoryPage params={Promise.resolve({ category: "shoes" })} searchParams={Promise.resolve({ sort: "price_asc", page: "3" })} />',
      'renders category title "shoes", sort "price_asc", and page "3"'
    ),
    r(
      'Selects first valid sort entry and clamps invalid page to 1',
      '<CategoryPage params={Promise.resolve({ category: "electronics" })} searchParams={Promise.resolve({ sort: ["rating_desc", "price_asc"], page: "-2" })} />',
      'renders category title "electronics", sort "rating_desc", and page "1"'
    ),
    r(
      'Applies safe defaults (category: all, sort: featured, page: 1) when values are missing',
      '<CategoryPage params={Promise.resolve({ category: "" })} searchParams={Promise.resolve({})} />',
      'renders category title "all", sort "featured", and page "1"'
    ),
    r(
      'Parses multi-digit page numbers and single sort parameter',
      '<CategoryPage params={Promise.resolve({ category: "books" })} searchParams={Promise.resolve({ sort: "newest", page: "12" })} />',
      'renders category title "books", sort "newest", and page "12"'
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
      'DashboardLayout renders children inside data-testid="dashboard-layout" with header shell',
      '<DashboardLayout><span>Layout Content</span></DashboardLayout>',
      'renders children and header inside dashboard-layout'
    ),
    r(
      'DashboardTemplate renders children inside data-testid="dashboard-template" with template-enter class',
      '<DashboardTemplate><span>Template Content</span></DashboardTemplate>',
      'renders children inside template-enter wrapper'
    ),
    r(
      'DashboardRoot nests DashboardTemplate with key={pathname} inside DashboardLayout',
      '<DashboardRoot pathname="/dashboard/analytics"><Page /></DashboardRoot>',
      'renders nested Layout and Template with pathname key'
    ),
    r(
      'DashboardRoot updates template key on route change while maintaining layout wrapper',
      '<DashboardRoot pathname="/dashboard/settings"><Page /></DashboardRoot>',
      'updates template key to /dashboard/settings'
    ),
  ],
};

