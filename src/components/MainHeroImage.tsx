import config from '../config/index.json';

const toWebp = (src: string) => src.replace(/\.(png|jpe?g)$/i, '.webp');

const MainHeroImage = () => {
  const { mainHero } = config;
  const webpSrc = toWebp(mainHero.img);
  return (
    <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
      <picture>
        <source type="image/webp" srcSet={webpSrc} />
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src={mainHero.img}
          alt="Noleggio auto SKV Rent"
          width={960}
          height={1200}
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </picture>
    </div>
  );
};

export default MainHeroImage;
