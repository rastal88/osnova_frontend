import axios from 'axios';

import i18n from '../i18n';
import type { ErrorResponse as ApiError } from './generated';

/** Error body returned by the backend: `message` is already in the user's language. */
export type {
  ErrorResponse as ApiError,
  FieldError as ApiFieldError,
} from './generated';

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
  // Answered by the proxy (nginx) before the request reached the backend
  if (axios.isAxiosError(error) && error.response?.status === 413) {
    return i18n.t('errors.tooLarge');
  }
  return i18n.t('errors.unknown');
}
