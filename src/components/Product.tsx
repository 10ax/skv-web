import Divider from './Divider';
import config from '../config/index.json';

const toWebp = (src: string) => src.replace(/\.(png|jpe?g)$/i, '.webp');

const withKnownWidth = (src: string, width: number) => {
  // Only rewrite sources that already include a -<n>w suffix.
  if (!/-\d+w\.(png|jpe?g|webp)$/i.test(src)) return src;
  return src.replace(/-\d+w\.(png|jpe?g|webp)$/i, `-${width}w.$1`);
};

// The photos are portrait originals; cropping them into a fixed landscape box
// keeps each row's text and image at the same visual height instead of leaving
// half the row empty next to a 700px-tall image.
const imageClass = `w-full h-64 sm:h-80 lg:h-96 rounded-lg object-cover`;

const Product = () => {
  const { product } = config;
  const [firstItem, secondItem] = product.items;

  return (
    <section className={`bg-background py-8`} id="product">
      <div className={`container max-w-5xl mx-auto m-8`}>
        <h2
          className={`w-full my-2 font-display text-4xl font-bold leading-tight tracking-tight text-center text-border`}
        >
          {product.title}
        </h2>
        <Divider />
        <div className={`flex flex-wrap items-center`}>
          <div className={`w-full sm:w-1/2 p-6`}>
            <h3
              className={`font-display text-2xl sm:text-3xl text-border font-bold leading-tight mb-3`}
            >
              {firstItem?.title}
            </h3>
            <p className={`text-gray-600`}>{firstItem?.description}</p>
          </div>
          <div className={`w-full sm:w-1/2 p-6`}>
            {firstItem?.img ? (
              <picture>
                <source type="image/webp" srcSet={toWebp(firstItem.img)} />
                <img
                  className={imageClass}
                  src={firstItem.img}
                  alt={firstItem?.title}
                  width={640}
                  height={960}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            ) : null}
          </div>
        </div>
        <div
          className={`flex flex-wrap flex-col-reverse sm:flex-row items-center`}
        >
          <div className={`w-full sm:w-1/2 p-6`}>
            {secondItem?.img ? (
              <picture>
                <source
                  type="image/webp"
                  srcSet={`${toWebp(
                    withKnownWidth(secondItem.img, 640)
                  )} 640w, ${toWebp(withKnownWidth(secondItem.img, 961))} 961w`}
                  sizes="(min-width: 1024px) 480px, (min-width: 640px) calc(50vw - 80px), calc(100vw - 112px)"
                />
                <img
                  className={imageClass}
                  src={withKnownWidth(secondItem.img, 640)}
                  srcSet={`${withKnownWidth(
                    secondItem.img,
                    640
                  )} 640w, ${withKnownWidth(secondItem.img, 961)} 961w`}
                  sizes="(min-width: 1024px) 480px, (min-width: 640px) calc(50vw - 80px), calc(100vw - 112px)"
                  alt={secondItem?.title}
                  width={640}
                  height={799}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            ) : null}
          </div>
          <div className={`w-full sm:w-1/2 p-6`}>
            <h3
              className={`font-display text-2xl sm:text-3xl text-border font-bold leading-tight mb-3`}
            >
              {secondItem?.title}
            </h3>
            <p className={`text-gray-600`}>{secondItem?.description}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Product;
