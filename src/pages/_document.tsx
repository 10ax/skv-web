import Document, { Html, Head, Main, NextScript } from 'next/document';

import { AppConfig } from '../utils/AppConfig';
import config from '../config/index.json';

const toWebp = (src: string) => src.replace(/\.(png|jpe?g)$/i, '.webp');

// Structured data for local business SEO
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'AutoRental',
  name: 'SKV Rent',
  description: AppConfig.description,
  url: 'https://skvrentsrls.it',
  logo: 'https://skvrentsrls.it/assets/images/skv-logo.png',
  email: 'skvrent@gmail.com',
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
          <link
            rel="preload"
            as="image"
            href={toWebp(config.mainHero.img)}
            type="image/webp"
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
            sizes="16x16"
            href="/favicon-16x16.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/apple-touch-icon.png"
          />
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
