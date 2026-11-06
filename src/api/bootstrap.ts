import api from './axios';


export interface BootstrapApplication {
  name: string;
  version: string;
}

export interface BootstrapFeatures {
  authentication: boolean;
  admin: boolean;
  files: boolean;
  notifications: boolean;
  background_tasks: boolean;
}

export interface BootstrapLanguage {
  code: string;
  name: string;
}

export interface BootstrapI18n {
  languages: BootstrapLanguage[];
  default: string;
}

export interface BootstrapResponse {
  application: BootstrapApplication;
  profile: 'minimal' | 'standard' | 'scalable';
  i18n: BootstrapI18n;
  features: BootstrapFeatures;
}

export const getBootstrap = async (): Promise<BootstrapResponse> => {
  const response = await api.get<BootstrapResponse>('/bootstrap');

  return response.data;
};