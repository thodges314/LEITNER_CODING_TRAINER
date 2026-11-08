const markup = typeof html === 'string' ? html : (typeof solution === 'string' ? solution : '');
const container = document.createElement('div');
container.innerHTML = markup;

const bannerEl = container.firstElementChild;
const hasContainer = Boolean(
  bannerEl &&
  bannerEl.classList.contains('flex') &&
  bannerEl.classList.contains('items-center') &&
  bannerEl.classList.contains('justify-between') &&
  bannerEl.classList.contains('p-4') &&
  bannerEl.classList.contains('rounded-xl') &&
  bannerEl.classList.contains('bg-blue-50') &&
  bannerEl.classList.contains('border-blue-200') &&
  bannerEl.getAttribute('role') === 'alert'
);
$test.check(
  'Banner container has flex layout, padding, rounded corners, blue background, and alert role',
  hasContainer
);

const badgeEl = container.querySelector('span');
const hasBadge = Boolean(
  badgeEl &&
  badgeEl.classList.contains('rounded-lg') &&
  badgeEl.classList.contains('bg-blue-100') &&
  badgeEl.classList.contains('text-blue-600') &&
  badgeEl.textContent.trim() === 'i'
);
$test.check(
  'Icon badge displays centered informational indicator with rounded styling',
  hasBadge
);

const headlineEl = container.querySelector('h4');
const descEl = container.querySelector('p');
const hasContent = Boolean(
  headlineEl &&
  headlineEl.textContent.includes('System Update Available') &&
  headlineEl.classList.contains('font-semibold') &&
  descEl &&
  descEl.textContent.includes('A new version of the dashboard is ready') &&
  descEl.classList.contains('text-blue-700')
);
$test.check(
  'Displays update headline and description subtext',
  hasContent
);

const btnEl = container.querySelector('button');
const hasButton = Boolean(
  btnEl &&
  btnEl.getAttribute('type') === 'button' &&
  btnEl.classList.contains('bg-blue-600') &&
  btnEl.classList.contains('rounded-lg') &&
  btnEl.classList.contains('text-white') &&
  btnEl.textContent.includes('Update Now')
);
$test.check(
  'Action button has type="button", padding, rounded corners, and update label',
  hasButton
);
