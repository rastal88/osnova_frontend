import {
  LoginOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  SwapOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Button, Drawer, Dropdown, Grid, Layout, Menu } from 'antd';
import type { MenuProps } from 'antd';
import { Suspense, useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';

import {
  type NavItem,
  findActiveNavPath,
  navGroupsOf,
  navigationConfig,
  visibleNavItems,
} from '../../config/navigation';
import { AREA_HOME, areaOfPath, otherArea, useAuthStore } from '../../modules/auth';
import { NotificationBell } from '../../modules/notifications';
import { LEGAL_LINKS } from '../../pages/Legal';
import { useBootstrapStore } from '../../store/bootstrapStore';
import { ThemeContext } from '../AppComponent/AppComponent';
import ThemeSwitcher from '../AppComponent/ThemeSwitcher';
import CookieBanner from '../CookieBanner/CookieBanner';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import PageState from '../PageState/PageState';
import './LayoutComponent.css';

const { Header, Content, Footer, Sider } = Layout;

// Whether the side menu is collapsed to icons, remembered between visits
const COLLAPSED_KEY = 'app_menu_collapsed';

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === 'true';
  } catch {
    return false;
  }
}

function saveCollapsed(collapsed: boolean) {
  try {
    localStorage.setItem(COLLAPSED_KEY, String(collapsed));
  } catch {
    // Storage may be unavailable (private mode): the choice lasts until the page closes.
  }
}

interface LayoutProps {
  /** Menu of this area; the admin area passes its own */
  navItems?: NavItem[];
}

const LayoutComponent = ({ navItems: areaItems = navigationConfig.items }: LayoutProps) => {
  const { t } = useTranslation();
  const { isAuthenticated, isLoading, user, logout } = useAuthStore();
  const features = useBootstrapStore((state) => state.config?.features);
  const application = useBootstrapStore((state) => state.config?.application);
  const appName = application?.name ?? 'Osnova';

  const authEnabled = features?.authentication ?? false;

  const { themeName, setThemeName } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();
  const screens = Grid.useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
    saveCollapsed(!collapsed);
  };

  if (authEnabled && isLoading) {
    return null;
  }

  // Public pages stay public: guests see them with a sign-in button,
  // private pages are guarded by ProtectedRoute.
  const navItems = visibleNavItems(areaItems, features, isAuthenticated ? user : null);
  const area = areaOfPath(location.pathname);
  const switchTo = user ? otherArea(location.pathname, user.areas) : undefined;

  const toMenuItem = (item: NavItem): NonNullable<MenuProps['items']>[number] => {
    const Icon = item.icon;

    return {
      key: item.path,
      icon: Icon ? <Icon /> : undefined,
      label: t(item.label),
      children: item.children?.map(toMenuItem),
    };
  };
  const menuItems: MenuProps['items'] = navItems.map(toMenuItem);

  const activePath = findActiveNavPath(location.pathname, navItems);
  const selectedKeys = activePath ? [activePath] : [];
  // The submenu of the current page starts open
  const openKeys = navGroupsOf(activePath, navItems);

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

  // User menu: profile of the current area, switch to the other area (admin roles), sign out
  const profileMenu: MenuProps = {
    items: [
      { key: 'profile', icon: <SettingOutlined />, label: t('header.profile') },
      ...(switchTo
        ? [
            {
              key: 'switch',
              icon: <SwapOutlined />,
              label: t(switchTo === 'admin' ? 'header.toAdmin' : 'header.toClient'),
            },
          ]
        : []),
      { type: 'divider' as const },
      { key: 'logout', icon: <LogoutOutlined />, label: t('header.logout'), danger: true },
    ],
    onClick: ({ key }) => {
      if (key === 'profile') navigate(area === 'admin' ? '/admin/profile' : '/profile');
      if (key === 'switch' && switchTo) navigate(AREA_HOME[switchTo]);
      if (key === 'logout') void handleLogout();
    },
  };

  const menu = (
    <Menu
      mode={isTop && !isMobile ? 'horizontal' : 'inline'}
      selectedKeys={selectedKeys}
      defaultOpenKeys={openKeys}
      items={menuItems}
      onClick={handleMenuClick}
      className={isTop && !isMobile ? 'app-nav-top' : 'app-nav-sider'}
    />
  );

  const side = navigationConfig.position === 'right' ? 'right' : 'left';
  const sider = showMenu && !isMobile && !isTop && (
    <Sider
      width={220}
      collapsedWidth={64}
      collapsible
      collapsed={collapsed}
      trigger={null}
      theme="light"
      className={`app-sider app-sider-${side}`}
    >
      <div className="app-sider-inner">
        {menu}
        <Button
          type="text"
          icon={(side === 'left') === collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          aria-label={t(collapsed ? 'header.expandMenu' : 'header.collapseMenu')}
          aria-expanded={!collapsed}
          onClick={toggleCollapsed}
          className="app-sider-toggle"
        />
      </div>
    </Sider>
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
            <Link to={area === 'admin' ? AREA_HOME.admin : '/'} className="app-brand">
              {appName}
            </Link>
          )}

          {showMenu && !isMobile && isTop && menu}
        </div>

        <div className="app-header-actions">
          <LanguageSwitcher />
          <ThemeSwitcher value={themeName} onChange={setThemeName} />

          {features?.notifications && isAuthenticated && <NotificationBell />}

          {authEnabled && !isAuthenticated && (
            <Button
              icon={<LoginOutlined />}
              aria-label={t('pages.login')}
              onClick={() => navigate('/login')}
            >
              {!isMobile && t('pages.login')}
            </Button>
          )}

          {authEnabled && isAuthenticated && (
            <Dropdown menu={profileMenu} placement="bottomRight" trigger={['click']} arrow>
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
        {side === 'left' && sider}

        {/* The footer sits next to the side menu, so it never pushes the sticky menu up */}
        <Layout className="app-main">
          <Content className="app-content">
            {/* Pages suspend while their translations load */}
            <Suspense fallback={<PageState kind="loading" />}>
              <Outlet />
            </Suspense>
          </Content>

          <Footer className="footer">
            <span>
              © {new Date().getFullYear()} {appName}
            </span>
            {/* Contacts from Admin → Settings → Site */}
            {(application?.contact_email || application?.contact_phone) && (
              <address className="footer-links" aria-label={t('footer.contacts')}>
                {application.contact_email && (
                  <a href={`mailto:${application.contact_email}`}>{application.contact_email}</a>
                )}
                {application.contact_phone && (
                  <a href={`tel:${application.contact_phone.replace(/[^\d+]/g, '')}`}>
                    {application.contact_phone}
                  </a>
                )}
              </address>
            )}
            <nav className="footer-links" aria-label={t('footer.legal')}>
              {LEGAL_LINKS.map((link) => (
                <Link key={link.path} to={link.path}>
                  {t(`pages.${link.document}`)}
                </Link>
              ))}
            </nav>
          </Footer>
        </Layout>

        {side === 'right' && sider}
      </Layout>

      <CookieBanner />

      {showMenu && (
        <Drawer
          title={appName}
          placement={navigationConfig.position === 'right' ? 'right' : 'left'}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          styles={{ body: { padding: 0 } }}
        >
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            defaultOpenKeys={openKeys}
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
