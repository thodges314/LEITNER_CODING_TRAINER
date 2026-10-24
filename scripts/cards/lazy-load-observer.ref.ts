interface IntersectionObserverEntryLike {
  isIntersecting: boolean;
  target: Element;
  [key: string]: unknown;
}

interface IntersectionObserverLike {
  observe(target: Element): void;
  unobserve(target: Element): void;
  disconnect(): void;
}

type IntersectionObserverConstructorLike = new (
  callback: (entries: IntersectionObserverEntryLike[], observer: IntersectionObserverLike) => void,
  options?: { rootMargin?: string; [key: string]: unknown },
) => IntersectionObserverLike;

function lazyLoadImages(
  root: Element,
  IO: IntersectionObserverConstructorLike | undefined = typeof IntersectionObserver === 'undefined'
    ? undefined
    : (IntersectionObserver as unknown as IntersectionObserverConstructorLike),
): () => void {
  const images = Array.from(root.querySelectorAll('img[data-src]')) as Element[];

  const load = (img: Element): void => {
    const src = img.getAttribute('data-src');
    if (!src) return; // already loaded
    img.setAttribute('src', src);
    img.removeAttribute('data-src');
  };

  if (!IO) {
    images.forEach(load);
    return () => {};
  }

  const observer = new IO(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        load(entry.target as Element);
        obs.unobserve(entry.target as Element);
      }
    },
    { rootMargin: '200px' },
  );
  images.forEach((img) => observer.observe(img));
  return () => observer.disconnect();
}
