import React from 'react';

import config from '../config/index.json';
import Divider from './Divider';

const toWebp = (src: string) => src.replace(/\.(png|jpe?g)$/i, '.webp');

const Product = () => {
  const { product } = config;
  const [firstItem, secondItem] = product.items;

  return (
    <section className={`bg-background py-8`} id="product">
      <div className={`container max-w-5xl mx-auto m-8`}>
        <h1
          className={`w-full my-2 text-5xl font-bold leading-tight text-center text-primary`}
        >
          {product.title.split(' ').map((word, index) => (
            <span
              key={index}
              className={index % 2 ? 'text-primary' : 'text-border'}
            >
              {word}{' '}
            </span>
          ))}
        </h1>
        <Divider />
        <div className={`flex flex-wrap`}>
          <div className={`w-5/6 sm:w-1/2 p-6 mt-20`}>
            <h3
              className={`text-3xl text-gray-800 font-bold leading-none mb-3`}
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
                  className="h-6/6"
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
        <div className={`flex flex-wrap flex-col-reverse sm:flex-row`}>
          <div className={`w-full sm:w-1/2 p-6`}>
            {secondItem?.img ? (
              <picture>
                <source type="image/webp" srcSet={toWebp(secondItem.img)} />
                <img
                  className="h-6/6"
                  src={secondItem.img}
                  alt={secondItem?.title}
                  width={961}
                  height={1200}
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            ) : null}
          </div>
          <div className={`w-full sm:w-1/2 p-6 mt-20`}>
            <div className={`align-middle`}>
              <h3
                className={`text-3xl text-gray-800 font-bold leading-none mb-3`}
              >
                {secondItem?.title}
              </h3>
              <p className={`text-gray-600 mb-8`}>{secondItem?.description}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Product;
