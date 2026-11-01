interface PricingTier {
  name: string;
  price: number;
  period?: string;
  popular?: boolean;
  features: string[];
  ctaText?: string;
}

function renderPricingCard(tier: PricingTier): string {
  const period = tier.period || '/mo';
  const ctaText = tier.ctaText || 'Get Started';
  const isPopular = Boolean(tier.popular);

  const containerClasses = isPopular
    ? 'rounded-2xl p-6 transition-all duration-200 border border-indigo-500 ring-2 ring-indigo-500/20'
    : 'rounded-2xl p-6 transition-all duration-200 border border-slate-700 bg-slate-900/50';

  const badgeHtml = isPopular
    ? '<span class="bg-indigo-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">Most Popular</span>'
    : '';

  const buttonClasses = isPopular
    ? 'w-full py-2.5 px-4 rounded-xl font-medium transition-colors cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white'
    : 'w-full py-2.5 px-4 rounded-xl font-medium transition-colors cursor-pointer bg-slate-800 hover:bg-slate-700 text-white';

  const featuresHtml = (tier.features || [])
    .map((f) => `<li class="flex items-center text-sm text-slate-300"><span>${f}</span></li>`)
    .join('');

  return `<article class="${containerClasses}">
${badgeHtml ? `  <div>${badgeHtml}</div>\n` : ''}  <h3 class="text-xl font-bold text-white">${tier.name}</h3>
  <div class="mt-4 flex items-baseline">
    <span class="text-3xl font-extrabold text-white">$${tier.price}</span>
    <span class="ml-1 text-sm text-slate-400">${period}</span>
  </div>
  <ul class="space-y-3 my-6">
    ${featuresHtml}
  </ul>
  <button type="button" class="${buttonClasses}">${ctaText}</button>
</article>`.trim();
}
