import { CheckCircleOutlined, TeamOutlined } from '@ant-design/icons';
import { Card, Col, Row, Statistic } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { AdminOverview, Role } from '../../../../api/generated';
import PageContainer from '../../../../components/PageContainer/PageContainer';
import { getOverview } from '../../api';

const ROLES: Role[] = ['root', 'moderator', 'user'];

const AdminDashboard = () => {
  const { t } = useTranslation(['admin', 'auth']);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getOverview()
      .then(setOverview)
      .catch(() => setError(true));
  }, []);

  return (
    <PageContainer
      title={t('overview.title')}
      subtitle={t('overview.subtitle')}
      noindex
      loading={!overview && !error}
      error={error}
    >
      {overview && (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Card>
              <Statistic
                title={t('overview.users')}
                value={overview.users}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card>
              <Statistic
                title={t('overview.activeUsers')}
                value={overview.active_users}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </Col>
          {ROLES.map((role) => (
            <Col key={role} xs={24} sm={8}>
              <Card>
                <Statistic
                  title={t(`auth:roles.${role}`)}
                  value={overview.users_by_role[role] ?? 0}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </PageContainer>
  );
};

export default AdminDashboard;
