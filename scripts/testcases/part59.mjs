import { c } from './part1.mjs';
const r = (d, i, e, o = {}) => c(d, i, e, { v: false, note: 'covered by Next.js harness', ...o });

export default {
  'next-client-boundary-guard': [
    r(
      'Serializes valid user record converting Dates to ISO strings',
      'serializeUserForClient({ id: "u-101", name: "Alice", email: "alice@example.com", role: "admin", passwordHash: "secret", createdAt: new Date("2026-01-15T12:00:00.000Z"), updatedAt: new Date("2026-01-20T18:30:00.000Z") })',
      '{ success: true, data: { id: "u-101", name: "Alice", email: "alice@example.com", role: "admin", createdAt: "2026-01-15T12:00:00.000Z", updatedAt: "2026-01-20T18:30:00.000Z" } }'
    ),
    r(
      'Strips sensitive passwordHash field from client output',
      'serializeUserForClient(user).data.passwordHash',
      'undefined'
    ),
    r(
      'Returns error when createdAt or updatedAt is invalid',
      'serializeUserForClient({ ...user, createdAt: new Date("invalid") })',
      '{ success: false, error: "Invalid date fields" }'
    ),
    r(
      'Returns error when required string fields are missing or empty',
      'serializeUserForClient({ ...user, id: "" })',
      '{ success: false, error: "Missing required user fields" }'
    ),
  ],

  'next-parallel-intercepting-routes': [
    r(
      'FeedLayout renders children and parallel modal slot when modal prop is present',
      '<FeedLayout modal={<Modal />}><div>Feed Items</div></FeedLayout>',
      'renders children in feed-content and modal in modal-slot'
    ),
    r(
      'FeedLayout omits modal slot container when modal prop is absent',
      '<FeedLayout><div>Solo Feed</div></FeedLayout>',
      'omits modal-slot container'
    ),
    r(
      'PhotoModal renders dialog with photo image and close button',
      '<PhotoModal id="pic-42" photoUrl="https://images.example.com/pic-42.jpg" />',
      'renders modal-dialog with img and close button'
    ),
    r(
      'Clicking close button triggers router.back() and optional onDismiss callback',
      'fireEvent.click(modalCloseButton)',
      'invokes onDismiss and router.back()'
    ),
  ],
};
