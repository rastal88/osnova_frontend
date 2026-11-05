import { createContext, useEffect, useState } from 'react';
import { ConfigProvider } from 'antd';
import AppRouter from '../../routes/routes';
import BootstrapComponent from '../BootstrapComponent/BootstrapComponent';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';
import { TranslationProvider } from '../i18n/index.tsx';
import { getTheme } from './theme';
import './AppComponent.css';

// eslint-disable-next-line react-refresh/only-export-components
export const ThemeContext = createContext<{
  themeName: 'light' | 'dark';
  setThemeName: (t: 'light' | 'dark') => void;
}>({
  themeName: 'light',
  setThemeName: () => {},
});

const THEME_KEY = 'app_theme';

const AppComponent = () => {
  const [themeName, setThemeName] = useState<'light' | 'dark'>(() => {
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

  useEffect(() => {
    localStorage.setItem(THEME_KEY, themeName);
    document.body.dataset.theme = themeName;
  }, [themeName]);

  return (
    <TranslationProvider>
      <ThemeContext.Provider value={{ themeName, setThemeName }}>
        <ConfigProvider theme={getTheme(themeName)}>
          <ErrorBoundary>
            <BootstrapComponent>
              <AppRouter />
            </BootstrapComponent>
          </ErrorBoundary>
        </ConfigProvider>
      </ThemeContext.Provider>
    </TranslationProvider>
  );
};

export default AppComponent;
