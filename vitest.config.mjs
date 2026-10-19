import { defineConfig } from 'vitest/config';

// .mjs on purpose: package.json has no "type": "module", so a .ts config is
// loaded as CommonJS and Vite warns about the ESM syntax in it.
//
// The site is a static export with no runtime, so the suite is
// characterisation-only: it exercises the pure helpers under src/utils and the
// JSON data and assets they read. Nothing renders React or touches the network,
// so the default Node environment is enough (no jsdom dependency).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      // lcov is what sonar-scan hands to SonarQube; the 90% thresholds stay on
      // the test:coverage command line, where CI reads them.
      reporter: ['text', 'lcov'],
    },
  },
});
