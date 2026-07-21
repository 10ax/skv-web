import Document, { Html, Head, Main, NextScript } from 'next/document';

import config from '../config/index.json';
import { AppConfig } from '../utils/AppConfig';

const toWebp = (src: string) => src.replace(/\.(png|jpe?g)$/i, '.webp');

// Structured data for local business SEO
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'AutoRental',
  name: 'SKV Rent',
  description: AppConfig.description,
  url: 'https://skvrentsrls.it',
  logo: 'https://skvrentsrls.it/assets/images/skv-logo.webp',
  email: 'skvrent96@gmail.com',
  // Add your actual address when available
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Via Taverna Campanile, 260',
    addressLocality: 'Monteforte Irpino',
    addressRegion: 'AV',
    postalCode: '83024',
    addressCountry: 'IT',
  },
  priceRange: '€€',
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    opens: '09:00',
    closes: '18:00',
  },
};

// Need to create a custom _document because i18n support is not compatible with `next export`.
class MyDocument extends Document {
  render() {
    return (
      <Html lang={AppConfig.locale}>
        <Head>
          <meta name="description" content={AppConfig.description} />
          <link rel="canonical" href={AppConfig.url} />

          <meta property="og:type" content="website" />
          <meta property="og:locale" content={AppConfig.locale} />
          <meta property="og:url" content={AppConfig.url} />
          <meta property="og:site_name" content={AppConfig.site_name} />
          <meta property="og:title" content={AppConfig.title} />
          <meta property="og:description" content={AppConfig.description} />
          <meta
            property="og:image"
            content={`${AppConfig.url}${AppConfig.ogImage}`}
          />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:image:alt" content="SKV Rent - Noleggio Auto" />

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@skvrent" />
          <meta name="twitter:creator" content="@skvrent" />
          <meta name="twitter:title" content={AppConfig.title} />
          <meta name="twitter:description" content={AppConfig.description} />
          <meta
            name="twitter:image"
            content={`${AppConfig.url}${AppConfig.ogImage}`}
          />

          <meta
            name="keywords"
            content="SKV Rent, noleggio auto, noleggio auto Italia, affitto auto, car rental Italy, autonoleggio"
          />
          <meta name="author" content="SKV Rent s.r.l." />

          <link
            rel="preload"
            as="image"
            href={toWebp(config.mainHero.img)}
            type="image/webp"
            // fetchPriority isn't in the pinned @types/react 17 <link> types,
            // but React 19 renders it (raises the LCP image request priority).
            {...({
              fetchPriority: 'high',
            } as unknown as JSX.IntrinsicElements['link'])}
          />
          {/* Favicon */}
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="48x48"
            href="/favicon-48x48.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
          <link rel="manifest" href="/site.webmanifest" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
