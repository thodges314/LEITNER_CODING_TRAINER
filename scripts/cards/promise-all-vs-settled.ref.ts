async function fetchAllUsers(urls: string[]): Promise<any[]> {
  const results = await Promise.allSettled(urls.map((url) => fetch(url).then((r) => r.json())));
  return results
    .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled')
    .map((r) => r.value);
}
