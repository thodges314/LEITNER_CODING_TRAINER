function PricingCard({ tier }) {
  if (!tier) return null;
  const {
    name,
    price,
    period = '/mo',
    popular = false,
    features = [],
    ctaText = 'Get Started',
  } = tier;

  const containerClasses = popular
    ? 'rounded-2xl p-6 transition-all duration-200 border border-indigo-500 ring-2 ring-indigo-500/20'
    : 'rounded-2xl p-6 transition-all duration-200 border border-slate-700 bg-slate-900/50';

  const buttonClasses = popular
    ? 'w-full py-2.5 px-4 rounded-xl font-medium transition-colors cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white'
    : 'w-full py-2.5 px-4 rounded-xl font-medium transition-colors cursor-pointer bg-slate-800 hover:bg-slate-700 text-white';

  return React.createElement(
    'article',
    { className: containerClasses },
    popular &&
      React.createElement(
        'div',
        { className: 'mb-3' },
        React.createElement(
          'span',
          {
            className:
              'bg-indigo-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider',
          },
          'Most Popular'
        )
      ),
    React.createElement('h3', { className: 'text-xl font-bold text-white' }, name),
    React.createElement(
      'div',
      { className: 'mt-4 flex items-baseline' },
      React.createElement(
        'span',
        { className: 'text-3xl font-extrabold text-white' },
        `$${price}`
      ),
      React.createElement(
        'span',
        { className: 'ml-1 text-sm text-slate-400' },
        period
      )
    ),
    React.createElement(
      'ul',
      { className: 'space-y-3 my-6' },
      features.map((f, i) =>
        React.createElement(
          'li',
          { key: i, className: 'flex items-center text-sm text-slate-300' },
          React.createElement('span', null, f)
        )
      )
    ),
    React.createElement(
      'button',
      { type: 'button', className: buttonClasses },
      ctaText
    )
  );
}
