function parseHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.firstElementChild;
}

{
  const card = parseHtml(renderPricingCard({
    name: 'Starter',
    price: 15,
    features: ['1 Project', 'Community Support'],
  }));

  const hasArticle = card && card.tagName.toLowerCase() === 'article';
  const hasSlateBorder = card && card.classList.contains('border-slate-700');
  const hasName = card && card.querySelector('h3') && card.querySelector('h3').textContent.includes('Starter');
  const hasPrice = card && card.textContent.includes('$15') && card.textContent.includes('/mo');
  const hasCta = card && card.querySelector('button') && card.querySelector('button').textContent === 'Get Started';
  const hasButtonSlate = card && card.querySelector('button') && card.querySelector('button').classList.contains('bg-slate-800');

  $test.check(
    'Basic non-popular tier renders semantic article with slate border and features list',
    hasArticle && hasSlateBorder && hasName && hasPrice && hasCta && hasButtonSlate,
    { hasArticle, hasSlateBorder, hasName, hasPrice, hasCta }
  );
}

{
  const card = parseHtml(renderPricingCard({
    name: 'Pro',
    price: 49,
    popular: true,
    features: ['Unlimited Projects', 'Priority 24/7 Support'],
  }));

  const hasIndigoRing = card && card.classList.contains('border-indigo-500') && card.classList.contains('ring-2');
  const badge = card && card.querySelector('span.bg-indigo-500');
  const hasBadgeText = badge && badge.textContent === 'Most Popular';
  const button = card && card.querySelector('button');
  const hasButtonIndigo = button && button.classList.contains('bg-indigo-600');

  $test.check(
    'Popular tier renders popular badge and indigo ring styling',
    hasIndigoRing && Boolean(hasBadgeText) && hasButtonIndigo,
    { hasIndigoRing, hasBadgeText, hasButtonIndigo }
  );
}

{
  const card = parseHtml(renderPricingCard({
    name: 'Enterprise',
    price: 999,
    period: '/year',
    features: ['Custom SLA'],
    ctaText: 'Contact Sales',
  }));

  const hasCustomPeriod = card && card.textContent.includes('/year');
  const ctaBtn = card && card.querySelector('button');
  const hasCustomCta = ctaBtn && ctaBtn.textContent === 'Contact Sales';

  $test.check(
    'Applies custom period and custom CTA text correctly',
    hasCustomPeriod && hasCustomCta,
    { hasCustomPeriod, hasCustomCta }
  );
}

{
  const card = parseHtml(renderPricingCard({
    name: 'Free',
    price: 0,
    features: [],
  }));

  const listItems = card ? card.querySelectorAll('ul li') : [];
  $test.check(
    'Renders empty features list gracefully without extra items',
    listItems.length === 0,
    { itemsCount: listItems.length }
  );
}
