function addTag(tags, input, { max = Infinity } = {}) {
  const tag = input.trim();
  const exists = tags.some((t) => t.toLowerCase() === tag.toLowerCase());
  if (!tag || exists || tags.length >= max) return [...tags];
  return [...tags, tag];
}

function removeTag(tags, index) {
  return tags.filter((_, i) => i !== index);
}

function parseTags(text) {
  return text.split(/[,\n]/).reduce((list, part) => addTag(list, part), []);
}
