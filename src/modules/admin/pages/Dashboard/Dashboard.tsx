import {
  CheckCircleFilled,
  CloseCircleOutlined,
  InboxOutlined,
  SendOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Card, Col, Descriptions, Row, Space, Spin, Statistic, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import type {
  AdminOverview,
  AdminSystem,
  BootstrapResponse,
  EntityRead,
  LeadStats,
  ReadyResponse,
} from '../../../../api/generated';
import BarChart from '../../../../components/BarChart/BarChart';
import PageContainer from '../../../../components/PageContainer/PageContainer';
import { useFormat } from '../../../../i18n/format';
import { useBootstrapStore } from '../../../../store/bootstrapStore';
import { useCan } from '../../../auth';
import { useRoles } from '../../access';
import { getEntities, getLeadStats, getOverview, getReadiness } from '../../api';
import './Dashboard.css';

const DAYS = 14;
const CHANNELS = 'lead_channels';
const FEATURES = ['authentication', 'admin', 'files', 'notifications', 'background_tasks'] as const;

/**
 * The admin start page: a few counters, a chart and the setup of this site.
 * An example of what a dashboard can show; each card has its own data, so a
 * card whose module is removed simply does not load.
 */
/** Sign-in providers by their name in /bootstrap. */
const PROVIDERS: Record<string, string> = { google: 'Google' };
const CAPTCHAS: Record<string, string> = { turnstile: 'Cloudflare Turnstile' };

/**
 * The setup of this site: profile, versions, sign-in, protection, where the data and
 * the counters live (from /admin/overview), the modules and the live checks of /ready
 * (database, task queue, sessions).
 */
const SystemCard = ({
  config,
  system,
  readiness,
}: {
  config: BootstrapResponse;
  system: AdminSystem;
  readiness: ReadyResponse | 'failed' | null;
}) => {
  const { t } = useTranslation('admin');
  const backend = config.application.version;
  const signIn = config.features.authentication
    ? ['Email', ...config.auth_providers.map((name) => PROVIDERS[name] ?? name)].join(', ')
    : '—';
  const captcha = config.captcha?.provider;
  // With replicas each one would count the rate limits on its own
  const limitsPerProcess = system.rate_limit_storage === 'memory';

  return (
    <Card title={t('overview.system')} className="overview-card">
      <Descriptions column={{ xs: 1, sm: 2, lg: 3 }} size="small">
        <Descriptions.Item label={t('overview.profile')}>
          <Tag color="blue">{config.profile}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label={t('overview.version')}>
          <Space size={4} wrap>
            {backend}
            {/* Both parts of a deploy should be the same release */}
            {__APP_VERSION__ !== backend && (
              <Tag color="warning">
                {t('overview.frontendVersion', { version: __APP_VERSION__ })}
              </Tag>
            )}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label={t('overview.languages')}>
          {config.i18n.languages.map((language) => language.code).join(', ')}
        </Descriptions.Item>
        <Descriptions.Item label={t('overview.signIn')}>{signIn}</Descriptions.Item>
        <Descriptions.Item label={t('overview.captcha')}>
          {captcha ? (CAPTCHAS[captcha] ?? captcha) : t('overview.captchaOff')}
        </Descriptions.Item>
        <Descriptions.Item label={t('overview.apiDocs')}>
          {/* Open only with DEBUG: worth noticing on a live site */}
          {config.api_docs ? (
            <Tag color="warning">{t('overview.apiDocsOpen')}</Tag>
          ) : (
            t('overview.apiDocsClosed')
          )}
        </Descriptions.Item>
        <Descriptions.Item label={t('overview.mail')}>
          {/* Saved in Admin → Settings → Mail: in the log nobody gets the emails */}
          {system.mail_backend === 'console' ? (
            <Tag color="warning">{t('overview.mailConsole')}</Tag>
          ) : (
            'SMTP'
          )}
        </Descriptions.Item>
        <Descriptions.Item label={t('overview.rateLimits')}>
          {limitsPerProcess && config.profile === 'scalable' ? (
            <Tag color="warning">{t('overview.rateLimitsMemory')}</Tag>
          ) : (
            t(limitsPerProcess ? 'overview.rateLimitsMemory' : 'overview.rateLimitsRedis')
          )}
        </Descriptions.Item>
        {system.files_storage && (
          <Descriptions.Item label={t('overview.fileStorage')}>
            {system.files_storage === 's3' ? 'S3' : t('overview.fileStorageLocal')}
          </Descriptions.Item>
        )}
        <Descriptions.Item label={t('overview.sessions')}>
          {t(system.auth_strategy === 'redis' ? 'overview.sessionsRedis' : 'overview.sessionsJwt')}
        </Descriptions.Item>
        <Descriptions.Item label={t('overview.errorTracking')}>
          {system.error_tracking ? 'Sentry' : t('overview.errorTrackingOff')}
        </Descriptions.Item>
        <Descriptions.Item label={t('overview.logs')}>
          {system.log_format === 'json' ? 'JSON' : t('overview.logsText')}
        </Descriptions.Item>
      </Descriptions>

      <Row gutter={[24, 0]}>
        <Col xs={24} lg={12}>
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
        </Col>
        <Col xs={24} lg={12}>
          <Typography.Text type="secondary" className="overview-caption">
            {t('overview.health')}
          </Typography.Text>
          <Health readiness={readiness} />
        </Col>
      </Row>
    </Card>
  );
};

/** The checks of /ready: what the enabled modules depend on answers or not. */
const Health = ({ readiness }: { readiness: ReadyResponse | 'failed' | null }) => {
  const { t } = useTranslation('admin');
  if (readiness === null) return <Spin size="small" />;
  if (readiness === 'failed') {
    return <Typography.Text type="danger">{t('overview.healthFailed')}</Typography.Text>;
  }
  const checks = Object.entries(readiness.checks);
  if (checks.length === 0) {
    return <Typography.Text type="secondary">{t('overview.noChecks')}</Typography.Text>;
  }
  return (
    <Space wrap>
      {checks.map(([name, ok]) => (
        <Tag
          key={name}
          color={ok ? 'success' : 'error'}
          icon={ok ? <CheckCircleFilled /> : <CloseCircleOutlined />}
        >
          {t(`overview.checks.${name}`, { defaultValue: name })}
        </Tag>
      ))}
    </Space>
  );
};

/** The icon of a card; a link to its page when the user may open it. */
const CardLink = ({ to, label, icon }: { to?: string; label: string; icon: ReactNode }) =>
  to ? (
    <Link to={to} aria-label={label} title={label} className="overview-card-link">
      {icon}
    </Link>
  ) : (
    icon
  );

const AdminDashboard = () => {
  const { t } = useTranslation('admin');
  const { roleName } = useRoles();
  const canReadLeads = useCan('leads.read');
  const canReadUsers = useCan('users.read');
  const format = useFormat();
  const config = useBootstrapStore((state) => state.config);
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [leads, setLeads] = useState<LeadStats | null>(null);
  const [channels, setChannels] = useState<EntityRead[] | null>(null);
  const [readiness, setReadiness] = useState<ReadyResponse | 'failed' | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getOverview()
      .then(setOverview)
      .catch(() => setError(true));
    // Asked only when it will be answered
    if (canReadLeads) {
      getLeadStats(DAYS)
        .then(setLeads)
        .catch(() => setLeads(null));
    }
    getReadiness()
      .then(setReadiness)
      .catch(() => setReadiness('failed'));
    getEntities(CHANNELS)
      .then(setChannels)
      .catch(() => setChannels(null));
  }, [canReadLeads]);

  // Users, leads and channels: as many equal columns as there are cards
  const span = 24 / (1 + (leads ? 1 : 0) + (channels ? 1 : 0));

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
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {config && <SystemCard config={config} system={overview.system} readiness={readiness} />}

          {/* The cards share the row equally, however many of them there are */}
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={span}>
              <Card
                title={t('overview.users')}
                extra={
                  <CardLink
                    to={canReadUsers ? '/admin/users' : undefined}
                    label={t('overview.users')}
                    icon={<TeamOutlined />}
                  />
                }
                className="overview-card"
              >
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
                  {Object.entries(overview.users_by_role).map(([role, count]) => (
                    <Tag key={role}>
                      {roleName(role)}: {count}
                    </Tag>
                  ))}
                </Space>
              </Card>
            </Col>

            {leads && (
              <Col xs={24} lg={span}>
                <Card
                  title={t('overview.leads')}
                  extra={
                    <CardLink
                      to="/admin/leads"
                      label={t('overview.leads')}
                      icon={<InboxOutlined />}
                    />
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
                      <Statistic
                        title={t('overview.leadsDone')}
                        value={leads.by_status.done ?? 0}
                      />
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
              <Col xs={24} lg={span}>
                <Card
                  title={t('overview.channels')}
                  extra={
                    <CardLink
                      to="/admin/settings/channels"
                      label={t('overview.channels')}
                      icon={<SendOutlined />}
                    />
                  }
                  className="overview-card"
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
          </Row>
        </Space>
      )}
    </PageContainer>
  );
};

export default AdminDashboard;
