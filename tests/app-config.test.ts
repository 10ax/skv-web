import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { AppConfig, canonicalUrl } from '../src/utils/AppConfig';

// next.config.js sets `trailingSlash: true`, so every route on this site ends
// with a slash. PageMeta builds each page's canonical URL and og:url from
// canonicalUrl(), and public/sitemap.xml lists the same URLs by hand — if the
// two drift apart, search engines are told the pages are duplicates.

describe('canonicalUrl', () => {
  it('joins the site origin to a path that already has its slashes', () => {
    expect(canonicalUrl('/')).toBe('https://skvrentsrls.it/');
    expect(canonicalUrl('/privacy/')).toBe('https://skvrentsrls.it/privacy/');
  });

  it('does not repair a caller who forgets the slashes', () => {
    expect(canonicalUrl('privacy/')).toBe('https://skvrentsrls.itprivacy/');
  });
});

describe('site metadata', () => {
  it('declares the production origin without a trailing slash', () => {
    expect(AppConfig.url).toBe('https://skvrentsrls.it');
    expect(AppConfig.url.endsWith('/')).toBe(false);
  });

  it('is an Italian-language site', () => {
    expect(AppConfig.locale).toBe('it');
  });

  it('points og:image at a file that exists in public/', () => {
    expect(() =>
      readFileSync(new URL(`../public${AppConfig.ogImage}`, import.meta.url))
    ).not.toThrow();
  });
});

describe('public/sitemap.xml', () => {
  const sitemap = readFileSync(
    new URL('../public/sitemap.xml', import.meta.url),
    'utf8'
  );

  it('lists every route the site exports, with the trailing slash', () => {
    expect(sitemap).toContain(`<loc>${canonicalUrl('/')}</loc>`);
    expect(sitemap).toContain(`<loc>${canonicalUrl('/privacy/')}</loc>`);
  });

  it('agrees with robots.txt about where the sitemap lives', () => {
    const robots = readFileSync(
      new URL('../public/robots.txt', import.meta.url),
      'utf8'
    );

    expect(robots).toContain(`Sitemap: ${AppConfig.url}/sitemap.xml`);
  });
});
