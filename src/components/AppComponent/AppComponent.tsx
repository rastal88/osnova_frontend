import { ConfigProvider } from 'antd';
import { createContext, useEffect, useState } from 'react';
import type { ThemeMode } from '../../config/brand';
import { useAntdLocale } from '../../i18n/antdLocale';
import AppRouter from '../../routes/routes';
import BootstrapComponent from '../BootstrapComponent/BootstrapComponent';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import ThemeVariables from './ThemeVariables';
import { getTheme } from './theme';

export const ThemeContext = createContext<{
  themeName: ThemeMode;
  setThemeName: (t: ThemeMode) => void;
}>({
  themeName: 'light',
  setThemeName: () => {},
});

const THEME_KEY = 'app_theme';

const AppComponent = () => {
  const [themeName, setThemeName] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const persisted = localStorage.getItem(THEME_KEY);

      if (persisted === 'dark' || persisted === 'light') {
        return persisted;
      }

      if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }

    return 'light';
  });

  const antdLocale = useAntdLocale();

  useEffect(() => {
    localStorage.setItem(THEME_KEY, themeName);
  }, [themeName]);

  return (
    <ThemeContext.Provider value={{ themeName, setThemeName }}>
      <ConfigProvider theme={getTheme(themeName)} locale={antdLocale}>
        <ThemeVariables mode={themeName} />
        <ErrorBoundary>
          <BootstrapComponent>
            <AppRouter />
          </BootstrapComponent>
        </ErrorBoundary>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export default AppComponent;
