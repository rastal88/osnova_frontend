import { Button, Form, Input } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import { getErrorMessage } from '../../../../api/errors';
import { setServerFieldErrors } from '../../../../utils/formErrors';
import { login, register } from '../../api';
import { landingPath } from '../../areas';
import { useAuthStore } from '../../authStore';
import AuthCard from '../../components/AuthCard/AuthCard';
import OAuthButtons from '../../components/OAuthButtons';
import PasswordFields from '../../components/PasswordFields';

interface RegisterValues {
  email: string;
  password: string;
  repeatPassword: string;
}

const Register = () => {
  const { t } = useTranslation(['auth', 'forms']);
  const [form] = Form.useForm<RegisterValues>();
  const navigate = useNavigate();
  const { fetchUser } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const handleRegister = async ({ email, password }: RegisterValues) => {
    setError(null);
    setSending(true);
    try {
      await register(email, password);
      await login(email, password);
      const user = await fetchUser();
      navigate(landingPath(user));
    } catch (err: unknown) {
      if (!setServerFieldErrors(form, err, ['email', 'password'])) {
        setError(getErrorMessage(err));
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthCard
      title={t('register.title')}
      error={error}
      footer={
        <>
          {t('register.haveAccount')} <Link to="/login">{t('register.toLogin')}</Link>
        </>
      }
    >
      <OAuthButtons onError={setError} />
      <Form<RegisterValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleRegister}
      >
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
        <PasswordFields />
        <Button type="primary" htmlType="submit" block loading={sending}>
          {t('register.submit')}
        </Button>
      </Form>
    </AuthCard>
  );
};

export default Register;
