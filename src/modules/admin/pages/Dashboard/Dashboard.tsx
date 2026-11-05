import { Card, Typography, Statistic, Row, Col } from 'antd';
import { UserOutlined, ShoppingCartOutlined, DollarOutlined } from '@ant-design/icons';

const { Title } = Typography;

const AdminDashboard = () => {
  return (
    <Card>
      <Title level={3}>Админ панель</Title>

      <Row gutter={16}>
        <Col span={8}>
          <Statistic title="Пользователи" value={1128} prefix={<UserOutlined />} />
        </Col>
        <Col span={8}>
          <Statistic title="Заказы" value={93} prefix={<ShoppingCartOutlined />} />
        </Col>
        <Col span={8}>
          <Statistic title="Доход" value={5683} prefix={<DollarOutlined />} suffix="₽" />
        </Col>
      </Row>
    </Card>
  );
};

export default AdminDashboard;