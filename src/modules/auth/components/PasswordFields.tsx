import { Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';

/** Same minimum as the backend (UserManager.validate_password). */
export const PASSWORD_MIN_LENGTH = 8;

/** "Password" and "Repeat password" items for sign-up and password reset forms. */
const PasswordFields = ({ label }: { label?: string }) => {
  const { t } = useTranslation(['auth', 'forms']);

  return (
    <>
      <Form.Item
        name="password"
        label={label ?? t('password')}
        rules={[
          { required: true, message: t('forms:validation.required') },
          {
            min: PASSWORD_MIN_LENGTH,
            message: t('forms:validation.minLength', { min: PASSWORD_MIN_LENGTH }),
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
    </>
  );
};

export default PasswordFields;
