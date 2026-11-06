import { Card, Typography, Statistic, Row, Col } from 'antd';
import { UserOutlined, ShoppingCartOutlined, DollarOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

const AdminDashboard = () => {
  const { t } = useTranslation('admin');

  return (
    <Card>
      <Title level={3}>{t('dashboard.title')}</Title>

      <Row gutter={16}>
        <Col span={8}>
          <Statistic title={t('dashboard.users')} value={1128} prefix={<UserOutlined />} />
        </Col>
        <Col span={8}>
          <Statistic title={t('dashboard.orders')} value={93} prefix={<ShoppingCartOutlined />} />
        </Col>
        <Col span={8}>
          <Statistic title={t('dashboard.revenue')} value={5683} prefix={<DollarOutlined />} />
        </Col>
      </Row>
    </Card>
  );
};

export default AdminDashboard;