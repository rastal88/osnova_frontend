/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_URL?: string;
  /** Public origin for canonical, hreflang, og:url and sitemap.xml, e.g. https://example.com */
  readonly VITE_SITE_URL?: string;
  /** Default link preview image: absolute URL or a path on the site */
  readonly VITE_OG_IMAGE?: string;
  /** Analytics script URL; when set, a cookie banner asks for consent before loading it */
  readonly VITE_ANALYTICS_SCRIPT?: string;
  /** Sentry (or GlitchTip) DSN; when set, errors are reported (src/errorTracking) */
  readonly VITE_SENTRY_DSN?: string;
  readonly VITE_SENTRY_ENVIRONMENT?: string;
}

/** The version from package.json (vite.config.ts) */
declare const __APP_VERSION__: string;
