const { render, q } = $dom;

{
  const r = render(
    <ThemeCard
      title="Adaptive Surface"
      description="Uses dark: variants to switch surfaces and text."
      badge="v2"
    />
  );
  const article = q('article', r.container);
  const h3 = q('h3', r.container);
  const p = q('p', r.container);
  const span = q('span', r.container);

  $test.check(
    'Article container uses light and dark surface/border classes',
    Boolean(
      article &&
        article.classList.contains('border') &&
        /\brounded-/.test(article.className) &&
        /\bp-\d/.test(article.className) &&
        article.classList.contains('bg-white') &&
        article.classList.contains('dark:bg-slate-900') &&
        article.classList.contains('border-slate-200') &&
        article.classList.contains('dark:border-slate-700')
    ),
    article?.className
  );

  $test.check(
    'Title uses light and dark text contrast classes',
    Boolean(
      h3 &&
        h3.textContent === 'Adaptive Surface' &&
        h3.classList.contains('text-slate-900') &&
        h3.classList.contains('dark:text-slate-100')
    ),
    h3?.className
  );

  $test.check(
    'Description uses light and dark muted text classes',
    Boolean(
      p &&
        p.textContent === 'Uses dark: variants to switch surfaces and text.' &&
        p.classList.contains('text-slate-600') &&
        p.classList.contains('dark:text-slate-300')
    ),
    p?.className
  );

  $test.check(
    'Optional badge renders when provided with adaptive classes',
    Boolean(
      span &&
        span.textContent === 'v2' &&
        span.classList.contains('text-indigo-600') &&
        span.classList.contains('dark:text-indigo-300')
    ),
    span?.className
  );

  r.unmount();
}

{
  const r = render(<ThemeCard title="No Badge" description="Plain card" />);
  $test.check(
    'Omits badge span when badge prop is undefined',
    !q('span', r.container),
    r.container.innerHTML
  );
  r.unmount();
}

