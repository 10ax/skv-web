<!-- autodoc:begin -->
<!-- autodoc: 351fa38 2026-09-18 -->
# Troubleshooting — SKV Rent website

The operating guide for this repo: the failures it has actually produced, what confirms
each one, and what to do about it. Every command below exists in this checkout.

Quick orientation: this is a Next 16 Pages-Router site built as a **static export**
(`output: 'export'` → `out/`) and deployed to GitHub Pages. There is no server, no
database and no runtime configuration — if something is wrong in production, it is wrong
in the build.

---

## Toolchain and install

### `ERR_PNPM_IGNORED_BUILDS` — every pnpm command fails, including `pnpm run lint`

**Check:** `pnpm install --frozen-lockfile` and read the list of packages it names.
**Cause:** pnpm 11 refuses to run a dependency's install script until a human has decided
about it. The decision lives in `pnpm-workspace.yaml` under `allowBuilds` — pnpm 11 ignores
a `"pnpm"` field in `package.json` and non-auth keys in `.npmrc`, so that file is the only
place it looks. Because every `pnpm run …` re-verifies the dependency tree first, one
unapproved package takes the whole script set down with it, not just installs.
**Fix:** add the named package to `allowBuilds` in `pnpm-workspace.yaml` with `true` or
`false` and say in a comment why. `sharp` and `unrs-resolver` are already there as `false`
on purpose. Do not run `pnpm approve-builds` — it writes the decision without the reasoning.

### A `package-lock.json`, `yarn.lock` or `node_modules/.package-lock.json` appears

**Check:** `git status --porcelain` and `ls package-lock.json yarn.lock 2>/dev/null`.
**Cause:** somebody ran `npm install`, `npx …` or `yarn`. The package manager here is pnpm
and only pnpm: `package.json → "packageManager": "pnpm@11.24.0"` pins it through corepack,
and `pnpm-lock.yaml` is the only lockfile CI knows about.
**Fix:** delete the stray lockfile, delete `node_modules`, and run `pnpm install` again.
Then use `pnpm` for everything — `pnpm exec <tool>` where you would have typed `npx <tool>`,
and `pnpm dlx <pkg>` where you would have typed `npx <pkg>` for a package that is not a
dependency.

### `ERR_PNPM_OUTDATED_LOCKFILE` — frozen install fails after you added a dependency

**Check:** `pnpm install --frozen-lockfile`; it reports that `package.json` and
`pnpm-lock.yaml` disagree.
**Cause:** `--frozen-lockfile` is the CI install mode. It refuses to update the lockfile, so
editing `package.json` — by hand or with `pnpm add` — without refreshing the lockfile breaks
every later run.
**Fix:** run a normal `pnpm install` locally and commit the resulting `pnpm-lock.yaml`
alongside the `package.json` change. Always in the same commit: a `package.json` change
without its lockfile is a red CI run for whoever pushes next.

### Node or pnpm is the wrong version

**Check:** `node --version` against `cat .node-version`, and `pnpm --version` against the
`packageManager` field in `package.json`.
**Cause:** Node is pinned to 22 by `.node-version` (read by nvm, mise and the GitHub
workflows) because pnpm 11 needs Node ≥ 22.13 and Next 16 needs ≥ 20.9.
**Fix:** switch with your version manager (`nvm use`, `mise install`) and let corepack supply
pnpm. In a workflow, never hardcode the numbers: use `actions/setup-node` with
`node-version-file: .node-version`, and `pnpm/action-setup` with no `version` input so it
reads `packageManager`. Both `.github/workflows/ci.yml` and `.github/workflows/nextjs.yml`
already do this.

### `EACCES` from a script that spawns another pnpm script

**Check:** look for `run-s`, `run-p` or `npm-run-all` in the failing script in
`package.json`.
**Cause:** `npm-run-all` spawns `$npm_execpath` directly, which under corepack is
`pnpm.cjs` — not an executable — so it dies with `EACCES`. It was removed for this reason;
`build-prod` is now plainly `pnpm run clean && pnpm run build`.
**Fix:** chain the scripts with `&&`. If a real runner is ever needed, `npm-run-all2` is the
pnpm-compatible fork.

