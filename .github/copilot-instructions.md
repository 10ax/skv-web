# SKV Rent Web - Copilot Instructions

## Project Overview
SKV Rent is a car rental landing page built with **Next.js 15**, **React 19**, **TypeScript**, and **Tailwind CSS**. It's a static site exported for deployment on GitHub Pages.

## Architecture

### Content-Driven Components
All page content is centralized in `src/config/index.json`. Components read from this config rather than hardcoding text:
```tsx
// Example pattern (see src/components/MainHero.tsx)
import config from '../config/index.json';
const { mainHero } = config;
```

### Single-Page Structure
The app is a single-page landing (`src/pages/index.tsx`) composed of lazy-loaded sections:
- `Header` → Navigation with smooth scroll (react-scroll)
- `MainHero` / `MainHeroImage` → Hero section
- `Product` → Service showcase
- `Contact` → Tabbed form (private/business customers)
- `About` → Footer with social links

### Contact Form Pattern
The Contact component (`src/components/Contact/`) demonstrates the project's modular approach:
- `index.tsx` - Parent with tab state and form submission (Web3Forms API)
- `PrivateForm.tsx` / `BusinessForm.tsx` - Child form components receive `errors` prop
- `types.ts` - Shared TypeScript interfaces
- `validation.ts` - Italian-specific validation (phone, VAT checksum)

## Key Conventions

### TypeScript
- **Strict mode enabled** with `noUncheckedIndexedAccess` - always handle undefined when accessing arrays/objects
- Type definitions in component folders (`types.ts`) or `src/interfaces.d.ts` for module declarations

### Styling
- Tailwind CSS with custom colors defined in `tailwind.config.js`:
  - `primary: #003cff`, `secondary: #0018a4`, `tertiary: #99a0a3`
- Dark mode support: use `dark:` prefix (e.g., `dark:bg-gray-800`)
- Template literals for conditional classes, not classnames library

### Animation
- `framer-motion` for scroll animations via `LazyShow` wrapper component
- `LazyShow` uses IntersectionObserver for viewport detection

## Developer Commands
```bash
npm run dev          # Start dev server
npm run build-types  # TypeScript check (also runs on lint-staged)
npm run lint         # ESLint
npm run build-prod   # Full production build (clean → build → export)
```

## Deployment
- **Static export**: `output: 'export'` in `next.config.js`
- Deploys to GitHub Pages (`.github/workflows/nextjs.yml`), custom domain skvrentsrls.it
- Assets in `public/assets/images/` and `public/assets/gifs/`

## When Adding Features
1. Add content strings to `src/config/index.json` first
2. Create component in `src/components/` reading from config
3. Wrap in `<LazyShow>` for scroll animation if below fold
4. For forms: follow Contact pattern with separate validation file
