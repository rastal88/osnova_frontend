import { useEffect } from 'react';
import { Alert, Button, Spin } from 'antd';

import { useBootstrapStore } from '../../store/bootstrapStore';
import { useAuthStore } from '../../store/authStore';
import './BootstrapComponent.css';

interface BootstrapComponentProps {
  children: React.ReactNode;
}

const BootstrapComponent = ({
  children,
}: BootstrapComponentProps) => {
  const initialize = useBootstrapStore((state) => state.initialize);
  const isInitialized = useBootstrapStore(
    (state) => state.isInitialized,
  );
  const isLoading = useBootstrapStore(
    (state) => state.isLoading,
  );
  const error = useBootstrapStore((state) => state.error);
  const config = useBootstrapStore((state) => state.config);

  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    if (isInitialized && config?.features.authentication) {
      void fetchUser();
    }
  }, [isInitialized, config, fetchUser]);

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
          message="Application initialization failed"
          description="Unable to connect to the server. Please try again."
          type="error"
          showIcon
          action={
            <Button
              size="small"
              danger
              onClick={() => void initialize()}
            >
              Retry
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