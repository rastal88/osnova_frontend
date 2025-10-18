import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_URL

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // ВАЖНО для cookies
});

export default api;