import { Button, Form, Result } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';

import { getApiError, getErrorMessage } from '../../../../api/errors';
import { resetPassword } from '../../api';
import AuthCard from '../../components/AuthCard/AuthCard';
import PasswordFields from '../../components/PasswordFields';

const BAD_TOKEN = 'reset_password_bad_token';

/** Opened from the reset email: /reset-password?token=... */
const ResetPassword = () => {
  const { t } = useTranslation('auth');
  const [form] = Form.useForm<{ password: string }>();
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const [error, setError] = useState<{ message: string; badToken: boolean } | null>(
    token ? null : { message: t('reset.noToken'), badToken: true },
  );
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const send = async ({ password }: { password: string }) => {
    setError(null);
    setSending(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      const apiError = getApiError(err);
      if (apiError?.code === BAD_TOKEN) {
        setError({ message: apiError.message, badToken: true });
      } else if (apiError?.code === 'reset_password_invalid_password') {
        form.setFields([{ name: 'password', errors: [apiError.message] }]);
      } else {
        setError({ message: getErrorMessage(err), badToken: false });
      }
    } finally {
      setSending(false);
    }
  };

  if (done) {
    return (
      <AuthCard title={t('reset.title')}>
        <Result
          status="success"
          title={t('reset.done')}
          extra={
            <Link to="/login">
              <Button type="primary">{t('login.submit')}</Button>
            </Link>
          }
        />
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={t('reset.title')}
      error={error?.message}
      footer={error?.badToken && <Link to="/forgot-password">{t('reset.newLink')}</Link>}
    >
      {token && (
        <Form form={form} layout="vertical" requiredMark={false} onFinish={send}>
          <PasswordFields label={t('reset.password')} />
          <Button type="primary" htmlType="submit" block loading={sending}>
            {t('reset.submit')}
          </Button>
        </Form>
      )}
    </AuthCard>
  );
};

export default ResetPassword;
