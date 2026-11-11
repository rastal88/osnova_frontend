import { SendOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Form, Grid, Modal, Space, Tabs, Typography, message } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

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

// One card per settings group; its fields come from the backend description.
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
    <Card title={group.title}>
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
 * Admin → Settings: one tab per group the backend shows to this user (groups with
 * secrets only to those who may change them); the open tab is kept in the URL.
 */
const Settings = () => {
  const { t, i18n } = useTranslation('admin');
  const screens = Grid.useBreakpoint();
  const [params, setParams] = useSearchParams();
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

  const names = groups?.map((group) => group.name) ?? [];
  const asked = params.get('group');
  const current = asked && names.includes(asked) ? asked : names[0];

  const open = (name: string) => {
    const next = new URLSearchParams(params);
    next.set('group', name);
    setParams(next, { replace: true });
  };

  return (
    <PageContainer
      title={t('settings.title')}
      subtitle={t('settings.subtitle')}
      noindex
      loading={!groups && !error}
      error={error}
      maxWidth={960}
    >
      {groups && (
        <Tabs
          activeKey={current}
          onChange={open}
          tabPosition={screens.md ? 'left' : 'top'}
          items={groups.map((group) => ({
            key: group.name,
            label: group.title,
            children: <GroupForm key={`${group.name}-${language}`} group={group} />,
          }))}
        />
      )}
    </PageContainer>
  );
};

export default Settings;
