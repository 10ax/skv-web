import { AppProps } from 'next/app';
import { Big_Shoulders, Karla } from 'next/font/google';

import '../styles/main.css';

// Big Shoulders: condensed, highway-signage character for headlines — a
// deliberate nod to road signs and license plates rather than a generic
// system-ui default. Karla carries body copy for warmth and legibility.
const bigShoulders = Big_Shoulders({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-display',
  display: 'swap',
});

const karla = Karla({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-body',
  display: 'swap',
});

const MyApp = ({ Component, pageProps }: AppProps) => (
  <div className={`${bigShoulders.variable} ${karla.variable} font-sans`}>
    <Component {...pageProps} />
  </div>
);

export default MyApp;
