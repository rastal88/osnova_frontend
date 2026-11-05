export const DEBUG_MODE_CONTROLLER = import.meta.env.VITE_DEBUG_MODE === 'true';
export const API_URL = import.meta.env.VITE_API_URL

const RAW_API_BASE_URL =
  import.meta.env.VITE_BASE_URL || 'http://localhost:8000/api/v1';

export const API_BASE_URL = RAW_API_BASE_URL;
export const API_DOCS_URL = `${RAW_API_BASE_URL.replace(/\/api\/v1\/?$/, '')}/docs`;

export const GITHUB_BACKEND_URL = 'https://github.com/rastal88/osnova_backend';
export const GITHUB_FRONTEND_URL = 'https://github.com/rastal88/osnova_frontend';