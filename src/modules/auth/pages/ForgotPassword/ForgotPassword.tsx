import { Button, Form, Input, Result } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { getErrorMessage } from '../../../../api/errors';
import { forgotPassword } from '../../api';
import AuthCard from '../../components/AuthCard/AuthCard';

const ForgotPassword = () => {
  const { t } = useTranslation(['auth', 'forms']);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const send = async ({ email }: { email: string }) => {
    setError(null);
    setSending(true);
    try {
      await forgotPassword(email);
      setSentTo(email);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthCard
      title={t('forgot.title')}
      error={error}
      footer={<Link to="/login">{t('forgot.backToLogin')}</Link>}
    >
      {sentTo ? (
        // Same answer for any address, so the page does not reveal who has an account
        <Result status="success" title={t('forgot.sent', { email: sentTo })} />
      ) : (
        <Form layout="vertical" requiredMark={false} onFinish={send}>
          <p className="auth-card-text">{t('forgot.text')}</p>
          <Form.Item
            name="email"
            label={t('email')}
            rules={[
              { required: true, message: t('forms:validation.required') },
              { type: 'email', message: t('forms:validation.email') },
            ]}
          >
            <Input inputMode="email" autoComplete="email" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={sending}>
            {t('forgot.submit')}
          </Button>
        </Form>
      )}
    </AuthCard>
  );
};

export default ForgotPassword;
