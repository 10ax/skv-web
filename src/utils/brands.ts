// Which brand logos the marquee shows, split out of
// src/components/BrandCarousel.tsx so the two rules can be tested.
//
// There is no separate list of brands: the carousel is derived from the cars in
// src/data/offers.json, so adding a car adds its logo and removing the last car
// of a make removes it. src/data/brandLogos.json maps a make to its asset.

/** Anything with a `make` — the carousel only ever reads that one field. */
type HasMake = { make: string };

/**
 * The makes to show: each one once, in the order it first appears in the
 * catalog, and only if a logo is mapped for it. An unmapped make is skipped
 * rather than rendered as a broken image.
 */
export const makesWithLogos = (
  cars: readonly HasMake[],
  logos: Record<string, string>
): string[] =>
  Array.from(new Set(cars.map((car) => car.make))).filter(
    (make) => logos[make]
  );

/**
 * Split the makes into the two shorter rows the mobile layout scrolls in
 * opposite directions, alternating between them so each row is a mix of brands
 * rather than the first and second half of the list.
 */
export const alternatingRows = (makes: readonly string[]) => ({
  rowA: makes.filter((_, index) => index % 2 === 0),
  rowB: makes.filter((_, index) => index % 2 === 1),
});
