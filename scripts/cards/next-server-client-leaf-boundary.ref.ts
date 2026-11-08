interface Product {
  id: string;
  name: string;
  price: number;
}

interface FavoriteButtonProps {
  productId: string;
  initialFavorited?: boolean;
  onToggle?: (productId: string, favorited: boolean) => void;
}

interface ProductCardProps {
  product: Product;
  initialFavorited?: boolean;
}

function FavoriteButton({
  productId,
  initialFavorited = false,
  onToggle,
}: FavoriteButtonProps): React.ReactElement {
  const [favorited, setFavorited] = React.useState<boolean>(initialFavorited);

  const handleClick = () => {
    const next = !favorited;
    setFavorited(next);
    if (onToggle) {
      onToggle(productId, next);
    }
  };

  return (
    <button
      type="button"
      data-testid="favorite-button"
      aria-pressed={favorited}
      className={favorited ? 'favorited' : ''}
      onClick={handleClick}
    >
      {favorited ? 'Favorited' : 'Add to Favorites'}
    </button>
  );
}

function ProductCard({
  product,
  initialFavorited = false,
}: ProductCardProps): React.ReactElement {
  return (
    <article data-testid="product-card">
      <h3 data-testid="product-title">{product.name}</h3>
      <p data-testid="product-price">${product.price}</p>
      <FavoriteButton
        productId={product.id}
        initialFavorited={initialFavorited}
      />
    </article>
  );
}
