function addTag(tags: string[], input: string, { max = Infinity }: { max?: number } = {}): string[] {
  const tag = input.trim();
  const exists = tags.some((t) => t.toLowerCase() === tag.toLowerCase());
  if (!tag || exists || tags.length >= max) return [...tags];
  return [...tags, tag];
}

function removeTag(tags: string[], index: number): string[] {
  return tags.filter((_, i) => i !== index);
}

function parseTags(text: string): string[] {
  return text.split(/[,\n]/).reduce<string[]>((list, part) => addTag(list, part), []);
}
