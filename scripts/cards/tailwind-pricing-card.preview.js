function PricingPreview() {
  const {
    name = 'Pro Cloud',
    price = 29,
    period = '/month',
    popular = true,
    features = [
      'Unlimited project sandboxes',
      'Full Tailwind & D3 visualization support',
      'Automated spaced repetition tracking',
    ],
    ctaText = 'Claim 14-Day Free Trial',
  } = usePreviewProps({
    name: 'Pro Cloud',
    price: 29,
    period: '/month',
    popular: true,
    features: [
      'Unlimited project sandboxes',
      'Full Tailwind & D3 visualization support',
      'Automated spaced repetition tracking',
    ],
    ctaText: 'Claim 14-Day Free Trial',
  });

  const parsedFeatures = Array.isArray(features) ? features : [];

  const tier = {
    name,
    price: Number(price) || 29,
    period,
    popular: Boolean(popular),
    features: parsedFeatures,
    ctaText,
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <PricingCard
          key={`${name}-${price}-${popular}-${ctaText}`}
          tier={tier}
          onSelect={(selectedTier) => {
            if (typeof log === 'function') log('onSelect', selectedTier);
          }}
        />
      </div>
    </div>
  );
}

<PricingPreview />
