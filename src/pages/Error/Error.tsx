import { Button } from 'antd';
import { useTranslation } from 'react-i18next';

import PageState from '../../components/PageState/PageState';

interface ErrorPageProps {
  onRetry?: () => void;
}

const ErrorPage = ({ onRetry }: ErrorPageProps) => {
  const { t } = useTranslation();

  return (
    <PageState
      kind="error"
      action={
        <Button
          type="primary"
          onClick={onRetry ?? (() => window.location.reload())}
        >
          {t('state.tryAgain')}
        </Button>
      }
    />
  );
};

export default ErrorPage;
