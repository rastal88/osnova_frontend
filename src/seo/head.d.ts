export interface HeadTag {
  tag: 'meta' | 'link';
  attrs: Record<string, string>;
}

export interface HeadInput {
  title: string;
  siteName: string;
  description?: string;
  siteUrl?: string;
  path: string;
  language: string;
  languages: string[];
  defaultLanguage: string;
  image?: string;
  noindex?: boolean;
}

export function pageUrl(siteUrl: string, language: string, path: string): string;
export function buildHead(input: HeadInput): { title: string; tags: HeadTag[] };
export function renderTags(tags: HeadTag[]): string;
export function escapeHtml(value: unknown): string;
