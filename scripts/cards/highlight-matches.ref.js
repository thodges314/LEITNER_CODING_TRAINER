function highlightMatches(text, query) {
  if (text === '') return [];
  if (query === '') return [{ text, match: false }];

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  // splitting on a capturing group alternates between non-matches (even indexes) and matches (odd indexes)
  return text
    .split(new RegExp(`(${escaped})`, 'i'))
    .map((part, i) => ({ text: part, match: i % 2 === 1 }))
    .filter((segment) => segment.text !== '');
}
