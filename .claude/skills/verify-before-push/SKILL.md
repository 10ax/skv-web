---
name: verify-before-push
description: Use before committing or pushing any change to the SKV Rent site, or when a pnpm command, CI run or GitHub Pages deploy behaves unexpectedly
---
<!-- autodoc:begin -->
<!-- autodoc: 351fa38 2026-09-18 -->
# Verify a change before it ships

A push to `main` deploys straight to production. Run the same four checks CI runs, in the
same order, and read the output — they take well under a minute together.

```bash
pnpm install --frozen-lockfile --ignore-scripts
pnpm run lint          # ESLint 9; Prettier runs as the prettier/prettier rule
pnpm run build-types   # tsc --noEmit, strict, and it type-checks tests/ too
pnpm exec vitest run   # the characterisation suite
pnpm run build         # production build + static export -> out/
```

`.github/workflows/ci.yml` runs exactly these on every push and pull request.

## The package-manager rules

- **pnpm only.** Never `npm`, `npx` or `yarn` — a second lockfile breaks CI. `pnpm exec`
  replaces `npx` for an installed tool; `pnpm dlx` replaces it for one that is not a
  dependency.
- **Node 22** (`.node-version`) and **pnpm 11** (`package.json → packageManager`, via
  corepack). Never hardcode either version in a workflow: use `actions/setup-node` with
  `node-version-file: .node-version` and `pnpm/action-setup` with no `version` input.
- **Adding a dependency is two files.** `pnpm add -D <pkg>` updates `package.json` *and*
  `pnpm-lock.yaml`; commit both together, or the next `--frozen-lockfile` install fails with
  `ERR_PNPM_OUTDATED_LOCKFILE`.
- **If the new dependency ships an install script**, pnpm 11 stops with
  `ERR_PNPM_IGNORED_BUILDS` and every `pnpm run …` fails with it. Add the package to
  `allowBuilds` in `pnpm-workspace.yaml` — `true` or `false`, with a comment saying why.
  Not `pnpm approve-builds`, which records the decision without the reason.
- **`--ignore-scripts` when running unattended.** `prepare` runs `husky install`, and the
  pre-commit hook runs `pnpm exec lint-staged --concurrent false` (ESLint, Prettier, then
  `pnpm run build-types`). Useful for a human, fatal for a script. Never run `husky install`
  or set `core.hooksPath` in a throwaway checkout; `git commit --no-verify` skips the hook
  for a single commit.

## Reviewing the diff

- **Behaviour change or not?** For a refactor that should change nothing, prove it: build,
  keep `out/`, build the previous commit in a scratch directory
  (`git archive HEAD | tar -x -C /tmp/base`), and diff the exported HTML after normalising
  the hashed `/_next/static/…` paths and the build id. Identical output is the proof.
- **New Tailwind classes**: this repo is on **Tailwind 2.2**. A Tailwind 3+ utility emits no
  CSS and produces no warning — the layout just collapses. Check the built stylesheet:
  `grep -o '<the-class>' out/_next/static/chunks/*.css`. Known traps: `aspect-*`,
  `shrink-*`/`grow-*`, the `open`/`group-open` variants, arbitrary variants and values.
- **Anything derived from `Date`, `Math.random` or the locale at render time** causes a React
  #418 hydration mismatch on a static export. Guard it with `suppressHydrationWarning` (as
  `Footer.tsx` does for the copyright year) or compute it in `useEffect`.
- **Workflow edits**: `actionlint .github/workflows/*.yml`. Keep the two workflows separate —
  `ci.yml` verifies and publishes nothing; `nextjs.yml` builds and deploys to GitHub Pages on
  pushes to `main` and is the only deploy path.
- **`next.config.js`**: `experimental.optimizeCss` stays `false`. It was `true` once and
  critters shifted the privacy page badly (CLS 0.431). Do not re-enable it without
  re-measuring `/privacy/`.

## When something is already broken

`docs/TROUBLESHOOTING.md` is organised symptom → check → cause → fix, and ends with the list
of things that are known-broken and deliberately unfixed.
<!-- autodoc:end -->
