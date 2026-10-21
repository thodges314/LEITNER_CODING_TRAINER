async function fetchAllUsers(urls) {
  const results = await Promise.allSettled(urls.map((url) => fetch(url).then((r) => r.json())));
  return results
    .filter((r) => r.status === 'fulfilled')
    .map((r) => r.value);
}
