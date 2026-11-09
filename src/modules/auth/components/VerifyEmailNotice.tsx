import { Alert, Button } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getErrorMessage } from '../../../api/errors';
import { requestVerification } from '../api';
import { useAuthStore } from '../authStore';

/** Reminds a signed-in user to confirm the email, with a button to send the link again. */
const VerifyEmailNotice = () => {
  const { t } = useTranslation('auth');
  const user = useAuthStore((state) => state.user);
  const [state, setState] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [error, setError] = useState<string | null>(null);

  if (!user || user.is_verified) return null;

  const resend = async () => {
    setState('sending');
    setError(null);
    try {
      await requestVerification(user.email);
      setState('sent');
    } catch (err) {
      setError(getErrorMessage(err));
      setState('idle');
    }
  };

  return (
    <Alert
      type={error ? 'error' : 'info'}
      showIcon
      message={t('verify.notice', { email: user.email })}
      description={state === 'sent' ? t('verify.resent') : (error ?? undefined)}
      action={
        state !== 'sent' && (
          <Button size="small" loading={state === 'sending'} onClick={() => void resend()}>
            {t('verify.resend')}
          </Button>
        )
      }
      style={{ marginBottom: 16 }}
    />
  );
};

export default VerifyEmailNotice;
