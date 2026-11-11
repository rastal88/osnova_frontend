import { Button, Popconfirm, Select, Space, Tag, Typography, message } from 'antd';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { utc } from '../../../../api/dates';
import { getErrorMessage } from '../../../../api/errors';
import type { AdminUser } from '../../../../api/generated';
import DataTable from '../../../../components/DataTable/DataTable';
import type { DataTableColumn } from '../../../../components/DataTable/DataTable';
import PageContainer from '../../../../components/PageContainer/PageContainer';
import { useFormat } from '../../../../i18n/format';
import { useAuthStore, useCan } from '../../../auth';
import {
  accountPermissions,
  canGiveRole,
  covers,
  permissionsOf,
  useGroups,
  useRoles,
} from '../../access';
import { type UserChanges, exportUsers, getUsers, updateUser } from '../../api';
import { canChangeRole, canManage } from './permissions';

const { Text } = Typography;

const ROLE_COLORS: Record<string, string> = { root: 'gold', moderator: 'blue', user: 'default' };

const Users = () => {
  const { t } = useTranslation('admin');
  const { roles, roleName } = useRoles();
  const { groups } = useGroups();
  const format = useFormat();
  const me = useAuthStore((state) => state.user);
  const canExport = useCan('users.export');
  const [toast, toastHolder] = message.useMessage();
  // Changing it makes the table fetch the current page again
  const [version, setVersion] = useState(0);
  const [busy, setBusy] = useState<string | null>(null);

  const columns = useMemo<DataTableColumn<AdminUser>[]>(() => {
    const change = async (user: AdminUser, changes: UserChanges) => {
      setBusy(user.id);
      try {
        await updateUser(user.id, changes);
        toast.success(t('users.saved'));
        setVersion((value) => value + 1);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setBusy(null);
      }
    };

    const date = (value: string | null | undefined) =>
      value ? (
        <span title={format.dateTime(utc(value))}>{format.relative(utc(value))}</span>
      ) : (
        <Text type="secondary">—</Text>
      );

    // With what the user may do, to know whether `me` may change them
    const account = (user: AdminUser) => ({
      ...user,
      permissions: accountPermissions(user, roles ?? [], groups ?? []),
    });
    const groupName = (id: string) => groups?.find((group) => group.id === id)?.name ?? id;

    return [
      { key: 'email', title: t('users.columns.email'), sortable: true },
      {
        key: 'role',
        title: t('users.columns.role'),
        sortable: true,
        filters: roles?.map((role) => ({ text: roleName(role.slug), value: role.slug })),
        render: (_, user) =>
          canChangeRole(me, account(user)) ? (
            <Select
              size="small"
              value={user.role}
              disabled={busy === user.id}
              aria-label={t('users.columns.role')}
              options={(roles ?? [])
                .filter((role) => role.slug !== 'root')
                .map((role) => ({
                  value: role.slug,
                  label: roleName(role.slug),
                  disabled: !canGiveRole(me, role),
                }))}
              onChange={(role) => void change(user, { role })}
              style={{ minWidth: 140 }}
            />
          ) : (
            <Tag color={ROLE_COLORS[user.role] ?? 'purple'}>{roleName(user.role)}</Tag>
          ),
      },
      // Shown when the project has groups; the key is the backend filter
      ...(groups?.length
        ? [
            {
              key: 'group',
              title: t('users.columns.groups'),
              filters: groups.map((group) => ({ text: group.name, value: group.id })),
              render: (_: unknown, user: AdminUser) =>
                canChangeRole(me, account(user)) ? (
                  <Select
                    size="small"
                    mode="multiple"
                    value={user.groups ?? []}
                    disabled={busy === user.id}
                    aria-label={t('users.columns.groups')}
                    placeholder="—"
                    optionFilterProp="label"
                    options={groups.map((group) => ({
                      value: group.id,
                      label: group.name,
                      disabled: !covers(me, permissionsOf(group.roles, roles ?? [])),
                    }))}
                    onChange={(ids) => void change(user, { groups: ids })}
                    style={{ minWidth: 160 }}
                  />
                ) : (
                  <Space wrap size={[0, 4]}>
                    {(user.groups ?? []).map((id) => (
                      <Tag key={id}>{groupName(id)}</Tag>
                    ))}
                  </Space>
                ),
            },
          ]
        : []),
      {
        key: 'status',
        title: t('users.columns.status'),
        filters: (['active', 'blocked'] as const).map((status) => ({
          text: t(`users.status.${status}`),
          value: status,
        })),
        render: (_, user) => (
          <Tag color={user.is_active ? 'green' : 'red'}>
            {t(`users.status.${user.is_active ? 'active' : 'blocked'}`)}
          </Tag>
        ),
      },
      {
        key: 'date_created',
        title: t('users.columns.created'),
        sortable: true,
        render: (_, user) => date(user.date_created),
      },
      {
        key: 'last_login',
        title: t('users.columns.lastLogin'),
        sortable: true,
        render: (_, user) => date(user.last_login),
      },
      {
        key: 'actions',
        title: t('users.columns.actions'),
        render: (_, user) =>
          canManage(me, account(user)) && (
            <Popconfirm
              title={t(user.is_active ? 'users.blockConfirm' : 'users.unblockConfirm', {
                email: user.email,
              })}
              okText={t(user.is_active ? 'users.block' : 'users.unblock')}
              okButtonProps={{ danger: user.is_active }}
              onConfirm={() => change(user, { is_active: !user.is_active })}
            >
              <Button size="small" danger={user.is_active} loading={busy === user.id}>
                {t(user.is_active ? 'users.block' : 'users.unblock')}
              </Button>
            </Popconfirm>
          ),
      },
    ];
  }, [t, roles, groups, roleName, format, me, busy, toast]);

  return (
    <PageContainer title={t('users.title')} subtitle={t('users.subtitle')} noindex>
      {toastHolder}
      <DataTable<AdminUser>
        columns={columns}
        rowKey="id"
        fetch={getUsers}
        onExport={canExport ? exportUsers : undefined}
        pageSize={20}
        refreshKey={version}
        searchPlaceholder={t('users.search')}
      />
    </PageContainer>
  );
};

export default Users;
