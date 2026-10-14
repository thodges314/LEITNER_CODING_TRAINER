function Carousel({ slides, loop = true, autoPlayMs }) {
  const [index, setIndex] = useState(0);
  const last = slides.length - 1;

  const step = useCallback(
    (delta) =>
      setIndex((i) => {
        const target = i + delta;
        return loop ? (target + slides.length) % slides.length : Math.min(last, Math.max(0, target));
      }),
    [loop, slides.length, last]
  );

  useEffect(() => {
    if (!autoPlayMs) return;
    const id = setInterval(() => step(1), autoPlayMs);
    return () => clearInterval(id);
  }, [autoPlayMs, step]);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') step(1);
    if (e.key === 'ArrowLeft') step(-1);
  };

  return (
    <section aria-roledescription="carousel" aria-label="Gallery" tabIndex={0} onKeyDown={onKeyDown}>
      <div role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}`}>
        {slides[index]}
      </div>
      <button onClick={() => step(-1)} disabled={!loop && index === 0}>
        Previous
      </button>
      <button onClick={() => step(1)} disabled={!loop && index === last}>
        Next
      </button>
      {slides.map((_, i) => (
        <button key={i} aria-label={`Go to slide ${i + 1}`} aria-current={i === index ? 'true' : undefined} onClick={() => setIndex(i)} />
      ))}
    </section>
  );
}
