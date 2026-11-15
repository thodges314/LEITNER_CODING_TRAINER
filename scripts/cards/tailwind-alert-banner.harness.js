const markup = typeof html === 'string' ? html : (typeof solution === 'string' ? solution : '');
const container = document.createElement('div');
container.innerHTML = markup;

const bannerEl = container.firstElementChild;
const bannerCls = bannerEl?.className || '';
const hasContainer = Boolean(
  bannerEl &&
  bannerEl.classList.contains('flex') &&
  bannerEl.classList.contains('items-center') &&
  bannerEl.classList.contains('justify-between') &&
  /\bp-/.test(bannerCls) &&
  /\brounded-/.test(bannerCls) &&
  /\bbg-(blue|sky)-/.test(bannerCls) &&
  /\bborder-(blue|sky)-/.test(bannerCls) &&
  bannerEl.getAttribute('role') === 'alert'
);
$test.check(
  'Banner container has flex layout, padding, rounded corners, blue background, and alert role',
  hasContainer
);

const badgeEl = container.querySelector('span');
const badgeCls = badgeEl?.className || '';
const hasBadge = Boolean(
  badgeEl &&
  /\brounded-/.test(badgeCls) &&
  /\bbg-(blue|sky)-/.test(badgeCls) &&
  /\btext-(blue|sky)-/.test(badgeCls) &&
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
  /\bfont-(semibold|bold)\b/.test(headlineEl.className) &&
  descEl &&
  descEl.textContent.includes('A new version of the dashboard is ready') &&
  /\btext-(blue|sky)-/.test(descEl.className)
);
$test.check(
  'Displays update headline and description subtext',
  hasContent
);

const btnEl = container.querySelector('button');
const btnCls = btnEl?.className || '';
const hasButton = Boolean(
  btnEl &&
  btnEl.getAttribute('type') === 'button' &&
  /\bbg-(blue|sky|indigo)-/.test(btnCls) &&
  /\brounded-/.test(btnCls) &&
  btnCls.includes('text-white') &&
  btnEl.textContent.includes('Update Now')
);
$test.check(
  'Action button has type="button", padding, rounded corners, and update label',
  hasButton
);
