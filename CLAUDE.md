# CLAUDE.md — SKV Rent website

Instructions and conventions for working on this repo. Follow these so changes stay
consistent with decisions already made. Keep this file up to date when a convention changes.

## What this is

Marketing / landing site for **SKV Rent** — a car-rental & long-term-lease company in
Monteforte Irpino (AV), Italy. One-page marketing site plus a privacy policy page (Italian
language), built as a **static export**
and deployed on **GitHub Pages** (custom domain `skvrentsrls.it`, see "Hosting" below).

- **Next.js 16** using the **Pages Router** (`src/pages`), not the App Router.
- **React 19**, **TypeScript**, **Tailwind CSS**.
- Output is a fully static site (`output: 'export'` → `out/`). There is **no server runtime**:
  no API routes, no `getServerSideProps`, no Next `<Image>` optimization, no i18n routing.

## Commands

The package manager is **pnpm** (details below) — use `pnpm`, never `npm`, `npx` or `yarn`.

```bash
pnpm install         # install deps (CI runs `pnpm install --frozen-lockfile`)
pnpm run dev         # local dev server (http://localhost:3000)
pnpm run build       # production build + static export → out/
pnpm run build-prod  # clean + build (static export happens in `build` via output:'export')
pnpm run build-types # tsc --noEmit type check
pnpm run lint        # ESLint 9 (flat config in eslint.config.mjs)
pnpm run lint:fix    # eslint . --fix
pnpm run format      # prettier --write .
```

### Package manager — pnpm 11 (migrated from npm on 2026-09-06)
- The version is pinned by `package.json → "packageManager": "pnpm@11.24.0"` (corepack). The lockfile is
  `pnpm-lock.yaml`, imported 1:1 from the old `package-lock.json` (same resolved versions); the old
  `yarn.lock` was a stale leftover and is gone. Node is pinned to **22** by `.node-version` (read by
  nvm, mise and the GitHub workflow) — pnpm 11 needs Node ≥ 22.13, Next 16 needs ≥ 20.9.
