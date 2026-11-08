interface ArticleNode {
  slug: string;
  subpages?: ArticleNode[];
}

interface CategoryTree {
  category: string;
  articles: ArticleNode[];
}

interface RouteParams {
  category: string;
  slug: string[];
}

async function generateStaticParams(
  categories: CategoryTree[] = []
): Promise<RouteParams[]> {
  const results: RouteParams[] = [];

  const collectPaths = (nodes: ArticleNode[], prefix: string[]): string[][] => {
    const paths: string[][] = [];
    if (!Array.isArray(nodes)) return paths;

    for (const node of nodes) {
      if (!node || typeof node.slug !== 'string') continue;

      let decodedSlug = '';
      try {
        decodedSlug = decodeURIComponent(node.slug).trim();
      } catch {
        decodedSlug = node.slug.trim();
      }

      if (!decodedSlug) continue;

      const currentPath = [...prefix, decodedSlug];
      paths.push(currentPath);

      if (Array.isArray(node.subpages) && node.subpages.length > 0) {
        paths.push(...collectPaths(node.subpages, currentPath));
      }
    }

    return paths;
  };

  if (!Array.isArray(categories)) return results;

  for (const cat of categories) {
    if (!cat || typeof cat.category !== 'string') continue;

    let decodedCategory = '';
    try {
      decodedCategory = decodeURIComponent(cat.category).trim();
    } catch {
      decodedCategory = cat.category.trim();
    }

    if (!decodedCategory) continue;
    if (!Array.isArray(cat.articles)) continue;

    const paths = collectPaths(cat.articles, []);
    for (const path of paths) {
      if (path.length > 0) {
        results.push({
          category: decodedCategory,
          slug: path,
        });
      }
    }
  }

  return results;
}