### An unattended or scripted run trips over a git hook

**Check:** `cat .husky/pre-commit` and `git config core.hooksPath`.
**Cause:** `prepare` runs `husky install`, and the pre-commit hook runs
`pnpm exec lint-staged --concurrent false`, which lints, formats and runs
`pnpm run build-types`. That is what you want as a human and exactly what you do not want in
an agent or CI run.
**Fix:** install with `pnpm install --frozen-lockfile --ignore-scripts`, which skips
`prepare`. Never run `husky install` and never set `core.hooksPath` in a throwaway checkout.
For a one-off commit that must skip the hook, `git commit --no-verify`.

---

## Build and page problems

### `/privacy/` paints unstyled and then jumps — layout shift, bad CLS

**Check:** `grep optimizeCss next.config.js` — it must read `experimental: { optimizeCss: false }`.
**Cause:** with `optimizeCss: true`, critters inlines the above-the-fold CSS and loads the
rest asynchronously. That held while the site was one image-led landing page; the text-only
privacy page needs layout rules critters does not consider above the fold, so it renders
unstyled and reflows. Measured under Lighthouse throttling, the privacy page went to CLS
0.431 in two runs out of three.
**Fix:** leave it `false`. This is deliberate, not an oversight — `critters` stays in
`devDependencies` only so the experiment is cheap to repeat. If you do flip it back,
re-measure `/privacy/`, not just `/`. Note that `beasties`, critters' successor, is
App-Router-only and does not work in this repo.

### A Tailwind class you added does nothing at all

**Check:** build, then search the emitted stylesheet:
`pnpm run build && grep -o 'aspect-\[[^]]*\]' out/_next/static/chunks/*.css`, substituting
the class you are looking for.
**Cause:** this repo is on **Tailwind 2.2** with `mode: 'jit'` and the legacy `purge` key.
Utilities introduced in Tailwind 3 or later simply do not exist, and JIT cannot warn about a
class it does not recognise — it emits nothing and the layout collapses silently. The usual
casualties: `aspect-*`, `shrink-*`/`grow-*` (use `flex-shrink-0`/`flex-grow-0`), the
`open`/`group-open` variants, and arbitrary variants or values such as
`[&::-webkit-details-marker]:hidden` or `aspect-[16/10]`.
**Fix:** use the Tailwind 2 equivalent, or write a small scoped rule in
`src/styles/main.css`. The offers accordion, the brand marquee and the form checkbox accent
are all there for this reason.

### React error #418 in the browser console — hydration mismatch

**Check:** open the exported HTML (`pnpm run build`, then read `out/index.html`) and compare
the value in it with what the page shows once JavaScript has run.
**Cause:** the build bakes a value into the HTML and the client recomputes a different one.
Anything derived from `Date`, `Math.random` or the locale at render time does this on a
static export. The copyright year in `src/components/Footer.tsx` is the known case.
**Fix:** guard the element with `suppressHydrationWarning` (as `Footer.tsx` does), or compute
the value in `useEffect` so the server and the first client render agree. For numbers, use a
deterministic formatter — `formatPrice` in `src/utils/offers.ts` exists because
`toLocaleString('it-IT')` groups thousands differently in Node and in the browser.

### A nav link scrolls nowhere

**Check:** `pnpm exec vitest run tests/site-content.test.ts`.
**Cause:** the header and footer menus are built from `src/config/index.json`
(`navigation` and `about.sections`), and each `href` is an element id rendered by a
component. Renaming or removing a section id leaves the link pointing at nothing, and
nothing fails to compile. "Chi siamo" has its own version of this: it must land on
`id="about"` in `About.tsx`, so `Footer.tsx` must not reintroduce an `id="about"` of its own.
**Fix:** point the entry at an id that exists, or add the id back. The test above lists every
dangling href.

