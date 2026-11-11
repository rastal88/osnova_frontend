import { DeleteOutlined, EditOutlined, PlusOutlined, SendOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Dropdown,
  Empty,
  Form,
  Input,
  List,
  Modal,
  Popconfirm,
  Space,
  Switch,
  Tag,
  Typography,
  message,
} from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { getErrorMessage } from '../../../../api/errors';
import type { FormValues } from '../../../../api/forms';
import type { EntityRead, EntityTypeDescription } from '../../../../api/generated';
import PageContainer from '../../../../components/PageContainer/PageContainer';
import { SchemaFields } from '../../../../components/SchemaForm/SchemaForm';
import { setServerFieldErrors } from '../../../../utils/formErrors';
import { useCan } from '../../../auth';
import {
  createEntity,
  deleteEntity,
  getEntities,
  getEntityTypes,
  testChannel,
  updateEntity,
} from '../../api';

const { Text } = Typography;

/** Entities of this group are the lead delivery channels (backend: app/modules/leads). */
const GROUP = 'lead_channels';

interface Editing {
  /** The channel being edited, or a new one of this type */
  channel: EntityRead | null;
  type: string;
}

interface ChannelValues {
  name: string;
  params: FormValues;
}

const Channels = () => {
  const { t, i18n } = useTranslation('admin');
  const editable = useCan('entities.manage');
  const [types, setTypes] = useState<EntityTypeDescription[]>([]);
  const [channels, setChannels] = useState<EntityRead[] | null>(null);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState<Editing | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [form] = Form.useForm<ChannelValues>();
  const [toast, toastHolder] = message.useMessage();
  const [modal, modalHolder] = Modal.useModal();
  const language = i18n.language;

  const load = useCallback(async () => {
    try {
      const [typeList, channelList] = await Promise.all([
        getEntityTypes(GROUP),
        getEntities(GROUP),
      ]);
      setTypes(typeList);
      setChannels(channelList);
    } catch {
      setError(true);
    }
  }, []);

  // Type titles and field labels come translated from the backend
  // biome-ignore lint/correctness/useExhaustiveDependencies: `language` triggers a reload
  useEffect(() => {
    void load();
  }, [load, language]);

  const typeOf = (name: string) => types.find((item) => item.type === name);

  const open = (next: Editing) => {
    form.resetFields();
    form.setFields([
      { name: 'name', value: next.channel?.name ?? typeOf(next.type)?.title ?? '' },
      ...Object.entries(next.channel?.params ?? {}).map(([key, value]) => ({
        name: ['params', key],
        value,
      })),
    ]);
    setEditing(next);
  };

  const save = async (values: ChannelValues) => {
    if (!editing) return;
    setSaving(true);
    try {
      if (editing.channel) await updateEntity(editing.channel.id, values);
      else await createEntity(editing.type, values);
      toast.success(t('channels.saved'));
      setEditing(null);
      await load();
    } catch (err) {
      const fields = typeOf(editing.type)?.fields.map((field) => `params.${field.name}`) ?? [];
      if (!setServerFieldErrors(form, err, ['name', ...fields])) toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const run = async (channel: EntityRead, action: () => Promise<unknown>) => {
    setBusy(channel.id);
    try {
      await action();
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const test = (channel: EntityRead) =>
    run(channel, async () => {
      const result = await testChannel(channel.id);
      if (result.ok) toast.success(t('channels.testSent', { name: channel.name }));
      else modal.error({ title: t('channels.testFailed'), content: result.error });
    });

  // Non-secret parameters, e.g. the address or the chat id
  const summary = (channel: EntityRead) =>
    Object.values(channel.params)
      .filter((value) => typeof value === 'string' && value && value !== '********')
      .join(' · ');

  const editingType = editing ? typeOf(editing.type) : undefined;

  return (
    <PageContainer
      title={t('channels.title')}
      subtitle={t('channels.subtitle')}
      noindex
      loading={!channels && !error}
      error={error}
      maxWidth={860}
      actions={
        editable &&
        types.length > 0 && (
          <Dropdown
            trigger={['click']}
            menu={{
              items: types.map((type) => ({ key: type.type, label: type.title })),
              onClick: ({ key }) => open({ channel: null, type: key }),
            }}
          >
            <Button type="primary" icon={<PlusOutlined />}>
              {t('channels.add')}
            </Button>
          </Dropdown>
        )
      }
    >
      {toastHolder}
      {modalHolder}
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {!editable && <Alert type="info" showIcon message={t('channels.readOnly')} />}
        <Alert type="info" showIcon message={t('channels.hint')} />
        <Card>
          {channels?.length === 0 ? (
            <Empty description={t('channels.empty')} />
          ) : (
            <List
              dataSource={channels ?? []}
              renderItem={(channel) => (
                <List.Item
                  actions={
                    editable
                      ? [
                          <Button
                            key="test"
                            size="small"
                            icon={<SendOutlined />}
                            loading={busy === channel.id}
                            disabled={!channel.enabled}
                            onClick={() => void test(channel)}
                          >
                            {t('channels.test')}
                          </Button>,
                          <Button
                            key="edit"
                            size="small"
                            icon={<EditOutlined />}
                            aria-label={t('channels.edit')}
                            onClick={() => open({ channel, type: channel.type })}
                          />,
                          <Popconfirm
                            key="delete"
                            title={t('channels.deleteConfirm', { name: channel.name })}
                            okText={t('channels.delete')}
                            okButtonProps={{ danger: true }}
                            onConfirm={() => run(channel, () => deleteEntity(channel.id))}
                          >
                            <Button
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              aria-label={t('channels.delete')}
                            />
                          </Popconfirm>,
                        ]
                      : []
                  }
                >
                  <List.Item.Meta
                    avatar={
                      <Switch
                        checked={channel.enabled}
                        disabled={!editable}
                        loading={busy === channel.id}
                        aria-label={t('channels.enabled')}
                        onChange={(enabled) =>
                          void run(channel, () => updateEntity(channel.id, { enabled }))
                        }
                      />
                    }
                    title={
                      <Space>
                        {channel.name}
                        <Tag>{typeOf(channel.type)?.title ?? channel.type}</Tag>
                      </Space>
                    }
                    description={<Text type="secondary">{summary(channel)}</Text>}
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      </Space>

      <Modal
        open={editing !== null}
        title={
          editingType &&
          `${t(editing?.channel ? 'channels.edit' : 'channels.add')}: ${editingType.title}`
        }
        okText={t('channels.save')}
        confirmLoading={saving}
        onOk={() => form.submit()}
        onCancel={() => setEditing(null)}
        destroyOnClose
      >
        <Form form={form} layout="vertical" requiredMark="optional" onFinish={save}>
          <Form.Item
            name="name"
            label={t('channels.name')}
            rules={[{ required: true, whitespace: true, message: t('channels.nameRequired') }]}
          >
            <Input maxLength={100} />
          </Form.Item>
          {editingType && <SchemaFields fields={editingType.fields} namePrefix="params" />}
          {editing?.channel && <Text type="secondary">{t('channels.secretHint')}</Text>}
          {/* Enter in a field submits the form (the visible button is the modal's OK) */}
          <button type="submit" hidden />
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Channels;
