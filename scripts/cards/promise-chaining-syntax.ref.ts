function getUserData(url: string): Promise<any> {
  return fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .catch((err: any) => {
      console.error('Caught in chain:', err.message);
      throw err;
    })
    .finally(() => {
      console.log('Cleanup: fetch attempt completed');
    });
}
