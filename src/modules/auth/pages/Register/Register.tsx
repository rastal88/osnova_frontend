import { Button, Form, Input } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import { getErrorMessage } from '../../../../api/errors';
import { setServerFieldErrors } from '../../../../utils/formErrors';
import { login, register } from '../../api';
import { useAuthStore } from '../../authStore';
import AuthCard from '../../components/AuthCard/AuthCard';

interface RegisterValues {
  email: string;
  password: string;
  repeatPassword: string;
}

const PASSWORD_MIN_LENGTH = 8;

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
      navigate(user?.role === 'root' || user?.role === 'moderator' ? '/admin' : '/');
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
        <Form.Item
          name="password"
          label={t('password')}
          rules={[
            { required: true, message: t('forms:validation.required') },
            {
              min: PASSWORD_MIN_LENGTH,
              message: t('forms:validation.minLength', {
                min: PASSWORD_MIN_LENGTH,
              }),
            },
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        <Form.Item
          name="repeatPassword"
          label={t('register.repeatPassword')}
          dependencies={['password']}
          rules={[
            { required: true, message: t('forms:validation.required') },
            ({ getFieldValue }) => ({
              validator: (_, value) =>
                !value || getFieldValue('password') === value
                  ? Promise.resolve()
                  : Promise.reject(new Error(t('register.passwordsMismatch'))),
            }),
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={sending}>
          {t('register.submit')}
        </Button>
      </Form>
    </AuthCard>
  );
};

export default Register;
