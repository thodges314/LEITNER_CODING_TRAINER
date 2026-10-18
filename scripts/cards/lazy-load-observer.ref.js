function lazyLoadImages(root, IO = typeof IntersectionObserver === 'undefined' ? undefined : IntersectionObserver) {
  const images = Array.from(root.querySelectorAll('img[data-src]'));

  const load = (img) => {
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
        load(entry.target);
        obs.unobserve(entry.target);
      }
    },
    { rootMargin: '200px' }
  );
  images.forEach((img) => observer.observe(img));
  return () => observer.disconnect();
}
