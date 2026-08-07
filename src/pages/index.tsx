import dynamic from 'next/dynamic';
import Head from 'next/head';

import Header from '../components/Header';
import LazyShow from '../components/LazyShow';
import MainHero from '../components/MainHero';
import MainHeroImage from '../components/MainHeroImage';
import { AppConfig } from '../utils/AppConfig';

const Product = dynamic(() => import('../components/Product'));
const About = dynamic(() => import('../components/About'));
const Offers = dynamic(() => import('../components/Offers'));
const BrandCarousel = dynamic(() => import('../components/BrandCarousel'));
const Contact = dynamic(() => import('../components/Contact'));
const Footer = dynamic(() => import('../components/Footer'));

const App = () => {
  return (
    // grid-cols-1 caps the column at minmax(0, 1fr); without it the
    // marquee's ~7500px un-clipped intrinsic width inflates this whole grid.
    <div className={`bg-background grid grid-cols-1 gap-y-16 overflow-hidden`}>
      <Head>
        <title>{AppConfig.title}</title>
      </Head>
      <div className={`bg-background`}>
        <Header />
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 pb-12 pt-8 sm:px-6 md:pb-16 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pb-24 lg:pt-12">
          <MainHero />
          <MainHeroImage />
        </div>
      </div>
      <LazyShow>
        <Product />
      </LazyShow>
      <LazyShow>
        <About />
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
        <Footer />
      </LazyShow>
    </div>
  );
};

export default App;
