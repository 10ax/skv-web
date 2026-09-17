import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import brandLogosData from '../src/data/brandLogos.json';
import offers from '../src/data/offers.json';
import { makesWithLogos } from '../src/utils/brands';
import { type Car, groupByCategory } from '../src/utils/offers';

// src/data/offers.json is hand-curated: about 22 of the ~124 cars in PROMO.pdf,
// each with a locally sourced image, a credit line and a human-assigned
// category. Nothing at build time checks that those four things agree, and a
// mismatch fails quietly — a car vanishes from the page, or a card renders the
// placeholder silhouette. These tests are that check.

const cars = offers.cars as Car[];
const logos = brandLogosData.logos as Record<string, string>;
const inPublic = (path: string) =>
  existsSync(fileURLToPath(new URL(`../public${path}`, import.meta.url)));

describe('offers.json', () => {
  it('features at least one car', () => {
    expect(cars.length).toBeGreaterThan(0);
  });

  it('gives every car a category listed in categoryOrder', () => {
    const unknown = cars
      .filter((car) => !offers.categoryOrder.includes(car.category))
      .map((car) => `${car.model} (${car.category})`);

    expect(unknown).toEqual([]);
  });

  it('renders every car, so no card is lost to an unlisted category', () => {
    const rendered = groupByCategory(cars, offers.categoryOrder).flatMap(
      (group) => group.list
    );

    expect(rendered).toHaveLength(cars.length);
  });

  it('names each model once, since the model is the React key', () => {
    expect(new Set(cars.map((car) => car.model)).size).toBe(cars.length);
  });

  it('quotes every price as a positive monthly figure', () => {
    const bad = cars.filter(
      (car) => !Number.isFinite(car.price) || car.price <= 0
    );

    expect(bad).toEqual([]);
  });

  it('points every card at an image that exists in public/', () => {
    const missing = cars.filter((car) => !inPublic(car.image));

    expect(missing.map((car) => car.image)).toEqual([]);
  });
});

describe('image credits', () => {
  const credited = Object.keys(offers.imageCredits).filter(
    (key) => !key.startsWith('_')
  );
  const used = cars.map((car) => car.image.split('/').pop());

  // Several renders come from Wikimedia Commons under CC BY-SA, so the credit
  // list is a licensing obligation, not documentation.
  it('credits the source of every image on a card', () => {
    expect(used.filter((file) => !credited.includes(file ?? ''))).toEqual([]);
  });

  it('carries no credit for an image no car uses any more', () => {
    expect(credited.filter((file) => !used.includes(file))).toEqual([]);
  });
});

describe('brand logos', () => {
  it('maps every make in the catalog to a logo', () => {
    const unmapped = cars.map((car) => car.make).filter((make) => !logos[make]);

    expect(Array.from(new Set(unmapped))).toEqual([]);
  });

  it('points every mapping at an SVG that exists in public/', () => {
    const missing = Object.values(logos).filter(
      (file) => !inPublic(`/assets/images/logos/${file}`)
    );

    expect(missing).toEqual([]);
  });

  it('shows every make in the carousel, none filtered out', () => {
    expect(makesWithLogos(cars, logos)).toHaveLength(
      new Set(cars.map((car) => car.make)).size
    );
  });
});
