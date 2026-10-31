function negotiateAccept(acceptHeader, availableTypes) {
  if (!availableTypes || availableTypes.length === 0) return null;
  if (!acceptHeader || acceptHeader.trim() === '' || acceptHeader === '*/*') {
    return availableTypes[0];
  }

  const clauses = [];
  const parts = acceptHeader.split(',');

  for (let idx = 0; idx < parts.length; idx++) {
    const raw = parts[idx].trim();
    if (!raw) continue;

    const tokens = raw.split(';').map((t) => t.trim());
    const mediaType = tokens[0].toLowerCase();
    let q = 1.0;

    for (let i = 1; i < tokens.length; i++) {
      const param = tokens[i];
      if (param.startsWith('q=')) {
        const parsedQ = parseFloat(param.slice(2));
        if (!isNaN(parsedQ)) {
          q = parsedQ;
        }
      }
    }

    const [type, subtype] = mediaType.split('/');
    let specificity = 0;
    if (type === '*') {
      specificity = 1;
    } else if (subtype === '*') {
      specificity = 2;
    } else {
      specificity = 3;
    }

    clauses.push({ mediaType, type, subtype, q, specificity, originalIndex: idx });
  }

  clauses.sort((a, b) => {
    if (b.q !== a.q) return b.q - a.q;
    if (b.specificity !== a.specificity) return b.specificity - a.specificity;
    return a.originalIndex - b.originalIndex;
  });

  for (const clause of clauses) {
    if (clause.q === 0) continue;

    for (const available of availableTypes) {
      const availLower = available.toLowerCase();
      const [availType] = availLower.split('/');

      if (clause.mediaType === '*/*') {
        return available;
      }
      if (clause.subtype === '*' && clause.type === availType) {
        return available;
      }
      if (clause.mediaType === availLower) {
        return available;
      }
    }
  }

  return null;
}
