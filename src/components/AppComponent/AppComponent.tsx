import { FC } from 'react';
import { ConfigProvider, App } from 'antd';
import { RouterProvider } from 'react-router-dom';
import routes from '../../routes/routes';
import { theme } from './theme';
// import { AuthProvider } from '../../hooks/useAuth';
// import { DevModeProvider } from '../../hooks/useDebugMode';
import './AppComponent.css';

const AppComponent: FC = () => (
  <ConfigProvider theme={theme}>
    {/*<DevModeProvider>*/}
    {/*  <AuthProvider>*/}
        <App>
          <RouterProvider router={routes} />
        </App>
    {/*  </AuthProvider>*/}
    {/*</DevModeProvider>*/}
  </ConfigProvider>
);

export default AppComponent;