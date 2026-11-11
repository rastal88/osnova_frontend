import { Button, Spin } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useParams } from 'react-router-dom';

import { getErrorMessage } from '../../../../api/errors';
import { finishOAuth } from '../../api';
import { useAuthStore } from '../../authStore';
import AuthCard from '../../components/AuthCard/AuthCard';
import { useEnterAccount } from '../../language';

/** The provider sends the user here (FRONTEND_URL/oauth/<provider>/callback?code=&state=). */
const OAuthCallback = () => {
  const { t } = useTranslation('auth');
  const { provider = '' } = useParams();
  const { search } = useLocation();
  const enterAccount = useEnterAccount();
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const [error, setError] = useState<string | null>(null);
  // The code works once: do not send it again when the effect re-runs (Strict Mode)
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    // The user pressed "Cancel" on the provider's page
    if (new URLSearchParams(search).has('error')) {
      setError(t('oauth.cancelled'));
      return;
    }
    finishOAuth(provider, search)
      .then(fetchUser)
      .then((user) => enterAccount(user, { replace: true }))
      .catch((err) => setError(getErrorMessage(err)));
  }, [provider, search, fetchUser, enterAccount, t]);

  return (
    <AuthCard title={t('oauth.title')} error={error}>
      {error ? (
        <Link to="/login">
          <Button block>{t('oauth.backToLogin')}</Button>
        </Link>
      ) : (
        <div className="auth-card-center">
          <Spin size="large" />
        </div>
      )}
    </AuthCard>
  );
};

export default OAuthCallback;
