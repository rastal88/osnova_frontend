import qs from 'qs';
import api from '../../api/axios';
import type { ClientSummary, UserRead } from '../../api/generated';

export const getCurrentUser = async (): Promise<UserRead> => {
  const response = await api.get<UserRead>('/auth/users/me', { skipAuthRedirect: true });
  return response.data;
};

export async function login(email: string, password: string) {
  const response = await api.post('/auth/login', qs.stringify({ username: email, password }), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response.data;
}

export async function logout() {
  const response = await api.post('/auth/logout');
  return response.data;
}

export async function register(email: string, password: string) {
  const response = await api.post(
    '/auth/register',
    {
      email,
      password,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
  return response.data;
}

export async function getClientSummary(): Promise<ClientSummary> {
  const response = await api.get<ClientSummary>('/client/summary');
  return response.data;
}
