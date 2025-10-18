import { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { RouterProvider } from 'react-router-dom';
import routes from '../../routes/routes';
import { theme } from './theme';
import { useAuthStore } from '../../store/authStore';
import './AppComponent.css';

const AppComponent = () => {
  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    void fetchUser();
  }, []);

  return (
    <ConfigProvider theme={theme}>
      <RouterProvider router={routes} />
    </ConfigProvider>
  );
};

export default AppComponent;