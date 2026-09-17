---
name: sync-offers-catalog
description: Use when a new PROMO.pdf arrives, when a rental price changed, or when a car must be added to or removed from the offers section of the SKV Rent site
---
<!-- autodoc:begin -->
<!-- autodoc: 351fa38 2026-09-18 -->
# Sync the offers catalog with PROMO.pdf

`src/data/offers.json` is a **hand-curated subset** of `PROMO.pdf` — about 22 of the ~124
cars in the PDF, each with a locally sourced image, a credit line and a human-assigned
category. It is not generated. `scripts/sync-offers.sh` automates the one part that is safe
to automate (prices) and reports everything that needs a decision.

Requires `pdftotext` (poppler) and `node` on `PATH`.

## 1. See what moved

```bash
scripts/sync-offers.sh
```

It prints three things: price changes for the cars you feature, featured cars that are no
longer in the PDF, and how many PDF cars you do not feature. It exits `1` when any of that
needs attention and `0` when the catalog is already in sync. It writes nothing.

## 2. Apply the price changes

```bash
scripts/sync-offers.sh --apply
```

Surgical: it rewrites only the changed digits of `"price"`, never `category`, `image` or
`electric`, so the diff is readable and the file's formatting survives. It re-parses the
result before overwriting, so it cannot leave invalid JSON behind.

If it reports `no "da €X,XX al mese" prices found`, the PDF's layout changed. Look at it
with `pdftotext PROMO.pdf - | head -40` and fix the regex in the Node helper embedded in
`scripts/sync-offers.sh`. Do not edit `offers.json` to match a PDF you have not read.

## 3. Add a car (manual — four things, not one)

```bash
scripts/sync-offers.sh --list-candidates   # every PDF car you don't feature, cheapest first
```

Then, for the car you picked, edit `src/data/offers.json`:

1. Append to `cars`:
   ```jsonc
   {
     "model": "Renault Clio",          // must match the PDF model line, and be unique —
                                       // it is the React key
     "make": "Renault",                // must exist in src/data/brandLogos.json
     "price": 285.5,                   // the "da … al mese" figure, euros, VAT excluded
     "category": "Utilitarie",         // must be one of offers.categoryOrder
     "electric": true,                 // only for BEVs; adds the green "Elettrica" badge
     "image": "/assets/images/offers/renault-clio.webp"
   }
   ```
2. Put the WEBP render at that path under `public/assets/images/offers/`. Cards are a fixed
   `h-44` box with `object-contain`, so any aspect ratio works; keep files in the 15–80 KB
   range. A missing file does not fail the build — the card falls back to a grey silhouette.
3. Add the file name to `imageCredits` with its real provenance. Renders lifted from
   `PROMO.pdf` need no attribution; manufacturer press images are free for editorial use;
   **Wikimedia Commons files are CC BY-SA and require photographer attribution**.
4. If the make is new, add it to `src/data/brandLogos.json` and drop its SVG into
   `public/assets/images/logos/`. The brand carousel is derived from the catalog, so the logo
   appears on its own.

Removing a car is the reverse: delete its entry, its image file and its credit line.

## 4. Verify

```bash
pnpm exec vitest run tests/offers-catalog.test.ts
pnpm run build
```

The test checks what the build will not: that the category is one of the eight in
`categoryOrder` (a car in an unlisted category is silently dropped from the page), that the
image exists, that credits and images match one-for-one, and that every make has a logo.

## Notes

- **Category taxonomy** (order fixed by `categoryOrder`): `City car`, `Utilitarie`,
  `Berline e hatchback`, `Station Wagon`, `SUV e Crossover compatti`,
  `SUV e Crossover medio-grandi`, `Monovolume e Van`, `Sportive e Lusso`. Assign by body type
  and size, except luxury and performance brands or trims (Porsche, Maserati, Land Rover,
  Audi S/RS) which go to `Sportive e Lusso`. A pure-electric car stays in its body segment
  and gets `electric: true`.
- Cars sort by price ascending inside their group; you do not control the order by hand.
- Prices render through `formatPrice` in `src/utils/offers.ts` — deliberately not
  `toLocaleString('it-IT')`, which groups differently in Node and the browser and would
  risk a hydration mismatch on the static export.
<!-- autodoc:end -->
