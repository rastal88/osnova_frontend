import { describe, expect, it } from 'vitest';

import {
  type RowAccessors,
  type TableQuery,
  applyQuery,
  compareValues,
  lastPage,
  readQuery,
  writeQuery,
} from './query';

const query = (overrides: Partial<TableQuery> = {}): TableQuery => ({
  page: 1,
  pageSize: 10,
  search: '',
  sort: null,
  filters: {},
  ...overrides,
});

describe('readQuery / writeQuery', () => {
  it('reads defaults from an empty URL', () => {
    expect(readQuery(new URLSearchParams(), '', 10, ['status'])).toEqual(query());
  });

  it('ignores invalid page numbers', () => {
    const params = new URLSearchParams('page=-2&size=abc');
    expect(readQuery(params, '', 10, [])).toMatchObject({ page: 1, pageSize: 10 });
  });

  it('round-trips a query with a prefix and keeps other parameters', () => {
    const value = query({
      page: 3,
      pageSize: 25,
      search: 'smith',
      sort: { field: 'total', order: 'desc' },
      filters: { status: ['paid', 'new'] },
    });
    const params = writeQuery(new URLSearchParams('tab=orders'), 'o_', value, 10, ['status']);

    expect(params.toString()).toBe(
      'tab=orders&o_q=smith&o_page=3&o_size=25&o_sort=-total&o_status=paid%2Cnew',
    );
    expect(readQuery(params, 'o_', 10, ['status'])).toEqual(value);
  });

  it('leaves defaults out of the URL', () => {
    const params = writeQuery(
      new URLSearchParams('page=4&q=old'),
      '',
      query({ search: '  ' }),
      10,
      [],
    );
    expect(params.toString()).toBe('');
  });
});

describe('applyQuery', () => {
  interface Row {
    name: string;
    status: string;
    total: number;
  }
  const rows: Row[] = [
    { name: 'Alice', status: 'paid', total: 30 },
    { name: 'Bob', status: 'new', total: 10 },
    { name: 'Carol', status: 'paid', total: 20 },
    { name: 'alan', status: 'cancelled', total: 5 },
  ];
  const accessors: RowAccessors<Row> = {
    search: [(row) => row.name],
    value: { status: (row) => row.status },
    compare: { total: (a, b) => a.total - b.total },
  };
  const names = (page: { items: Row[] }) => page.items.map((row) => row.name);

  it('searches case-insensitively', () => {
    expect(names(applyQuery(rows, query({ search: ' AL ' }), accessors))).toEqual([
      'Alice',
      'alan',
    ]);
  });

  it('filters, sorts and paginates', () => {
    const result = applyQuery(
      rows,
      query({
        filters: { status: ['paid', 'new'] },
        sort: { field: 'total', order: 'desc' },
        pageSize: 2,
        page: 2,
      }),
      accessors,
    );
    expect(result.total).toBe(3);
    expect(names(result)).toEqual(['Bob']);
  });

  it('clamps a page past the end to the last page', () => {
    expect(names(applyQuery(rows, query({ page: 9, pageSize: 3 }), accessors))).toEqual(['alan']);
  });

  it('does not change the source rows', () => {
    applyQuery(rows, query({ sort: { field: 'total', order: 'asc' } }), accessors);
    expect(rows[0].name).toBe('Alice');
  });
});

describe('helpers', () => {
  it('lastPage is at least 1', () => {
    expect(lastPage(0, 10)).toBe(1);
    expect(lastPage(21, 10)).toBe(3);
  });

  it('compareValues puts empty values first and compares numbers in text naturally', () => {
    expect(compareValues(null, 1)).toBeLessThan(0);
    expect(compareValues(1, undefined)).toBeGreaterThan(0);
    expect(compareValues(2, 10)).toBeLessThan(0);
    expect(compareValues('item 2', 'item 10')).toBeLessThan(0);
    expect(compareValues(new Date(2026, 0, 2), new Date(2026, 0, 1))).toBeGreaterThan(0);
  });
});
