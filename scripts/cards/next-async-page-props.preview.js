function Preview() {
  const props = usePreviewProps({
    category: 'electronics',
    sort: 'price-asc',
    page: 1,
  });

  const [element, setElement] = useState(null);

  useEffect(() => {
    let active = true;
    CategoryPage({
      params: Promise.resolve({ category: props.category }),
      searchParams: Promise.resolve({ sort: props.sort, page: String(props.page) }),
    }).then((el) => {
      if (active) setElement(el);
    }).catch((err) => {
      if (active) setElement(React.createElement('div', { className: 'p-4 text-red-400 font-mono text-sm' }, String(err)));
    });

    return () => { active = false; };
  }, [props.category, props.sort, props.page]);

  return (
    <div className="p-6 bg-slate-900 min-h-[200px] flex items-center justify-center rounded-lg">
      {element || <div className="text-slate-400 text-sm animate-pulse">Loading Category Page...</div>}
    </div>
  );
}

<Preview />

