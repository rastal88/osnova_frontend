import { Card, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

import PageContainer from '../../../../components/PageContainer/PageContainer';

const { Text } = Typography;

const Dashboard = () => {
  const { t } = useTranslation('auth');

  return (
    <PageContainer title={t('dashboard.title')} subtitle={t('dashboard.subtitle')}>
      <Card>
        <Text>{t('dashboard.placeholder')}</Text>
      </Card>
    </PageContainer>
  );
};

export default Dashboard;
