import { useEffect, useState, createContext } from 'react';
import { ConfigProvider } from 'antd';
import { RouterProvider } from 'react-router-dom';
import routes from '../../routes/routes';
import { getTheme } from './theme';
import { useAuthStore } from '../../store/authStore';
import './AppComponent.css';

export const ThemeContext = createContext<{
  themeName: 'light' | 'dark';
  setThemeName: (t: 'light' | 'dark') => void;
}>({ themeName: 'light', setThemeName: () => {} });

const THEME_KEY = 'app_theme';

const AppComponent = () => {
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const [themeName, setThemeName] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const persisted = localStorage.getItem(THEME_KEY);
      if (persisted === 'dark' || persisted === 'light') return persisted;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  useEffect(() => {
    void fetchUser();
  }, []);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, themeName);
    document.body.dataset.theme = themeName;
  }, [themeName]);

  return (
    <ThemeContext.Provider value={{ themeName, setThemeName }}>
      <ConfigProvider theme={getTheme(themeName)}>
        <RouterProvider router={routes} />
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export default AppComponent;