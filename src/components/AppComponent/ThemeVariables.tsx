import { theme } from 'antd';
import { useLayoutEffect } from 'react';

import type { ThemeMode } from '../../config/brand';

/**
 * Writes the current Ant Design tokens to CSS variables on <html>, so custom CSS
 * uses the same colours as the components: var(--color-primary), var(--color-surface)...
 */
const ThemeVariables = ({ mode }: { mode: ThemeMode }) => {
  const { token } = theme.useToken();

  useLayoutEffect(() => {
    const variables: Record<string, string> = {
      '--color-primary': token.colorPrimary,
      '--color-primary-hover': token.colorPrimaryHover,
      '--color-primary-bg': token.colorPrimaryBg,
      '--color-bg': token.colorBgLayout,
      '--color-surface': token.colorBgContainer,
      '--color-text': token.colorText,
      '--color-text-secondary': token.colorTextSecondary,
      '--color-text-tertiary': token.colorTextTertiary,
      '--color-border': token.colorBorderSecondary,
      '--color-fill': token.colorFillTertiary,
      '--color-success': token.colorSuccess,
      '--color-error': token.colorError,
      '--radius': `${token.borderRadius}px`,
      '--radius-lg': `${token.borderRadiusLG}px`,
      '--shadow': token.boxShadowTertiary,
    };
    const root = document.documentElement;
    for (const [name, value] of Object.entries(variables)) root.style.setProperty(name, value);
    root.dataset.theme = mode;
    root.style.colorScheme = mode;
  }, [token, mode]);

  return null;
};

export default ThemeVariables;
