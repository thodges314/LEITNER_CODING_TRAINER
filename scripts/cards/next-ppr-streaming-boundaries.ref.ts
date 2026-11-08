interface ProductData {
  id: string;
  title: string;
  category: string;
  price: number;
}

interface InventoryStatusData {
  stockCount: number;
  warehouse: string;
  lowStockAlert: boolean;
}

interface ReviewItem {
  id: string;
  author: string;
  rating: number;
  comment: string;
}

interface ProductPPRPageProps {
  product: ProductData;
  inventoryPromise: Promise<InventoryStatusData>;
  reviewsPromise: Promise<ReviewItem[]>;
}

const InventorySkeleton = (): React.ReactElement => {
  return (
    <div data-testid="inventory-skeleton" className="animate-pulse py-2 text-sm text-gray-500">
      Checking stock...
    </div>
  );
};

const ReviewsSkeleton = (): React.ReactElement => {
  return (
    <div data-testid="reviews-skeleton" className="animate-pulse space-y-2 py-2 text-sm text-gray-500">
      Loading reviews...
    </div>
  );
};

const InventoryStream = ({ promise }: { promise: Promise<InventoryStatusData> }): React.ReactElement => {
  const status: InventoryStatusData = React.use(promise);
  return (
    <div
      data-testid="inventory-status"
      className={`text-sm font-medium ${status.lowStockAlert ? 'text-amber-600' : 'text-emerald-600'}`}
    >
      {status.lowStockAlert
        ? `Only ${status.stockCount} left! (${status.warehouse})`
        : `${status.stockCount} in stock (${status.warehouse})`}
    </div>
  );
};

const ReviewsStream = ({ promise }: { promise: Promise<ReviewItem[]> }): React.ReactElement => {
  const reviews: ReviewItem[] = React.use(promise);
  if (reviews.length === 0) {
    return (
      <div data-testid="no-reviews" className="text-sm text-gray-500">
        No reviews yet.
      </div>
    );
  }

  return (
    <div data-testid="reviews-list" className="space-y-3">
      {reviews.map((rev: ReviewItem) => (
        <div
          key={rev.id}
          data-testid={`review-item-${rev.id}`}
          className="rounded border border-gray-200 p-3 text-sm"
        >
          <div className="flex items-center justify-between font-semibold">
            <span>{rev.author}</span>
            <span className="text-amber-500">{rev.rating} ★</span>
          </div>
          <p className="mt-1 text-gray-600">{rev.comment}</p>
        </div>
      ))}
    </div>
  );
};

function ProductPPRPage({
  product,
  inventoryPromise,
  reviewsPromise,
}: ProductPPRPageProps): React.ReactElement {
  return (
    <div data-testid="static-product-shell" className="max-w-xl rounded-lg border border-gray-200 p-6 shadow-sm">
      <header className="border-b border-gray-100 pb-4">
        <span data-testid="product-category" className="text-xs uppercase tracking-wider text-gray-400">
          {product.category}
        </span>
        <h1 data-testid="product-title" className="text-2xl font-bold text-gray-900">
          {product.title}
        </h1>
        <div data-testid="product-price" className="mt-2 text-xl font-semibold text-gray-800">
          ${product.price.toFixed(2)}
        </div>
      </header>

      <section className="my-4">
        <React.Suspense fallback={<InventorySkeleton />}>
          <InventoryStream promise={inventoryPromise} />
        </React.Suspense>
      </section>

      <section className="mt-6 border-t border-gray-100 pt-4">
        <h2 className="mb-3 text-lg font-semibold text-gray-800">Customer Reviews</h2>
        <React.Suspense fallback={<ReviewsSkeleton />}>
          <ReviewsStream promise={reviewsPromise} />
        </React.Suspense>
      </section>
    </div>
  );
}
