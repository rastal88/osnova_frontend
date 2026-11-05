import { useEffect } from 'react';

import { useBootstrapStore } from '../../store/bootstrapStore';

interface SeoProps {
  title?: string;
  titleKey?: string;
  description?: string;
  descriptionKey?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
}

export const Seo = ({
  title,
  titleKey,
  description,
  descriptionKey,
  ogTitle,
  ogDescription,
  ogImage,
  canonical,
}: SeoProps) => {
  const config = useBootstrapStore((state: any) => state.config);
  const appName = config?.application.name ?? 'Osnova';

  const finalTitle = title ?? titleKey ?? 'Home';
  const finalDescription = description ?? descriptionKey ?? '';
  const finalOgTitle = ogTitle ?? finalTitle;
  const finalOgDescription = ogDescription ?? finalDescription;

  useEffect(() => {
    document.title = `${finalTitle} – ${appName}`;
  }, [finalTitle, appName]);

  useEffect(() => {
    const updateMeta = (selector: string, content: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        document.head.appendChild(el);
      }
      (el as HTMLMetaElement).content = content;
    };

    updateMeta('meta[name="description"]', finalDescription);
    updateMeta('meta[name="og:title"]', finalOgTitle);
    updateMeta('meta[name="og:description"]', finalOgDescription);
    if (ogImage) updateMeta('meta[name="og:image"]', ogImage);
    if (canonical) {
      let linkEl = document.querySelector('link[rel="canonical"]');
      if (!linkEl) {
        linkEl = document.createElement('link');
        document.head.appendChild(linkEl);
      }
      (linkEl as HTMLLinkElement).rel = 'canonical';
      (linkEl as HTMLLinkElement).href = canonical;
    }

    return () => {
      // cleanup? optional
    };
  }, [finalDescription, finalOgTitle, finalOgDescription, ogImage, canonical]);

  return null;
};

export default Seo;
