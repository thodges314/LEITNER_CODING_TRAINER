function negotiateAccept(acceptHeader, availableTypes) {
  if (!availableTypes?.length) return null;
  if (!acceptHeader?.trim() || acceptHeader === '*/*') return availableTypes[0];

  const clauses = acceptHeader.split(',').map((raw, idx) => {
    const [mediaType, ...params] = raw.trim().toLowerCase().split(';').map((t) => t.trim());
    const qParam = params.find((p) => p.startsWith('q='));
    const q = qParam ? (parseFloat(qParam.slice(2)) || 0) : 1.0;
    const [type, subtype] = mediaType.split('/');
    const specificity = type === '*' ? 1 : subtype === '*' ? 2 : 3;
    return { mediaType, type, subtype, q, specificity, idx };
  }).filter((c) => c.mediaType);

  clauses.sort((a, b) => b.q - a.q || b.specificity - a.specificity || a.idx - b.idx);

  for (const c of clauses) {
    if (c.q <= 0) continue;
    for (const avail of availableTypes) {
      const [aType] = avail.toLowerCase().split('/');
      if (c.mediaType === '*/*' || (c.subtype === '*' && c.type === aType) || c.mediaType === avail.toLowerCase()) {
        return avail;
      }
    }
  }
  return null;
}

