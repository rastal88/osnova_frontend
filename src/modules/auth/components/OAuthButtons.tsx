import { GoogleOutlined } from '@ant-design/icons';
import { Button, Divider, Space } from 'antd';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getErrorMessage } from '../../../api/errors';
import { useBootstrapStore } from '../../../store/bootstrapStore';
import { getOAuthUrl } from '../api';

const PROVIDERS: Record<string, { name: string; icon: ReactNode }> = {
  google: { name: 'Google', icon: <GoogleOutlined /> },
};

/** "Continue with Google" and other providers the backend has keys for (/bootstrap). */
const OAuthButtons = ({ onError }: { onError: (message: string) => void }) => {
  const { t } = useTranslation('auth');
  const providers = useBootstrapStore((state) => state.config?.auth_providers ?? []);
  const [busy, setBusy] = useState<string | null>(null);

  const start = async (provider: string) => {
    setBusy(provider);
    try {
      window.location.assign(await getOAuthUrl(provider));
    } catch (error) {
      onError(getErrorMessage(error));
      setBusy(null);
    }
  };

  const known = providers.filter((provider) => provider in PROVIDERS);
  if (known.length === 0) return null;

  return (
    <>
      <Space direction="vertical" style={{ width: '100%' }}>
        {known.map((provider) => (
          <Button
            key={provider}
            block
            icon={PROVIDERS[provider].icon}
            loading={busy === provider}
            onClick={() => void start(provider)}
          >
            {t('oauth.continueWith', { provider: PROVIDERS[provider].name })}
          </Button>
        ))}
      </Space>
      <Divider plain>{t('oauth.or')}</Divider>
    </>
  );
};

export default OAuthButtons;
