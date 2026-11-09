import { Alert, Button, Spin } from 'antd';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '../../modules/auth';
import { useBootstrapStore } from '../../store/bootstrapStore';
import './BootstrapComponent.css';

interface BootstrapComponentProps {
  children: React.ReactNode;
}

const BootstrapComponent = ({ children }: BootstrapComponentProps) => {
  const { t } = useTranslation();
  const initialize = useBootstrapStore((state) => state.initialize);
  const isInitialized = useBootstrapStore((state) => state.isInitialized);
  const isLoading = useBootstrapStore((state) => state.isLoading);
  const error = useBootstrapStore((state) => state.error);
  const authEnabled = useBootstrapStore((state) => state.config?.features.authentication);

  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  // Only on start: a later bootstrap refresh (new site settings) keeps the signed-in user
  useEffect(() => {
    if (isInitialized && authEnabled) {
      void fetchUser();
    }
  }, [isInitialized, authEnabled, fetchUser]);

  if (isLoading) {
    return (
      <div className="bootstrap-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bootstrap-error">
        <Alert
          message={t('bootstrap.failedTitle')}
          description={t('bootstrap.failedDescription')}
          type="error"
          showIcon
          action={
            <Button size="small" danger onClick={() => void initialize()}>
              {t('bootstrap.retry')}
            </Button>
          }
        />
      </div>
    );
  }

  if (!isInitialized) {
    return null;
  }

  return children;
};

export default BootstrapComponent;
