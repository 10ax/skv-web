import Divider from './Divider';
import offers from '../data/offers.json';

type Car = {
  model: string;
  price: number;
  category: string;
  electric?: boolean;
  image: string;
};

const cars = offers.cars as Car[];

// Deterministic Italian currency formatting (e.g. 1455 -> "€1.455,00").
// Avoids relying on Intl/ICU grouping, which is inconsistent across the
// Node (SSR) and browser runtimes and would trigger a hydration mismatch.
const formatPrice = (value: number) => {
  const [integer, decimals] = value.toFixed(2).split('.');
  const grouped = (integer ?? '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `€${grouped},${decimals}`;
};

// Neutral car-silhouette placeholder shown if an image fails to load.
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 120 60'%3E%3Crect width='120' height='60' fill='%23f3f4f6'/%3E%3Cpath fill='%23cbd5e1' d='M18 40a5 5 0 0 0 10 0zm74 0a5 5 0 0 0 10 0zM24 26l6-10a6 6 0 0 1 5-3h26a6 6 0 0 1 5 3l6 10 12 3a4 4 0 0 1 3 4v6a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2v-6a4 4 0 0 1 3-4zm10-9-4 8h20v-8zm22 0v8h18l-4-8z'/%3E%3C/svg%3E";

const groupByCategory = () => {
  const groups = new Map<string, Car[]>();
  offers.categoryOrder.forEach((category) => groups.set(category, []));

  cars.forEach((car) => {
    const bucket = groups.get(car.category);
    if (bucket) bucket.push(car);
  });

  return offers.categoryOrder
    .map((category) => ({
      category,
      list: (groups.get(category) ?? [])
        .slice()
        .sort((a, b) => a.price - b.price),
    }))
    .filter((group) => group.list.length > 0);
};

const CarCard = ({ car }: { car: Car }) => (
  <div
    className={`flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-background shadow-sm transition-shadow hover:shadow-md`}
  >
    <div className={`relative h-44 bg-gray-50`}>
      <img
        src={car.image}
        alt={car.model}
        loading="lazy"
        decoding="async"
        className={`absolute inset-0 h-full w-full object-contain p-2`}
        onError={(event) => {
          const img = event.currentTarget;
          img.onerror = null;
          img.src = PLACEHOLDER_IMAGE;
        }}
      />
      {car.electric ? (
        <span
          className={`absolute left-2 top-2 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700`}
        >
          Elettrica
        </span>
      ) : null}
    </div>
    <div className={`flex flex-1 flex-col justify-between p-4`}>
      <h4 className={`font-bold leading-snug text-gray-800`}>{car.model}</h4>
      <p className={`mt-2 text-sm text-gray-500`}>
        da{' '}
        <span className={`text-lg font-bold text-primary`}>
          {formatPrice(car.price)}
        </span>{' '}
        al mese
      </p>
    </div>
  </div>
);

const Offers = () => {
  const groups = groupByCategory();

  return (
    <section className={`bg-background py-8`} id="offers">
      <div className={`container mx-auto max-w-6xl px-4`}>
        <h2
          className={`w-full my-2 font-display text-5xl font-bold leading-tight text-center text-primary`}
        >
          {offers.title}
        </h2>
        {offers.subtitle ? (
          <p className={`mx-auto mb-2 max-w-2xl text-center text-gray-600`}>
            {offers.subtitle}
          </p>
        ) : null}
        <Divider />

        <div className={`mt-8`}>
          {groups.map(({ category, list }) => (
            <details
              key={category}
              className={`group border-b border-gray-200 py-2`}
            >
              <summary
                className={`flex cursor-pointer list-none items-center justify-between py-4`}
              >
                <div>
                  <h3 className={`text-2xl font-bold text-border`}>
                    {category}
                  </h3>
                  <p className={`mt-1 text-sm text-gray-500`}>
                    da{' '}
                    <span className={`font-semibold text-primary`}>
                      {formatPrice(Math.min(...list.map((car) => car.price)))}
                    </span>{' '}
                    al mese · {list.length}{' '}
                    {list.length === 1 ? 'modello' : 'modelli'}
                  </p>
                </div>
                <svg
                  className={`offers-chevron h-5 w-5 flex-shrink-0 text-primary transition-transform duration-300`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </summary>

              <div
                className={`grid grid-cols-1 gap-4 pt-2 pb-6 sm:grid-cols-2 lg:grid-cols-3`}
              >
                {list.map((car) => (
                  <CarCard key={car.model} car={car} />
                ))}
              </div>
            </details>
          ))}
        </div>

        {offers.note ? (
          <p className={`mt-8 text-center text-xs text-gray-400`}>
            {offers.note}
          </p>
        ) : null}

        <div className={`mt-8 flex justify-center`}>
          <a
            href="#contact"
            className={`inline-flex items-center rounded-md border border-transparent bg-primary px-8 py-3 text-base font-medium text-white shadow hover:bg-secondary`}
          >
            Richiedi un preventivo
          </a>
        </div>
      </div>
    </section>
  );
};

export default Offers;
