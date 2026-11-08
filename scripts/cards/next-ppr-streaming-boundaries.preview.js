function Preview() {
  const props = usePreviewProps({
    inventoryDelay: 800,
    reviewsDelay: 1600,
    stockCount: 14,
    lowStockAlert: false,
  });

  const product = {
    id: 'summit-jacket',
    title: 'Alpine Stormproof Shell',
    category: 'Technical Outerwear',
    price: 289.0,
  };

  const inventoryPromise = React.useMemo(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          stockCount: props.stockCount,
          warehouse: 'Denver Hub',
          lowStockAlert: props.lowStockAlert,
        });
      }, props.inventoryDelay);
    });
  }, [props.stockCount, props.lowStockAlert, props.inventoryDelay]);

  const reviewsPromise = React.useMemo(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: '1', author: 'Elena Rostova', rating: 5, comment: 'Outstanding breathability and weatherproofing on rugged terrain.' },
          { id: '2', author: 'Marcus Chen', rating: 5, comment: 'Lightweight shell with zero restriction. Best purchase of the season.' },
        ]);
      }, props.reviewsDelay);
    });
  }, [props.reviewsDelay]);

  const key = [props.inventoryDelay, props.reviewsDelay, props.stockCount, props.lowStockAlert].join('-');

  return (
    <div className="flex justify-center p-6 bg-slate-50 min-h-[350px]">
      <ProductPPRPage
        key={key}
        product={product}
        inventoryPromise={inventoryPromise}
        reviewsPromise={reviewsPromise}
      />
    </div>
  );
}

<Preview />
