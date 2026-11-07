const DEFAULT_KEYBOARD_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400" width="600" height="400"><rect width="600" height="400" fill="%23090d16"/><circle cx="300" cy="200" r="160" fill="%236366f1" opacity="0.15"/><g transform="translate(50,60)"><rect width="500" height="280" rx="24" fill="%230b1120" stroke="%23334155" stroke-width="2"/><rect x="8" y="8" width="484" height="264" rx="18" fill="%231e293b" stroke="%23334155" stroke-width="2"/><rect x="22" y="22" width="456" height="236" rx="12" fill="%23090d16"/><g fill="%231e293b" stroke="%23334155" stroke-width="1"><rect x="36" y="36" width="34" height="28" rx="5" fill="%236366f1"/><rect x="76" y="36" width="28" height="28" rx="5"/><rect x="110" y="36" width="28" height="28" rx="5"/><rect x="144" y="36" width="28" height="28" rx="5"/><rect x="178" y="36" width="28" height="28" rx="5"/><rect x="212" y="36" width="28" height="28" rx="5"/><rect x="246" y="36" width="28" height="28" rx="5"/><rect x="280" y="36" width="28" height="28" rx="5"/><rect x="314" y="36" width="28" height="28" rx="5"/><rect x="348" y="36" width="28" height="28" rx="5"/><rect x="382" y="36" width="28" height="28" rx="5"/><rect x="416" y="36" width="46" height="28" rx="5" fill="%23334155"/><rect x="36" y="70" width="44" height="28" rx="5" fill="%23334155"/><rect x="86" y="70" width="28" height="28" rx="5"/><rect x="120" y="70" width="28" height="28" rx="5"/><rect x="154" y="70" width="28" height="28" rx="5"/><rect x="188" y="70" width="28" height="28" rx="5" fill="%234338ca"/><rect x="222" y="70" width="28" height="28" rx="5"/><rect x="256" y="70" width="28" height="28" rx="5"/><rect x="290" y="70" width="28" height="28" rx="5"/><rect x="324" y="70" width="28" height="28" rx="5"/><rect x="358" y="70" width="28" height="28" rx="5"/><rect x="392" y="70" width="28" height="28" rx="5"/><rect x="426" y="70" width="36" height="28" rx="5" fill="%23334155"/><rect x="36" y="104" width="50" height="28" rx="5" fill="%23334155"/><rect x="92" y="104" width="28" height="28" rx="5"/><rect x="126" y="104" width="28" height="28" rx="5"/><rect x="160" y="104" width="28" height="28" rx="5"/><rect x="194" y="104" width="28" height="28" rx="5"/><rect x="228" y="104" width="28" height="28" rx="5"/><rect x="262" y="104" width="28" height="28" rx="5"/><rect x="296" y="104" width="28" height="28" rx="5"/><rect x="330" y="104" width="28" height="28" rx="5"/><rect x="364" y="104" width="28" height="28" rx="5"/><rect x="398" y="104" width="64" height="28" rx="5" fill="%236366f1"/><rect x="36" y="138" width="62" height="28" rx="5" fill="%23334155"/><rect x="104" y="138" width="28" height="28" rx="5"/><rect x="138" y="138" width="28" height="28" rx="5"/><rect x="172" y="138" width="28" height="28" rx="5"/><rect x="206" y="138" width="28" height="28" rx="5"/><rect x="240" y="138" width="28" height="28" rx="5"/><rect x="274" y="138" width="28" height="28" rx="5"/><rect x="308" y="138" width="28" height="28" rx="5"/><rect x="342" y="138" width="28" height="28" rx="5"/><rect x="376" y="138" width="28" height="28" rx="5"/><rect x="410" y="138" width="52" height="28" rx="5" fill="%23334155"/><rect x="36" y="172" width="38" height="28" rx="5" fill="%23334155"/><rect x="80" y="172" width="34" height="28" rx="5" fill="%23334155"/><rect x="120" y="172" width="38" height="28" rx="5" fill="%23334155"/><rect x="164" y="172" width="176" height="28" rx="5" fill="%23334155" stroke="%236366f1"/><rect x="346" y="172" width="34" height="28" rx="5" fill="%23334155"/><rect x="386" y="172" width="34" height="28" rx="5" fill="%23334155"/><rect x="426" y="172" width="36" height="28" rx="5" fill="%23334155"/></g><circle cx="440" cy="225" r="3" fill="%2310b981"/><circle cx="452" cy="225" r="3" fill="%236366f1"/></g><text x="300" y="375" fill="%2364748b" font-family="sans-serif" font-size="12" font-weight="700" letter-spacing="3" text-anchor="middle">SERIES 75 · MECHANICAL KEYBOARD</text></svg>';

function ProductCardPreview() {
  const {
    title = 'Mechanical Keyboard Pro',
    description = 'Engineered for developers with hot-swappable tactile switches, per-key RGB backlighting, and aluminum body.',
    price = 129,
    originalPrice = 169,
    badge = 'Hot Deal',
    rating = 4.9,
    imageUrl = '/keyboard-preview.svg',
  } = usePreviewProps({
    title: 'Mechanical Keyboard Pro',
    description: 'Engineered for developers with hot-swappable tactile switches, per-key RGB backlighting, and aluminum body.',
    price: 129,
    originalPrice: 169,
    badge: 'Hot Deal',
    rating: 4.9,
    imageUrl: '/keyboard-preview.svg',
  });

  const displayImage =
    !imageUrl || imageUrl === '/keyboard-preview.svg'
      ? DEFAULT_KEYBOARD_IMAGE
      : imageUrl;

  return (
    <div className="p-6 max-w-xl mx-auto flex items-center justify-center">
      <ResponsiveProductCard
        key={`${title}-${price}-${originalPrice}-${badge}-${rating}-${imageUrl}`}
        product={{
          title,
          description,
          price: Number(price),
          originalPrice: originalPrice ? Number(originalPrice) : undefined,
          badge: badge || undefined,
          imageUrl: displayImage,
          rating: rating ? Number(rating) : undefined,
        }}
        onAddToCart={() => {
          if (typeof log === 'function') {
            log('onAddToCart', { item: title, price: Number(price) });
          }
        }}
      />
    </div>
  );
}

<ProductCardPreview />
