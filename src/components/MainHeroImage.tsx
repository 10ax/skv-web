import config from '../config/index.json';

const toWebp = (src: string) => src.replace(/\.(png|jpe?g)$/i, '.webp');

const MainHeroImage = () => {
  const { mainHero } = config;
  const webpSrc = toWebp(mainHero.img);
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-l-8 border-l-primary shadow-xl`}
    >
      <picture>
        <source type="image/webp" srcSet={webpSrc} />
        <img
          className="h-64 w-full object-cover sm:h-80 md:h-[26rem] lg:h-[32rem]"
          src={mainHero.img}
          alt="Noleggio auto SKV Rent"
          width={1200}
          height={1440}
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      </picture>
    </div>
  );
};

export default MainHeroImage;
