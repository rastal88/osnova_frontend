import api from '../../api/axios';
import { downloadFile } from '../../api/download';
import type { FormValues } from '../../api/forms';
import type {
  AdminOverview,
  AdminUser,
  AdminUserPage,
  ChannelTestResult,
  EntityRead,
  EntityTypeDescription,
  FormDescription,
  GroupCreate,
  GroupRead,
  GroupUpdate,
  LeadPage,
  LeadRead,
  LeadStats,
  PermissionRead,
  RoleCreate,
  RoleRead,
  RoleUpdate,
  SettingsGroupDescription,
} from '../../api/generated';
import type { TableQuery } from '../../components/DataTable/DataTable';
import { exportParams, listParams } from '../../components/DataTable/query';

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
  /** The slug of a role (not root) */
  role?: string;
  /** Ids of the groups; replaces the user's groups */
  groups?: string[];
}

/** "users-2026-01-31.csv", as the backend names the file. */
function csvName(name: string): string {
  return `${name}-${new Date().toISOString().slice(0, 10)}.csv`;
}

/** One page of users; the query is the DataTable one. */
export async function getUsers(query: TableQuery): Promise<AdminUserPage> {
  const response = await api.get<AdminUserPage>('/admin/users', { params: listParams(query) });
  return response.data;
}

/** Every user the list shows with this query, as a CSV file. */
export function exportUsers(query: TableQuery): Promise<void> {
  return downloadFile('/admin/users/export', exportParams(query), csvName('users'));
}

export async function updateUser(id: string, changes: UserChanges): Promise<AdminUser> {
  const response = await api.patch<AdminUser>(`/admin/users/${id}`, changes);
  return response.data;
}

/** Every permission of the enabled modules, with texts in the request language. */
export async function getPermissions(): Promise<PermissionRead[]> {
  const response = await api.get<PermissionRead[]>('/admin/permissions');
  return response.data;
}

export async function getRoles(): Promise<RoleRead[]> {
  const response = await api.get<RoleRead[]>('/admin/roles');
  return response.data;
}

export async function createRole(values: RoleCreate): Promise<RoleRead> {
  const response = await api.post<RoleRead>('/admin/roles', values);
  return response.data;
}

export async function updateRole(slug: string, values: RoleUpdate): Promise<RoleRead> {
  const response = await api.put<RoleRead>(`/admin/roles/${slug}`, values);
  return response.data;
}

export async function deleteRole(slug: string) {
  await api.delete(`/admin/roles/${slug}`);
}

export async function getGroups(): Promise<GroupRead[]> {
  const response = await api.get<GroupRead[]>('/admin/groups');
  return response.data;
}

export async function createGroup(values: GroupCreate): Promise<GroupRead> {
  const response = await api.post<GroupRead>('/admin/groups', values);
  return response.data;
}

export async function updateGroup(id: string, values: GroupUpdate): Promise<GroupRead> {
  const response = await api.put<GroupRead>(`/admin/groups/${id}`, values);
  return response.data;
}

export async function deleteGroup(id: string) {
  await api.delete(`/admin/groups/${id}`);
}

export async function getLeadForms(): Promise<FormDescription[]> {
  const response = await api.get<FormDescription[]>('/admin/leads/forms');
  return response.data;
}

/** One page of leads; the query is the DataTable one. */
export async function getLeads(query: TableQuery): Promise<LeadPage> {
  const response = await api.get<LeadPage>('/admin/leads', { params: listParams(query) });
  return response.data;
}

/** Every lead the list shows with this query, as a CSV file. */
export function exportLeads(query: TableQuery): Promise<void> {
  return downloadFile('/admin/leads/export', exportParams(query), csvName('leads'));
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
