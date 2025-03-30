import { Card, Typography } from 'antd';

const { Title } = Typography;

const Dashboard = () => {
  return (
    <Card>
      <Title level={3}>Клиентский дашборд</Title>
      <p>Здесь может быть контент для обычных пользователей</p>
    </Card>
  );
};

export default Dashboard;