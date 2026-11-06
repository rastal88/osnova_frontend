import { Suspense, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Outlet,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  Layout,
  Menu,
  Drawer,
  Button,
  Dropdown,
  Grid,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  UserOutlined,
  LoginOutlined,
  LogoutOutlined,
  SettingOutlined,
  MenuOutlined,
} from '@ant-design/icons';

import { useAuthStore } from '../../modules/auth';
import { LEGAL_LINKS } from '../../pages/Legal';
import { useBootstrapStore } from '../../store/bootstrapStore';
import CookieBanner from '../CookieBanner/CookieBanner';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import PageState from '../PageState/PageState';
import ThemeSwitcher from '../AppComponent/ThemeSwitcher';
import { ThemeContext } from '../AppComponent/AppComponent';
import {
  findActiveNavPath,
  navigationConfig,
} from '../../config/navigation';
import './LayoutComponent.css';

const { Header, Content, Footer, Sider } = Layout;

const LayoutComponent = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, user, logout } = useAuthStore();
  const features = useBootstrapStore((state) => state.config?.features);
  const appName =
    useBootstrapStore((state) => state.config?.application.name) ?? 'Osnova';

  const authEnabled = features?.authentication ?? false;

  const { themeName, setThemeName } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const screens = Grid.useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (authEnabled && isLoading) {
    return null;
  }

  // Public pages stay public: guests see them with a sign-in button,
  // private pages are guarded by ProtectedRoute.
  const navItems = navigationConfig.items.filter(
    (item) =>
      (!item.capability || Boolean(features?.[item.capability])) &&
      (!item.requiresAuth || isAuthenticated) &&
      (!item.roles || (user !== null && item.roles.includes(user.role))),
  );

  const menuItems: MenuProps['items'] = navItems.map((item) => {
    const Icon = item.icon;

    return {
      key: item.path,
      icon: Icon ? <Icon /> : undefined,
      label: t(item.label),
    };
  });

  const activePath = findActiveNavPath(location.pathname, navItems);
  const selectedKeys = activePath ? [activePath] : [];

  const showMenu = navigationConfig.enabled && navItems.length > 0;
  const isMobile = screens.md === false;
  const isTop = navigationConfig.position === 'top';

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key);
    setDrawerOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const profileMenu = (
    <div className="profile-menu">
      <Button
        type="text"
        icon={<SettingOutlined />}
        className="profile-menu-item"
        onClick={() => navigate('/profile')}
      >
        {t('header.profile')}
      </Button>

      <Button
        danger
        type="text"
        icon={<LogoutOutlined />}
        className="profile-menu-item profile-menu-logout"
        onClick={() => void handleLogout()}
      >
        {t('header.logout')}
      </Button>
    </div>
  );

  const menu = (
    <Menu
      mode={isTop && !isMobile ? 'horizontal' : 'inline'}
      selectedKeys={selectedKeys}
      items={menuItems}
      onClick={handleMenuClick}
      className={isTop && !isMobile ? 'app-nav-top' : 'app-nav-sider'}
    />
  );

  return (
    <Layout className="app-shell">
      <Header className="app-header">
        <div className="app-header-left">
          {showMenu && isMobile && (
            <Button
              type="text"
              aria-label={t('header.openMenu')}
              icon={<MenuOutlined />}
              onClick={() => setDrawerOpen(true)}
              className="app-menu-trigger"
            />
          )}

          {navigationConfig.showBrand && (
            <Link to="/" className="app-brand">
              {appName}
            </Link>
          )}

          {showMenu && !isMobile && isTop && menu}
        </div>

        <div className="app-header-actions">
          <LanguageSwitcher />
          <ThemeSwitcher value={themeName} onChange={setThemeName} />

          {authEnabled && !isAuthenticated && (
            <Button icon={<LoginOutlined />} onClick={() => navigate('/login')}>
              {t('pages.login')}
            </Button>
          )}

          {authEnabled && isAuthenticated && (
            <Dropdown
              overlay={profileMenu}
              placement="bottomRight"
              trigger={['click']}
              arrow
            >
              <Button
                type="text"
                aria-label={t('header.openProfileMenu')}
                icon={<UserOutlined style={{ fontSize: 20 }} />}
                className="app-profile-trigger"
              />
            </Dropdown>
          )}
        </div>
      </Header>

      <Layout className="app-body">
        {showMenu &&
          !isMobile &&
          !isTop &&
          navigationConfig.position === 'left' && (
            <Sider
              width={220}
              theme="light"
              className="app-sider app-sider-left"
            >
              {menu}
            </Sider>
          )}

        <Content className="app-content">
          {/* Pages suspend while their translations load */}
          <Suspense fallback={<PageState kind="loading" />}>
            <Outlet />
          </Suspense>
        </Content>

        {showMenu &&
          !isMobile &&
          !isTop &&
          navigationConfig.position === 'right' && (
            <Sider
              width={220}
              theme="light"
              className="app-sider app-sider-right"
            >
              {menu}
            </Sider>
          )}
      </Layout>

      <Footer className="footer">
        <span>
          © {new Date().getFullYear()} {appName}
        </span>
        <nav className="footer-links" aria-label={t('footer.legal')}>
          {LEGAL_LINKS.map((link) => (
            <Link key={link.path} to={link.path}>
              {t(`pages.${link.document}`)}
            </Link>
          ))}
        </nav>
      </Footer>

      <CookieBanner />

      {showMenu && (
        <Drawer
          title={appName}
          placement={
            navigationConfig.position === 'right' ? 'right' : 'left'
          }
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          styles={{ body: { padding: 0 } }}
        >
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            items={menuItems}
            onClick={handleMenuClick}
            className="app-nav-sider"
          />
        </Drawer>
      )}
    </Layout>
  );
};

export default LayoutComponent;
