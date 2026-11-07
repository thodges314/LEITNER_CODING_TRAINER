interface PricingTier {
  name: string;
  price: number;
  period?: string;
  popular?: boolean;
  features: string[];
  ctaText?: string;
}

interface PricingCardProps {
  tier: PricingTier;
}

function PricingCard({ tier }: PricingCardProps): JSX.Element | null {
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

  return (
    <article className={containerClasses}>
      {popular && (
        <div className="mb-3">
          <span className="bg-indigo-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
            Most Popular
          </span>
        </div>
      )}
      <h3 className="text-xl font-bold text-white">{name}</h3>
      <div className="mt-4 flex items-baseline">
        <span className="text-3xl font-extrabold text-white">${price}</span>
        <span className="ml-1 text-sm text-slate-400">{period}</span>
      </div>
      <ul className="space-y-3 my-6">
        {features.map((f, i) => (
          <li key={i} className="flex items-center text-sm text-slate-300">
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button type="button" className={buttonClasses}>
        {ctaText}
      </button>
    </article>
  );
}
