interface PageProps {
  params: { category: string; slug: string };
  searchParams?: Record<string, string | string[] | undefined>;
}

interface ArticleRecord {
  title: string;
  summary: string;
  thumbnailUrl?: string;
  publishedAt: string;
  author: string;
}

interface ArticleMetadata extends Metadata {
  openGraph?: {
    title: string;
    description: string;
    type?: string;
    publishedTime?: string;
    authors?: string[];
    images?: Array<{ url: string; alt?: string }>;
  };
}

const articlesStore = new Map<string, ArticleRecord>();

const generateMetadata = async ({
  params,
  searchParams,
}: PageProps): Promise<ArticleMetadata> => {
  const category = params?.category;
  const slug = params?.slug;
  const key = `${category}/${slug}`;

  const article = articlesStore.get(key);

  if (!article) {
    return {
      title: 'Article Not Found | Portal',
      description: 'The requested article could not be located.',
    };
  }

  const isPreview = searchParams?.preview === 'true';

  const metadata: ArticleMetadata = {
    title: `${article.title} | Portal`,
    description: article.summary,
    alternates: {
      canonical: `https://example.com/articles/${category}/${slug}`,
    },
    openGraph: {
      title: article.title,
      description: article.summary,
      type: 'article',
      publishedTime: article.publishedAt,
      authors: [article.author],
      images: article.thumbnailUrl ? [{ url: article.thumbnailUrl, alt: article.title }] : [],
    },
  };

  if (isPreview) {
    metadata.robots = {
      index: false,
      follow: false,
    };
  }

  return metadata;
};

