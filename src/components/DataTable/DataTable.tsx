import { DownloadOutlined } from '@ant-design/icons';
import { Alert, Button, Input, Space, Table, message } from 'antd';
import type { TableProps } from 'antd';
import type { ColumnType } from 'antd/es/table';
import type { SorterResult } from 'antd/es/table/interface';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Key, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';

import { getErrorMessage } from '../../api/errors';
import { applyQuery, compareValues, lastPage, readQuery, writeQuery } from './query';
import type { RowAccessors, TablePage, TableQuery } from './query';
import './DataTable.css';

export type { TablePage, TableQuery } from './query';

export interface DataTableColumn<T>
  extends Omit<
    ColumnType<T>,
    'key' | 'dataIndex' | 'sorter' | 'sortOrder' | 'filters' | 'filteredValue' | 'onFilter'
  > {
  /** Field name: used as dataIndex, in the URL and in the query sent to the server */
  key: string;
  /** Value for search, filters and sorting of local data (default: row[key]) */
  value?: (row: T) => unknown;
  /** true sorts by value; a function sets the order of local data */
  sortable?: boolean | ((a: T, b: T) => number);
  filters?: { text: ReactNode; value: string }[];
  /** Included in the search box (local data) */
  searchable?: boolean;
}

type Source<T> =
  | { data: T[]; fetch?: never }
  | { fetch: (query: TableQuery) => Promise<TablePage<T>>; data?: never };

export type DataTableProps<T> = Source<T> & {
  columns: DataTableColumn<T>[];
  rowKey: string | ((row: T) => Key);
  pageSize?: number;
  /** Prefix for URL parameters, for several tables on one page */
  urlPrefix?: string;
  /** Show the search box (default: when a column is searchable or data is remote) */
  search?: boolean;
  searchPlaceholder?: string;
  /** Extra controls next to the search box */
  toolbar?: ReactNode;
  /**
   * Shows an export button; called with the current search, sort and filters (e.g. to
   * download everything that matches as a file from the server)
   */
  onExport?: (query: TableQuery) => Promise<void>;
  /** Remote data: a new value fetches the current page again (e.g. after a row changed) */
  refreshKey?: unknown;
};

const SEARCH_DELAY_MS = 300;

/**
 * Table with search, column filters, sorting and pagination, kept in the URL.
 * Pass `data` to work in the browser, or `fetch` to ask the server for each page.
 * `onExport` adds an export button to the toolbar.
 */
