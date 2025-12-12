import Document, { Html, Head, Main, NextScript } from 'next/document';

import { AppConfig } from '../utils/AppConfig';

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
