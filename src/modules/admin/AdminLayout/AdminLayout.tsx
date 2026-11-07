import { Button, Layout, Menu } from 'antd';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet } from 'react-router-dom';
import { ThemeContext } from '../../../components/AppComponent/AppComponent';
import ThemeSwitcher from '../../../components/AppComponent/ThemeSwitcher';
import LanguageSwitcher from '../../../components/LanguageSwitcher/LanguageSwitcher';
import { useAuthStore } from '../../auth/authStore';

const { Header, Content, Footer } = Layout;

const AdminLayout = () => {
  const { t } = useTranslation('admin');
  const { logout } = useAuthStore();
  const { themeName, setThemeName } = useContext(ThemeContext);
  return (
    <Layout>
      <Header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: 1 }}>
          <Menu mode="horizontal">
            <Menu.Item key="dashboard">
              <Link to="/admin/dashboard">{t('menu.dashboard')}</Link>
            </Menu.Item>
            <Menu.Item key="profile">
              <Link to="/admin/profile">{t('menu.profile')}</Link>
            </Menu.Item>
          </Menu>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <LanguageSwitcher />
          <ThemeSwitcher value={themeName} onChange={setThemeName} />
          <Button type="text" onClick={logout}>
            {t('logout')}
          </Button>
        </div>
      </Header>

      <Content style={{ padding: '24px', minHeight: '80vh' }}>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: 'center' }}>
        © {new Date().getFullYear()} Osnova {t('footer')}
      </Footer>
    </Layout>
  );
};

export default AdminLayout;
