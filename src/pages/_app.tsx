import { DefaultSeo } from 'next-seo';
import { AppProps } from 'next/app';

import { AppConfig } from '../utils/AppConfig';
import '../styles/main.css';

const MyApp = ({ Component, pageProps }: AppProps) => (
  <>
    <DefaultSeo
      titleTemplate={`%s | ${AppConfig.site_name}`}
      defaultTitle={AppConfig.title}
      description={AppConfig.description}
      canonical={AppConfig.url}
      openGraph={{
        type: 'website',
        locale: AppConfig.locale,
        url: AppConfig.url,
        siteName: AppConfig.site_name,
        title: AppConfig.title,
        description: AppConfig.description,
        images: [
          {
            url: `${AppConfig.url}${AppConfig.ogImage}`,
            width: 1200,
            height: 630,
            alt: 'SKV Rent - Noleggio Auto',
          },
        ],
      }}
      twitter={{
        handle: '@skvrent',
        site: '@skvrent',
        cardType: 'summary_large_image',
      }}
      additionalMetaTags={[
        {
          name: 'keywords',
          content:
            'SKV Rent, noleggio auto, noleggio auto Italia, affitto auto, car rental Italy, autonoleggio',
        },
        {
          name: 'author',
          content: 'SKV Rent s.r.l.',
        },
      ]}
    />
    <Component {...pageProps} />
  </>
);
export default MyApp;
