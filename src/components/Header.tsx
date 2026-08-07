import { useEffect, useState } from 'react';

import Link from 'next/link';

import config from '../config/index.json';

const withWidthVariant = (src: string, width: number, ext: 'png' | 'webp') => {
  // Example: /assets/images/skv-logo.webp -> /assets/images/skv-logo-64w.webp
  // If the file already has a -<n>w suffix, replace it.
  if (!src) return src;
  if (!/\.(png|jpe?g|webp)$/i.test(src)) return src;
  return src.replace(/(-\d+w)?\.(png|jpe?g|webp)$/i, `-${width}w.${ext}`);
};

const Menu = () => {
  const { navigation, company } = config;
  const { name: companyName, logo } = company;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuId = 'mobile-menu';

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };

    if (isMenuOpen) {
      globalThis.addEventListener('keydown', onKeyDown);
    }

    return () => {
      globalThis.removeEventListener('keydown', onKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <div className="relative mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <nav
        className="relative flex items-center justify-between"
        aria-label="Global"
      >
        <div className="flex items-center flex-grow flex-shrink-0 lg:flex-grow-0">
          <div className="flex items-center justify-between w-full md:w-auto">
            <Link
              href="/"
              aria-label={companyName}
              className="inline-flex"
              passHref={true}
            >
              <span className="sr-only">{companyName}</span>
              <picture>
                <source
                  type="image/webp"
                  srcSet={`${withWidthVariant(
                    logo,
                    64,
                    'webp'
                  )} 64w, ${withWidthVariant(logo, 128, 'webp')} 128w`}
                  sizes="64px"
                />
                <img
                  alt="logo"
                  className="h-16 w-auto sm:h-16"
                  src={withWidthVariant(logo, 64, 'webp')}
                  srcSet={`${withWidthVariant(
                    logo,
                    64,
                    'webp'
                  )} 64w, ${withWidthVariant(logo, 128, 'webp')} 128w`}
                  sizes="64px"
                  width={64}
                  height={64}
                  decoding="async"
                  fetchPriority="high"
                />
              </picture>
            </Link>
            <div className="-mr-2 flex items-center md:hidden">
              <button
                type="button"
                aria-controls={menuId}
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((open) => !open)}
                className={`bg-background rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-secondary`}
              >
                <span className="sr-only">
                  {isMenuOpen ? 'Close main menu' : 'Open main menu'}
                </span>
                {isMenuOpen ? (
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="hidden md:block md:ml-10 md:pr-4 md:space-x-8">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={`#${item.href}`}
              className="font-medium text-gray-500 hover:text-gray-900"
            >
              {item.name}
            </a>
          ))}
        </div>
      </nav>

      {isMenuOpen ? (
        <div
          id={menuId}
          className="absolute z-10 top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden"
        >
          <div
            className={`rounded-lg shadow-md bg-background ring-1 ring-black ring-opacity-5 overflow-hidden`}
          >
            <div className="px-5 pt-4 flex items-center justify-between">
              <div>
                <picture>
                  <source
                    type="image/webp"
                    srcSet={`${withWidthVariant(
                      logo,
                      32,
                      'webp'
                    )} 32w, ${withWidthVariant(logo, 64, 'webp')} 64w`}
                    sizes="32px"
                  />
                  <img
                    className="h-8 w-auto"
                    src={withWidthVariant(logo, 32, 'webp')}
                    srcSet={`${withWidthVariant(
                      logo,
                      32,
                      'webp'
                    )} 32w, ${withWidthVariant(logo, 64, 'webp')} 64w`}
                    sizes="32px"
                    alt=""
                    width={32}
                    height={32}
                    loading="lazy"
                    decoding="async"
                  />
                </picture>
              </div>
              <div className="-mr-2">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className={`bg-background rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-secondary`}
                >
                  <span className="sr-only">Close main menu</span>
                  <svg
                    className="h-6 w-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={`#${item.href}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Menu;
