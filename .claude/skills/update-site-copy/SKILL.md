---
name: update-site-copy
description: Use when changing any text, navigation entry, contact detail or company registration detail on the SKV Rent site — the copy lives in JSON, not in the components
---
<!-- autodoc:begin -->
<!-- autodoc: 351fa38 2026-09-18 -->
# Change the site's copy

All user-facing text lives in `src/config/index.json`. Components read it with
`import config from '../config/index.json'` and render it. **Do not hardcode copy in a
component** — if you find yourself typing Italian inside a `.tsx` file, the string belongs in
the JSON instead.

All copy is Italian (`locale: 'it'`). Keep new copy Italian.

## What lives where

| You want to change | Edit |
|---|---|
| Hero heading, sub-heading, body, the two CTA buttons | `config.mainHero` |
| Header and mobile-menu links | `config.navigation` |
| The two "Scegli i servizi" rows | `config.product.items` |
| The "Chi siamo" section | `config.story` |
| Footer link list | `config.about.sections` |
| Address, phone, email | `config.about.contact` |
| Instagram / WhatsApp / Facebook | `config.about.socialMedia` |
| VAT number, REA, PEC, share capital | `config.about.legal` |
| Company name and legal name | `config.company` |
| Page titles, meta descriptions, canonical origin | `src/utils/AppConfig.ts` |
| Offers heading, subtitle, small print | `src/data/offers.json` (`title`, `subtitle`, `note`) |
| The privacy notice | `src/pages/privacy.tsx` (prose, not JSON) |

## The three rules that are easy to break

**1. A nav entry's `href` must be an id something renders.** `config.navigation` and
`config.about.sections` hold bare ids (`product`, `offers`, `about`, `contact`) that become
`#product` in the header and `/#product` in the footer — absolute in the footer so the links
also work from `/privacy/`. Rename a section id in a component and the link silently scrolls
nowhere. "Chi siamo" in particular must land on `id="about"` in `About.tsx`; never give
`Footer.tsx` an `id="about"` of its own, which would swallow it.

**2. Never delete legal text.** The footer prints the legal name, registered office, VAT
number, REA number and PEC from `config.about.legal`. Italian law requires them — the VAT
number under art. 35 DPR 633/72, the registration details under art. 2250 c.c. Emptying a
string removes the line with no build error. The entity is an **S.r.l.s.**, not an "S.r.l.";
do not "correct" it. `shareCapital` is intentionally empty: the footer hides that line until
someone supplies the figure.

**3. Changing the data flow changes the privacy notice.** `src/pages/privacy.tsx` is the
art. 13 GDPR notice and describes what the code actually does: the form posts to Web3Forms,
which delivers to a Google-hosted mailbox; the site is served by GitHub Pages; nothing else
leaves first-party. Adding a recipient, a tracker, an embedded map or a hosted font means
updating that page — and, under the Garante's 2021 cookie guidelines, adding a consent
banner. Treat it as a product decision, not a technical one.

## After the edit

```bash
pnpm exec vitest run tests/site-content.test.ts   # dangling nav links, legal details, no new trackers
pnpm run lint                                     # Prettier reformats JSON as a lint rule
pnpm run build
```

Then look at the page: `pnpm run dev` and open <http://localhost:3000>.

## Adding a new route while you are here

Four things, all easy to forget:

1. Create `src/pages/<name>.tsx` and render `<PageMeta title=… description=… path="/<name>/" />`
   inside it — page-specific `<title>`, canonical and Open Graph tags go through `PageMeta`,
   never into `_document.tsx`, which would give every route the landing page's canonical URL.
2. `trailingSlash: true`, so the path is `/<name>/` with both slashes.
3. Add the URL to `public/sitemap.xml`.
4. Link it with `next/link`, not `<a href="/…">` — ESLint's `no-html-link-for-pages`
   enforces this. Compare `privacyPage` in `config.about`, which `Footer.tsx` renders with
   `<Link>` while the in-page anchors stay plain `<a>`.
<!-- autodoc:end -->
