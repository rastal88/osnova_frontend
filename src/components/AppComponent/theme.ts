import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

import { brand } from '../../config/brand';
import type { ThemeMode } from '../../config/brand';

/** Mixes two #rrggbb colours: `weight` of `color` over `base`. */
function mix(color: string, base: string, weight: number): string {
  const channel = (hex: string, index: number) =>
    Number.parseInt(hex.slice(1 + index * 2, 3 + index * 2), 16);
  const value = [0, 1, 2].map((index) =>
    Math.round(channel(color, index) * weight + channel(base, index) * (1 - weight)),
  );
  return `#${value.map((part) => part.toString(16).padStart(2, '0')).join('')}`;
}

/** Ant Design theme for a mode: brand tokens + the light or dark algorithm. */
export function getTheme(mode: ThemeMode): ThemeConfig {
  const palette = brand[mode];

  return {
    algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: palette.primary,
      // The generated tints turn grey for muted brand colours: derive them from the surface
      colorPrimaryBg: mix(palette.primary, palette.surface, 0.1),
      colorPrimaryBgHover: mix(palette.primary, palette.surface, 0.18),
      colorInfo: palette.primary,
      colorTextBase: palette.text,
      colorBgBase: palette.background,
      colorBgLayout: palette.background,
      colorBgContainer: palette.surface,
      colorBgElevated: palette.surface,
      borderRadius: brand.borderRadius,
      fontFamily: brand.fontFamily,
    },
    components: {
      Button: {
        defaultShadow: 'none',
        primaryShadow: 'none',
      },
      Layout: {
        headerBg: palette.surface,
        siderBg: palette.surface,
        footerBg: palette.surface,
        bodyBg: palette.background,
      },
    },
  };
}
