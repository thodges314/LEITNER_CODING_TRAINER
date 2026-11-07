function ProductCardPreview() {
  const {
    title = 'Mechanical Keyboard Pro',
    price = 129,
    originalPrice = 169,
    badge = 'Hot Deal',
    rating = 4.9,
  } = usePreviewProps({
    title: 'Mechanical Keyboard Pro',
    price: 129,
    originalPrice: 169,
    badge: 'Hot Deal',
    rating: 4.9,
  });

  return (
    <div className="p-6 max-w-xl mx-auto flex items-center justify-center">
      <ResponsiveProductCard
        product={{
          title,
          description:
            'Engineered for developers with hot-swappable tactile switches, per-key RGB backlighting, and aluminum body.',
          price: Number(price),
          originalPrice: originalPrice ? Number(originalPrice) : undefined,
          badge,
          imageUrl:
            'https://images.unsplash.com/photo-1595225476474-87563907a212?w=600&auto=format&fit=crop&q=80',
          rating: rating ? Number(rating) : undefined,
        }}
        onAddToCart={() => {
          if (typeof log === 'function') {
            log('addToCart', { item: title, price });
          }
        }}
      />
    </div>
  );
}

<ProductCardPreview />
