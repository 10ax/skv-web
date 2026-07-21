import brandLogosData from '../data/brandLogos.json';
import offers from '../data/offers.json';

type Car = { make: string };

const logoFolder = '/assets/images/logos/';
const logos = brandLogosData.logos as Record<string, string>;

// Unique makes among the cars actually shown in Offers, in the order they
// first appear there (i.e. cheapest-first within categoryOrder).
const makes = Array.from(
  new Set((offers.cars as Car[]).map((car) => car.make))
).filter((make) => logos[make]);

// Rendered 3x back-to-back so the marquee can loop seamlessly (see the
// matching -33.3333% keyframe in main.css) without a visible seam on wide
// viewports.
const COPIES = 3;

const LogoRow = ({ hidden }: { hidden: boolean }) => (
  <div className="flex items-center" aria-hidden={hidden || undefined}>
    {makes.map((make) => (
      <div
        key={make}
        className="mx-8 flex h-10 w-28 flex-shrink-0 items-center justify-center sm:h-12 sm:w-32"
      >
        <img
          src={logoFolder + logos[make]}
          alt={hidden ? '' : make}
          loading="lazy"
          decoding="async"
          className="max-h-full max-w-full object-contain"
        />
      </div>
    ))}
  </div>
);

const BrandCarousel = () => (
  <section
    className="brand-marquee bg-background py-10"
    aria-label="Marchi disponibili a noleggio"
  >
    <div className="brand-marquee-track flex">
      {Array.from({ length: COPIES }, (_, index) => (
        <LogoRow key={index} hidden={index > 0} />
      ))}
    </div>
  </section>
);

export default BrandCarousel;
