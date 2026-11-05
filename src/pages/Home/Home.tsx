import { Button, Space, Tag, Typography } from 'antd';
import {
  CheckCircleFilled,
  CloseCircleFilled,
  GithubOutlined,
  ReadOutlined,
} from '@ant-design/icons';

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

const FEATURE_LABELS: { key: keyof BootstrapFeatures; label: string }[] = [
  { key: 'authentication', label: 'Аутентификация' },
  { key: 'admin', label: 'Админ-панель' },
  { key: 'files', label: 'Файловое хранилище' },
  { key: 'notifications', label: 'Уведомления' },
  { key: 'background_tasks', label: 'Фоновые задачи' },
];

const PROFILE_INFO: Record<
  string,
  { title: string; description: string }
> = {
  minimal: {
    title: 'Minimal',
    description:
      'Минимальная инфраструктура: сайты, информационные приложения и небольшие сервисы.',
  },
  standard: {
    title: 'Standard',
    description:
      'Production-профиль: пользователи, админка, фоновые задачи, хранилище.',
  },
  scalable: {
    title: 'Scalable',
    description:
      'Горизонтальное масштабирование: балансировка, несколько инстансов, CDN.',
  },
};

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
  const config = useBootstrapStore((state) => state.config);
  const features = config?.features;
  const profile = config?.profile ?? 'minimal';
  const profileInfo = PROFILE_INFO[profile] ?? PROFILE_INFO.minimal;

  const enabledCount = features
    ? Object.values(features).filter(Boolean).length
    : 0;

  return (
    <>
      <Seo
        title="Home"
        description="Osnova — универсальный full-stack шаблон для быстрой разработки web-приложений на Python и React"
        ogTitle="Osnova"
        ogDescription="Универсальный full-stack шаблон для быстрой разработки web-приложений"
        canonical="/"
      />
      <div className="welcome">
      <div className="welcome-hero">
        <Logo />

        <div className="welcome-badges">
          <Tag color="blue" className="welcome-profile-tag">
            Профиль: {profileInfo.title}
          </Tag>
          <Tag className="welcome-version-tag">
            v{config?.application.version ?? '1.0.0'}
          </Tag>
        </div>

        <Title level={1} className="welcome-title">
          Osnova
        </Title>

        <Paragraph className="welcome-tagline">
          Универсальный full-stack шаблон для быстрой разработки web-приложений
          на Python и React.
        </Paragraph>

        <Paragraph className="welcome-description">
          {profileInfo.description} Возможности подключаются конфигурацией и
          передаются в интерфейс через bootstrap — без переписывания архитектуры.
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
            Документация API
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
          <Text strong>Активные возможности</Text>
          <Text type="secondary">
            включено {enabledCount} из {FEATURE_LABELS.length}
          </Text>
        </div>

        <ul className="welcome-features">
          {FEATURE_LABELS.map(({ key, label }) => {
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
                <span>{label}</span>
              </li>
            );
          })}
        </ul>

        {enabledCount === 0 && (
          <div className="welcome-hint">
            <Text type="secondary">
              Все возможности отключены — приложение работает как публичный
              сайт. Включите нужные флаги в <code>.env</code> и перезапустите
              backend.
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