### A car is missing from the offers page

**Check:** `pnpm exec vitest run tests/offers-catalog.test.ts`.
**Cause:** `src/components/Offers.tsx` groups cars using `offers.categoryOrder` as the whole
taxonomy. A car whose `category` is not one of those eight strings has no bucket to go in and
is dropped without a warning — so is a typo such as `"City Car"` for `"City car"`.
**Fix:** correct the car's `category` in `src/data/offers.json`, or add the new category to
`categoryOrder` in the position you want it displayed.

### A car card shows a grey silhouette instead of a photo

**Check:** `pnpm exec vitest run tests/offers-catalog.test.ts` — it lists any `image` path
with no file behind it.
**Cause:** the `onError` handler in `Offers.tsx` swaps in `PLACEHOLDER_IMAGE`, an inline SVG,
when the image 404s. Typically the file was never added under
`public/assets/images/offers/`, or the name in the JSON does not match the file.
**Fix:** add the WEBP render at the path the JSON names, and add its provenance to
`offers.json → imageCredits` in the same edit. The credits are a licensing obligation for the
Wikimedia Commons files, not a nicety.

### `pnpm run build-stats` produces no bundle report

**Check:** `pnpm run build-stats` then `ls .next/analyze` — the directory is not created.
**Cause:** `next.config.js` calls `require('@next/bundle-analyzer')({ … })` and discards the
wrapper function it returns; `nextConfig` is exported unwrapped, so `ANALYZE=true` does
nothing. See "Known issues" below.
**Fix:** none in this repo today. To analyse a bundle, wrap the config yourself in a scratch
branch (`module.exports = withBundleAnalyzer(nextConfig)`), bearing in mind that
`@next/bundle-analyzer` is pinned at `^12.0.0` against Next 16.

### A stale build output confuses you

**Check:** `ls -la out .next`.
**Cause:** `next build` writes over `out/` but does not remove files that no longer belong to
the site, so a deleted route can linger.
**Fix:** `pnpm run build-prod`, which is `pnpm run clean && pnpm run build`.

---

## Tests and CI

### `pnpm exec vitest run` reports "No test files found"

**Check:** `ls tests/` and `cat vitest.config.mjs`.
**Cause:** the config only collects `tests/**/*.test.ts`. A test placed elsewhere, or named
`*.spec.ts`, is invisible.
**Fix:** put the file under `tests/` and name it `*.test.ts`.

### A new test fails `pnpm run build-types` but passes under vitest

**Check:** `pnpm run build-types`.
**Cause:** vitest and `tsc` do not see the same language. `tsconfig.json` targets **ES5**, so
spreading an iterator (`[...someSet]`, `[...str.matchAll(re)]`) is a type error — use
`Array.from(…)`. And `@types/node` is pinned at `^16` while the runtime is Node 22, so newer
Node APIs are missing from the types even though they work at runtime (`readdirSync`'s
`recursive` option is the one this suite hit). `tsconfig.json` includes `**/*.ts`, so every
test is type-checked.
**Fix:** use the ES5-compatible form, or avoid the API. `tests/site-content.test.ts` walks
directories by hand for exactly this reason.

### CI is red on formatting only

**Check:** `pnpm run lint`.
**Cause:** Prettier runs *as an ESLint rule* (`prettier/prettier`) with `singleQuote: true`
and `trailingComma: 'es5'`, so a formatting difference is a lint error, not a warning. Note
that `next lint` no longer exists — Next 16 removed it and linting goes through
`eslint.config.mjs` directly.
**Fix:** `pnpm run lint:fix`. Use `pnpm run format` only when you mean to reformat every file
in the repo.

### A push deployed the site when you only wanted checks

