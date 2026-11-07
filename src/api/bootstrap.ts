import api from './axios';
import type { BootstrapResponse } from './generated';

export type {
  BootstrapApplication,
  BootstrapFeatures,
  BootstrapI18n,
  BootstrapLanguage,
  BootstrapResponse,
} from './generated';

export const getBootstrap = async (): Promise<BootstrapResponse> => {
  const response = await api.get<BootstrapResponse>('/bootstrap');

  return response.data;
};
