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

// On mobile the single row is split into two shorter rows (alternating
// makes between them) that scroll in opposite directions, so more logos
// are visible at once on narrow screens.
const mobileRowA = makes.filter((_, index) => index % 2 === 0);
const mobileRowB = makes.filter((_, index) => index % 2 === 1);

// Rendered 3x back-to-back so the marquee can loop seamlessly (see the
// matching -33.3333% keyframe in main.css) without a visible seam on wide
// viewports.
const COPIES = 3;

const LogoRow = ({ items, hidden }: { items: string[]; hidden: boolean }) => (
  <div className="flex items-center" aria-hidden={hidden || undefined}>
    {items.map((make) => (
      <div
        key={make}
        className="mx-8 flex h-10 w-28 flex-shrink-0 items-center justify-center sm:h-12 sm:w-32"
      >
        <img
          src={logoFolder + logos[make]}
          alt={hidden ? '' : make}
          loading="lazy"
          decoding="async"
          className="max-h-full max-w-full object-contain grayscale opacity-60 transition duration-300 hover:grayscale-0 hover:opacity-100"
        />
      </div>
    ))}
  </div>
);

const MarqueeRow = ({
  items,
  reverse,
}: {
  items: string[];
  reverse?: boolean;
}) => (
  <div className="brand-marquee">
    <div
      className={`brand-marquee-track flex ${reverse ? 'brand-marquee-track-reverse' : ''}`}
    >
      {Array.from({ length: COPIES }, (_, index) => (
        <LogoRow key={index} items={items} hidden={index > 0} />
      ))}
    </div>
  </div>
);

const BrandCarousel = () => (
  <section
    className="bg-background py-10"
    aria-label="Marchi disponibili a noleggio"
  >
    <div className="flex flex-col gap-4 sm:hidden">
      <MarqueeRow items={mobileRowA} />
      <MarqueeRow items={mobileRowB} reverse />
    </div>
    <div className="hidden sm:block">
      <MarqueeRow items={makes} />
    </div>
  </section>
);

export default BrandCarousel;
