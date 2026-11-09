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

/** Confirms the email with the token from the confirmation link. */
export async function verifyEmail(token: string): Promise<UserRead> {
  const response = await api.post<UserRead>('/auth/verify', { token }, { skipAuthRedirect: true });
  return response.data;
}

/** Sends a new confirmation link (the answer is the same for unknown addresses). */
export async function requestVerification(email: string) {
  await api.post('/auth/request-verify-token', { email }, { skipAuthRedirect: true });
}

/** Sends a password reset link (the answer is the same for unknown addresses). */
export async function forgotPassword(email: string) {
  await api.post('/auth/forgot-password', { email }, { skipAuthRedirect: true });
}

export async function resetPassword(token: string, password: string) {
  await api.post('/auth/reset-password', { token, password }, { skipAuthRedirect: true });
}
