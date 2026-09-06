require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  poweredByHeader: false,
  trailingSlash: true,
  basePath: '',
  // The starter code load resources from `public` folder with `router.basePath` in React components.
  // So, the source code is "basePath-ready".
  // You can remove `basePath` if you don't need it.
  reactStrictMode: true,
  output: 'export',
  // Critical-CSS inlining is OFF. It used to be on: critters inlined the
  // above-the-fold rules and loaded the rest asynchronously, which removed the
  // render-blocking stylesheet request. That works while the whole site is one
  // image-led landing page, but on the text-only /privacy/ page critters missed
  // layout rules that are above the fold, so the page painted unstyled and then
  // re-flowed. Measured on /privacy/ under Lighthouse throttling, three runs each:
  //   optimizeCss: true   CLS 0.431 (2 of 3 runs), performance 79-99, FCP 0.6s
  //   optimizeCss: false  CLS 0     (3 of 3 runs), performance 99,    FCP 0.8s
  // The landing page scores 96 either way. Trading 0.2s of FCP (still well
  // inside the "good" band) for a Core Web Vital that was in the "poor" band is
  // the better deal, so the stylesheet is render-blocking again — it is ~5 KB
  // over the wire, so there is little left to win here. `critters` stays in
  // devDependencies so flipping this back is a one-word change.
  experimental: { optimizeCss: false },
};

module.exports = nextConfig;
