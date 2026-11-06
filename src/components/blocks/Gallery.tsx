import type { ReactNode } from 'react';

import Image from '../Image/Image';
import type { ImageSource } from '../Image/Image';
import Section from './Section';
import type { SectionProps } from './Section';

export interface GalleryItem {
  image: ImageSource;
  alt: string;
  caption?: ReactNode;
}

export interface GalleryProps extends Omit<SectionProps, 'children'> {
  items: GalleryItem[];
}

/** Image grid with captions; images load lazily as they scroll into view. */
const Gallery = ({ items, ...section }: GalleryProps) => (
  <Section {...section}>
    <div className="block-gallery">
      {items.map((item, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: items are static content
        <figure key={index} className="block-gallery-item">
          <Image
            image={item.image}
            alt={item.alt}
            sizes="(min-width: 992px) 33vw, (min-width: 576px) 50vw, 100vw"
            className="block-gallery-image"
          />
          {item.caption && <figcaption>{item.caption}</figcaption>}
        </figure>
      ))}
    </div>
  </Section>
);

export default Gallery;
