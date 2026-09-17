import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import config from '../src/config/index.json';
import { validateVATNumber } from '../src/utils/validation';

// All copy lives in src/config/index.json rather than in the components, which
// makes it easy to edit and easy to break: a navigation entry can be pointed at
// a section that no longer exists, and the company details the law requires can
// be emptied, without anything failing to compile.

const srcDir = fileURLToPath(new URL('../src', import.meta.url));

// Walked by hand rather than with readdirSync's `recursive` option: the repo
// pins @types/node 16, which predates it.
const tsxFilesUnder = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = `${dir}/${entry.name}`;
    if (entry.isDirectory()) return tsxFilesUnder(path);
    return entry.name.endsWith('.tsx') ? [path] : [];
  });

const sourceFiles = tsxFilesUnder(srcDir);

const allSource = sourceFiles
  .map((file) => readFileSync(file, 'utf8'))
  .join('\n');

// Every `id="…"` the components render. Form fields end up in here too, which
// only makes the check more permissive — it still catches an anchor pointed at
// a section that was renamed or removed.
const renderedIds = new Set(
  Array.from(allSource.matchAll(/\bid="([^"]+)"/g)).map((match) => match[1])
);

describe('in-page navigation', () => {
  it('points every header link at a section that is rendered', () => {
    const dangling = config.navigation.filter(
      (item) => !renderedIds.has(item.href)
    );

    expect(dangling.map((item) => item.href)).toEqual([]);
  });

  it('points every footer link at a section that is rendered', () => {
    const dangling = config.about.sections.filter(
      (item) => !renderedIds.has(item.href)
    );

    expect(dangling.map((item) => item.href)).toEqual([]);
  });

  // "Chi siamo" has to land on the About section. The footer used to carry an
  // id="about" of its own, which swallowed the link.
  it('renders id="about" once, in About.tsx and not in Footer.tsx', () => {
    const footer = readFileSync(`${srcDir}/components/Footer.tsx`, 'utf8');
    const about = readFileSync(`${srcDir}/components/About.tsx`, 'utf8');

    expect(about).toContain('id="about"');
    expect(footer).not.toContain('id="about"');
  });
});

describe('company identification required by Italian law', () => {
  const { legal } = config.about;

  // Art. 35 DPR 633/72 (VAT number) and art. 2250 c.c. (registration details).
  it('carries a well-formed partita IVA', () => {
    expect(legal.vatId).toMatch(/^\d{11}$/);
    expect(validateVATNumber(legal.vatId)).toBe(true);
  });

  it('carries the REA number and the PEC address', () => {
    expect(legal.rea).not.toBe('');
    expect(legal.pec).toContain('@');
  });

  it('prints the VAT number, the REA number and the PEC in the footer', () => {
    const footer = readFileSync(`${srcDir}/components/Footer.tsx`, 'utf8');

    expect(footer).toContain('legal.vatId');
    expect(footer).toContain('legal.rea');
    expect(footer).toContain('legal.pec');
  });

  // Art. 2250 also wants the paid-up share capital. Nobody has supplied the
  // figure, so the footer hides the line rather than printing an empty one.
  it('still has no share capital figure, so the footer omits that line', () => {
    const footer = readFileSync(`${srcDir}/components/Footer.tsx`, 'utf8');

    expect(legal.shareCapital).toBe('');
    expect(footer).toContain('legal.shareCapital ?');
  });

  it('names the company as an S.r.l.s., not an S.r.l.', () => {
    expect(config.company.legalName).toBe('SKV Rent S.r.l.s.');
  });
});

describe('privacy notice', () => {
  it('is reachable from the footer of every page', () => {
    expect(config.about.privacyPage.href).toBe('/privacy/');
    expect(readFileSync(`${srcDir}/components/Footer.tsx`, 'utf8')).toContain(
      'privacyPage.href'
    );
  });

  it('is linked from the consent checkbox next to the submit button', () => {
    const contact = readFileSync(`${srcDir}/components/Contact.tsx`, 'utf8');

    expect(contact).toContain('name="privacy_consent"');
    expect(contact).toContain('href="/privacy/"');
  });
});

// The site sets no cookies, loads no analytics, self-hosts its font and embeds
// no third-party frames, which is the reason it needs no consent banner under
// the Garante's 2021 cookie guidelines. Anything added here brings the banner
// back, so the absence is worth asserting.
describe('no third-party tracking', () => {
  it('references no analytics or tag-manager origin', () => {
    const trackers = [
      'googletagmanager.com',
      'google-analytics.com',
      'gtag(',
      'fbq(',
      'hotjar',
      'doubleclick.net',
    ];

    expect(trackers.filter((needle) => allSource.includes(needle))).toEqual([]);
  });

  it('self-hosts the display font instead of fetching it', () => {
    const app = readFileSync(`${srcDir}/pages/_app.tsx`, 'utf8');

    expect(app).toContain("from 'next/font/local'");
    expect(allSource).not.toContain('fonts.googleapis.com');
    expect(allSource).not.toContain('fonts.gstatic.com');
  });

  it('posts the contact form to Web3Forms and nowhere else', () => {
    const contact = readFileSync(`${srcDir}/components/Contact.tsx`, 'utf8');
    const fetched = Array.from(contact.matchAll(/fetch\('([^']+)'/g)).map(
      (match) => match[1]
    );

    expect(fetched).toEqual(['https://api.web3forms.com/submit']);
  });
});
