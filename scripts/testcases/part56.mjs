import { c } from './part1.mjs';
const r = (d, i, e, o = {}) => c(d, i, e, { v: false, note: 'covered by Next.js harness', ...o });

export default {
  'next-route-handler-crud': [
    r(
      'GET returns 404 with error when item does not exist',
      'GET(req, { params: { id: "unknown_999" } })',
      '{ status: 404, data: { error: "Item not found" } }'
    ),
    r(
      'POST returns 400 with error when payload is invalid',
      'POST(req, { params: { id: "item_1" } }) with body { name: "", quantity: -5, price: 10 }',
      '{ status: 400, data: { error: "Invalid item payload" } }'
    ),
    r(
      'POST returns 201 with saved item record on valid payload',
      'POST(req, { params: { id: "item_1" } }) with body { name: "Mechanical Keyboard", quantity: 15, price: 120 }',
      '{ status: 201, data: { id: "item_1", name: "Mechanical Keyboard", quantity: 15, price: 120 } }'
    ),
    r(
      'GET returns 200 with matching item record for existing item',
      'GET(req, { params: { id: "item_1" } })',
      '{ status: 200, data: { id: "item_1", name: "Mechanical Keyboard", quantity: 15, price: 120 } }'
    ),
  ],

  'next-server-action-form': [
    r(
      'Valid formData returns success: true with updated cart and computed total',
      'updateCartQuantity(prevState, formData with itemId: "item_42", quantity: "3")',
      '{ success: true, cart: { itemId: "item_42", quantity: 3, total: 75 } }'
    ),
    r(
      'Missing itemId returns success: false with errors.itemId',
      'updateCartQuantity(prevState, formData with quantity: "2")',
      '{ success: false, errors: { itemId: "Item ID is required" } }'
    ),
    r(
      'Out-of-bounds quantity (> 99) returns errors.quantity',
      'updateCartQuantity(prevState, formData with itemId: "item_42", quantity: "150")',
      '{ success: false, errors: { quantity: "Quantity must be between 1 and 99" } }'
    ),
    r(
      'Non-integer quantity returns errors.quantity',
      'updateCartQuantity(prevState, formData with itemId: "item_42", quantity: "2.5")',
      '{ success: false, errors: { quantity: "Quantity must be between 1 and 99" } }'
    ),
    r(
      'Both fields invalid returns errors for both itemId and quantity',
      'updateCartQuantity(prevState, formData with itemId: "", quantity: "0")',
      '{ success: false, errors: { itemId: "Item ID is required", quantity: "Quantity must be between 1 and 99" } }'
    ),
  ],

  'next-middleware-auth-redirect': [
    r(
      'Unauthenticated /dashboard redirects to /login?next=/dashboard',
      'middleware(req with url: "/dashboard", no cookie)',
      'NextResponse.redirect("/login?next=%2Fdashboard") with status 307'
    ),
    r(
      'Unauthenticated /dashboard/analytics redirects to /login with encoded pathname',
      'middleware(req with url: "/dashboard/analytics", no cookie)',
      'NextResponse.redirect("/login?next=%2Fdashboard%2Fanalytics") with status 307'
    ),
    r(
      'Authenticated /dashboard/settings allows request with NextResponse.next()',
      'middleware(req with url: "/dashboard/settings", cookie: "auth_token=jwt_valid_session_token")',
      'NextResponse.next()'
    ),
    r(
      'Public route /about passes through with NextResponse.next() without auth cookie',
      'middleware(req with url: "/about", no cookie)',
      'NextResponse.next()'
    ),
  ],
};
