/**
 * Table query: what the user asked for (page, search, sort, filters), kept in the URL
 * so a filtered table can be shared or reloaded. Remote tables get it as is; local
 * tables apply it in the browser with applyQuery.
 */
export type SortOrder = 'asc' | 'desc';

export interface TableQuery {
  page: number;
  pageSize: number;
  search: string;
  sort: { field: string; order: SortOrder } | null;
  filters: Record<string, string[]>;
}

export interface TablePage<T> {
  items: T[];
  total: number;
}

/** How a local table reads a row: values to search in, filter and sort by. */
export interface RowAccessors<T> {
  search: ((row: T) => unknown)[];
  value: Record<string, (row: T) => unknown>;
  compare: Record<string, (a: T, b: T) => number>;
}

// Filters use the column key as the URL parameter, so these keys are reserved
const PARAMS = { search: 'q', page: 'page', pageSize: 'size', sort: 'sort' } as const;

export function readQuery(
  params: URLSearchParams,
  prefix: string,
  defaultPageSize: number,
  filterKeys: string[],
): TableQuery {
  const get = (name: string) => params.get(`${prefix}${name}`);
  const positive = (value: string | null, fallback: number) => {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : fallback;
  };
  const sort = get(PARAMS.sort);
  const filters: Record<string, string[]> = {};
  for (const key of filterKeys) {
    const value = get(key);
    if (value) filters[key] = value.split(',');
  }

  return {
    page: positive(get(PARAMS.page), 1),
    pageSize: positive(get(PARAMS.pageSize), defaultPageSize),
    search: get(PARAMS.search) ?? '',
    sort: sort
      ? { field: sort.replace(/^-/, ''), order: sort.startsWith('-') ? 'desc' : 'asc' }
      : null,
    filters,
  };
}

/** The query as URL parameters; defaults are left out to keep links short. */
export function writeQuery(
  params: URLSearchParams,
  prefix: string,
  query: TableQuery,
  defaultPageSize: number,
  filterKeys: string[],
): URLSearchParams {
  const next = new URLSearchParams(params);
  const set = (name: string, value: string | null) => {
    if (value) next.set(`${prefix}${name}`, value);
    else next.delete(`${prefix}${name}`);
  };
  set(PARAMS.search, query.search.trim() || null);
  set(PARAMS.page, query.page > 1 ? String(query.page) : null);
  set(PARAMS.pageSize, query.pageSize !== defaultPageSize ? String(query.pageSize) : null);
  set(
    PARAMS.sort,
    query.sort ? `${query.sort.order === 'desc' ? '-' : ''}${query.sort.field}` : null,
  );
  for (const key of filterKeys) set(key, query.filters[key]?.join(',') || null);
  return next;
}

export function lastPage(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize));
}

export function compareValues(a: unknown, b: unknown, language?: string): number {
  if (a == null || b == null) return a == null ? (b == null ? 0 : -1) : 1;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), language, { numeric: true });
}

/** Search, filter, sort and paginate rows in the browser. */
export function applyQuery<T>(
  rows: T[],
  query: TableQuery,
  accessors: RowAccessors<T>,
): TablePage<T> {
  const search = query.search.trim().toLocaleLowerCase();
  let result = rows;

  if (search) {
    result = result.filter((row) =>
      accessors.search.some((read) => String(read(row) ?? '').toLocaleLowerCase().includes(search)),
    );
  }

  for (const [key, values] of Object.entries(query.filters)) {
    const read = accessors.value[key];
    if (read && values.length > 0) {
      result = result.filter((row) => values.includes(String(read(row))));
    }
  }

  const compare = query.sort && accessors.compare[query.sort.field];
  if (query.sort && compare) {
    const direction = query.sort.order === 'desc' ? -1 : 1;
    result = [...result].sort((a, b) => compare(a, b) * direction);
  }

  const page = Math.min(query.page, lastPage(result.length, query.pageSize));
  const start = (page - 1) * query.pageSize;
  return { items: result.slice(start, start + query.pageSize), total: result.length };
}
