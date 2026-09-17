<!-- autodoc:begin -->
<!-- autodoc: 351fa38 2026-09-18 -->
# SKV Rent — website

Marketing site for **SKV Rent S.r.l.s.**, a family-run car rental and long-term lease company
in Monteforte Irpino (AV), Italy. One Italian-language landing page plus a privacy notice,
built with Next.js and shipped as a **static export** to GitHub Pages at
<https://skvrentsrls.it>.

It exists to do three things: show the fleet and its monthly long-term-lease prices, let a
visitor ask for a quote, and satisfy the company-identification and privacy obligations
Italian law places on a company website. There is no application behind it — no server, no
database, no accounts. Everything a visitor sees is baked into HTML at build time.

## Quickstart

Requires **Node 22** (pinned in `.node-version`) and **pnpm 11** (pinned in `package.json`
under `packageManager`, so `corepack enable` is enough to get the right one).

```bash
pnpm install          # CI uses: pnpm install --frozen-lockfile
pnpm run dev          # http://localhost:3000
```

Everything else:

```bash
pnpm run build        # production build + static export -> out/
pnpm run build-prod   # clean, then build
pnpm run lint         # ESLint 9 (Prettier runs as a lint rule)
pnpm run lint:fix     # the same, with fixes applied
pnpm run format       # prettier --write . (reformats the whole repo)
pnpm run build-types  # tsc --noEmit
pnpm exec vitest run  # the test suite
pnpm run clean        # remove .next and out
```

`pnpm`, never `npm`, `npx` or `yarn` — a second lockfile breaks CI. Use `pnpm exec` in place
of `npx`.

## How it is put together

**Next.js 16 on the Pages Router** (`src/pages`, not the App Router), **React 19**,
**TypeScript** in strict mode, **Tailwind CSS 2.2**. `next.config.js` sets
`output: 'export'` and `trailingSlash: true`, so the build produces static files in `out/`
and every URL ends with a slash. There is no server runtime: no API routes, no
`getServerSideProps`, no Next `<Image>` optimization, no i18n routing.

Two routes: `/` (the landing page, composed in `src/pages/index.tsx`) and `/privacy/` (the
GDPR notice).

```
src/
  components/    one file per section: MainHero, Product, About, Offers,
                 BrandCarousel, Contact, Footer, plus Header, Divider, LazyShow,
                 PageMeta
  config/        index.json — all site copy: hero, navigation, company and legal
                 details, "chi siamo" story
  data/          offers.json (the car catalog), brandLogos.json (make -> logo file)
  pages/         index.tsx, privacy.tsx, _app.tsx, _document.tsx
  utils/         the pure helpers: offers.ts, validation.ts, images.ts, brands.ts,
                 AppConfig.ts
  styles/        main.css — Tailwind plus the handful of rules Tailwind 2 cannot express
  fonts/         self-hosted Sora (variable, latin subset) and its OFL licence
public/          images, favicons, robots.txt, sitemap.xml, site.webmanifest
tests/           the Vitest suite
docs/            TROUBLESHOOTING.md
scripts/         sync-offers.sh — reconcile the catalog with PROMO.pdf
.github/         ci.yml (checks) and nextjs.yml (deploy to Pages)
```

Two conventions matter more than the rest:

- **Copy is data, not code.** Text, prices and lists live in `src/config/index.json` and
  `src/data/*.json`. To change what the site says, edit the JSON.
- **Decisions live in `src/utils`.** Price formatting, the grouping of the car catalog, the
  contact-form validation rules and the image-URL rewrites are pure functions there, imported
  by the components. That is what the test suite exercises.

`CLAUDE.md` is the long-form version: conventions, design tokens, why the odd choices are the
way they are. Read it before changing anything visual.

## Deployment

Every push to `main` runs `.github/workflows/nextjs.yml`, which builds the export and
publishes `out/` to **GitHub Pages**. The custom domain is configured in the repository's
Pages settings, not by a `CNAME` file. There is no other deploy path — Netlify used to serve
the site and no longer does.

`.github/workflows/ci.yml` runs lint, type check, tests and a build on every push and pull
request. It deploys nothing.

## Tests

```bash
pnpm exec vitest run
```

Seven files under `tests/`, all Node-only — nothing renders React and nothing touches the
network. They are characterisation tests: they pin down what the code does today so that a
change which alters it becomes visible.

- `offers-helpers.test.ts`, `offers-catalog.test.ts` — price formatting, category grouping,
  and the agreement between `offers.json`, the image files on disk, the credit list and the
  brand logos.
- `validation.test.ts` — the contact form's email, phone and partita-IVA rules.
- `images.test.ts`, `brands.test.ts` — the responsive-image URL rewrites and the brand
  carousel's source list.
- `site-content.test.ts` — that every nav link points at a section that exists, that the
  legally required company details are still rendered, and that no analytics, hosted font or
  third-party endpoint has crept in.
- `app-config.test.ts` — canonical URLs, and that `sitemap.xml` and `robots.txt` agree with
  them.

## State of the repo

What runs: the site builds, exports and deploys; lint, type check and tests are green; the
Lighthouse scores sit around 100 across the four categories. `scripts/sync-offers.sh` works
and is the intended way to refresh prices from `PROMO.pdf`.

What does not, or only half does:

- `pnpm run build-stats` produces no bundle report — `next.config.js` builds the analyzer
  wrapper and never applies it.
- `src/utils/utils.ts` (`chunkArr`) and `src/data/logos.json` are dead template leftovers.
- Dark mode is styled but never switched on.
- `@types/node` (16) and `@types/react` (17) lag the actual runtimes (Node 22, React 19).
- The CC BY-SA image credits recorded in `offers.json` are not displayed on the page, though
  the licence asks for it.

`docs/TROUBLESHOOTING.md` has the full list with the evidence for each, alongside the
failures this repo has actually produced and what to do about them.

## Licence

ISC, see `LICENSE`. The site content, brand assets and vehicle photography are not covered by
it; see `src/data/offers.json → imageCredits` and `src/data/brandLogos.json` for image
provenance.
<!-- autodoc:end -->
