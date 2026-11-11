import { Alert, Button, Card, Form, Space, message } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getErrorMessage } from '../../../../api/errors';
import type { FormValues } from '../../../../api/forms';
import type { SettingsGroupDescription } from '../../../../api/generated';
import PageContainer from '../../../../components/PageContainer/PageContainer';
import { SchemaFields } from '../../../../components/SchemaForm/SchemaForm';
import { useBootstrapStore } from '../../../../store/bootstrapStore';
import { setServerFieldErrors } from '../../../../utils/formErrors';
import { useCan } from '../../../auth';
import { getSettings, saveSettings } from '../../api';

interface GroupFormProps {
  group: SettingsGroupDescription;
  editable: boolean;
}

// One card per settings group; its fields come from the backend description.
const GroupForm = ({ group, editable }: GroupFormProps) => {
  const { t } = useTranslation('admin');
  const [form] = Form.useForm<FormValues>();
  const [saving, setSaving] = useState(false);
  const [toast, toastHolder] = message.useMessage();
  const refreshBootstrap = useBootstrapStore((state) => state.refresh);

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
      <Form
        form={form}
        layout="vertical"
        initialValues={group.values}
        disabled={!editable || saving}
        onFinish={save}
        requiredMark="optional"
      >
        <SchemaFields fields={group.fields} />
        {editable && (
          <Button type="primary" htmlType="submit" loading={saving}>
            {t('settings.save')}
          </Button>
        )}
      </Form>
    </Card>
  );
};

const Settings = () => {
  const { t, i18n } = useTranslation('admin');
  const editable = useCan('settings.manage');
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

  return (
    <PageContainer
      title={t('settings.title')}
      subtitle={t('settings.subtitle')}
      noindex
      loading={!groups && !error}
      error={error}
      maxWidth={720}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {!editable && <Alert type="info" showIcon message={t('settings.readOnly')} />}
        {groups?.map((group) => (
          <GroupForm key={`${group.name}-${language}`} group={group} editable={editable} />
        ))}
      </Space>
    </PageContainer>
  );
};

export default Settings;
