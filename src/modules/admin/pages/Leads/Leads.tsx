import { Button, Descriptions, Modal, Popconfirm, Space, Tag, Typography, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { utc } from '../../../../api/dates';
import { getErrorMessage } from '../../../../api/errors';
import type { FormDescription, LeadRead } from '../../../../api/generated';
import DataTable from '../../../../components/DataTable/DataTable';
import type { DataTableColumn } from '../../../../components/DataTable/DataTable';
import PageContainer from '../../../../components/PageContainer/PageContainer';
import { useFormat } from '../../../../i18n/format';
import { useCan } from '../../../auth';
import { deleteLead, exportLeads, getLeadForms, getLeads, updateLead } from '../../api';
import { formatValue, leadSummary } from './leadText';
import './Leads.css';

const { Text, Title } = Typography;

const STATUSES: LeadRead['status'][] = ['new', 'done'];

const Leads = () => {
  const { t, i18n } = useTranslation('admin');
  const format = useFormat();
  const [toast, toastHolder] = message.useMessage();
  const [forms, setForms] = useState<Record<string, FormDescription>>({});
  const [open, setOpen] = useState<LeadRead | null>(null);
  const [busy, setBusy] = useState(false);
  const canManage = useCan('leads.manage');
  const canExport = useCan('leads.export');
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
        onExport={canExport ? exportLeads : undefined}
        pageSize={20}
        refreshKey={version}
        searchPlaceholder={t('leads.search')}
      />

      <Modal
        open={open !== null}
        onCancel={() => setOpen(null)}
        title={open && (form?.title ?? open.form)}
        width={640}
        footer={[
          ...(open && canManage
            ? [
                <Popconfirm
                  key="delete"
                  title={t('leads.deleteConfirm')}
                  okText={t('leads.delete')}
                  okButtonProps={{ danger: true }}
                  onConfirm={() => act(() => deleteLead(open.id), 'deleted')}
                >
                  <Button danger loading={busy}>
                    {t('leads.delete')}
                  </Button>
                </Popconfirm>,
                <Button
                  key="status"
                  loading={busy}
                  onClick={() => void setStatus(open, open.status === 'new' ? 'done' : 'new')}
                >
                  {t(open.status === 'new' ? 'leads.markDone' : 'leads.markNew')}
                </Button>,
              ]
            : []),
          <Button key="close" type="primary" onClick={() => setOpen(null)}>
            {t('leads.close')}
          </Button>,
        ]}
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
        {open && (
          <div className="lead-deliveries">
            <Title level={5}>{t('leads.deliveries')}</Title>
            {Object.keys(open.deliveries).length === 0 ? (
              <Text type="secondary">{t('leads.noDeliveries')}</Text>
            ) : (
              <Space direction="vertical" style={{ width: '100%' }}>
                {Object.entries(open.deliveries).map(([id, item]) => (
                  <div key={id}>
                    <Space wrap>
                      <Text strong>{item.channel}</Text>
                      <Tag color={item.status === 'sent' ? 'green' : 'red'}>
                        {t(`leads.delivery.${item.status}`)}
                      </Tag>
                      <Text type="secondary">{format.dateTime(utc(item.at))}</Text>
                    </Space>
                    {item.error && (
                      <Text type="danger" className="lead-delivery-error">
                        {item.error}
                      </Text>
                    )}
                  </div>
                ))}
              </Space>
            )}
          </div>
        )}
      </Modal>
    </PageContainer>
  );
};

export default Leads;
