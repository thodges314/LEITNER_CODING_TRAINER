function ProductCardPreview() {
  const {
    title = 'Mechanical Keyboard Pro',
    description = 'Engineered for developers with hot-swappable tactile switches, per-key RGB backlighting, and aluminum body.',
    price = 129,
    originalPrice = 169,
    badge = 'Hot Deal',
    rating = 4.9,
    imageUrl = '/keyboard-preview.jpeg',
  } = usePreviewProps({
    title: 'Mechanical Keyboard Pro',
    description: 'Engineered for developers with hot-swappable tactile switches, per-key RGB backlighting, and aluminum body.',
    price: 129,
    originalPrice: 169,
    badge: 'Hot Deal',
    rating: 4.9,
    imageUrl: '/keyboard-preview.jpeg',
  });

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
          imageUrl: imageUrl || '/keyboard-preview.jpeg',
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
