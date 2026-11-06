import type { ReactNode } from 'react';
import { Button, Empty, Result, Spin } from 'antd';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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
        <Empty description={description ?? t('state.empty')} />
        {action && <div className="page-state-action">{action}</div>}
      </div>
    );
  }

  const status: '500' | '403' | '404' =
    kind === 'error' ? '500' : kind === 'forbidden' ? '403' : '404';

  const defaultTitle = {
    error: t('state.errorTitle'),
    forbidden: t('state.forbiddenTitle'),
    'not-found': t('state.notFoundTitle'),
  }[kind];

  const defaultDescription = {
    error: t('state.errorDescription'),
    forbidden: t('state.forbiddenDescription'),
    'not-found': t('state.notFoundDescription'),
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
              {t('state.goHome')}
            </Button>
          )
        }
      />
    </div>
  );
};

export default PageState;
