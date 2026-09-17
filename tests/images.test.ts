import { describe, expect, it } from 'vitest';

import { toWebp, withKnownWidth, withWidthVariant } from '../src/utils/images';

// There is no image optimizer in a static export, so every <picture> in the
// site builds its own sources from these three string rewrites. They are the
// only thing standing between a responsive srcSet and a 404, and all three
// deliberately return the input untouched when they do not recognise it.

describe('toWebp', () => {
  it('swaps a raster extension for .webp', () => {
    expect(toWebp('/assets/images/product1.png')).toBe(
      '/assets/images/product1.webp'
    );
    expect(toWebp('/assets/images/product1.jpg')).toBe(
      '/assets/images/product1.webp'
    );
    expect(toWebp('/assets/images/product1.jpeg')).toBe(
      '/assets/images/product1.webp'
    );
  });

  it('is case insensitive on the extension', () => {
    expect(toWebp('/assets/images/HERO.JPG')).toBe('/assets/images/HERO.webp');
  });

  it('leaves a source it does not recognise alone', () => {
    expect(toWebp('/assets/images/logos/fiat.svg')).toBe(
      '/assets/images/logos/fiat.svg'
    );
    expect(toWebp('/assets/images/skv-logo.webp')).toBe(
      '/assets/images/skv-logo.webp'
    );
    expect(toWebp('')).toBe('');
  });

  it('only rewrites the extension, never a mid-path match', () => {
    expect(toWebp('/assets/png.images/hero.jpg')).toBe(
      '/assets/png.images/hero.webp'
    );
  });
});

describe('withKnownWidth', () => {
  it('replaces an existing -<n>w suffix and keeps the extension', () => {
    expect(withKnownWidth('/assets/images/grant-porter-961w.webp', 640)).toBe(
      '/assets/images/grant-porter-640w.webp'
    );
    expect(withKnownWidth('/assets/images/hero-640w.jpg', 961)).toBe(
      '/assets/images/hero-961w.jpg'
    );
  });

  it('refuses to invent a width for a source that has none', () => {
    expect(withKnownWidth('/assets/images/product1.webp', 640)).toBe(
      '/assets/images/product1.webp'
    );
    expect(withKnownWidth('/assets/images/logos/fiat.svg', 640)).toBe(
      '/assets/images/logos/fiat.svg'
    );
  });
});

describe('withWidthVariant', () => {
  it('adds a width suffix and forces the requested extension', () => {
    expect(withWidthVariant('/assets/images/skv-logo.webp', 64, 'webp')).toBe(
      '/assets/images/skv-logo-64w.webp'
    );
    expect(withWidthVariant('/assets/images/skv-logo.png', 128, 'webp')).toBe(
      '/assets/images/skv-logo-128w.webp'
    );
  });

  it('replaces a width suffix that is already there', () => {
    expect(
      withWidthVariant('/assets/images/skv-logo-32w.webp', 64, 'webp')
    ).toBe('/assets/images/skv-logo-64w.webp');
  });

  it('leaves an empty or unrecognised source alone', () => {
    expect(withWidthVariant('', 64, 'webp')).toBe('');
    expect(withWidthVariant('/assets/images/logos/fiat.svg', 64, 'webp')).toBe(
      '/assets/images/logos/fiat.svg'
    );
  });
});
