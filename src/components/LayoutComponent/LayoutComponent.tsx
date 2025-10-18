import {Outlet, Navigate, Link} from 'react-router-dom';
import { Layout, Menu } from 'antd';
import { useAuthStore } from '../../store/authStore';
import {logout} from "../../api/auth.ts";

const { Header, Content, Footer } = Layout;

const LayoutComponent = () => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Header style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Menu theme="dark" mode="horizontal">
          <Menu.Item key="home">
            <Link to="/">Home</Link>
          </Menu.Item>
          <Menu.Item key="dashboard">
            <Link to="/dashboard">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="profile">
            <Link to="/profile">Profile</Link>
          </Menu.Item>
        </Menu>
        <button onClick={logout} style={{ color: 'white' }}>
          Выйти
        </button>
      </Header>

      <Content style={{ padding: '24px', minHeight: '80vh' }}>
        <Outlet />
      </Content>

      <Footer style={{ textAlign: 'center' }}>© {new Date().getFullYear()} Osnova</Footer>
    </Layout>
  );
};

export default LayoutComponent;