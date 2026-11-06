import axios from 'axios';

import i18n from '../i18n';
import { localizedPath } from '../i18n/language';
import { API_BASE_URL } from '../utils/constants';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** A 401 is an expected answer (e.g. "who am I" for a guest): do not send to /login */
    skipAuthRedirect?: boolean;
  }
}

const AUTH_PAGES = ['/login', '/register'];

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// The backend answers errors and messages in this language.
api.interceptors.request.use((request) => {
  request.headers.set('Accept-Language', i18n.language);
  return request;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // A session that expired on a protected request sends the user to sign in;
    // guests on public pages are left alone (ProtectedRoute guards private ones).
    const onAuthPage = AUTH_PAGES.some((page) => window.location.pathname.endsWith(page));
    if (error.response?.status === 401 && !error.config?.skipAuthRedirect && !onAuthPage) {
      window.location.href = localizedPath('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
