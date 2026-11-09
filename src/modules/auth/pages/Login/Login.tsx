import { Button, Form, Input } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import { getErrorMessage } from '../../../../api/errors';
import { login } from '../../api';
import { landingPath } from '../../areas';
import { useAuthStore } from '../../authStore';
import AuthCard from '../../components/AuthCard/AuthCard';
import OAuthButtons from '../../components/OAuthButtons';

interface LoginValues {
  email: string;
  password: string;
}

const Login = () => {
  const { t } = useTranslation(['auth', 'forms']);
  const navigate = useNavigate();
  const { fetchUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handleLogin = async ({ email, password }: LoginValues) => {
    setError(null);
    setSending(true);
    try {
      await login(email, password);
      const user = await fetchUser();
      navigate(landingPath(user));
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthCard
      title={t('login.title')}
      error={error}
      footer={
        <>
          {t('login.noAccount')} <Link to="/register">{t('login.toRegister')}</Link>
        </>
      }
    >
      <OAuthButtons onError={setError} />
      <Form<LoginValues> layout="vertical" requiredMark={false} onFinish={handleLogin}>
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
        <Form.Item
          name="password"
          label={t('password')}
          rules={[{ required: true, message: t('forms:validation.required') }]}
          extra={<Link to="/forgot-password">{t('login.forgot')}</Link>}
        >
          <Input.Password autoComplete="current-password" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={sending}>
          {t('login.submit')}
        </Button>
      </Form>
    </AuthCard>
  );
};

export default Login;
