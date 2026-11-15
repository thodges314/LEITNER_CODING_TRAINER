const markup = typeof html === 'string' ? html : (typeof solution === 'string' ? solution : '');
const container = document.createElement('div');
container.innerHTML = markup;

const cardEl = container.firstElementChild;
const cardCls = cardEl?.className || '';
const hasContainerClasses = Boolean(
  cardEl &&
  /\bmax-w-/.test(cardCls) &&
  /\brounded-/.test(cardCls) &&
  /\bp-/.test(cardCls) &&
  /\bbg-/.test(cardCls) &&
  /\bborder\b/.test(cardCls)
);
$test.check(
  'Card container has dark background, border, padding, and max-width classes',
  hasContainerClasses
);

const spans = Array.from(container.querySelectorAll('span'));
const titleEl = spans.find((s) => s.textContent.includes('Total Revenue'));
const badgeEl = spans.find((s) => s.textContent.includes('+12.5%'));
const hasHeader = Boolean(
  titleEl &&
  badgeEl &&
  badgeEl.classList.contains('rounded-full') &&
  /\b(text|bg)-(emerald|green)-/.test(badgeEl.className)
);
$test.check(
  'Header contains metric title and trend badge with emerald colors',
  hasHeader
);

const allEls = Array.from(container.querySelectorAll('*'));
const valueEl = allEls.find((el) => el.children.length === 0 && el.textContent.includes('$48,250'));
const subtextEl = container.querySelector('p');
const hasValueAndSubtext = Boolean(
  valueEl &&
  /\btext-(2xl|3xl|4xl)\b/.test(valueEl.className) &&
  /\bfont-(bold|extrabold)\b/.test(valueEl.className) &&
  subtextEl &&
  subtextEl.textContent.includes('vs. $42,890 last month')
);
$test.check(
  'Displays formatted stat value and comparison subtext',
  hasValueAndSubtext
);

const btnEl = container.querySelector('button');
const btnCls = btnEl?.className || '';
const hasButton = Boolean(
  btnEl &&
  btnEl.getAttribute('type') === 'button' &&
  btnEl.textContent.includes('View Detailed Report') &&
  /\bbg-(indigo|blue)-/.test(btnCls) &&
  btnCls.includes('w-full') &&
  /\brounded-/.test(btnCls)
);
$test.check(
  'Action button is styled with indigo background, rounded corners, and focus ring',
  hasButton
);
