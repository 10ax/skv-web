import config from '../config/index.json';

const MainHero = () => {
  const { mainHero } = config;
  return (
    <main>
      <p
        className={`inline-flex items-center rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-wide text-secondary sm:text-sm`}
      >
        {mainHero.eyebrow}
      </p>
      <h1 className="mt-4 font-display text-5xl uppercase leading-[0.95] tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
        <span className="block">{mainHero.title}</span>
        <span className={`block text-primary`}>{mainHero.subtitle}</span>
      </h1>
      <p className="mt-5 max-w-lg text-base text-gray-500 sm:text-lg md:text-xl">
        {mainHero.description}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={mainHero.primaryAction.href}
          className={`flex items-center justify-center rounded-md border border-transparent bg-primary px-8 py-3 text-base font-medium text-background shadow hover:bg-border hover:text-primary md:px-10 md:py-4 md:text-lg`}
        >
          {mainHero.primaryAction.text}
        </a>
        <a
          href={mainHero.secondaryAction.href}
          className={`flex items-center justify-center rounded-md border border-primary px-8 py-3 text-base font-medium text-secondary hover:bg-border hover:text-primary md:px-10 md:py-4 md:text-lg`}
        >
          {mainHero.secondaryAction.text}
        </a>
      </div>
    </main>
  );
};

export default MainHero;
