import React from 'react';

import Head from 'next/head';

import { AppConfig } from '../utils/AppConfig';

type PageMetaProps = {
  title: string;
  description: string;
  /** Absolute path including the trailing slash, e.g. `/` or `/privacy/`. */
  path: string;
  children?: React.ReactNode;
};

// Head tags that name a single page. Everything identical across pages
// (favicons, manifest, og:image, twitter:card, JSON-LD) stays in `_document`;
// putting these there too would give every new page the landing page's
// canonical URL and Open Graph title.
const PageMeta = ({ title, description, path, children }: PageMetaProps) => {
  const url = `${AppConfig.url}${path}`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {children}
    </Head>
  );
};

export default PageMeta;
