export const AppConfig = {
  site_name: 'SKV Rent',
  title: 'SKV Rent - Noleggio Auto in Italia | Tariffe Competitive',
  description:
    "SKV Rent offre noleggio auto affidabile in Italia. Tariffe competitive, prenotazioni flessibili e servizio professionale. Trova l'auto perfetta per il tuo viaggio!",
  locale: 'it',
  url: 'https://skvrentsrls.it',
  ogImage: '/assets/images/skv-logo.webp',
};

/**
 * Absolute URL for a page, used for its canonical link and og:url.
 *
 * `path` is expected to arrive with both slashes already on it (`/`,
 * `/privacy/`) because next.config.js sets `trailingSlash: true`; this only
 * prefixes the origin and does not repair a path that is missing them.
 */
export const canonicalUrl = (path: string) => `${AppConfig.url}${path}`;
