/**
 * Site owner details used in the legal pages (/privacy, /terms, /cookies).
 * Texts live in src/locales/<language>/legal.json and are placeholders:
 * fill this file, then review the texts for your country and your data processing.
 * While a value is still in [brackets], the pages show a "template" notice.
 */
export interface LegalConfig {
  /** Company or person responsible for the site and personal data */
  owner: string;
  /** Contact for privacy and legal requests */
  email: string;
  /** Postal address of the owner */
  address: string;
  /** Date the documents were last changed, YYYY-MM-DD */
  updated: string;
}

export const legal: LegalConfig = {
  owner: '[Company name]',
  email: '[privacy@example.com]',
  address: '[Postal address]',
  updated: '2026-11-07',
};

export const isLegalConfigured = (): boolean =>
  !Object.values(legal).some((value) => value.startsWith('['));
