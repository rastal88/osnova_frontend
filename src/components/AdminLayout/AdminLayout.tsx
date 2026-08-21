import React, { useContext } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { useAuthStore } from '../../store/authStore';
import ThemeSwitcher from '../AppComponent/ThemeSwitcher';
import { ThemeContext } from '../AppComponent/AppComponent';

const { Header, Content, Footer } = Layout;

const AdminLayout = () => {
  const { logout } = useAuthStore();
  const { themeName, setThemeName } = useContext(ThemeContext);
  return (
    <Layout>
      <Header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <Menu theme="dark" mode="horizontal">
            <Menu.Item key="dashboard">
              <Link to="/admin/dashboard">Admin Dashboard</Link>
            </Menu.Item>
            <Menu.Item key="profile">
              <Link to="/admin/profile">Profile</Link>
            </Menu.Item>
          </Menu>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <ThemeSwitcher value={themeName} onChange={setThemeName} />
          <button onClick={logout} style={{ color: 'white' }}>
            Выйти
          </button>
        </div>
      </Header>

      <Content style={{ padding: '24px', minHeight: '80vh' }}>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: 'center' }}>© {new Date().getFullYear()} Osnova Admin</Footer>
    </Layout>
  );
};

export default AdminLayout;