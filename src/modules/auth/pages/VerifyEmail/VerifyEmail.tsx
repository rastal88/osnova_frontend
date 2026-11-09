import { Button, Result, Spin } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';

import { getApiError, getErrorMessage } from '../../../../api/errors';
import { verifyEmail } from '../../api';
import { landingPath } from '../../areas';
import { useAuthStore } from '../../authStore';
import AuthCard from '../../components/AuthCard/AuthCard';

type State = { kind: 'checking' } | { kind: 'done' } | { kind: 'failed'; message: string };

/** Opened from the confirmation email: /verify-email?token=... */
const VerifyEmail = () => {
  const { t } = useTranslation('auth');
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const { user, fetchUser } = useAuthStore();
  const [state, setState] = useState<State>({ kind: 'checking' });
  // A token works once: do not send it again when the effect re-runs (Strict Mode)
  const sent = useRef<string | null>(null);

  useEffect(() => {
    if (sent.current === token) return;
    sent.current = token;
    if (!token) {
      setState({ kind: 'failed', message: t('verify.noToken') });
      return;
    }
    verifyEmail(token).then(
      () => {
        setState({ kind: 'done' });
        void fetchUser();
      },
      (error) =>
        getApiError(error)?.code === 'verify_user_already_verified'
          ? setState({ kind: 'done' })
          : setState({ kind: 'failed', message: getErrorMessage(error) }),
    );
  }, [token, t, fetchUser]);

  const next = user ? landingPath(user) : '/login';

  return (
    <AuthCard title={t('verify.title')}>
      {state.kind === 'checking' && (
        <div className="auth-card-center">
          <Spin size="large" />
        </div>
      )}
      {state.kind === 'done' && (
        <Result
          status="success"
          title={t('verify.done')}
          extra={
            <Link to={next}>
              <Button type="primary">{t(user ? 'verify.continue' : 'login.submit')}</Button>
            </Link>
          }
        />
      )}
      {state.kind === 'failed' && (
        <Result
          status="warning"
          title={state.message}
          subTitle={t('verify.failedHint')}
          extra={
            <Link to={user ? '/profile' : '/login'}>
              <Button>{t(user ? 'verify.toProfile' : 'login.submit')}</Button>
            </Link>
          }
        />
      )}
    </AuthCard>
  );
};

export default VerifyEmail;
