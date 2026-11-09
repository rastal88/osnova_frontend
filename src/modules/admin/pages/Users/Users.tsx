import { Button, Popconfirm, Select, Tag, Typography, message } from 'antd';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { utc } from '../../../../api/dates';
import { getErrorMessage } from '../../../../api/errors';
import type { AdminUser, Role } from '../../../../api/generated';
import DataTable from '../../../../components/DataTable/DataTable';
import type { DataTableColumn } from '../../../../components/DataTable/DataTable';
import PageContainer from '../../../../components/PageContainer/PageContainer';
import { useFormat } from '../../../../i18n/format';
import { useAuthStore } from '../../../auth';
import { type UserChanges, getUsers, updateUser } from '../../api';
import { canChangeRole, canManage } from './permissions';

const { Text } = Typography;

const ROLES: Role[] = ['root', 'moderator', 'user'];
const ROLE_COLORS: Record<Role, string> = { root: 'gold', moderator: 'blue', user: 'default' };

const Users = () => {
  const { t } = useTranslation(['admin', 'auth']);
  const format = useFormat();
  const me = useAuthStore((state) => state.user);
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

    return [
      { key: 'email', title: t('users.columns.email'), sortable: true },
      {
        key: 'role',
        title: t('users.columns.role'),
        sortable: true,
        filters: ROLES.map((role) => ({ text: t(`auth:roles.${role}`), value: role })),
        render: (_, user) =>
          canChangeRole(me, user) ? (
            <Select<Role>
              size="small"
              value={user.role}
              disabled={busy === user.id}
              aria-label={t('users.columns.role')}
              options={(['user', 'moderator'] as const).map((role) => ({
                value: role,
                label: t(`auth:roles.${role}`),
              }))}
              onChange={(role) => void change(user, { role: role as UserChanges['role'] })}
              style={{ minWidth: 140 }}
            />
          ) : (
            <Tag color={ROLE_COLORS[user.role]}>{t(`auth:roles.${user.role}`)}</Tag>
          ),
      },
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
          canManage(me, user) && (
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
  }, [t, format, me, busy, toast]);

  return (
    <PageContainer title={t('users.title')} subtitle={t('users.subtitle')} noindex>
      {toastHolder}
      <DataTable<AdminUser>
        columns={columns}
        rowKey="id"
        fetch={getUsers}
        pageSize={20}
        refreshKey={version}
        searchPlaceholder={t('users.search')}
      />
    </PageContainer>
  );
};

export default Users;
