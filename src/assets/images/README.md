# Images

- `source/` — originals (photos as JPEG/PNG/WebP, or SVG artwork). Keep them reasonably sized;
  the largest generated width is 1920 px.
- `generated/` — output of `npm run images`, committed: AVIF, WebP and a JPEG (PNG when the
  source has transparency) at 640 / 1280 / 1920 px (never wider than the source), plus
  `index.ts` with an `ImageSource` per file.

```tsx
import Image from '../components/Image/Image';
import { hero } from '../assets/images/generated';

<Image image={hero} alt="..." sizes="(min-width: 992px) 50vw, 100vw" priority />
```

The file name becomes the export name: `team-photo.jpg` → `teamPhoto`. Run `npm run images`
after adding, changing or removing a source; it rewrites `generated/` completely.
Icons and logos: use SVG directly, they do not need this step.
