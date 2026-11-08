import { c } from './part1.mjs';
const r = (d, i, e, o = {}) => c(d, i, e, { v: false, note: 'covered by Next.js harness', ...o });

export default {
  'next-client-boundary-guard': [
    r(
      'Awaits fetchUser(userId) and renders <UserBadge> inside user-profile-boundary',
      'await UserProfileContainer({ userId: "user-77", fetchUser })',
      'renders <div data-testid="user-profile-boundary"><UserBadge user={clientSafeUser} /></div>'
    ),
    r(
      'Retains Date object on createdAt across the RSC boundary',
      'userBadgeProps.createdAt instanceof Date',
      'true'
    ),
    r(
      'Never exposes passwordHash or apiSecret in UserBadge props',
      '"passwordHash" in userBadgeProps || "apiSecret" in userBadgeProps',
      'false'
    ),
    r(
      'Invokes notFound() when fetchUser returns null',
      'await UserProfileContainer({ userId: "user-unknown", fetchUser: async () => null })',
      'throws NextNotFoundError (calls notFound())'
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
