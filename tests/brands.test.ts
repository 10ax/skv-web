import { describe, expect, it } from 'vitest';

import { alternatingRows, makesWithLogos } from '../src/utils/brands';

// The brand marquee is driven by the offers catalog, not by a list of its own:
// a make appears there because a car of that make is on sale and a logo file
// exists for it. These two rules decide which logos scroll past and in which
// order, so they are worth pinning.

const logos = { Fiat: 'fiat.svg', Toyota: 'toyota.svg', Audi: 'audi.svg' };

describe('makesWithLogos', () => {
  it('keeps the order in which each make first appears', () => {
    const makes = makesWithLogos(
      [
        { make: 'Toyota' },
        { make: 'Fiat' },
        { make: 'Toyota' },
        { make: 'Audi' },
      ],
      logos
    );

    expect(makes).toEqual(['Toyota', 'Fiat', 'Audi']);
  });

  it('lists each make once however many cars it has', () => {
    const makes = makesWithLogos(
      [{ make: 'Fiat' }, { make: 'Fiat' }, { make: 'Fiat' }],
      logos
    );

    expect(makes).toEqual(['Fiat']);
  });

  // This is why a new car can join the catalog without breaking the carousel:
  // an unknown make is skipped instead of rendering a broken <img>.
  it('drops a make that has no logo file mapped', () => {
    const makes = makesWithLogos(
      [{ make: 'Fiat' }, { make: 'Ferrari' }],
      logos
    );

    expect(makes).toEqual(['Fiat']);
  });

  it('returns nothing for an empty catalog', () => {
    expect(makesWithLogos([], logos)).toEqual([]);
  });
});

describe('alternatingRows', () => {
  it('deals the makes into two rows like cards', () => {
    expect(alternatingRows(['a', 'b', 'c', 'd', 'e'])).toEqual({
      rowA: ['a', 'c', 'e'],
      rowB: ['b', 'd'],
    });
  });

  it('gives the odd one out to the first row', () => {
    expect(alternatingRows(['a'])).toEqual({ rowA: ['a'], rowB: [] });
    expect(alternatingRows([])).toEqual({ rowA: [], rowB: [] });
  });
});
