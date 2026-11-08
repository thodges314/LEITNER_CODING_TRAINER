import { c } from './part1.mjs';
const r = (d, i, e, o = {}) => c(d, i, e, { v: false, note: 'covered by Next.js component harness', ...o });

export default {
  'next-image-component': [
    r(
      'HeroBanner renders fixed-dimension Image with width, height, and priority',
      '<HeroBanner src="/hero.jpg" alt="Hero banner" width={1200} height={600} priority={true} />',
      'renders Image with width=1200, height=600, priority, and alt text'
    ),
    r(
      'HeroBanner renders responsive fill Image with sizes when fill prop is true',
      '<HeroBanner src="/bg.jpg" alt="Background banner" fill={true} />',
      'renders fill Image inside aspect-video wrapper with responsive sizes'
    ),
    r(
      'Uses default width (800) and height (400) when omitted in fixed mode',
      '<HeroBanner src="/product.jpg" alt="Product" />',
      'renders Image with default width=800 and height=400'
    ),
    r(
      'Sets priority to false by default when priority prop is omitted',
      '<HeroBanner src="/product.jpg" alt="Product" />',
      'omits priority/high fetchpriority'
    ),
  ],

  'next-navigation-hooks': [
    r(
      'SearchFilter reads searchParams and displays current pathname',
      '<SearchFilter /> with pathname="/products" and searchParams="?q=shoes"',
      'renders search input with value "shoes" and displays current-path "/products"'
    ),
    r(
      'Submitting search query navigates via router.push with encoded query string',
      'fire.submit(searchForm)',
      'invokes router.push("/products?q=hiking%20boots")'
    ),
    r(
      'Submitting empty search input navigates to base pathname without query parameter',
      'fire.submit(emptySearchForm)',
      'invokes router.push("/products")'
    ),
    r(
      'Falls back to defaultQuery when searchParams has no "q" parameter',
      '<SearchFilter defaultQuery="jackets" /> with empty searchParams',
      'renders search input with value "jackets"'
    ),
  ],

  'next-font-optimization': [
    r(
      'RootLayout applies font CSS variable to html element',
      '<RootLayout><div>App Content</div></RootLayout>',
      'html element contains inter.variable class'
    ),
    r(
      'RootLayout applies font className to body element and renders children',
      '<RootLayout><main>Content</main></RootLayout>',
      'body element contains inter.className and wraps children'
    ),
    r(
      'Sets lang="en" on the html element',
      '<RootLayout><div>App Content</div></RootLayout>',
      'html element has lang="en"'
    ),
    r(
      'Forwards children intact into data-testid="root-body"',
      '<RootLayout><span data-testid="child">Child Element</span></RootLayout>',
      'renders children directly inside root-body'
    ),
  ],

  'next-script-strategies': [
    r(
      'AnalyticsScripts renders core analytics with strategy="afterInteractive"',
      '<AnalyticsScripts analyticsId="ga-9988" />',
      'renders Script tag with strategy="afterInteractive" and analytics id'
    ),
    r(
      'AnalyticsScripts renders chat widget with strategy="lazyOnload"',
      '<AnalyticsScripts analyticsId="ga-9988" />',
      'renders Script tag with strategy="lazyOnload"'
    ),
    r(
      'Encodes analyticsId parameter into analytics script URL',
      '<AnalyticsScripts analyticsId="org/123?auth=true" />',
      'url contains encoded analyticsId'
    ),
    r(
      'Renders scripts-container wrapping both scripts',
      '<AnalyticsScripts analyticsId="ga-9988" />',
      'renders div with data-testid="scripts-container"'
    ),
  ],
};
