function PricingPreview() {
  const {
    name = 'Pro Cloud',
    price = 29,
    period = '/month',
    popular = true,
    ctaText = 'Claim 14-Day Free Trial',
  } = usePreviewProps({
    name: 'Pro Cloud',
    price: 29,
    period: '/month',
    popular: true,
    ctaText: 'Claim 14-Day Free Trial',
  });

  const tier = {
    name,
    price: Number(price) || 29,
    period,
    popular: Boolean(popular),
    features: [
      'Unlimited project sandboxes',
      'Full Tailwind & D3 visualization support',
      'Automated spaced repetition tracking',
    ],
    ctaText,
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '380px' }}>
        <PricingCard key={`${name}-${price}-${popular}`} tier={tier} />
      </div>
    </div>
  );
}

<PricingPreview />
