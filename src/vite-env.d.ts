/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL?: string;
  /** Public origin for canonical, hreflang, og:url and sitemap.xml, e.g. https://example.com */
  readonly VITE_SITE_URL?: string;
  /** Default link preview image: absolute URL or a path on the site */
  readonly VITE_OG_IMAGE?: string;
}
