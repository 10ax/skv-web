import dynamic from 'next/dynamic';
import Head from 'next/head';

import Header from '../components/Header';
import LazyShow from '../components/LazyShow';
import MainHero from '../components/MainHero';
import MainHeroImage from '../components/MainHeroImage';
import { AppConfig } from '../utils/AppConfig';

const Product = dynamic(() => import('../components/Product'));
const Offers = dynamic(() => import('../components/Offers'));
const BrandCarousel = dynamic(() => import('../components/BrandCarousel'));
const Contact = dynamic(() => import('../components/Contact'));
const About = dynamic(() => import('../components/About'));

const App = () => {
  return (
    // grid-cols-1 caps the column at minmax(0, 1fr); without it the
    // marquee's ~7500px un-clipped intrinsic width inflates this whole grid.
    <div className={`bg-background grid grid-cols-1 gap-y-16 overflow-hidden`}>
      <Head>
        <title>{AppConfig.title}</title>
      </Head>
      <div className={`relative bg-background`}>
        <div className="max-w-7xl mx-auto">
          <div
            className={`relative z-10 pb-8 bg-background sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32`}
          >
            <Header />
            <MainHero />
          </div>
        </div>
        <MainHeroImage />
      </div>
      <LazyShow>
        <Product />
      </LazyShow>
      <LazyShow>
        <>
          <BrandCarousel />
          <Offers />
        </>
      </LazyShow>
      <LazyShow>
        <Contact />
      </LazyShow>
      <LazyShow>
        <About />
      </LazyShow>
    </div>
  );
};

export default App;
