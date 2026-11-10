import {
  CheckCircleFilled,
  CloseCircleOutlined,
  InboxOutlined,
  SendOutlined,
  SettingOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Button, Card, Col, Descriptions, Row, Space, Statistic, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import type { AdminOverview, EntityRead, LeadStats, Role } from '../../../../api/generated';
import BarChart from '../../../../components/BarChart/BarChart';
import PageContainer from '../../../../components/PageContainer/PageContainer';
import { useFormat } from '../../../../i18n/format';
import { useBootstrapStore } from '../../../../store/bootstrapStore';
import { getEntities, getLeadStats, getOverview } from '../../api';
import './Dashboard.css';

const ROLES: Role[] = ['root', 'moderator', 'user'];
const DAYS = 14;
const CHANNELS = 'lead_channels';
const FEATURES = ['authentication', 'admin', 'files', 'notifications', 'background_tasks'] as const;

/**
 * The admin start page: a few counters, a chart and the setup of this site.
 * An example of what a dashboard can show; each card has its own data, so a
 * card whose module is removed simply does not load.
 */
const AdminDashboard = () => {
  const { t } = useTranslation(['admin', 'auth']);
  const format = useFormat();
  const config = useBootstrapStore((state) => state.config);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [leads, setLeads] = useState<LeadStats | null>(null);
  const [channels, setChannels] = useState<EntityRead[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getOverview()
      .then(setOverview)
      .catch(() => setError(true));
    getLeadStats(DAYS)
      .then(setLeads)
      .catch(() => setLeads(null));
    getEntities(CHANNELS)
      .then(setChannels)
      .catch(() => setChannels(null));
  }, []);

  const dayLabel = (date: string) =>
    format.date(date, { day: 'numeric', month: 'short', timeZone: 'UTC' });

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
          <Col xs={24} lg={8}>
            <Card title={t('overview.users')} extra={<TeamOutlined />} className="overview-card">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic title={t('overview.users')} value={overview.users} />
                </Col>
                <Col span={12}>
                  <Statistic title={t('overview.activeUsers')} value={overview.active_users} />
                </Col>
              </Row>
              <Typography.Text type="secondary" className="overview-caption">
                {t('overview.byRole')}
              </Typography.Text>
              <Space wrap>
                {ROLES.map((role) => (
                  <Tag key={role}>
                    {t(`auth:roles.${role}`)}: {overview.users_by_role[role] ?? 0}
                  </Tag>
                ))}
              </Space>
            </Card>
          </Col>

          {leads && (
            <Col xs={24} lg={16}>
              <Card
                title={t('overview.leads')}
                extra={
                  <Link to="/admin/leads">
                    <Button type="link" icon={<InboxOutlined />}>
                      {t('overview.openLeads')}
                    </Button>
                  </Link>
                }
                className="overview-card"
              >
                <Row gutter={16}>
                  <Col span={8}>
                    <Statistic title={t('overview.leads')} value={leads.total} />
                  </Col>
                  <Col span={8}>
                    <Statistic title={t('overview.leadsNew')} value={leads.by_status.new ?? 0} />
                  </Col>
                  <Col span={8}>
                    <Statistic title={t('overview.leadsDone')} value={leads.by_status.done ?? 0} />
                  </Col>
                </Row>
                <Typography.Text type="secondary" className="overview-caption">
                  {t('overview.leadsPerDay', { days: DAYS })}
                </Typography.Text>
                <BarChart
                  title={t('overview.leadsPerDay', { days: DAYS })}
                  bars={leads.by_day.map((day) => ({
                    label: dayLabel(day.date),
                    value: day.count,
                  }))}
                />
              </Card>
            </Col>
          )}

          {channels && (
            <Col xs={24} lg={8}>
              <Card
                title={t('overview.channels')}
                extra={<SendOutlined />}
                className="overview-card"
                actions={[
                  <Link key="setup" to="/admin/settings/channels">
                    <SettingOutlined /> {t('overview.openChannels')}
                  </Link>,
                ]}
              >
                {channels.length === 0 ? (
                  <Typography.Text type="secondary">{t('overview.noChannels')}</Typography.Text>
                ) : (
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic title={t('overview.channelsTotal')} value={channels.length} />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title={t('overview.channelsEnabled')}
                        value={channels.filter((channel) => channel.enabled).length}
                      />
                    </Col>
                  </Row>
                )}
              </Card>
            </Col>
          )}

          {config && (
            <Col xs={24} lg={16}>
              <Card title={t('overview.system')} className="overview-card">
                <Descriptions column={{ xs: 1, sm: 3 }} size="small">
                  <Descriptions.Item label={t('overview.profile')}>
                    <Tag color="blue">{config.profile}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label={t('overview.version')}>
                    {config.application.version}
                  </Descriptions.Item>
                  <Descriptions.Item label={t('overview.languages')}>
                    {config.i18n.languages.map((language) => language.code).join(', ')}
                  </Descriptions.Item>
                </Descriptions>
                <Typography.Text type="secondary" className="overview-caption">
                  {t('overview.modules')}
                </Typography.Text>
                <Space wrap>
                  {FEATURES.map((feature) => {
                    const on = config.features[feature];
                    return (
                      <Tag
                        key={feature}
                        color={on ? 'success' : 'default'}
                        icon={on ? <CheckCircleFilled /> : <CloseCircleOutlined />}
                      >
                        {t(`overview.features.${feature}`)}
                      </Tag>
                    );
                  })}
                </Space>
              </Card>
            </Col>
          )}
        </Row>
      )}
    </PageContainer>
  );
};

export default AdminDashboard;
