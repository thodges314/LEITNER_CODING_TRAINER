function Preview() {
  const props = usePreviewProps({
    name: 'Mechanical Keyboard RGB',
    price: 149,
    initialFavorited: false,
  });

  return (
    <div className="p-6 bg-slate-900 min-h-[200px] flex items-center justify-center rounded-lg">
      <ProductCard
        key={`${props.name}-${props.initialFavorited}`}
        product={{
          id: 'prod_101',
          name: props.name,
          price: props.price,
        }}
        initialFavorited={props.initialFavorited}
      />
    </div>
  );
}

<Preview />

