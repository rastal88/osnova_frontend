import axios from 'axios';

import i18n from '../i18n';
import { localizedPath } from '../i18n/language';

const API_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
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
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        window.location.href = localizedPath('/login');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
