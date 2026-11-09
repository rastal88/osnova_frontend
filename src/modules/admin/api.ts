import api from '../../api/axios';
import type { AdminOverview } from '../../api/generated';

export async function getOverview(): Promise<AdminOverview> {
  const response = await api.get<AdminOverview>('/admin/overview');
  return response.data;
}
