import type { CSSProperties } from 'react';

/**
 * An image with its intrinsic size and optional modern formats.
 * `npm run images` generates these for files in src/assets/images/source
 * (see src/assets/images/README.md); a plain file works too: { src, width, height }.
 */
export interface ImageSource {
  src: string;
  width: number;
  height: number;
  /** Responsive variants: "a.avif 640w, b.avif 1280w" */
  srcSet?: string;
  avif?: string;
  webp?: string;
}

interface ImageProps {
  image: ImageSource;
  alt: string;
  /** Rendered width, for picking a variant: "(min-width: 768px) 50vw, 100vw" */
  sizes?: string;
  /** Above the fold (hero): load at once with high priority */
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * <picture> with AVIF / WebP sources and a fallback <img>: lazy by default,
 * decoded off the main thread, and sized up front so the layout does not jump.
 */
const Image = ({ image, alt, sizes = '100vw', priority = false, className, style }: ImageProps) => (
  <picture className={className}>
    {image.avif && <source type="image/avif" srcSet={image.avif} sizes={sizes} />}
    {image.webp && <source type="image/webp" srcSet={image.webp} sizes={sizes} />}
    <img
      src={image.src}
      srcSet={image.srcSet}
      sizes={image.srcSet ? sizes : undefined}
      width={image.width}
      height={image.height}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
      style={{ maxWidth: '100%', height: 'auto', ...style }}
    />
  </picture>
);

export default Image;
