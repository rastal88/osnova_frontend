import type { TablePage, TableQuery } from '../../components/DataTable/DataTable';
import { applyQuery, compareValues } from '../../components/DataTable/query';
import type { RowAccessors } from '../../components/DataTable/query';

export const ORDER_STATUSES = ['new', 'paid', 'shipped', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface Order {
  id: string;
  number: number;
  customer: string;
  createdAt: Date;
  status: OrderStatus;
  total: number;
}

const CUSTOMERS = [
  'Anna Petrova',
  'James Miller',
  'Olga Smirnova',
  'Liam Johnson',
  'Maria Garcia',
  'Ivan Sokolov',
  'Emma Brown',
  'Noah Wilson',
  'Sofia Rossi',
  'Daniel Kim',
  'Elena Volkova',
  'Lucas Martin',
];

const HOUR = 3600 * 1000;

/** Demo orders: the same rows on every load, dated relative to now. */
export const orders: Order[] = Array.from({ length: 57 }, (_, index) => ({
  id: `order-${index + 1}`,
  number: 1001 + index,
  customer: CUSTOMERS[(index * 7) % CUSTOMERS.length],
  createdAt: new Date(Date.now() - (index * 37 + (index % 5) * 11) * HOUR),
  status: ORDER_STATUSES[(index * 3 + Math.floor(index / 4)) % ORDER_STATUSES.length],
  total: Math.round((((index * 7919) % 50000) + 990) * 100) / 100 / 10,
}));

// What a real backend would do with the query: search, filter, sort, return one page
const serverAccessors: RowAccessors<Order> = {
  search: [(order) => order.customer, (order) => order.number],
  value: { status: (order) => order.status },
  compare: {
    number: (a, b) => a.number - b.number,
    customer: (a, b) => compareValues(a.customer, b.customer),
    createdAt: (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    total: (a, b) => a.total - b.total,
  },
};

/** Stand-in for `GET /orders?q=&page=&size=&sort=&status=` with network latency. */
export function fetchOrders(query: TableQuery): Promise<TablePage<Order>> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(applyQuery(orders, query, serverAccessors)), 400);
  });
}
