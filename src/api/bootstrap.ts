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

export interface BootstrapResponse {
  application: BootstrapApplication;
  profile: 'minimal' | 'standard' | 'scalable';
  features: BootstrapFeatures;
}

export const getBootstrap = async (): Promise<BootstrapResponse> => {
  const response = await api.get<BootstrapResponse>('/bootstrap');

  return response.data;
};