function DataTable<T extends object>(props: DataTableProps<T>) {
  const {
    columns,
    rowKey,
    pageSize: defaultPageSize = 10,
    urlPrefix = '',
    searchPlaceholder,
    toolbar,
    onExport,
    refreshKey,
  } = props;
  const { t, i18n } = useTranslation();
  const [params, setParams] = useSearchParams();

  const filterKeys = useMemo(
    () => columns.filter((column) => column.filters).map((column) => column.key),
    [columns],
  );
  const query = readQuery(params, urlPrefix, defaultPageSize, filterKeys);
  const queryKey = JSON.stringify(query);

  const update = (patch: Partial<TableQuery>) => {
    setParams(
      (current) =>
        writeQuery(current, urlPrefix, { ...query, ...patch }, defaultPageSize, filterKeys),
      { replace: true },
    );
  };

  // Search box: typed text goes to the URL after a short pause
  const [searchText, setSearchText] = useState(query.search);
  useEffect(() => setSearchText(query.search), [query.search]);
  const updateRef = useRef(update);
  updateRef.current = update;
  useEffect(() => {
    if (searchText.trim() === query.search.trim()) return;
    const timer = setTimeout(
      () => updateRef.current({ search: searchText, page: 1 }),
      SEARCH_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [searchText, query.search]);

  // Local data
  const language = i18n.language;
  const accessors = useMemo<RowAccessors<T>>(() => {
    const read = (column: DataTableColumn<T>) =>
      column.value ?? ((row: T) => (row as Record<string, unknown>)[column.key]);
    const result: RowAccessors<T> = { search: [], value: {}, compare: {} };
    for (const column of columns) {
      const value = read(column);
      result.value[column.key] = value;
      if (column.searchable) result.search.push(value);
      if (typeof column.sortable === 'function') result.compare[column.key] = column.sortable;
      else if (column.sortable) {
        result.compare[column.key] = (a, b) => compareValues(value(a), value(b), language);
      }
    }
    return result;
  }, [columns, language]);
  const localPage = useMemo(
    () => (props.data ? applyQuery(props.data, JSON.parse(queryKey), accessors) : null),
    [props.data, queryKey, accessors],
  );

  // Remote data: the latest fetch function is kept in a ref, so an inline one does not loop
  const fetchRef = useRef(props.fetch);
  fetchRef.current = props.fetch;
  const isRemote = Boolean(props.fetch);
  const [remotePage, setRemotePage] = useState<TablePage<T> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // biome-ignore lint/correctness/useExhaustiveDependencies: `attempt` and `refreshKey` trigger a reload
  useEffect(() => {
    const fetch = fetchRef.current;
    if (!fetch) return;
    let active = true;
    setLoading(true);
    setError(null);
    fetch(JSON.parse(queryKey)).then(
      (page) => {
        if (!active) return;
        setRemotePage(page);
        setLoading(false);
      },
      (reason) => {
        if (!active) return;
        setError(getErrorMessage(reason));
        setLoading(false);
      },
    );
    return () => {
      active = false;
    };
  }, [queryKey, attempt, refreshKey]);

  const [toast, toastHolder] = message.useMessage();
  const [exporting, setExporting] = useState(false);
  const runExport = async () => {
    if (!onExport) return;
    setExporting(true);
    try {
      await onExport(query);
    } catch (reason) {
      toast.error(getErrorMessage(reason));
    } finally {
      setExporting(false);
    }
  };

  const page = localPage ?? remotePage ?? { items: [], total: 0 };
  const current = Math.min(query.page, lastPage(page.total, query.pageSize));
  const showSearch = props.search ?? (isRemote || columns.some((column) => column.searchable));

  const tableColumns: ColumnType<T>[] = columns.map(
    ({ key, value: _value, sortable, filters, searchable: _searchable, ...rest }) => ({
      ...rest,
      key,
      dataIndex: key,
      sorter: sortable ? true : undefined,
      sortOrder:
        query.sort?.field === key ? (query.sort.order === 'asc' ? 'ascend' : 'descend') : null,
      filters,
      filteredValue: filters ? (query.filters[key] ?? null) : undefined,
    }),
  );

  const handleChange: TableProps<T>['onChange'] = (pagination, filters, sorter, extra) => {
    if (extra.action === 'paginate') {
      const nextSize = pagination.pageSize ?? query.pageSize;
      update({
        pageSize: nextSize,
        page: nextSize === query.pageSize ? (pagination.current ?? 1) : 1,
      });
    } else if (extra.action === 'sort') {
      const { columnKey, order } = (Array.isArray(sorter) ? sorter[0] : sorter) as SorterResult<T>;
      update({
        sort:
          order && columnKey
            ? {
                field: String(columnKey),
                order: order === 'ascend' ? 'asc' : 'desc',
              }
            : null,
        page: 1,
      });
    } else if (extra.action === 'filter') {
      const next: Record<string, string[]> = {};
      for (const [key, values] of Object.entries(filters)) {
        if (values?.length) next[key] = values.map(String);
      }
      update({ filters: next, page: 1 });
    }
  };

  return (
    <div className="data-table">
      {toastHolder}
      {(showSearch || toolbar || onExport) && (
        <Space className="data-table-toolbar" wrap>
          {showSearch && (
            <Input.Search
              allowClear
              value={searchText}
              placeholder={searchPlaceholder ?? t('table.search')}
              onChange={(event) => setSearchText(event.target.value)}
              onSearch={(value) => update({ search: value, page: 1 })}
              className="data-table-search"
            />
          )}
          {toolbar}
          {onExport && (
            <Button icon={<DownloadOutlined />} loading={exporting} onClick={runExport}>
              {t('table.export')}
            </Button>
          )}
        </Space>
      )}

      {error && (
        <Alert
          className="data-table-error"
          type="error"
          showIcon
          message={error}
          action={
            <Button size="small" onClick={() => setAttempt((value) => value + 1)}>
              {t('state.tryAgain')}
            </Button>
          }
        />
      )}

      <Table<T>
        columns={tableColumns}
        dataSource={page.items}
        rowKey={rowKey}
        loading={loading}
        onChange={handleChange}
        scroll={{ x: 'max-content' }}
        pagination={{
          current,
          pageSize: query.pageSize,
          total: page.total,
          showSizeChanger: true,
          showTotal: (total) => t('table.total', { count: total }),
        }}
      />
    </div>
  );
}

export default DataTable;
