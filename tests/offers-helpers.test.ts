import { describe, expect, it } from 'vitest';

import { formatPrice, groupByCategory, type Car } from '../src/utils/offers';

const car = (
  model: string,
  price: number,
  category: string,
  make = 'Fiat'
): Car => ({
  model,
  make,
  price,
  category,
  image: `/assets/images/offers/${model}.webp`,
});

// Prices are rendered from a hand-rolled formatter rather than
// Number.toLocaleString('it-IT'): Node (which runs the export) and the browser
// group Italian thousands differently, which both looked wrong and risked a
// React hydration mismatch on the statically exported HTML.
describe('formatPrice', () => {
  it('always shows two decimals with a comma', () => {
    expect(formatPrice(0)).toBe('€0,00');
    expect(formatPrice(0.5)).toBe('€0,50');
    expect(formatPrice(192.5)).toBe('€192,50');
    expect(formatPrice(287.67)).toBe('€287,67');
  });

  it('groups thousands with a dot', () => {
    expect(formatPrice(1000)).toBe('€1.000,00');
    expect(formatPrice(1455)).toBe('€1.455,00');
    expect(formatPrice(100000)).toBe('€100.000,00');
    expect(formatPrice(1234567.5)).toBe('€1.234.567,50');
  });

  it('rounds to the cent rather than truncating', () => {
    expect(formatPrice(287.666)).toBe('€287,67');
    expect(formatPrice(287.664)).toBe('€287,66');
  });

  // Not a price the catalog can produce today, but pinned so a future change
  // to the grouping regex cannot silently move the sign.
  it('puts the minus sign after the euro symbol', () => {
    expect(formatPrice(-1234.5)).toBe('€-1.234,50');
  });
});

describe('groupByCategory', () => {
  const order = ['City car', 'Utilitarie', 'SUV e Crossover compatti'];

  it('returns the groups in categoryOrder, not in car order', () => {
    const groups = groupByCategory(
      [
        car('Seat Arona', 300, 'SUV e Crossover compatti'),
        car('Fiat Panda', 200, 'City car'),
        car('Peugeot 208', 250, 'Utilitarie'),
      ],
      order
    );

    expect(groups.map((group) => group.category)).toEqual(order);
  });

  it('sorts each group by price ascending', () => {
    const groups = groupByCategory(
      [
        car('Fiat 500', 300, 'City car'),
        car('Fiat Topolino', 192.5, 'City car'),
        car('Fiat Panda', 260.5, 'City car'),
      ],
      order
    );

    expect(groups[0]?.list.map((entry) => entry.model)).toEqual([
      'Fiat Topolino',
      'Fiat Panda',
      'Fiat 500',
    ]);
  });

  it('omits categories that have no cars', () => {
    const groups = groupByCategory(
      [car('Fiat Panda', 260.5, 'City car')],
      order
    );

    expect(groups).toHaveLength(1);
    expect(groups[0]?.category).toBe('City car');
  });

  // Worth knowing before you add a car: a category that is not listed in
  // categoryOrder is not rendered anywhere, and nothing warns about it.
  it('silently drops a car whose category is not in categoryOrder', () => {
    const groups = groupByCategory(
      [
        car('Fiat Panda', 260.5, 'City car'),
        car('Ferrari 296', 9000, 'Supercar'),
      ],
      order
    );

    expect(groups.flatMap((group) => group.list.map((c) => c.model))).toEqual([
      'Fiat Panda',
    ]);
  });

  it('does not reorder the array it is given', () => {
    const cars = [
      car('Fiat 500', 300, 'City car'),
      car('Fiat Topolino', 192.5, 'City car'),
    ];

    groupByCategory(cars, order);

    expect(cars.map((entry) => entry.model)).toEqual([
      'Fiat 500',
      'Fiat Topolino',
    ]);
  });
});
