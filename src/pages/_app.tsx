import { AppProps } from 'next/app';
import localFont from 'next/font/local';

import '../styles/main.css';

// Display face for the headings (h1–h3): Sora, variable weight, latin subset,
// self-hosted so the static export has no third-party font request. Licence in
// src/fonts/OFL-Sora.txt. Exposed as --font-display → Tailwind `font-display`;
// body copy stays on the system sans stack.
const display = localFont({
  src: '../fonts/Sora-Variable-latin.woff2',
  weight: '100 800',
  display: 'swap',
  variable: '--font-display',
});

const MyApp = ({ Component, pageProps }: AppProps) => (
  <div className={display.variable}>
    <Component {...pageProps} />
  </div>
);

export default MyApp;
