import { Card, Typography } from 'antd';

const { Title } = Typography;

const Dashboard = () => {
  return (
    <Card>
      <Title level={3}>Client dashboard</Title>
      	<p>There may be content for ordinary users here</p>
    </Card>
  );
};

export default Dashboard;