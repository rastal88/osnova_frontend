import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import type { TableColumnsType } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { getErrorMessage } from '../../../../api/errors';
import type { PermissionRead, RoleRead } from '../../../../api/generated';
import PageContainer from '../../../../components/PageContainer/PageContainer';
import { setServerFieldErrors } from '../../../../utils/formErrors';
import { useAuthStore, useCan } from '../../../auth';
import { canDeleteRole, canEditRole, covers, useRoles } from '../../access';
import { createRole, deleteRole, getPermissions, updateRole } from '../../api';
import PermissionPicker from './PermissionPicker';

interface RoleValues {
  name: string;
  permissions: string[];
}

/** The role being opened, or `new` for a new one. */
type Opened = RoleRead | 'new';

const Roles = () => {
  const { t, i18n } = useTranslation('admin');
  const me = useAuthStore((state) => state.user);
  const canManage = useCan('roles.manage');
  const { roles, error, reload, roleName } = useRoles();
  const [permissions, setPermissions] = useState<PermissionRead[] | null>(null);
  const [opened, setOpened] = useState<Opened | null>(null);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [form] = Form.useForm<RoleValues>();
  const [toast, toastHolder] = message.useMessage();
  const language = i18n.language;

  // Permission titles come translated from the backend
  // biome-ignore lint/correctness/useExhaustiveDependencies: `language` triggers a reload
  useEffect(() => {
    getPermissions()
      .then(setPermissions)
      .catch(() => setPermissions([]));
  }, [language]);

  const role = opened === 'new' ? null : opened;
  const editable = opened === 'new' || (role !== null && canEditRole(me, role));

  const open = (next: Opened) => {
    form.resetFields();
    form.setFieldsValue(
      next === 'new'
        ? { name: '', permissions: [] }
        : { name: roleName(next.slug), permissions: next.permissions },
    );
    setOpened(next);
  };

  const save = async (values: RoleValues) => {
    setSaving(true);
    try {
      if (role) {
        await updateRole(role.slug, {
          // Built-in roles keep their names
          ...(role.system ? {} : { name: values.name }),
          permissions: values.permissions,
        });
      } else {
        await createRole(values);
      }
      toast.success(t('roles.saved'));
      setOpened(null);
      await reload();
    } catch (err) {
      if (!setServerFieldErrors(form, err, ['name'])) toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: RoleRead) => {
    setBusy(item.slug);
    try {
      await deleteRole(item.slug);
      toast.success(t('roles.deleted'));
      await reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const columns: TableColumnsType<RoleRead> = [
    {
      key: 'name',
      title: t('roles.columns.name'),
      render: (_, item) => (
        <Space>
          {roleName(item.slug)}
          {item.system && <Tag>{t('roles.system')}</Tag>}
        </Space>
      ),
    },
    {
      key: 'permissions',
      title: t('roles.columns.permissions'),
      render: (_, item) =>
        item.slug === 'root' ? t('roles.allPermissions') : item.permissions.length,
    },
    {
      key: 'users',
      title: t('roles.columns.users'),
      // The users list filtered by this role
      render: (_, item) =>
        item.users > 0 ? <Link to={`/admin/users?role=${item.slug}`}>{item.users}</Link> : 0,
    },
    {
      key: 'actions',
      title: t('roles.columns.actions'),
      render: (_, item) => (
        <Space>
          <Button
            size="small"
            icon={canEditRole(me, item) ? <EditOutlined /> : <EyeOutlined />}
            aria-label={t(canEditRole(me, item) ? 'roles.edit' : 'roles.view')}
            onClick={() => open(item)}
          />
          {canDeleteRole(me, item) && (
            <Popconfirm
              title={t('roles.deleteConfirm', { name: item.name })}
              okText={t('roles.delete')}
              okButtonProps={{ danger: true }}
              onConfirm={() => remove(item)}
            >
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                loading={busy === item.slug}
                aria-label={t('roles.delete')}
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title={t('roles.title')}
      subtitle={t('roles.subtitle')}
      noindex
      loading={!roles && !error}
      error={error}
      maxWidth={860}
      actions={
        canManage && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => open('new')}>
            {t('roles.add')}
          </Button>
        )
      }
    >
      {toastHolder}
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {!canManage && <Alert type="info" showIcon message={t('roles.readOnly')} />}
        <Card>
          <Table<RoleRead>
            rowKey="slug"
            columns={columns}
            dataSource={roles ?? []}
            pagination={false}
            scroll={{ x: true }}
          />
        </Card>
      </Space>

      <Modal
        open={opened !== null}
        title={
          role
            ? `${t(editable ? 'roles.edit' : 'roles.view')}: ${roleName(role.slug)}`
            : t('roles.add')
        }
        okText={t('roles.save')}
        okButtonProps={{ hidden: !editable }}
        cancelText={t(editable ? 'roles.cancel' : 'roles.close')}
        confirmLoading={saving}
        onOk={() => form.submit()}
        onCancel={() => setOpened(null)}
        // The form exists before the first opening, so `open` can fill it
        forceRender
      >
        <Form form={form} name="role" layout="vertical" requiredMark="optional" onFinish={save}>
          <Form.Item
            name="name"
            label={t('roles.name')}
            rules={[{ required: true, whitespace: true, message: t('roles.nameRequired') }]}
            extra={role?.system && t('roles.systemName')}
          >
            <Input maxLength={100} disabled={!editable || role?.system} />
          </Form.Item>
          {role?.slug === 'root' ? (
            <Typography.Text type="secondary">{t('roles.rootHint')}</Typography.Text>
          ) : (
            <Form.Item
              name="permissions"
              label={t('roles.permissions')}
              extra={editable && t('roles.ownOnly')}
            >
              <PermissionPicker
                permissions={permissions ?? []}
                allowed={(permission) => covers(me, [permission])}
                disabled={!editable}
              />
            </Form.Item>
          )}
          {/* Enter in a field submits the form (the visible button is the modal's OK) */}
          <button type="submit" hidden />
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Roles;
