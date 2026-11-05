import { Card, Typography } from 'antd';

import PageContainer from '../../components/PageContainer/PageContainer';

const { Text } = Typography;

const Dashboard = () => {
  return (
    <PageContainer
      title="Client dashboard"
      subtitle="Area for authenticated users"
    >
      <Card>
        <Text>There may be content for ordinary users here.</Text>
      </Card>
    </PageContainer>
  );
};

export default Dashboard;
