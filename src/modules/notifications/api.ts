import api from '../../api/axios';
import type { NotificationPage, NotificationRead, UnreadCount } from '../../api/generated';

export async function getUnread(): Promise<number> {
  // A 401 here (session ended) must not send the user to sign in from the header
  const response = await api.get<UnreadCount>('/notifications/unread', { skipAuthRedirect: true });
  return response.data.unread;
}

export async function getNotifications(size = 10): Promise<NotificationPage> {
  const response = await api.get<NotificationPage>('/notifications', { params: { size } });
  return response.data;
}

export async function markRead(id: string): Promise<NotificationRead> {
  const response = await api.post<NotificationRead>(`/notifications/${id}/read`);
  return response.data;
}

export async function markAllRead() {
  await api.post('/notifications/read');
}
