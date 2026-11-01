const root = document.getElementById('preview-root');

const html = renderPricingCard({
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

root.innerHTML = `<div style="padding: 20px; max-width: 380px;">${html}</div>`;
