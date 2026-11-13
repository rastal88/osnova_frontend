import { SendOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Modal, Space, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';

import { getErrorMessage } from '../../../../api/errors';
import type { FormValues } from '../../../../api/forms';
import type { SettingsGroupDescription } from '../../../../api/generated';
import PageContainer from '../../../../components/PageContainer/PageContainer';
import { SchemaFields } from '../../../../components/SchemaForm/SchemaForm';
import { useBootstrapStore } from '../../../../store/bootstrapStore';
import { setServerFieldErrors } from '../../../../utils/formErrors';
import { getSettings, saveSettings, testMail } from '../../api';

/** The group of the mail settings: it has a test email. */
const MAIL = 'mail';

/** Sends a test email with the saved mail settings and shows what the server said. */
const MailTest = () => {
  const { t } = useTranslation('admin');
  const [sending, setSending] = useState(false);
  const [toast, toastHolder] = message.useMessage();
  const [modal, modalHolder] = Modal.useModal();

  const send = async () => {
    setSending(true);
    try {
      const result = await testMail();
      if (result.ok) toast.success(t('settings.testSent'));
      else modal.error({ title: t('settings.testFailed'), content: result.error });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  return (
    <Space wrap>
      {toastHolder}
      {modalHolder}
      <Button icon={<SendOutlined />} loading={sending} onClick={() => void send()}>
        {t('settings.sendTest')}
      </Button>
      <Typography.Text type="secondary">{t('settings.testHint')}</Typography.Text>
    </Space>
  );
};

// The form of a settings group; its fields come from the backend description.
const GroupForm = ({ group }: { group: SettingsGroupDescription }) => {
  const { t } = useTranslation('admin');
  const [form] = Form.useForm<FormValues>();
  const [saving, setSaving] = useState(false);
  const [toast, toastHolder] = message.useMessage();
  const refreshBootstrap = useBootstrapStore((state) => state.refresh);
  const editable = group.editable ?? false;

  const save = async (values: FormValues) => {
    setSaving(true);
    try {
      const saved = await saveSettings(group.name, values);
      form.setFields(Object.entries(saved.values).map(([name, value]) => ({ name, value })));
      toast.success(t('settings.saved'));
      await refreshBootstrap();
    } catch (error) {
      const names = group.fields.map((field) => field.name);
      if (!setServerFieldErrors(form, error, names)) toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      {toastHolder}
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {!editable && <Alert type="info" showIcon message={t('settings.readOnly')} />}
        <Form
          form={form}
          name={`settings-${group.name}`}
          layout="vertical"
          initialValues={group.values}
          disabled={!editable || saving}
          onFinish={save}
          requiredMark="optional"
        >
          <SchemaFields fields={group.fields} secretHint={editable} />
          {editable && (
            <Button type="primary" htmlType="submit" loading={saving}>
              {t('settings.save')}
            </Button>
          )}
        </Form>
        {editable && group.name === MAIL && <MailTest />}
      </Space>
    </Card>
  );
};

/**
 * Admin → Settings → <group>: the group of the address (/admin/settings/mail) as the
 * backend shows it to this user; a group with secrets only to those who may change it.
 * The menu lists the groups (src/modules/admin/navigation.ts).
 */
const Settings = () => {
  const { t, i18n } = useTranslation('admin');
  const { group: name } = useParams();
  const [groups, setGroups] = useState<SettingsGroupDescription[] | null>(null);
  const [error, setError] = useState(false);
  const language = i18n.language;

  // Labels come translated from the backend: reload them when the language changes.
  // biome-ignore lint/correctness/useExhaustiveDependencies: `language` triggers a reload
  useEffect(() => {
    let active = true;
    getSettings().then(
      (data) => active && setGroups(data),
      () => active && setError(true),
    );
    return () => {
      active = false;
    };
  }, [language]);

  const group = groups?.find((item) => item.name === name);

  return (
    <PageContainer
      title={group?.title ?? t('settings.title')}
      subtitle={t('settings.subtitle')}
      noindex
      loading={!groups && !error}
      error={error}
      // Not this user's (secrets), or no such group
      forbidden={groups !== null && !group}
    >
      {group && <GroupForm key={`${group.name}-${language}`} group={group} />}
    </PageContainer>
  );
};

export default Settings;
