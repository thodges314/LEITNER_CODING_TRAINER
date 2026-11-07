interface DocTopic {
  slug: string;
  title: string;
  published?: boolean;
}

interface DocCategory {
  name: string;
  slug: string;
  topics: DocTopic[];
}

interface StaticDocParam {
  category: string;
  slug: string;
}

const generateStaticParams = (categories: DocCategory[]): StaticDocParam[] => {
  if (!Array.isArray(categories)) return [];

  const seen = new Set<string>();
  const results: StaticDocParam[] = [];

  for (const cat of categories) {
    if (!cat || typeof cat.slug !== 'string' || cat.slug.trim().length === 0) {
      continue;
    }
    if (!Array.isArray(cat.topics)) {
      continue;
    }

    const catSlug = cat.slug.trim();

    for (const topic of cat.topics) {
      if (!topic || typeof topic.slug !== 'string' || topic.slug.trim().length === 0) {
        continue;
      }
      if (topic.published === false) {
        continue;
      }

      const topicSlug = topic.slug.trim();
      const dedupKey = `${catSlug}::${topicSlug}`;

      if (!seen.has(dedupKey)) {
        seen.add(dedupKey);
        results.push({ category: catSlug, slug: topicSlug });
      }
    }
  }

  results.sort((a, b) => {
    const catDiff = a.category.localeCompare(b.category);
    if (catDiff !== 0) return catDiff;
    return a.slug.localeCompare(b.slug);
  });

  return results;
};
