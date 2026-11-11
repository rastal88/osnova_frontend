import { Input, Space, Typography } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { utc } from '../../../../api/dates';
import type { AuditAction, AuditRead } from '../../../../api/generated';
import DataTable from '../../../../components/DataTable/DataTable';
import type { DataTableColumn, TableQuery } from '../../../../components/DataTable/DataTable';
import PageContainer from '../../../../components/PageContainer/PageContainer';
import { useFormat } from '../../../../i18n/format';
import { useRoles } from '../../access';
import { getAudit, getAuditActions } from '../../api';
import { changeLines, plainText } from './changes';

const { Text } = Typography;

/** Fields whose values are role slugs */
const ROLE_FIELDS = new Set(['role', 'roles']);

/**
 * Admin → Audit log: who changed what in the admin and when (backend:
 * app/modules/admin/audit.py). Search, filters and the period are kept in the URL.
 */
const Audit = () => {
  const { t, i18n } = useTranslation('admin');
  const format = useFormat();
  const { roleName } = useRoles();
  const [params, setParams] = useSearchParams();
  const [actions, setActions] = useState<AuditAction[]>([]);
  const since = params.get('since') ?? '';
  const until = params.get('until') ?? '';
  const language = i18n.language;

  // Action titles come translated from the backend
  // biome-ignore lint/correctness/useExhaustiveDependencies: `language` triggers a reload
  useEffect(() => {
    getAuditActions()
      .then(setActions)
      .catch(() => setActions([]));
  }, [language]);

  const setPeriod = (name: 'since' | 'until', value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(name, value);
    else next.delete(name);
    // A new period starts from the first page
    next.delete('page');
    setParams(next, { replace: true });
  };

  const fetch = useCallback(
    (query: TableQuery) =>
      getAudit(query, { since: since || undefined, until: until || undefined }),
    [since, until],
  );

  const columns = useMemo<DataTableColumn<AuditRead>[]>(() => {
    const text = plainText(t('audit.yes'), t('audit.no'), (field, value) =>
      ROLE_FIELDS.has(field) ? roleName(value) : value,
    );

    return [
      {
        key: 'created_at',
        title: t('audit.columns.time'),
        sortable: true,
        render: (_, record) => (
          <span title={format.relative(utc(record.created_at))}>
            {format.dateTime(utc(record.created_at))}
          </span>
        ),
      },
      {
        key: 'actor_email',
        title: t('audit.columns.actor'),
        sortable: true,
        render: (_, record) => (
          <Space direction="vertical" size={0}>
            {record.actor_email}
            {record.ip && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.ip}
              </Text>
            )}
          </Space>
        ),
      },
      {
        key: 'action',
        title: t('audit.columns.action'),
        sortable: true,
        filters: actions.map((action) => ({ text: action.title, value: action.name })),
        render: (_, record) => record.title,
      },
      {
        key: 'target',
        title: t('audit.columns.target'),
        render: (_, record) => record.target ?? <Text type="secondary">—</Text>,
      },
      {
        key: 'changes',
        title: t('audit.columns.changes'),
        render: (_, record) => (
          <Space direction="vertical" size={0}>
            {changeLines(record.changes, text).map((line) => (
              <span key={line.field}>
                <Text type="secondary">{line.field}: </Text>
                {line.value ?? `${line.before} → ${line.after}`}
              </span>
            ))}
          </Space>
        ),
      },
    ];
  }, [t, format, actions, roleName]);

  return (
    <PageContainer title={t('audit.title')} subtitle={t('audit.subtitle')} noindex>
      <DataTable<AuditRead>
        columns={columns}
        rowKey="id"
        fetch={fetch}
        refreshKey={`${since}/${until}`}
        pageSize={20}
        searchPlaceholder={t('audit.search')}
        toolbar={
          // Native date inputs: no date library in the bundle
          <Space wrap>
            <Input
              type="date"
              value={since}
              max={until || undefined}
              aria-label={t('audit.since')}
              addonBefore={t('audit.since')}
              onChange={(event) => setPeriod('since', event.target.value)}
            />
            <Input
              type="date"
              value={until}
              min={since || undefined}
              aria-label={t('audit.until')}
              addonBefore={t('audit.until')}
              onChange={(event) => setPeriod('until', event.target.value)}
            />
          </Space>
        }
      />
    </PageContainer>
  );
};

export default Audit;