**Check:** `cat .github/workflows/nextjs.yml` — look at its `on:` block.
**Cause:** there are two workflows and they have different jobs. `nextjs.yml` builds and
deploys to GitHub Pages on pushes to `main` (plus `workflow_dispatch`); `ci.yml` runs lint,
types, tests and a build on every push and pull request and publishes nothing.
**Fix:** nothing to fix — that is the design. Do not add deploy steps to `ci.yml`, and do not
add checks to `nextjs.yml`: the production deploy should not be gated on a check that can
flake. Verify a workflow edit with `actionlint .github/workflows/*.yml` before pushing.

### The site is live but a change has not appeared

**Check:** `curl -sI https://skvrentsrls.it | grep -i server` — it answers `GitHub.com`.
**Cause:** production is GitHub Pages, not Netlify; the `netlify.toml` that used to be here
was removed. Only a push to `main` deploys, through `nextjs.yml`. The custom domain lives in
the repository's Pages settings, which is why there is no `CNAME` file in `public/`.
**Fix:** check the Actions tab for the deploy run. `/_next/static` filenames are
content-hashed, so a stale asset is a build problem, not a caching one.

---

## Content and data

### Prices on the site no longer match `PROMO.pdf`

**Check:** `scripts/sync-offers.sh` (report only; it exits non-zero when something needs
attention).
**Cause:** `src/data/offers.json` is a hand-curated subset — about 22 of the ~124 cars in the
PDF — so a new PDF does not propagate on its own.
**Fix:** `scripts/sync-offers.sh --apply` writes the price updates, and only the prices: it
never touches `category`, `image` or `electric`. Cars that vanished from the PDF and new PDF
cars need a human — `scripts/sync-offers.sh --list-candidates` prints the unfeatured ones.
Requires `pdftotext` (poppler) and `node` on `PATH`.

### `scripts/sync-offers.sh` says no prices were found in the PDF

**Check:** `pdftotext PROMO.pdf - | head -40`.
**Cause:** the script finds a price by matching lines of the form `da €1.234,56 al mese` and
takes the nearest non-empty line above as the model. A PDF laid out differently produces no
matches, and the script exits 1 rather than guessing.
**Fix:** inspect the extracted text and adjust the regex in the embedded Node helper inside
`scripts/sync-offers.sh`. Do not "fix" it by editing `offers.json` to match a PDF you have
not read.

### The company's legal details disappeared from the footer

**Check:** `pnpm exec vitest run tests/site-content.test.ts`.
**Cause:** the footer prints the legal name, registered office, VAT number, REA number and
PEC from `config.about.legal`. Italian law requires them: the VAT number under art. 35 DPR
633/72, the registration details under art. 2250 c.c. Emptying a JSON string removes them
without any build error.
**Fix:** restore the values in `src/config/index.json`. Never delete legal text while editing
copy, and keep the form of the company right — it is an **S.r.l.s.**, not an "S.r.l.".

### Someone wants to add a map, a hosted font or analytics

**Check:** `pnpm exec vitest run tests/site-content.test.ts` — it asserts that no analytics
origin is referenced, that the display font is self-hosted through `next/font/local`, and
that the contact form posts to Web3Forms and nowhere else.
**Cause:** the site sets no cookies and embeds nothing third-party, which is the only reason
it needs no consent banner under the Garante's 2021 cookie guidelines. That is why the Google
Analytics and Ads code was deleted rather than left dormant.
**Fix:** treat it as a product decision. Adding any tracker, embedded map or hosted font
brings back prior consent, a banner, and an update to `src/pages/privacy.tsx` — whose
sub-processor list and stated 24-month retention describe what the code actually does today.

---

## Known issues

Things found while writing these docs and the test suite, left exactly as they are. Each one
is reproducible from this checkout.

- **`pnpm run build-stats` is a no-op.** `next.config.js` calls
  `require('@next/bundle-analyzer')({ enabled: … })` as a bare statement and exports
  `nextConfig` unwrapped, so `ANALYZE=true` changes nothing. Confirmed: after
  `pnpm run build-stats`, `.next/analyze/` does not exist. The dependency is also pinned at
  `@next/bundle-analyzer@^12.0.0` against Next 16.
