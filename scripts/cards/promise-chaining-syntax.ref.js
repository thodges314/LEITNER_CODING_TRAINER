function getUserData(url) {
  return fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .catch((err) => {
      console.error('Caught in chain:', err.message);
      throw err;
    })
    .finally(() => {
      console.log('Cleanup: fetch attempt completed');
    });
}
