import { Card, Descriptions, Segmented, Tag, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import DataTable from '../../components/DataTable/DataTable';
import type { DataTableColumn } from '../../components/DataTable/DataTable';
import PageContainer from '../../components/PageContainer/PageContainer';
import { useFormat } from '../../i18n/format';
import { ORDER_STATUSES, fetchOrders, orders } from './orders';
import type { Order, OrderStatus } from './orders';
import './ExampleData.css';

const { Text } = Typography;

const STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'blue',
  paid: 'green',
  shipped: 'purple',
  cancelled: 'default',
};

type Mode = 'local' | 'remote';

/** Example page: locale-aware formatting and a table over local or "server" data. */
const ExampleData = () => {
  const { t } = useTranslation('examples');
  const format = useFormat();
  const [mode, setMode] = useState<Mode>('local');
  const sample = orders[3];

  const columns = useMemo<DataTableColumn<Order>[]>(
    () => [
      {
        key: 'number',
        title: t('data.columns.number'),
        sortable: true,
        searchable: true,
        render: (_, order) => `#${order.number}`,
      },
      {
        key: 'customer',
        title: t('data.columns.customer'),
        sortable: true,
        searchable: true,
      },
      {
        key: 'createdAt',
        title: t('data.columns.createdAt'),
        sortable: true,
        render: (_, order) => (
          <span className="example-data-date">
            {format.date(order.createdAt)}
            <Text type="secondary">{format.relative(order.createdAt)}</Text>
          </span>
        ),
      },
      {
        key: 'status',
        title: t('data.columns.status'),
        filters: ORDER_STATUSES.map((status) => ({
          text: t(`data.status.${status}`),
          value: status,
        })),
        render: (_, order) => (
          <Tag color={STATUS_COLORS[order.status]}>{t(`data.status.${order.status}`)}</Tag>
        ),
      },
      {
        key: 'total',
        title: t('data.columns.total'),
        align: 'right',
        sortable: true,
        render: (_, order) => format.currency(order.total),
      },
    ],
    [t, format],
  );

  return (
    <PageContainer title={t('data.title')} subtitle={t('data.subtitle')} seo="exampleData">
      <Card title={t('data.formatTitle')} className="example-data-card">
        <Descriptions
          size="small"
          column={{ xs: 1, sm: 2, lg: 3 }}
          items={[
            { key: 'date', label: t('data.format.date'), children: format.date(sample.createdAt) },
            {
              key: 'dateTime',
              label: t('data.format.dateTime'),
              children: format.dateTime(sample.createdAt),
            },
            {
              key: 'relative',
              label: t('data.format.relative'),
              children: format.relative(sample.createdAt),
            },
            { key: 'number', label: t('data.format.number'), children: format.number(1234567.891) },
            { key: 'percent', label: t('data.format.percent'), children: format.percent(0.256, 1) },
            { key: 'compact', label: t('data.format.compact'), children: format.compact(1530000) },
            {
              key: 'currency',
              label: t('data.format.currency'),
              children: format.currency(sample.total),
            },
          ]}
        />
        <Text type="secondary">{t('data.formatHint')}</Text>
      </Card>

      <Card title={t('data.tableTitle')} className="example-data-card">
        <Text type="secondary" className="example-data-hint">
          {t(mode === 'local' ? 'data.localHint' : 'data.remoteHint')}
        </Text>
        <DataTable<Order>
          key={mode}
          {...(mode === 'local' ? { data: orders } : { fetch: fetchOrders })}
          columns={columns}
          rowKey="id"
          searchPlaceholder={t('data.searchPlaceholder')}
          toolbar={
            <Segmented<Mode>
              value={mode}
              onChange={setMode}
              options={[
                { value: 'local', label: t('data.modes.local') },
                { value: 'remote', label: t('data.modes.remote') },
              ]}
            />
          }
        />
      </Card>
    </PageContainer>
  );
};

export default ExampleData;
