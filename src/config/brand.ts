/**
 * Brand: the only place for colours, radius and font.
 * Ant Design themes are built from it (src/components/AppComponent/theme.ts),
 * and the derived colours are exposed to custom CSS as variables
 * (--color-primary, --color-bg, --color-surface, ... see ThemeVariables).
 */
export type ThemeMode = 'light' | 'dark';

export interface BrandPalette {
  primary: string;
  /** Page background */
  background: string;
  /** Header, footer, cards, inputs, popups */
  surface: string;
  text: string;
}

export interface Brand {
  fontFamily: string;
  borderRadius: number;
  light: BrandPalette;
  dark: BrandPalette;
}

export const brand: Brand = {
  fontFamily: "Roboto, system-ui, -apple-system, 'Segoe UI', sans-serif",
  borderRadius: 8,
  light: {
    primary: '#3b516a',
    background: '#f1f5f8',
    surface: '#ffffff',
    text: '#213547',
  },
  dark: {
    primary: '#1677ff',
    background: '#10141a',
    surface: '#1d2129',
    text: '#f5f7fa',
  },
};
