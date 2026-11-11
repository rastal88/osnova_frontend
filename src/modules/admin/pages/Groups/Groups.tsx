import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  message,
} from 'antd';
import type { TableColumnsType } from 'antd';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { getErrorMessage } from '../../../../api/errors';
import type { GroupRead } from '../../../../api/generated';
import PageContainer from '../../../../components/PageContainer/PageContainer';
import { setServerFieldErrors } from '../../../../utils/formErrors';
import { useAuthStore, useCan } from '../../../auth';
import { canEditGroup, canGiveRole, useGroups, useRoles } from '../../access';
import { createGroup, deleteGroup, updateGroup } from '../../api';

interface GroupValues {
  name: string;
  roles: string[];
}

/** The group being edited, or `new` for a new one. */
type Opened = GroupRead | 'new';

const Groups = () => {
  const { t } = useTranslation('admin');
  const me = useAuthStore((state) => state.user);
  const canManage = useCan('roles.manage');
  const { roles, error: rolesError, roleName } = useRoles();
  const { groups, error, reload } = useGroups();
  const [opened, setOpened] = useState<Opened | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [form] = Form.useForm<GroupValues>();
  const [toast, toastHolder] = message.useMessage();

  const group = opened === 'new' ? null : opened;
  const editable = (item: GroupRead) => canEditGroup(me, item, roles ?? []);

  const open = (next: Opened) => {
    form.resetFields();
    form.setFieldsValue(next === 'new' ? { name: '', roles: [] } : next);
    setOpened(next);
  };

  const save = async (values: GroupValues) => {
    setSaving(true);
    try {
      if (group) await updateGroup(group.id, values);
      else await createGroup(values);
      toast.success(t('groups.saved'));
      setOpened(null);
      await reload();
    } catch (err) {
      if (!setServerFieldErrors(form, err, ['name', 'roles'])) toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: GroupRead) => {
    setBusy(item.id);
    try {
      await deleteGroup(item.id);
      toast.success(t('groups.deleted'));
      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const columns: TableColumnsType<GroupRead> = [
    { key: 'name', title: t('groups.columns.name'), dataIndex: 'name' },
    {
      key: 'roles',
      title: t('groups.columns.roles'),
      render: (_, item) => (
        <Space wrap size={[0, 4]}>
          {item.roles.map((slug) => (
            <Tag key={slug}>{roleName(slug)}</Tag>
          ))}
        </Space>
      ),
    },
    {
      key: 'users',
      title: t('groups.columns.users'),
      // The users list filtered by this group
      render: (_, item) =>
        item.users > 0 ? <Link to={`/admin/users?group=${item.id}`}>{item.users}</Link> : 0,
    },
    {
      key: 'actions',
      title: t('groups.columns.actions'),
      render: (_, item) =>
        editable(item) && (
          <Space>
            <Button
              size="small"
              icon={<EditOutlined />}
              aria-label={t('groups.edit')}
              onClick={() => open(item)}
            />
            <Popconfirm
              title={t('groups.deleteConfirm', { name: item.name })}
              okText={t('groups.delete')}
              okButtonProps={{ danger: true }}
              onConfirm={() => remove(item)}
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                loading={busy === item.id}
                aria-label={t('groups.delete')}
              />
            </Popconfirm>
          </Space>
        ),
    },
  ];

  return (
    <PageContainer
      title={t('groups.title')}
      subtitle={t('groups.subtitle')}
      noindex
      loading={(!groups || !roles) && !error && !rolesError}
      error={error || rolesError}
      maxWidth={860}
      actions={
        canManage && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => open('new')}>
            {t('groups.add')}
          </Button>
        )
      }
    >
      {toastHolder}
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {!canManage && <Alert type="info" showIcon message={t('groups.readOnly')} />}
        <Alert type="info" showIcon message={t('groups.hint')} />
        <Card>
          <Table<GroupRead>
            rowKey="id"
            columns={columns}
            dataSource={groups ?? []}
            pagination={false}
            scroll={{ x: true }}
          />
        </Card>
      </Space>

      <Modal
        open={opened !== null}
        title={group ? `${t('groups.edit')}: ${group.name}` : t('groups.add')}
        okText={t('groups.save')}
        confirmLoading={saving}
        onOk={() => form.submit()}
        onCancel={() => setOpened(null)}
        // The form exists before the first opening, so `open` can fill it
        forceRender
      >
        <Form form={form} name="group" layout="vertical" requiredMark="optional" onFinish={save}>
          <Form.Item
            name="name"
            label={t('groups.name')}
            rules={[{ required: true, whitespace: true, message: t('groups.nameRequired') }]}
          >
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item name="roles" label={t('groups.roles')} extra={t('groups.ownOnly')}>
            <Select
              mode="multiple"
              allowClear
              optionFilterProp="label"
              options={(roles ?? [])
                .filter((role) => role.slug !== 'root')
                .map((role) => ({
                  value: role.slug,
                  label: roleName(role.slug),
                  disabled: !canGiveRole(me, role),
                }))}
            />
          </Form.Item>
          {/* Enter in a field submits the form (the visible button is the modal's OK) */}
          <button type="submit" hidden />
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Groups;
