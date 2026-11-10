import { Alert, Button, Card, Form, Input, Modal, Popconfirm, Typography, message } from 'antd';
import type { FormInstance } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

import { getApiError, getErrorMessage } from '../../../../api/errors';
import type { UserRead } from '../../../../api/generated';
import { localizedPath } from '../../../../i18n/language';
import {
  changeEmail,
  changePassword,
  deleteAccount,
  signOutEverywhere,
  updateName,
} from '../../api';
import { useAuthStore } from '../../authStore';
import PasswordFields from '../../components/PasswordFields';
import { deleteConfirmation } from './confirm';

const { Paragraph } = Typography;

/** Server errors that belong to one field of the form. */
const FIELD_ERRORS: Record<string, string> = {
  current_password_wrong: 'current_password',
  password_too_short: 'password',
  password_contains_email: 'password',
  update_user_email_already_exists: 'email',
};

/** Shows a known error under its field; returns false for the caller to show it as a toast. */
function showFieldError<T>(form: FormInstance<T>, error: unknown): boolean {
  const apiError = getApiError(error);
  const field = apiError && FIELD_ERRORS[apiError.code];
  // `field` is a key of this form's values when the form has it
  if (!apiError || !field || !form.getFieldInstance(field as never)) return false;
  form.setFields([{ name: field as never, errors: [apiError.message] }]);
  return true;
}

/** Runs a save: busy state, success toast, field errors or a toast with the error. */
function useSubmit() {
  const [toast, holder] = message.useMessage();
  const [busy, setBusy] = useState(false);

  const submit = async <T,>(
    form: FormInstance<T>,
    action: () => Promise<unknown>,
    success: string,
  ) => {
    setBusy(true);
    try {
      await action();
      toast.success(success);
      return true;
    } catch (error) {
      if (!showFieldError(form, error)) toast.error(getErrorMessage(error));
      return false;
    } finally {
      setBusy(false);
    }
  };

  return { submit, busy, holder };
}

export const NameSection = ({ user }: { user: UserRead }) => {
  const { t } = useTranslation('auth');
  const [form] = Form.useForm<{ name: string }>();
  const setUser = useAuthStore((state) => state.setUser);
  const { submit, busy, holder } = useSubmit();

  return (
    <Card title={t('profile.nameTitle')}>
      {holder}
      <Form
        form={form}
        name="profile-name"
        layout="vertical"
        initialValues={{ name: user.name ?? '' }}
        onFinish={({ name }) =>
          submit(form, async () => setUser(await updateName(name)), t('profile.saved'))
        }
      >
        <Form.Item name="name" label={t('profile.name')} extra={t('profile.nameHint')}>
          <Input maxLength={100} autoComplete="name" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={busy}>
          {t('profile.save')}
        </Button>
      </Form>
    </Card>
  );
};

interface PasswordValues {
  current_password: string;
  password: string;
}

export const PasswordSection = () => {
  const { t } = useTranslation(['auth', 'forms']);
  const [form] = Form.useForm<PasswordValues>();
  const { submit, busy, holder } = useSubmit();

  const save = async ({ current_password, password }: PasswordValues) => {
    const done = await submit(
      form,
      () => changePassword({ current_password, new_password: password }),
      t('profile.passwordChanged'),
    );
    if (done) form.resetFields();
  };

  return (
    <Card title={t('profile.passwordTitle')}>
      {holder}
      <Paragraph type="secondary">{t('profile.passwordHint')}</Paragraph>
      {/* A form name keeps field ids unique: two forms here have a "password" */}
      <Form
        form={form}
        name="profile-password"
        layout="vertical"
        requiredMark={false}
        onFinish={save}
      >
        <Form.Item
          name="current_password"
          label={t('profile.currentPassword')}
          rules={[{ required: true, message: t('forms:validation.required') }]}
          extra={<Link to="/forgot-password">{t('profile.noPassword')}</Link>}
        >
          <Input.Password autoComplete="current-password" />
        </Form.Item>
        <PasswordFields label={t('profile.newPassword')} />
        <Button type="primary" htmlType="submit" loading={busy}>
          {t('profile.changePassword')}
        </Button>
      </Form>
    </Card>
  );
};

