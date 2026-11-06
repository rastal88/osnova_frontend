/**
 * Analytics is off unless VITE_ANALYTICS_SCRIPT is set. When it is on, the cookie
 * banner asks for consent and the script is added only after the visitor accepts
 * (src/consent). List the analytics cookies in the cookie policy (legal.json).
 */
export const ANALYTICS_SCRIPT = import.meta.env.VITE_ANALYTICS_SCRIPT || '';

export const analyticsEnabled = ANALYTICS_SCRIPT !== '';

/**
 * Adds the analytics script to the page. Providers that need attributes or init
 * code (e.g. data-domain for Plausible, data-website-id for Umami) are set up here.
 */
export function loadAnalytics() {
  const script = document.createElement('script');
  script.src = ANALYTICS_SCRIPT;
  script.async = true;
  document.head.appendChild(script);
}
