const markup = typeof html === 'string' ? html : (typeof solution === 'string' ? solution : '');
const container = document.createElement('div');
container.innerHTML = markup;

const cardEl = container.firstElementChild;
const hasContainerClasses = Boolean(
  cardEl &&
  cardEl.classList.contains('max-w-sm') &&
  cardEl.classList.contains('rounded-2xl') &&
  cardEl.classList.contains('p-6') &&
  cardEl.classList.contains('bg-slate-900') &&
  cardEl.classList.contains('border-slate-800')
);
$test.check(
  'Card container has dark background, border, padding, and max-width classes',
  hasContainerClasses
);

const titleEl = container.querySelector('span.text-slate-400');
const badgeEl = container.querySelector('span.text-emerald-400');
const hasHeader = Boolean(
  titleEl &&
  titleEl.textContent.includes('Total Revenue') &&
  badgeEl &&
  badgeEl.textContent.includes('+12.5%') &&
  badgeEl.classList.contains('rounded-full')
);
$test.check(
  'Header contains metric title and trend badge with emerald colors',
  hasHeader
);

const valueEl = container.querySelector('.text-3xl');
const subtextEl = container.querySelector('p.text-slate-500');
const hasValueAndSubtext = Boolean(
  valueEl &&
  valueEl.textContent.includes('$48,250') &&
  valueEl.classList.contains('font-extrabold') &&
  subtextEl &&
  subtextEl.textContent.includes('vs. $42,890 last month')
);
$test.check(
  'Displays formatted stat value and comparison subtext',
  hasValueAndSubtext
);

const btnEl = container.querySelector('button');
const hasButton = Boolean(
  btnEl &&
  btnEl.getAttribute('type') === 'button' &&
  btnEl.textContent.includes('View Detailed Report') &&
  btnEl.classList.contains('bg-indigo-600') &&
  btnEl.classList.contains('w-full') &&
  btnEl.classList.contains('rounded-xl')
);
$test.check(
  'Action button is styled with indigo background, rounded corners, and focus ring',
  hasButton
);
