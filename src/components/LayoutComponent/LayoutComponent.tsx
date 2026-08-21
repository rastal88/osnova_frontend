import { useContext } from 'react';
import { Outlet, Navigate, Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Dropdown, Button } from 'antd';
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../store/authStore';
import { logout } from '../../api/auth.ts';
import ThemeSwitcher from '../AppComponent/ThemeSwitcher';
import { ThemeContext } from '../AppComponent/AppComponent';
import './LayoutComponent.css';

const { Header, Content, Footer } = Layout;

const LayoutComponent = () => {
  const { isAuthenticated } = useAuthStore();
  const { themeName, setThemeName } = useContext(ThemeContext);
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const handleLogout = () => {
    logout();
  };

  const menu = (
  <div className="profile-menu">
    <Button
      type="text"
      icon={<SettingOutlined />}
      className="profile-menu-item"
      onClick={handleProfileClick}
    >
      Profile
    </Button>

    <Button
      danger
      type="text"
      icon={<LogoutOutlined />}
      className="profile-menu-item profile-menu-logout"
      onClick={handleLogout}
    >
      Log out
    </Button>
  </div>
);

  return (
    <Layout>
      <Header className="app-header">
          <div className="app-header-menu">
              <Menu mode="horizontal">
                  <Menu.Item key="home">
                      <Link to="/">Home</Link>
                  </Menu.Item>

                  <Menu.Item key="dashboard">
                      <Link to="/dashboard">Dashboard</Link>
                  </Menu.Item>
              </Menu>
          </div>

          <div className="app-header-theme">
              <ThemeSwitcher
                  value={themeName}
                  onChange={setThemeName}
              />
          </div>

          <div className="app-header-profile">
              <Dropdown
                  overlay={menu}
            placement="bottomRight"
            trigger={['click']}
            arrow
          >
            <Button
              type="text"
              icon={<UserOutlined style={{ fontSize: 22 }} />}
            />
          </Dropdown>
        </div>
      </Header>

      <Content style={{ padding: '24px', minHeight: '80vh' }}>
        <Outlet />
      </Content>

      <Footer className="footer">
        © {new Date().getFullYear()} Osnova
      </Footer>
    </Layout>
  );
};

export default LayoutComponent;