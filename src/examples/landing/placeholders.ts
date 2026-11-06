import type { ImageSource } from '../../components/Image/Image';

/**
 * Lightweight gallery placeholders: inline SVG gradients, no files in the repository.
 * Replace with real photos: put them in src/assets/images/source and run `npm run images`.
 */
export function placeholderImage(hue: number, width = 800, height = 600): ImageSource {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="hsl(${hue} 55% 62%)"/><stop offset="1" stop-color="hsl(${(hue + 40) % 360} 60% 38%)"/>
</linearGradient></defs>
<rect width="100%" height="100%" fill="url(#g)"/>
<circle cx="${width * 0.7}" cy="${height * 0.35}" r="${height * 0.22}" fill="#fff" fill-opacity="0.18"/>
<rect x="${width * 0.12}" y="${height * 0.6}" width="${width * 0.45}" height="${height * 0.18}" rx="16" fill="#fff" fill-opacity="0.22"/>
</svg>`;
  return { src: `data:image/svg+xml,${encodeURIComponent(svg)}`, width, height };
}
