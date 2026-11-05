import api from '../../api/axios';
import qs from 'qs';


export const getCurrentUser = async () => {
  const response = await api.get('/auth/users/me');
  return response.data;
};

export async function login(email: string, password: string) {
  const response = await api.post(
    '/auth/login',
    qs.stringify({ username: email, password }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  );
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
    }
  );
  return response.data;
}

export async function getAdminUsers() {
  const response = await api.get('/admin_flow/users');
  return response.data;
}