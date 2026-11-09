import api from '../../api/axios';
import type { FormValues } from '../../api/forms';
import type { AdminOverview, SettingsGroupDescription } from '../../api/generated';

export async function getOverview(): Promise<AdminOverview> {
  const response = await api.get<AdminOverview>('/admin/overview');
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
