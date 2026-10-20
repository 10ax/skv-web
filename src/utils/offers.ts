// The rules behind the Offers catalog, split out of the component so they can
// be exercised without rendering it. src/data/offers.json holds the data;
// src/components/Offers.tsx holds the markup; everything that decides what a
// visitor sees — the order of the groups, the order within a group, and how a
// monthly price is written — lives here.

export type Car = {
  model: string;
  make: string;
  price: number;
  category: string;
  electric?: boolean;
  image: string;
};

export type CarGroup = {
  category: string;
  list: Car[];
};

/**
 * Deterministic Italian currency formatting (e.g. 1455 -> `€1.455,00`).
 *
 * Deliberately not Number.prototype.toLocaleString('it-IT'): the static export
 * is rendered by Node and then hydrated by the browser, and the two group
 * Italian thousands differently (Node emitted `1455,00` with no separator),
 * which looks wrong and risks a React hydration mismatch.
 */
export const formatPrice = (value: number) => {
  const [integer, decimals] = value.toFixed(2).split('.');
  const digits = integer ?? '';
  let grouped = '';
  for (let end = digits.length; end > 0; end -= 3) {
    const chunk = digits.slice(Math.max(0, end - 3), end);
    grouped = grouped === '' ? chunk : `${chunk}.${grouped}`;
  }
  return `€${grouped},${decimals}`;
};

/**
 * Bucket the catalog into the accordion the page renders: groups in
 * `categoryOrder`, cars cheapest first inside each group, empty groups dropped.
 *
 * `categoryOrder` is the whole taxonomy — a car whose `category` is not in it
 * has nowhere to go and is left out of the result entirely.
 */
export const groupByCategory = (
  cars: readonly Car[],
  categoryOrder: readonly string[]
): CarGroup[] => {
  const groups = new Map<string, Car[]>();
  categoryOrder.forEach((category) => groups.set(category, []));

  cars.forEach((car) => {
    const bucket = groups.get(car.category);
    if (bucket) bucket.push(car);
  });

  return categoryOrder
    .map((category) => ({
      category,
      list: (groups.get(category) ?? [])
        .slice()
        .sort((a, b) => a.price - b.price),
    }))
    .filter((group) => group.list.length > 0);
};
