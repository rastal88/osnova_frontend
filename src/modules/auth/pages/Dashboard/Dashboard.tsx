import { Card, Descriptions, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { ClientSummary } from '../../../../api/generated';
import PageContainer from '../../../../components/PageContainer/PageContainer';
import { getClientSummary } from '../../api';

const { Paragraph } = Typography;

// Example page of the client area: data from a client endpoint (/client/summary).
const Dashboard = () => {
  const { t } = useTranslation('auth');
  const [summary, setSummary] = useState<ClientSummary | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getClientSummary()
      .then(setSummary)
      .catch(() => setError(true));
  }, []);

  return (
    <PageContainer
      title={t('dashboard.title')}
      subtitle={t('dashboard.subtitle')}
      noindex
      loading={!summary && !error}
      error={error}
    >
      <Card>
        <Paragraph>{t('dashboard.placeholder')}</Paragraph>
        {summary && (
          <Descriptions column={1} size="small">
            <Descriptions.Item label={t('email')}>{summary.email}</Descriptions.Item>
            <Descriptions.Item label={t('profile.role')}>
              {t(`roles.${summary.role}`)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Card>
    </PageContainer>
  );
};

export default Dashboard;