interface EmailValues {
  email: string;
  password: string;
}

export const EmailSection = ({ user }: { user: UserRead }) => {
  const { t } = useTranslation(['auth', 'forms']);
  const [form] = Form.useForm<EmailValues>();
  const setUser = useAuthStore((state) => state.setUser);
  const { submit, busy, holder } = useSubmit();

  const save = async (values: EmailValues) => {
    const done = await submit(
      form,
      async () => setUser(await changeEmail(values)),
      t('profile.emailChanged', { email: values.email }),
    );
    if (done) form.resetFields();
  };

  return (
    <Card title={t('profile.emailTitle')}>
      {holder}
      <Paragraph type="secondary">{t('profile.emailHint', { email: user.email })}</Paragraph>
      <Form form={form} name="profile-email" layout="vertical" requiredMark={false} onFinish={save}>
        <Form.Item
          name="email"
          label={t('profile.newEmail')}
          rules={[
            { required: true, message: t('forms:validation.required') },
            { type: 'email', message: t('forms:validation.email') },
          ]}
        >
          <Input inputMode="email" autoComplete="email" />
        </Form.Item>
        <Form.Item
          name="password"
          label={t('profile.currentPassword')}
          rules={[{ required: true, message: t('forms:validation.required') }]}
        >
          <Input.Password autoComplete="current-password" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={busy}>
          {t('profile.changeEmail')}
        </Button>
      </Form>
    </Card>
  );
};

export const SessionsSection = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const clear = useAuthStore((state) => state.clear);
  const [toast, holder] = message.useMessage();
  const [busy, setBusy] = useState(false);

  const signOut = async () => {
    setBusy(true);
    try {
      await signOutEverywhere();
      clear();
      navigate('/login');
    } catch (error) {
      toast.error(getErrorMessage(error));
      setBusy(false);
    }
  };

  return (
    <Card title={t('profile.sessionsTitle')}>
      {holder}
      <Paragraph type="secondary">{t('profile.sessionsHint')}</Paragraph>
      <Popconfirm
        title={t('profile.signOutEverywhereConfirm')}
        okText={t('profile.signOutEverywhere')}
        onConfirm={signOut}
      >
        <Button loading={busy}>{t('profile.signOutEverywhere')}</Button>
      </Popconfirm>
    </Card>
  );
};

export const DeleteSection = ({ user }: { user: UserRead }) => {
  const { t } = useTranslation(['auth', 'forms']);
  const [form] = Form.useForm<{ confirm: string }>();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (user.role === 'root') {
    return (
      <Card title={t('profile.deleteTitle')}>
        <Paragraph type="secondary">{t('profile.rootCannotDelete')}</Paragraph>
      </Card>
    );
  }

  const remove = async ({ confirm }: { confirm: string }) => {
    setBusy(true);
    setError(null);
    try {
      await deleteAccount(deleteConfirmation(confirm, user.email));
      // A fresh start on the home page: no state of the deleted account is left, and
      // the guarded profile page cannot send the now-guest to sign in first
      window.location.assign(localizedPath('/'));
    } catch (err) {
      setError(getErrorMessage(err));
      setBusy(false);
    }
  };

  return (
    <Card title={t('profile.deleteTitle')} className="profile-danger">
      <Paragraph type="secondary">{t('profile.deleteHint')}</Paragraph>
      <Button danger onClick={() => setOpen(true)}>
        {t('profile.delete')}
      </Button>
      <Modal
        open={open}
        title={t('profile.deleteConfirmTitle')}
        okText={t('profile.delete')}
        okButtonProps={{ danger: true, loading: busy }}
        onOk={() => form.submit()}
        onCancel={() => setOpen(false)}
        destroyOnClose
      >
        <Paragraph>{t('profile.deleteConfirmText')}</Paragraph>
        {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />}
        <Form
          form={form}
          name="profile-delete"
          layout="vertical"
          requiredMark={false}
          onFinish={remove}
        >
          <Form.Item
            name="confirm"
            label={t('profile.deleteConfirmLabel')}
            rules={[{ required: true, message: t('forms:validation.required') }]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <button type="submit" hidden />
        </Form>
      </Modal>
    </Card>
  );
};
