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
  // Inline critical CSS into <head> and load the rest asynchronously,
  // removing the render-blocking stylesheet request. The Pages Router path
  // (server/post-process.js) requires the `critters` devDependency at build
  // time; `beasties` is only wired into the App Router, which we don't use.
  experimental: { optimizeCss: true },
};

module.exports = nextConfig;