- **`src/utils/utils.ts` is dead code.** It exports `chunkArr`, which nothing imports —
  a template leftover. `src/data/logos.json` is dead in the same way: a list of Clearbit
  logo URLs for Google, Microsoft, Apple and others, unreferenced since the brand carousel
  started deriving its logos from `src/data/offers.json` via `src/data/brandLogos.json`.
- **The type packages are years behind the runtime.** `@types/node` is `^16` while
  `.node-version` says 22, and `@types/react` is `^17` while React is 19. The visible
  consequence is in `src/pages/index.tsx`, where the hero preload's `fetchPriority` has to be
  cast through `as unknown as JSX.IntrinsicElements['link']` because the pinned types do not
  know the attribute. Raising them is not a behaviour change but it is not a free one either.
- **The phone field validates twice, differently.** The input's HTML `pattern` in
  `src/components/Contact.tsx` requires an Italian mobile (`3xx`) or landline (`0…`) shape;
  `validatePhone` in `src/utils/validation.ts` only checks for an optional `+39` followed by
  9–11 digits. So `123456789` passes the JavaScript check and is rejected by the browser, and
  a number typed with dots (`377.357.5917`) fails the JavaScript check because only spaces and
  hyphens are stripped. Both behaviours are pinned in `tests/validation.test.ts`.
- **`validateVATNumber` accepts `00000000000`.** The check is arithmetic — a Luhn check digit
  over eleven digits — so a string of zeros satisfies it. Pinned in
  `tests/validation.test.ts`.
- **The Web3Forms access key is hard-coded in `src/components/Contact.tsx`.** It has to be
  readable by the browser, so this is how the service is designed; it does mean the key is
  public and anyone can post to the same endpoint. Rotating it is a source change and a
  redeploy, not a configuration change.
- **`about.legal.shareCapital` is empty**, so the footer omits the paid-up share capital that
  art. 2250 c.c. also asks for. The line reappears on its own once someone fills the figure
  in; nothing else needs changing.
- **The Wikimedia Commons image credits are not shown anywhere.** `offers.json → imageCredits`
  records several offer renders as CC BY-SA, which requires visible photographer attribution
  while the page is public. The data is there; the page does not render it.
- **Dark mode is half-wired.** `tailwind.config.js` sets `darkMode: true` (the legacy
  Tailwind 2 form) and `Footer.tsx` and `Contact.tsx` are full of `dark:` variants, but
  nothing toggles a dark class and the palette has no dark tokens.
- **`CLAUDE.md` ends with an unmatched ``` fence** (its last line, after the "Known issues"
  section). Every renderer past that point treats the rest of the file as a code block.
  Removing that single line fixes it; it was left alone here because this run may not edit
  human-written text outside its own markers.

### What is not covered by tests

- **Nothing renders React.** The suite is Node-only by design: the site has no runtime, no
  state worth simulating and no routing, so component rendering would mostly assert that
  Tailwind class strings have not changed. Adding it would mean pulling in jsdom and
  `@testing-library/react`, which is a dependency decision for the maintainer.
- **The layout itself is unverified.** Core Web Vitals, the critical-CSS trade-off and the
  Tailwind-2 silent-no-op class problem are all browser-level facts. They are checked with
  Lighthouse instead — `unlighthouse --site https://skvrentsrls.it` for a report, or
  `unlighthouse-ci --site https://skvrentsrls.it --budget 90` for a gate. Neither is in CI:
  both need a headless browser and a deployed URL.
- **`scripts/sync-offers.sh` is untested.** It needs `pdftotext` and the real `PROMO.pdf`,
  neither of which belongs in a unit test, and its `--apply` path rewrites a tracked file.
  Run it by hand and read the report.
- **Nothing exercises the contact form end to end.** Submitting it posts to a live Web3Forms
  endpoint, and the rule here is no network in tests. Only the validation that runs before
  the request is covered.
<!-- autodoc:end -->
