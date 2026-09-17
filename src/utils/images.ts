// Image source rewrites for the hand-rolled <picture> markup.
//
// The site is a static export, so there is no Next image optimizer: every
// responsive source is a string the components build themselves from the paths
// in src/config/index.json and src/data/offers.json. These three helpers used
// to live as private copies inside MainHeroImage, Product, Header and
// pages/index; they are shared here so the behaviour has one definition and can
// be tested. Each one returns its input unchanged when it does not recognise
// the source, which is what keeps an SVG logo or an already-converted file from
// being rewritten into a 404.

/** `foo.png` / `foo.jpg` / `foo.jpeg` -> `foo.webp`. Anything else is returned as-is. */
export const toWebp = (src: string) => src.replace(/\.(png|jpe?g)$/i, '.webp');

/**
 * Swap the width in a source that already carries a `-<n>w` suffix, keeping its
 * extension: `hero-961w.webp` -> `hero-640w.webp`. A source without the suffix
 * has no such variant on disk, so it is left alone rather than guessed at.
 */
export const withKnownWidth = (src: string, width: number) => {
  if (!/-\d+w\.(png|jpe?g|webp)$/i.test(src)) return src;
  return src.replace(/-\d+w\.(png|jpe?g|webp)$/i, `-${width}w.$1`);
};

/**
 * Point a source at a `-<n>w` variant in the requested format, adding the width
 * suffix when there isn't one and replacing it when there is:
 * `skv-logo.webp` -> `skv-logo-64w.webp`.
 */
export const withWidthVariant = (
  src: string,
  width: number,
  ext: 'png' | 'webp'
) => {
  if (!src) return src;
  if (!/\.(png|jpe?g|webp)$/i.test(src)) return src;
  return src.replace(/(-\d+w)?\.(png|jpe?g|webp)$/i, `-${width}w.${ext}`);
};
