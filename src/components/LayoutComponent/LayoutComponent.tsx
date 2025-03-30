import { Layout, Menu, Button } from 'antd';
import { Link, Outlet } from 'react-router-dom';
import { HomeOutlined, DashboardOutlined, UserOutlined } from '@ant-design/icons';

const { Header, Content, Footer } = Layout;

const LayoutComponent = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div className="demo-logo" />
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['1']}
          items={[
            {
              key: '1',
              icon: <HomeOutlined />,
              label: <Link to="/">Главная</Link>,
            },
            {
              key: '2',
              icon: <DashboardOutlined />,
              label: <Link to="/dashboard">Дашборд</Link>,
            },
          ]}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>

      <Content style={{ padding: '0 48px' }}>
        <div style={{ padding: 24, minHeight: 380 }}>
          <Outlet />
        </div>
      </Content>

      <Footer style={{ textAlign: 'center' }}>
        <Link to="/profile">
          <Button type="link" icon={<UserOutlined />}>Профиль</Button>
        </Link>
        {/* Здесь можно добавить переключатель языка */}
      </Footer>
    </Layout>
  );
};

export default LayoutComponent;