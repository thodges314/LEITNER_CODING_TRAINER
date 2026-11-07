interface Product {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  imageUrl?: string;
  rating?: number;
}

interface ResponsiveCardProps {
  product: Product;
  onAddToCart?: () => void;
}

const ResponsiveProductCard = ({
  product,
  onAddToCart,
}: ResponsiveCardProps): JSX.Element | null => {
  if (!product) return null;

  const {
    title,
    description,
    price,
    originalPrice,
    badge,
    imageUrl = '/keyboard-preview.svg',
    rating,
  } = product;

  return (
    <article className="flex flex-col md:flex-row rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
      <div className="relative w-full aspect-video md:w-48 md:aspect-square md:shrink-0">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
        {badge && (
          <span className="absolute top-3 left-3 bg-indigo-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <p className="text-sm text-slate-400 mt-1 line-clamp-2">
            {description}
          </p>
        </div>
        <div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-baseline">
              <span className="text-xl font-extrabold text-white">
                ${price}
              </span>
              {originalPrice !== undefined && (
                <span className="text-sm text-slate-500 line-through ml-2">
                  ${originalPrice}
                </span>
              )}
            </div>
            {rating !== undefined && (
              <div className="flex items-center gap-1 text-amber-400 text-sm font-medium">
                <span>★</span>
                <span>{rating}</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onAddToCart}
            className="mt-4 w-full md:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-colors cursor-pointer text-center"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
};

