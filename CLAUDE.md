# CLAUDE.md — SKV Rent website

Instructions and conventions for working on this repo. Follow these so changes stay
consistent with decisions already made. Keep this file up to date when a convention changes.

## What this is

Marketing / landing site for **SKV Rent** — a car-rental & long-term-lease company in
Monteforte Irpino (AV), Italy. Single-page site (Italian language) built as a **static export**
and deployed on **Netlify**.

- **Next.js 16** using the **Pages Router** (`src/pages`), not the App Router.
- **React 19**, **TypeScript**, **Tailwind CSS**.
- Output is a fully static site (`output: 'export'` → `out/`). There is **no server runtime**:
  no API routes, no `getServerSideProps`, no Next `<Image>` optimization, no i18n routing.

## Commands

```bash
npm run dev          # local dev server (http://localhost:3000)
npm run build        # production build + static export → out/
npm run build-prod   # clean + build (static export happens in `build` via output:'export')
npm run build-types  # tsc --noEmit type check
npm run lint         # ⚠️ broken on Next 16 (`next lint` was removed) — see Known issues
```

### Critical CSS is inlined at build (render-blocking fix)
`next.config.js` sets `experimental.optimizeCss: true`, which inlines critical CSS into
`<head>` and loads the full stylesheet asynchronously (`media="print" onload=...` + a
`<noscript>` fallback), removing the render-blocking stylesheet request. The **Pages-Router**
path needs the **`critters`** devDependency at build time (`beasties` is App-Router-only, so it
does *not* work here). With Turbopack the stylesheet now emits under `/_next/static/chunks/*.css`
(still covered by netlify.toml's `/_next/static/*`). Note `critters` is deprecated upstream but
runs build-time only (never shipped to the browser).

Netlify config: `netlify.toml` (`publish = "out"`, immutable cache headers for `/assets/*`
and `/_next/static/*`).

## Architecture & conventions

### Content is data-driven — do not hardcode copy in components
- **Site copy** lives in `src/config/index.json` (hero, navigation, product, about, SEO-ish text).
  Components read it via `import config from '../config/index.json'`.
- **Data collections** live in `src/data/*.json` (e.g. `logos.json`, `offers.json`).
- To change text, prices, or lists, **edit the JSON** — not the component.

### Components (`src/components`)
- Functional components, arrow style, `export default`.
- Styling is Tailwind via template-literal classNames: `className={`...`}` (kept consistent across
  the codebase — match it).
- Page is composed in `src/pages/index.tsx`. Heavy/below-the-fold sections are `dynamic()`-imported
  and wrapped in `<LazyShow>` (IntersectionObserver fade-in). `<Canvas>` draws the decorative wave
  separators between sections.
- Standard section shell:
  ```tsx
  <section className={`bg-background py-8`} id="section-id">
    <h1 className={`w-full my-2 text-5xl font-bold leading-tight text-center text-primary`}>Title</h1>
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
- `src/pages/_document.tsx` holds meta/OG/Twitter tags, favicons, `site.webmanifest`, and JSON-LD
  **AutoRental** structured data (address, hours). Update address/contact there.
- `next-seo` was intentionally removed (see git history) in favor of hand-written tags — do not re-add it.
- A custom `_document` is required because Next i18n routing isn't compatible with `next export`.

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
    "cars": [ { "model": "Fiat Topolino", "price": 192.5, "category": "City car", "electric": true }, ... ]
  }
  ```
  `price` is the "da … al mese" monthly figure in euros. `electric` is optional (BEV only → shows badge).
- **Component:** `src/components/Offers.tsx` groups cars by `category` (in `categoryOrder`), sorts each
  group by price ascending, and renders one collapsible `<details>` accordion per category (first open),
  a responsive card grid (each card = **vehicle image + model + "da … al mese"**), and a
  "Richiedi un preventivo" CTA → `#contact`.
- **To update prices / add or remove cars:** edit `offers.json` only.

### Vehicle images (imagin.studio)
- Each card shows a car render fetched at load time from **imagin.studio**:
  `https://cdn.imagin.studio/getimage?customer=<key>&make=<make>&modelFamily=<family>&angle=23&zoomType=fullscreen`.
- `make`/`modelFamily` are **derived from `car.model`** in `Offers.tsx` (`parseModel`): first token is the
  make (two tokens for "Alfa Romeo"/"Land Rover"; "Mercedes" → `mercedes-benz`), the rest becomes the
  family (lowercased, accent-stripped, hyphenated, trailing model-years dropped — but kept when the year
  *is* the name, e.g. "Peugeot 2008"). Override per car with `imageMake` / `imageModel` fields in
  `offers.json` when a render is wrong.
- The **customer key** and camera `angle` live in `offers.json → imageProvider`. The committed key is the
  shared **`hrjavascript-mastery` demo key**, which returns **grayscale, watermarked** previews. **Before
  production, replace it with SKV Rent's own imagin.studio key** to get full-colour, unwatermarked images.
- imagin serves real images only when the request carries a browser `Referer`/`Origin` (it does so
  automatically in the browser; server-side `curl` without one gets a fixed fallback image). Unmatched
  models get imagin's own "no image" graphic; genuine load failures fall back to an inline SVG placeholder.
- External image host — no local car assets are stored. (Consistent with `logos.json`, which already uses
  an external logo CDN.)
- **Category taxonomy** (8 segments) and how models were assigned:
  `City car`, `Utilitarie`, `Berline e hatchback`, `Station Wagon`, `SUV e Crossover compatti`,
  `SUV e Crossover medio-grandi`, `Monovolume e Van`, `Sportive e Lusso`. Assignment rule: by body
  type / size, **except** luxury/performance brands & trims (Porsche, Maserati, Land Rover, Audi S/RS)
  → `Sportive e Lusso`. Pure-electric cars stay in their body segment and get `electric: true`.
  To re-bucket a car, change its `category` in the JSON.

## Performance & accessibility conventions (keep the Lighthouse scores)

The site scores ~100 across Performance / A11y / Best-Practices / SEO. To keep it there:
- **Heading hierarchy must stay sequential** (Lighthouse `heading-order`): exactly **one `<h1>`**
  (the hero in `MainHero.tsx`); section titles are **`<h2>`** (Product, Offers, Contact); sub-headings
  `<h3>` (Offers category); card titles `<h4>` (Offers model). Never skip a level.
- **LCP image**: the hero is preloaded in `_document.tsx` with `fetchPriority="high"` and rendered
  `loading="eager"`. Keep both in sync if the hero image changes.
- **Static export + time/locale-dependent values cause React #418 hydration errors.** The build bakes a
  value into the HTML that the client then recomputes to something different. The copyright year in
  `About.tsx` uses `suppressHydrationWarning` for exactly this reason. Apply the same guard (or render
  such values only in `useEffect`) for anything derived from `Date`/`Math.random`/locale at render time.
  (This is also why offer prices use a deterministic manual formatter — see above.)
- New third-party origins get a `preconnect`/`dns-prefetch` in `_document.tsx` (e.g. `cdn.imagin.studio`).

## Known issues / cleanup backlog (not yet done)

- **`npm run lint` is broken on Next 16** — `next lint` was removed, so the command now
  misfires (treats "lint" as a build dir). Migrate to the ESLint CLI, which needs eslint 8/9 +
  `eslint-config-next@16` (the repo is still pinned to eslint 7 / `eslint-config-next@12`).
  Doesn't affect the build/export/deploy or `npm run build-types`.
- **Dead nav link:** `config.navigation` still has "Servizi" → `#features`, but there is **no Features
  component** and nothing renders a `#features` section; `config.features` is unused English placeholder
  (Lorem Ipsum). Either build the section with real Italian copy or remove the nav entry before launch.
  (The "Tariffe" → `#pricing` entry, `Pricing.tsx`, and `config.pricing` were removed.)
- `config.about.sections` are placeholder ("Something" + Lorem Ipsum); `about.socialMedia` github/twitter/
  linkedin all point to the Instagram URL.
- `tailwind.config.js` uses the legacy Tailwind 2 style (`purge`, `mode: 'jit'`, `darkMode: true`) while
  `About.tsx` uses `dark:` variants — dark mode is not really wired up. Revisit if dark mode is wanted.
```
