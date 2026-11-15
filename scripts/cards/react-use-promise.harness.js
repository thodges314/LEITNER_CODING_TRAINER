const { render, q, act, wait } = $dom;
const deferred = () => {
  let resolve;
  const promise = new Promise((res) => { resolve = res; });
  return { promise, resolve };
};

{
  const d = deferred();
  let r;
  await act(async () => {
    r = render(<UserProfileContainer userPromise={d.promise} />);
  });
  const loadingText = r.container.textContent;
  await act(async () => {
    d.resolve({ name: 'Ada Lovelace', role: 'Staff Engineer' });
  });
  await wait(10);
  const card = q('[data-testid="user-card"]', r.container);
  const heading = card ? q('h3', card)?.textContent : '';
  const role = card ? q('p', card)?.textContent : '';
  $test.check(
    'Shows default Suspense fallback while pending, then renders resolved user',
    loadingText.includes('Loading user...') && heading === 'Ada Lovelace' && role === 'Staff Engineer',
    { loadingText, heading, role }
  );
  r.unmount();
}

{
  const d = deferred();
  let r;
  await act(async () => {
    r = render(
      <UserProfileContainer
        userPromise={d.promise}
        fallback={<span data-testid="custom-loader">Fetching profile</span>}
      />
    );
  });
  const hasCustom = Boolean(q('[data-testid="custom-loader"]', r.container));
  await act(async () => {
    d.resolve({ name: 'Grace Hopper', role: 'Principal Architect' });
  });
  await wait(10);
  const card = q('[data-testid="user-card"]', r.container);
  $test.check(
    'Supports a custom fallback prop and swaps to UserProfile on resolve',
    hasCustom && Boolean(card) && card.textContent.includes('Grace Hopper'),
    { hasCustom, text: r.container.textContent }
  );
  r.unmount();
}

{
  const resolved = Promise.resolve({ name: 'Alan Turing', role: 'Researcher' });
  let r;
  await act(async () => {
    r = render(<UserProfileContainer userPromise={resolved} />);
  });
  await wait(10);
  const card = q('[data-testid="user-card"]', r.container);
  $test.check(
    'Renders resolved user details when passed an already-resolved promise',
    Boolean(card) && q('h3', card)?.textContent === 'Alan Turing' && q('p', card)?.textContent === 'Researcher',
    r.container.textContent
  );
  const nextPromise = Promise.resolve({ name: 'Katherine Johnson', role: 'Mathematician' });
  await act(async () => {
    r.rerender(<UserProfileContainer userPromise={nextPromise} />);
  });
  await wait(10);
  const updatedCard = q('[data-testid="user-card"]', r.container);
  $test.check(
    'Updates rendered user when userPromise prop changes to a new promise',
    Boolean(updatedCard) && q('h3', updatedCard)?.textContent === 'Katherine Johnson' && q('p', updatedCard)?.textContent === 'Mathematician',
    r.container.textContent
  );
  r.unmount();
}

