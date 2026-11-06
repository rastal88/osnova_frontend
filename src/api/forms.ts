import api from './axios';

/** Forms are described on the backend (app/forms.py) and rendered from this description. */
export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'tel'
  | 'select'
  | 'checkbox'
  | 'consent';

export interface FormFieldOption {
  value: string;
  label: string;
}

export interface FormFieldDescription {
  name: string;
  type: FormFieldType;
  label: string;
  required: boolean;
  min_length: number | null;
  max_length: number | null;
  pattern: string | null;
  options: FormFieldOption[];
}

export interface FormDescription {
  name: string;
  title: string;
  submit: string;
  fields: FormFieldDescription[];
}

export interface FormSubmitResponse {
  message: string;
}

export type FormValues = Record<string, unknown>;

export const getForm = async (name: string): Promise<FormDescription> => {
  const response = await api.get<FormDescription>(`/forms/${name}`);
  return response.data;
};

export const submitForm = async (
  name: string,
  values: FormValues,
): Promise<FormSubmitResponse> => {
  const response = await api.post<FormSubmitResponse>(`/forms/${name}`, values);
  return response.data;
};
