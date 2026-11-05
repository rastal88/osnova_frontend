import { Button } from 'antd';

import PageState from '../../components/PageState/PageState';

interface ErrorPageProps {
  onRetry?: () => void;
}

const ErrorPage = ({ onRetry }: ErrorPageProps) => {
  return (
    <PageState
      kind="error"
      action={
        <Button
          type="primary"
          onClick={onRetry ?? (() => window.location.reload())}
        >
          Try again
        </Button>
      }
    />
  );
};

export default ErrorPage;
