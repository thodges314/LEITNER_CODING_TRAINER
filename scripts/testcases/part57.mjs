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
      'Mutates product price via PATCH request to external API',
      'updateProduct({ id: "p-1", price: 99 })',
      'dispatches PATCH to "https://api.example.com/products/p-1" and returns { success: true }'
    ),
    r(
      'Purges products cache tag on successful update',
      'updateProduct({ id: "p-1", price: 99 })',
      'invokes revalidateTag("products")'
    ),
    r(
      'Purges specific product detail path on successful update',
      'updateProduct({ id: "p-1", price: 99 })',
      'invokes revalidatePath("/products/p-1")'
    ),
    r(
      'Returns failure result and does not purge caches on HTTP error',
      'updateProduct({ id: "p-2", price: 150 }) (when API responds 500)',
      'returns { success: false, error: "Update failed" } without purging tags or paths'
    ),
  ],
};

