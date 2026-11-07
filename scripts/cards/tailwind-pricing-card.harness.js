const { render } = $dom;

// 1. Basic non-popular tier renders semantic article with slate border and features list
{
  const r = render(
    <PricingCard
      tier={{
        name: 'Starter',
        price: 15,
        features: ['1 Project', 'Community Support'],
      }}
    />
  );
  const card = r.container.querySelector('article');

  const hasArticle = card !== null && card.tagName.toLowerCase() === 'article';
  const hasSlateBorder = card !== null && card.classList.contains('border-slate-700');
  const hasName = card !== null && card.querySelector('h3')?.textContent.includes('Starter');
  const hasPrice = card !== null && card.textContent.includes('$15') && card.textContent.includes('/mo');
  const hasCta = card !== null && card.querySelector('button')?.textContent === 'Get Started';
  const hasButtonSlate = card !== null && card.querySelector('button')?.classList.contains('bg-slate-800');

  $test.check(
    'Basic non-popular tier renders semantic article with slate border and features list',
    Boolean(hasArticle && hasSlateBorder && hasName && hasPrice && hasCta && hasButtonSlate),
    { hasArticle, hasSlateBorder, hasName, hasPrice, hasCta }
  );
  r.unmount();
}

// 2. Popular tier renders popular badge and indigo ring styling
{
  const r = render(
    <PricingCard
      tier={{
        name: 'Pro',
        price: 49,
        popular: true,
        features: ['Unlimited Projects', 'Priority 24/7 Support'],
      }}
    />
  );
  const card = r.container.querySelector('article');

  const hasIndigoRing =
    card !== null &&
    card.classList.contains('border-indigo-500') &&
    card.classList.contains('ring-2');
  const badge = card?.querySelector('span.bg-indigo-500');
  const hasBadgeText = badge !== null && badge.textContent === 'Most Popular';
  const button = card?.querySelector('button');
  const hasButtonIndigo = button !== null && button.classList.contains('bg-indigo-600');

  $test.check(
    'Popular tier renders popular badge and indigo ring styling',
    Boolean(hasIndigoRing && hasBadgeText && hasButtonIndigo),
    { hasIndigoRing, hasBadgeText: Boolean(hasBadgeText), hasButtonIndigo }
  );
  r.unmount();
}

// 3. Applies custom period and custom CTA text correctly
{
  const r = render(
    <PricingCard
      tier={{
        name: 'Enterprise',
        price: 999,
        period: '/year',
        features: ['Custom SLA'],
        ctaText: 'Contact Sales',
      }}
    />
  );
  const card = r.container.querySelector('article');

  const hasCustomPeriod = card !== null && card.textContent.includes('/year');
  const ctaBtn = card?.querySelector('button');
  const hasCustomCta = ctaBtn !== null && ctaBtn.textContent === 'Contact Sales';

  $test.check(
    'Applies custom period and custom CTA text correctly',
    Boolean(hasCustomPeriod && hasCustomCta),
    { hasCustomPeriod, hasCustomCta }
  );
  r.unmount();
}

// 4. Renders empty features list gracefully without extra items
{
  const r = render(
    <PricingCard
      tier={{
        name: 'Free',
        price: 0,
        features: [],
      }}
    />
  );
  const card = r.container.querySelector('article');
  const listItems = card ? card.querySelectorAll('ul li') : [];

  $test.check(
    'Renders empty features list gracefully without extra items',
    listItems.length === 0,
    { itemsCount: listItems.length }
  );
  r.unmount();
}

// 5. Fires optional onSelect callback when CTA button is clicked
{
  let selected = null;
  const tier = {
    name: 'Team',
    price: 99,
    features: ['5 seats'],
  };
  const r = render(
    <PricingCard
      tier={tier}
      onSelect={(t) => {
        selected = t;
      }}
    />
  );
  const btn = r.container.querySelector('button');
  $dom.fire.click(btn);

  $test.check(
    'Fires optional onSelect callback when CTA button is clicked',
    selected !== null && selected.name === 'Team',
    { selected: Boolean(selected) }
  );
  r.unmount();
}

