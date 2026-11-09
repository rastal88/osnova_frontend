import { Button, Descriptions, Drawer, Popconfirm, Space, Tag, Typography, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { utc } from '../../../../api/dates';
import { getErrorMessage } from '../../../../api/errors';
import type { FormDescription, LeadRead } from '../../../../api/generated';
import DataTable from '../../../../components/DataTable/DataTable';
import type { DataTableColumn } from '../../../../components/DataTable/DataTable';
import PageContainer from '../../../../components/PageContainer/PageContainer';
import { useFormat } from '../../../../i18n/format';
import { deleteLead, getLeadForms, getLeads, updateLead } from '../../api';
import { formatValue, leadSummary } from './leadText';

const { Text } = Typography;

const STATUSES: LeadRead['status'][] = ['new', 'done'];

const Leads = () => {
  const { t, i18n } = useTranslation('admin');
  const format = useFormat();
  const [toast, toastHolder] = message.useMessage();
  const [forms, setForms] = useState<Record<string, FormDescription>>({});
  const [open, setOpen] = useState<LeadRead | null>(null);
  const [busy, setBusy] = useState(false);
  // Changing it makes the table fetch the current page again
  const [version, setVersion] = useState(0);
  const language = i18n.language;

  // Form titles and field labels come translated from the backend
  // biome-ignore lint/correctness/useExhaustiveDependencies: `language` triggers a reload
  useEffect(() => {
    getLeadForms().then(
      (list) => setForms(Object.fromEntries(list.map((form) => [form.name, form]))),
      () => setForms({}),
    );
  }, [language]);

  const act = async (action: () => Promise<unknown>, done: 'saved' | 'deleted' = 'saved') => {
    setBusy(true);
    try {
      await action();
      toast.success(t(`leads.${done}`));
      setVersion((value) => value + 1);
      if (done === 'deleted') setOpen(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const setStatus = (lead: LeadRead, status: LeadRead['status']) =>
    act(async () => setOpen(await updateLead(lead.id, status)));

  const columns = useMemo<DataTableColumn<LeadRead>[]>(
    () => [
      {
        key: 'created_at',
        title: t('leads.columns.received'),
        sortable: true,
        render: (_, lead) => (
          <span title={format.dateTime(utc(lead.created_at))}>
            {format.relative(utc(lead.created_at))}
          </span>
        ),
      },
      {
        key: 'form',
        title: t('leads.columns.form'),
        sortable: true,
        filters: Object.values(forms).map((form) => ({ text: form.title, value: form.name })),
        render: (_, lead) => forms[lead.form]?.title ?? lead.form,
      },
      {
        key: 'summary',
        title: t('leads.columns.summary'),
        render: (_, lead) => (
          <Text ellipsis style={{ maxWidth: 360 }}>
            {leadSummary(forms[lead.form], lead.data) || '—'}
          </Text>
        ),
      },
      {
        key: 'status',
        title: t('leads.columns.status'),
        sortable: true,
        filters: STATUSES.map((status) => ({ text: t(`leads.status.${status}`), value: status })),
        render: (_, lead) => (
          <Tag color={lead.status === 'new' ? 'blue' : 'default'}>
            {t(`leads.status.${lead.status}`)}
          </Tag>
        ),
      },
      {
        key: 'actions',
        title: '',
        render: (_, lead) => (
          <Button size="small" onClick={() => setOpen(lead)}>
            {t('leads.open')}
          </Button>
        ),
      },
    ],
    [t, format, forms],
  );

  const form = open ? forms[open.form] : undefined;
  const yesNo = { yes: t('leads.yes'), no: t('leads.no') };
  // Fields of the form first (in its order), then anything else that was stored
  const keys = open
    ? [
        ...(form?.fields.map((field) => field.name) ?? []),
        ...Object.keys(open.data).filter((key) => !form?.fields.some((f) => f.name === key)),
      ]
    : [];

  return (
    <PageContainer title={t('leads.title')} subtitle={t('leads.subtitle')} noindex>
      {toastHolder}
      <DataTable<LeadRead>
        columns={columns}
        rowKey="id"
        fetch={getLeads}
        pageSize={20}
        refreshKey={version}
        searchPlaceholder={t('leads.search')}
      />

      <Drawer
        open={open !== null}
        onClose={() => setOpen(null)}
        title={open && (form?.title ?? open.form)}
        width={520}
        extra={
          open && (
            <Space>
              <Button
                loading={busy}
                onClick={() => void setStatus(open, open.status === 'new' ? 'done' : 'new')}
              >
                {t(open.status === 'new' ? 'leads.markDone' : 'leads.markNew')}
              </Button>
              <Popconfirm
                title={t('leads.deleteConfirm')}
                okText={t('leads.delete')}
                okButtonProps={{ danger: true }}
                onConfirm={() => act(() => deleteLead(open.id), 'deleted')}
              >
                <Button danger loading={busy}>
                  {t('leads.delete')}
                </Button>
              </Popconfirm>
            </Space>
          )
        }
      >
        {open && (
          <Descriptions column={1} bordered size="small">
            {keys.map((key) => {
              const field = form?.fields.find((item) => item.name === key);
              return (
                <Descriptions.Item key={key} label={field?.label ?? key}>
                  <span style={{ whiteSpace: 'pre-wrap' }}>
                    {formatValue(field, open.data[key], yesNo)}
                  </span>
                </Descriptions.Item>
              );
            })}
            <Descriptions.Item label={t('leads.columns.received')}>
              {format.dateTime(utc(open.created_at))}
            </Descriptions.Item>
            <Descriptions.Item label={t('leads.language')}>
              {open.language.toUpperCase()}
            </Descriptions.Item>
            <Descriptions.Item label={t('leads.columns.status')}>
              {t(`leads.status.${open.status}`)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default Leads;
