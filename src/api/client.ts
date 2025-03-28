import axios from 'axios';
import useAuthStore from '../store/authStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;

// После успешного логина
// document.cookie = `token=${token}; path=/; SameSite=Strict; Secure`;