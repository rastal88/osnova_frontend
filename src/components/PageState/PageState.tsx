import type { ReactNode } from 'react';
import { Button, Empty, Result, Spin } from 'antd';

import './PageState.css';

export type PageStateKind =
  | 'loading'
  | 'empty'
  | 'error'
  | 'forbidden'
  | 'not-found';

interface PageStateProps {
  kind: PageStateKind;
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}

const PageState = ({ kind, title, description, action }: PageStateProps) => {
  if (kind === 'loading') {
    return (
      <div className="page-state page-state-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (kind === 'empty') {
    return (
      <div className="page-state">
        <Empty description={description ?? 'Nothing here yet'} />
        {action && <div className="page-state-action">{action}</div>}
      </div>
    );
  }

  const status: '500' | '403' | '404' =
    kind === 'error' ? '500' : kind === 'forbidden' ? '403' : '404';

  const defaultTitle = {
    error: 'Something went wrong',
    forbidden: 'Access denied',
    'not-found': 'Page not found',
  }[kind];

  const defaultDescription = {
    error: 'Please try again. If the problem persists, contact support.',
    forbidden: 'You do not have permission to view this page.',
    'not-found': 'The page you are looking for does not exist or has moved.',
  }[kind];

  return (
    <div className="page-state">
      <Result
        status={status}
        title={title ?? defaultTitle}
        subTitle={description ?? defaultDescription}
        extra={
          action ?? (
            <Button type="primary" href="/">
              Go home
            </Button>
          )
        }
      />
    </div>
  );
};

export default PageState;
