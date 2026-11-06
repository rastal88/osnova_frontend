import axios from 'axios';

import i18n from '../i18n';

/** Error body returned by the backend: `message` is already in the user's language. */
export interface ApiFieldError {
  field: string;
  code: string;
  message: string;
}

export interface ApiError {
  code: string;
  message: string;
  fields?: ApiFieldError[];
}

export function getApiError(error: unknown): ApiError | null {
  if (!axios.isAxiosError(error)) return null;
  const data = error.response?.data;
  if (data && typeof data.code === 'string' && typeof data.message === 'string') {
    return data as ApiError;
  }
  return null;
}

/** Text to show for a failed request: the server message, or a local fallback. */
export function getErrorMessage(error: unknown): string {
  const apiError = getApiError(error);
  if (apiError) return apiError.message;
  if (axios.isAxiosError(error) && !error.response) return i18n.t('errors.network');
  return i18n.t('errors.unknown');
}
