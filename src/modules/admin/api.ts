import api from '../../api/axios';
import type { FormValues } from '../../api/forms';
import type {
  AdminOverview,
  AdminUser,
  AdminUserPage,
  ChannelTestResult,
  EntityRead,
  EntityTypeDescription,
  FormDescription,
  LeadPage,
  LeadRead,
  LeadStats,
  SettingsGroupDescription,
} from '../../api/generated';
import type { TableQuery } from '../../components/DataTable/DataTable';

export async function getOverview(): Promise<AdminOverview> {
  const response = await api.get<AdminOverview>('/admin/overview');
  return response.data;
}

export async function getLeadStats(days = 14): Promise<LeadStats> {
  const response = await api.get<LeadStats>('/admin/leads/stats', { params: { days } });
  return response.data;
}

export async function getSettings(): Promise<SettingsGroupDescription[]> {
  const response = await api.get<SettingsGroupDescription[]>('/admin/settings');
  return response.data;
}

export async function saveSettings(
  group: string,
  values: FormValues,
): Promise<SettingsGroupDescription> {
  const response = await api.put<SettingsGroupDescription>(`/admin/settings/${group}`, values);
  return response.data;
}

export interface UserChanges {
  is_active?: boolean;
  role?: 'user' | 'moderator';
}

/** The DataTable query in the backend list format: q, page, size, sort, filters. */
function tableParams(query: TableQuery): Record<string, string | number> {
  const params: Record<string, string | number> = { page: query.page, size: query.pageSize };
  if (query.search.trim()) params.q = query.search.trim();
  if (query.sort) params.sort = `${query.sort.order === 'desc' ? '-' : ''}${query.sort.field}`;
  for (const [key, values] of Object.entries(query.filters)) {
    if (values.length) params[key] = values.join(',');
  }
  return params;
}

/** One page of users; the query is the DataTable one. */
export async function getUsers(query: TableQuery): Promise<AdminUserPage> {
  const response = await api.get<AdminUserPage>('/admin/users', { params: tableParams(query) });
  return response.data;
}

export async function updateUser(id: string, changes: UserChanges): Promise<AdminUser> {
  const response = await api.patch<AdminUser>(`/admin/users/${id}`, changes);
  return response.data;
}

export async function getLeadForms(): Promise<FormDescription[]> {
  const response = await api.get<FormDescription[]>('/admin/leads/forms');
  return response.data;
}

/** One page of leads; the query is the DataTable one. */
export async function getLeads(query: TableQuery): Promise<LeadPage> {
  const response = await api.get<LeadPage>('/admin/leads', { params: tableParams(query) });
  return response.data;
}

export async function updateLead(id: string, status: LeadRead['status']): Promise<LeadRead> {
  const response = await api.patch<LeadRead>(`/admin/leads/${id}`, { status });
  return response.data;
}

export async function deleteLead(id: string) {
  await api.delete(`/admin/leads/${id}`);
}

/** Configurable entities of one group (e.g. "lead_channels") and their types. */
export async function getEntityTypes(group: string): Promise<EntityTypeDescription[]> {
  const response = await api.get<EntityTypeDescription[]>('/admin/entities/types', {
    params: { group },
  });
  return response.data;
}

export async function getEntities(group: string): Promise<EntityRead[]> {
  const response = await api.get<EntityRead[]>('/admin/entities', { params: { group } });
  return response.data;
}

export interface EntityValues {
  name: string;
  enabled?: boolean;
  params?: FormValues;
}

export async function createEntity(type: string, values: EntityValues): Promise<EntityRead> {
  const response = await api.post<EntityRead>('/admin/entities', { type, ...values });
  return response.data;
}

export async function updateEntity(id: string, values: Partial<EntityValues>): Promise<EntityRead> {
  const response = await api.put<EntityRead>(`/admin/entities/${id}`, values);
  return response.data;
}

export async function deleteEntity(id: string) {
  await api.delete(`/admin/entities/${id}`);
}

export async function testChannel(id: string): Promise<ChannelTestResult> {
  const response = await api.post<ChannelTestResult>(`/admin/leads/channels/${id}/test`);
  return response.data;
}