- **Project settings live in `pnpm-workspace.yaml`** — pnpm 11 ignores a `"pnpm"` field in package.json
  and non-auth keys in `.npmrc`. Right now it only holds `allowBuilds`: pnpm 11 refuses to install
  (`ERR_PNPM_IGNORED_BUILDS`; and since every `pnpm run` re-verifies deps, all scripts fail too) until
  each dependency that ships install scripts is explicitly set to `true`/`false`. `sharp` and
  `unrs-resolver` are denied on purpose (the file's comments say why). If a new dependency triggers the
  error, add it there deliberately instead of running `pnpm approve-builds`.
- **`npm-run-all` was removed**: its `run-s` spawns `$npm_execpath` directly and dies with `EACCES`
  under corepack's `pnpm.cjs`. `build-prod` is now `pnpm run clean && pnpm run build`. Don't re-add it
  (`npm-run-all2` is the pnpm-compatible fork if a runner is ever needed).
- The GitHub Pages workflow (the only deploy path) uses `pnpm/action-setup@v4` (version from
  `packageManager`) + `pnpm install --frozen-lockfile`. Husky's pre-commit runs `pnpm exec lint-staged`,
  which calls `pnpm run build-types`.

### Linting — ESLint 9 flat config (`eslint.config.mjs`)
`next lint` was removed in Next 16, so linting runs ESLint directly against
`eslint.config.mjs`. It composes `eslint-config-next` (core-web-vitals + typescript),
`import/order`, `eslint-plugin-unused-imports`, and Prettier (`eslint-plugin-prettier`,
`singleQuote` + `trailingComma:'es5'` to preserve the repo's existing formatting). **airbnb was
dropped** in the migration (no first-class flat-config support; its rules are largely Prettier's
job). `next-env.d.ts` and the CJS root config files (`*.config.js`) have targeted overrides.

### Critical CSS is inlined at build (render-blocking fix)
`next.config.js` sets `experimental.optimizeCss: true`, which inlines critical CSS into
`<head>` and loads the full stylesheet asynchronously (`media="print" onload=...` + a
`<noscript>` fallback), removing the render-blocking stylesheet request. The **Pages-Router**
path needs the **`critters`** devDependency at build time (`beasties` is App-Router-only, so it
does *not* work here). With Turbopack the stylesheet now emits under `/_next/static/chunks/*.css`. Note `critters` is deprecated upstream but
runs build-time only (never shipped to the browser).

### Hosting — GitHub Pages (not Netlify)
Production `https://skvrentsrls.it` is served by **GitHub Pages**: DNS points at GitHub's Pages IPs and
responses carry `server: GitHub.com`. Every push to `main` deploys through
`.github/workflows/nextjs.yml` (build → upload `out/` → `actions/deploy-pages`). The custom domain lives
in the repo's Pages settings (`build_type: workflow`, `cname: skvrentsrls.it`), so no `CNAME` file is
needed in `public/`. `https_enforced` is still **off** in those settings — worth enabling. Pages sets its
own `cache-control` (no custom headers), which is fine because `/_next/static` filenames are
content-hashed. `netlify.toml` was removed on 2026-09-06: Netlify no longer serves the site.

## Architecture & conventions

### Content is data-driven — do not hardcode copy in components
- **Site copy** lives in `src/config/index.json` (hero, navigation, product, about, story, SEO-ish text).
  Components read it via `import config from '../config/index.json'`.
- **Data collections** live in `src/data/*.json` (e.g. `logos.json`, `offers.json`).
- To change text, prices, or lists, **edit the JSON** — not the component.

### Components (`src/components`)
- Functional components, arrow style, `export default`.
- Styling is Tailwind via template-literal classNames: `className={`...`}` (kept consistent across
  the codebase — match it).
- The landing page is composed in `src/pages/index.tsx`; `src/pages/privacy.tsx` is the second (and only
  other) route. Heavy/below-the-fold sections are `dynamic()`-imported
  and wrapped in `<LazyShow>` (IntersectionObserver fade-in + slide). Sections sit on one white canvas in
  a `gap-y-16` grid; the old `<Canvas>` wave separators no longer exist.
- **`About.tsx` vs `Footer.tsx`:** `About.tsx` is the real "Chi siamo" content section (`id="about"`,
  copy from `config.story`), rendered right after `Product`. `Footer.tsx` is the page footer (logo,
  in-page nav mirror, address/phone/email, social links, copyright) — it has **no** `id="about"` of its
  own; don't reintroduce one, since the nav's "Chi siamo" link must land on the real content section,
  not the footer.
- Nav entries in `config.navigation` must point at a rendered `id`. "Servizi" → `#features` and the unused
  `config.features` placeholder were removed on 2026-09-06 (as were "Tariffe"/`Pricing.tsx` earlier).
- Standard section shell:
  ```tsx
  <section className={`bg-background py-8`} id="section-id">
    <h2 className={`w-full my-2 font-display text-4xl font-bold leading-tight tracking-tight text-center text-border`}>Title</h2>
    <Divider />
    ...
  </section>
  ```

### Tailwind is v2 (2.2.x) — not v3/v4
This repo runs **Tailwind CSS 2.2** (`mode: 'jit'`, legacy `purge`). **Tailwind-3+ utilities do not
exist here and silently emit no CSS** (JIT can't warn) — a class that "does nothing" collapses layout.
Avoid: `aspect-*` (no `aspect-ratio` utility — use a fixed height like `h-44` or a padding-top box),
`shrink-*`/`grow-*` (use `flex-shrink-0`/`flex-grow-0`), the `open`/`group-open` variants, and
arbitrary variants/values like `[&::-webkit-details-marker]:hidden` or `aspect-[16/10]`. When you need
one of those behaviours, write a small scoped rule in `src/styles/main.css` instead (see the `#offers`
accordion rules). Verify new classes actually render by grepping the built `out/_next/static/css/*.css`.

### Design tokens (`tailwind.config.js`) — use tokens, not raw hex
- `primary` `#003cff` (blue, brand accent / CTAs), `secondary` `#0018a4` (hover), `tertiary` `#99a0a3`,
  `border` `#1a2e35` (near-black text), `background` `#ffffff`.
- Prefer `text-primary`, `bg-background`, `text-border`, etc. over literal colors.
- **Type:** headings (h1–h3) use `font-display` → **Sora** (variable weight, latin subset, OFL), self-hosted
  through `next/font/local` in `_app.tsx` and exposed as `--font-display`; body copy stays on the system sans
  stack (no extra font request). Section titles are `text-4xl` (36px) in `text-border`. The brand blue is
  reserved for the hero accent phrase, CTAs, prices and the short solid `Divider` bar, not for every heading.
  Font file + licence live in `src/fonts/`; swap the face by replacing the woff2 and the `src` in `_app.tsx`.
- Note: the PROMO.pdf uses green for prices; on-site we use the **blue `primary`** for price emphasis
  to match the brand. EV models get a small green "Elettrica" badge.

### Images — WEBP-first, responsive, hand-rolled (no Next Image)
Because there's no image optimizer in a static export, images use `<picture>` with a WEBP `<source>`
and responsive `srcSet`. Assets live in `public/assets/images/` with `-<width>w` filename suffixes
(e.g. `foo-640w.webp`, `foo-961w.webp`). Helper patterns already in the code:
- `toWebp(src)` — swap extension to `.webp`.
- `withKnownWidth(src, w)` / `withWidthVariant(src, w, ext)` — swap the `-<n>w` width suffix.
Always set `loading="lazy"` + `decoding="async"` (hero image is the exception — it's `preload`ed in
`_document.tsx` with `fetchPriority="high"`).

### Language
All user-facing copy is **Italian** (`locale: 'it'`). Keep new copy in Italian.

### SEO
- Central metadata: `src/utils/AppConfig.ts` (title, description, url `https://skvrentsrls.it`, ogImage).
- **Head tags are split by scope.** Anything that names *one* page — `<title>`, description, canonical,
  `og:url`/`og:title`/`og:description`, the Twitter title/description and the hero `preload` — goes through
  the `<PageMeta>` component (`src/components/PageMeta.tsx`) inside that page. Only page-independent tags
  (favicons, manifest, `og:image`, `twitter:card`, author, keywords, JSON-LD) stay in `_document`. Putting a
  page-specific tag back in `_document` gives every route the landing page's canonical URL, which tells
  search engines the other pages are duplicates.
- `src/pages/_document.tsx` holds the shared meta/OG/Twitter tags, favicons, `site.webmanifest`, and JSON-LD
  **AutoRental** structured data (address, hours). Update address/contact there.
- `next-seo` was intentionally removed (see git history) in favor of hand-written tags — do not re-add it.
- A custom `_document` is required because Next i18n routing isn't compatible with `next export`.
- Add every new route to `public/sitemap.xml`. `trailingSlash: true`, so URLs end with `/` (`/privacy/`).
- Internal navigation uses `next/link`, not `<a href="/...">` (ESLint `no-html-link-for-pages` enforces it).
  In-page anchors in the shared `Footer` are absolute (`/#offers`) so they also work from `/privacy/`.

### Number/price formatting — deterministic, not `Intl`
Do **not** use `toLocaleString('it-IT')` for prices rendered on the page. Node (SSR) and the browser
group thousands differently for `it-IT` (Node produced `1455,00`, no separator), which both looks
wrong and risks a React hydration mismatch. Use a manual formatter that always groups with `.` and
uses `,` for decimals (see `formatPrice` in `Offers.tsx`) → `€1.455,00`, `€287,67`.

## Offers section (car catalog)

- **Data:** `src/data/offers.json`, transcribed from `PROMO.pdf` (repo root). Shape:
  ```jsonc
  {
    "title": "...", "subtitle": "...", "note": "...",
    "categoryOrder": ["City car", ...],           // controls display order of groups
    "cars": [ { "model": "Fiat Topolino", "make": "Fiat", "price": 192.5, "category": "City car",
               "electric": true, "image": "/assets/images/offers/fiat-topolino.webp" }, ... ],
    "imageCredits": { "_comment": "...", "fiat-topolino.webp": "SKV Rent promotional PDF (PROMO.pdf)", ... }
  }
  ```
  `price` is the "da … al mese" monthly figure in euros. `electric` is optional (BEV only → shows badge).
  `image` is the local render shown on the card; `imageCredits` records where each file came from (see below).
- **Component:** `src/components/Offers.tsx` groups cars by `category` (in `categoryOrder`), sorts each
  group by price ascending, and renders one collapsible `<details>` accordion per category (all collapsed by default),
  a responsive card grid (each card = **vehicle image + model + "da … al mese"**), and a
  "Richiedi un preventivo" CTA → `#contact`.
- **To update prices / add or remove cars:** edit `offers.json` only.
- **Syncing with `PROMO.pdf`:** `offers.json` is a **hand-curated subset** (~22 of the ~124 cars in
  the PDF), each with a locally-sourced image + credit and a human-assigned category — so it is *not*
  auto-generated. When a new `PROMO.pdf` lands, run **`scripts/sync-offers.sh`**: it reports price
  changes for the cars you feature, cars that disappeared from the PDF, and new PDF cars (candidates);
  `--apply` writes the price updates (surgical, prices only — never touches category/image/electric);
  `--list-candidates` prints the full unfeatured list. Adding a new car is still manual (image + credit
  + category). Requires `pdftotext` (poppler).

### Vehicle images (local WEBP renders)
- Each card shows `car.image`, a local render in `public/assets/images/offers/<slug>.webp` (one file per
  featured car, ~15–80 KB), inside a fixed `h-44` box with `object-contain` (Tailwind 2 has no `aspect-*`).
  A failed load falls back to the inline SVG car silhouette (`PLACEHOLDER_IMAGE` in `Offers.tsx`).
- **Provenance lives in `offers.json → imageCredits`**, keyed by file name. Renders taken from `PROMO.pdf` need
  no attribution and manufacturer press images are free for editorial use, but the **Wikimedia Commons files
  are CC BY-SA and require visible photographer attribution while the page is public**. Add an entry for
  every new file and keep the credits honest.
- `make` is stored per car in the JSON, it is no longer derived from `model`. The earlier imagin.studio
  integration (remote renders, demo customer key, `cdn.imagin.studio` preconnect) is gone; if a remote image
  host ever comes back, restore a `preconnect` for it in `_document.tsx`.

- **Category taxonomy** (8 segments) and how models were assigned:
  `City car`, `Utilitarie`, `Berline e hatchback`, `Station Wagon`, `SUV e Crossover compatti`,
  `SUV e Crossover medio-grandi`, `Monovolume e Van`, `Sportive e Lusso`. Assignment rule: by body
  type / size, **except** luxury/performance brands & trims (Porsche, Maserati, Land Rover, Audi S/RS)
  → `Sportive e Lusso`. Pure-electric cars stay in their body segment and get `electric: true`.
  To re-bucket a car, change its `category` in the JSON.

## Legal & privacy

The site is operated by an Italian company, which constrains what the pages must show.

- **Company identification.** The footer prints legal name, registered office, `P. IVA e C.F.`, REA and PEC
  from `config.about.legal` + `config.company.legalName`. Italian law requires the VAT number on the site
  (art. 35 DPR 633/72) and the registration details (art. 2250 c.c.). The entity is an **S.r.l.s.**, not an
  "s.r.l." — don't reintroduce the wrong form. `about.legal.shareCapital` is still **empty**: art. 2250 also
  wants the paid-up share capital, and the footer omits that line until someone fills the figure in.
- **Privacy policy.** `src/pages/privacy.tsx` is the art. 13 GDPR notice, linked from the footer nav and from
  a required consent checkbox next to the contact form's submit button. It describes what the code actually
  does, so **if the data flow changes the page must change with it**: today the form posts to Web3Forms,
  which delivers to a Google-hosted mailbox, the site is served by GitHub Pages, and nothing else leaves
  first-party. The stated retention (24 months) and the sub-processor list are the two things to re-check.
- **No cookies, and that is load-bearing.** The site sets no cookies, uses no analytics, self-hosts its font
  and embeds no third-party iframes, which is why it needs no consent banner and why the Google Analytics /
  Ads code was deleted rather than left dormant. **Adding any tracker, embedded map, or hosted font brings
  back prior consent under the Garante's 2021 cookie guidelines** — and a banner, and an update to the
  privacy page. Treat that as a product decision, not a technical one.

## Performance & accessibility conventions (keep the Lighthouse scores)

The site scores ~100 across Performance / A11y / Best-Practices / SEO. To keep it there:
- **Heading hierarchy must stay sequential** (Lighthouse `heading-order`): exactly **one `<h1>`**
  (the hero in `MainHero.tsx`); section titles are **`<h2>`** (Product, Offers, Contact); sub-headings
  `<h3>` (Offers category); card titles `<h4>` (Offers model). Never skip a level.
- **LCP image**: the hero is preloaded in `_document.tsx` with `fetchPriority="high"` and rendered
  `loading="eager"`. Keep both in sync if the hero image changes.
- **Static export + time/locale-dependent values cause React #418 hydration errors.** The build bakes a
  value into the HTML that the client then recomputes to something different. The copyright year in
  `Footer.tsx` uses `suppressHydrationWarning` for exactly this reason. Apply the same guard (or render
  such values only in `useEffect`) for anything derived from `Date`/`Math.random`/locale at render time.
  (This is also why offer prices use a deterministic manual formatter — see above.)
- Any new third-party origin needs a `preconnect`/`dns-prefetch` in `_document.tsx`. Today there are none:
  images, scripts and styles are all first-party.

## Agent tooling (Claude Code)

- Project skills live in `.claude/skills/` and are installed with the `skills` CLI
  (`pnpm dlx skills add <owner/repo> --skill <name> -a claude-code -y`); `skills-lock.json` records source
  and hash, so update/remove them through the CLI rather than by hand. Installed on 2026-09-06:
  `landing-page-conversion-audit` (github/awesome-copilot) for CRO reviews of the landing page, and
  `performance-optimization` (addyosmani/agent-skills) for Lighthouse / Core Web Vitals work.
- Site-wide Lighthouse: **unlighthouse** is installed globally (`pnpm add -g unlighthouse`), deliberately not
  as a devDependency (it would drag puppeteer into every CI install). Interactive report:
  `unlighthouse --site https://skvrentsrls.it`; pass/fail gate: `unlighthouse-ci --site https://skvrentsrls.it --budget 90`.
- `observability/affordance-invocations.json` is a log written by the ai-literacy-superpowers plugin hooks;
  it is not part of the site and is not committed.

## Known issues / cleanup backlog (not yet done)

- **Image attribution:** `offers.json → imageCredits` marks several offer renders as Wikimedia Commons
  CC BY-SA, which requires visible photographer attribution while the page is public. Nothing on the page
  shows those credits yet.
- `tailwind.config.js` uses the legacy Tailwind 2 style (`purge`, `mode: 'jit'`, `darkMode: true`) while
  `Footer.tsx` uses `dark:` variants — dark mode is not really wired up. Revisit if dark mode is wanted.
```
