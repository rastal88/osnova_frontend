import { Button, Space, Tag, Typography } from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  GithubOutlined,
  ReadOutlined,
} from '@ant-design/icons';
import { Trans, useTranslation } from 'react-i18next';

import { useBootstrapStore } from '../../store/bootstrapStore';
import type { BootstrapFeatures } from '../../api/bootstrap';
import {
  API_DOCS_URL,
  GITHUB_BACKEND_URL,
  GITHUB_FRONTEND_URL,
} from '../../utils/constants';
import Seo from '../../components/Seo/Seo';
import './Home.css';

const { Title, Paragraph, Text } = Typography;

const FEATURES: (keyof BootstrapFeatures)[] = [
  'authentication',
  'admin',
  'files',
  'notifications',
  'background_tasks',
];

const PROFILE_TITLES = {
  minimal: 'Minimal',
  standard: 'Standard',
  scalable: 'Scalable',
} as const;

const Logo = () => (
  <svg
    className="osnova-logo"
    width="80"
    height="80"
    viewBox="0 0 72 72"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-label="Osnova"
  >
    <defs>
      <linearGradient id="osnova-grad" x1="0" y1="0" x2="72" y2="72">
        <stop stopColor="#3b516a" />
        <stop offset="1" stopColor="#1677ff" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="68" height="68" rx="18" fill="url(#osnova-grad)" />
    <circle
      cx="36"
      cy="36"
      r="16"
      stroke="#ffffff"
      strokeWidth="5"
      fill="none"
      opacity="0.95"
    />
    <circle cx="36" cy="36" r="5" fill="#ffffff" />
  </svg>
);

const HomePage = () => {
  const { t } = useTranslation('home');
  const config = useBootstrapStore((state) => state.config);
  const features = config?.features;
  const profile = config?.profile ?? 'minimal';

  const enabledCount = features
    ? Object.values(features).filter(Boolean).length
    : 0;

  return (
    <>
      <Seo page="home" />
      <div className="welcome">
      <div className="welcome-hero">
        <Logo />

        <div className="welcome-badges">
          <Tag color="blue" className="welcome-profile-tag">
            {t('profile', { name: PROFILE_TITLES[profile] })}
          </Tag>
          <Tag className="welcome-version-tag">
            v{config?.application.version ?? '1.0.0'}
          </Tag>
        </div>

        <Title level={1} className="welcome-title">
          Osnova
        </Title>

        <Paragraph className="welcome-tagline">
          {t('tagline')}
        </Paragraph>

        <Paragraph className="welcome-description">
          {t(`profiles.${profile}`)} {t('capabilitiesNote')}
        </Paragraph>

        <Space size="middle" wrap className="welcome-actions">
          <Button
            type="primary"
            size="large"
            icon={<ReadOutlined />}
            href={API_DOCS_URL}
            target="_blank"
            rel="noreferrer"
          >
            {t('apiDocs')}
          </Button>
          <Button
            size="large"
            icon={<GithubOutlined />}
            href={GITHUB_BACKEND_URL}
            target="_blank"
            rel="noreferrer"
          >
            Backend
          </Button>
          <Button
            size="large"
            icon={<GithubOutlined />}
            href={GITHUB_FRONTEND_URL}
            target="_blank"
            rel="noreferrer"
          >
            Frontend
          </Button>
        </Space>
      </div>

      <div className="welcome-panel">
        <div className="welcome-panel-head">
          <Text strong>{t('featuresTitle')}</Text>
          <Text type="secondary">
            {t('featuresCount', { count: enabledCount, total: FEATURES.length })}
          </Text>
        </div>

        <ul className="welcome-features">
          {FEATURES.map((key) => {
            const enabled = Boolean(features?.[key]);
            return (
              <li
                key={key}
                className={`welcome-feature ${enabled ? 'is-on' : 'is-off'}`}
              >
                {enabled ? (
                  <CheckCircleFilled className="welcome-feature-icon" />
                ) : (
                  <CloseCircleFilled className="welcome-feature-icon" />
                )}
                <span>{t(`features.${key}`)}</span>
              </li>
            );
          })}
        </ul>

        {enabledCount === 0 && (
          <div className="welcome-hint">
            <Text type="secondary">
              <Trans t={t} i18nKey="allDisabled" components={{ code: <code /> }} />
            </Text>
          </div>
        )}
      </div>

      <div className="welcome-footer">
        <a href={GITHUB_BACKEND_URL} target="_blank" rel="noreferrer">
          osnova_backend
        </a>
        <span className="welcome-footer-sep">·</span>
        <a href={GITHUB_FRONTEND_URL} target="_blank" rel="noreferrer">
          osnova_frontend
        </a>
      </div>

    </div>
    </>
  );
};

export default HomePage;
