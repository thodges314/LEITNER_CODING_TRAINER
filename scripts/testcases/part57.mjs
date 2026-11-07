import { c } from './part1.mjs';
const r = (d, i, e, o = {}) => c(d, i, e, { v: false, note: 'covered by Next.js harness', ...o });

export default {
  'next-generate-metadata': [
    r(
      'Found article generates dynamic title, description, canonical URL, and openGraph image',
      'generateMetadata({ params: { category: "tech", slug: "nextjs-15-deep-dive" } })',
      '{ title: "Next.js 15 Deep Dive | Portal", description: "...", alternates: { canonical: "..." }, openGraph: { ... } }'
    ),
    r(
      'Article without thumbnail returns empty openGraph images array',
      'generateMetadata({ params: { category: "design", slug: "minimalist-ui" } })',
      '{ title: "Minimalist UI Principles | Portal", openGraph: { images: [] } }'
    ),
    r(
      'Preview searchParam sets robots to noindex, nofollow',
      'generateMetadata({ params: { ... }, searchParams: { preview: "true" } })',
      '{ robots: { index: false, follow: false } }'
    ),
    r(
      'Missing article returns 404 fallback title and description',
      'generateMetadata({ params: { category: "unknown", slug: "missing" } })',
      '{ title: "Article Not Found | Portal", description: "The requested article could not be located." }'
    ),
  ],

  'next-static-params-generator': [
    r(
      'Flattens nested categories into sorted category and slug params',
      'generateStaticParams(categories)',
      '[{ category: "components", slug: "button" }, { category: "components", slug: "modal" }, ...]'
    ),
    r(
      'Excludes topics where published is false',
      'generateStaticParams([{ slug: "routing", topics: [{ slug: "parallel", published: false }] }])',
      'excludes unpublished topics'
    ),
    r(
      'Skips categories with invalid or empty slug',
      'generateStaticParams([{ slug: "", topics: [{ slug: "hidden" }] }])',
      'excludes invalid categories'
    ),
    r(
      'Dedupes duplicate category and slug pairs',
      'generateStaticParams(categoriesWithDuplicates)',
      'returns unique category and slug pairs'
    ),
  ],

  'next-revalidation-tag-cache': [
    r(
      'Stores and retrieves data with tags',
      'cache.set("/api/products/1", { id: 1 }, { tags: ["products"] }); cache.get("/api/products/1")',
      '{ id: 1 }'
    ),
    r(
      'revalidateTag purges matching entries and returns purged count',
      'cache.revalidateTag("audio")',
      'returns 1 and purges tagged entry'
    ),
    r(
      'Revalidating shared tag purges all items associated with that tag',
      'cache.revalidateTag("products")',
      'purges all entries associated with "products" tag'
    ),
    r(
      'Entries with ttlMs expire automatically after duration passes',
      'cache.set("/api/temp", data, { ttlMs: 1 }); wait 10ms; cache.get("/api/temp")',
      'null'
    ),
    r(
      'clear wipes all cached items and tag associations',
      'cache.clear()',
      'wipes all cached items and tag mappings'
    ),
  ],
};

