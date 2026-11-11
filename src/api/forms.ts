import api from './axios';
import { captchaHeaders } from './captcha';
import type { FormDescription, FormFieldDescription, FormSubmitResponse } from './generated';

/** Forms are described on the backend (app/forms.py) and rendered from this description. */
export type {
  FormDescription,
  FormFieldDescription,
  FormFieldOption,
  FormSubmitResponse,
} from './generated';
export type FormFieldType = FormFieldDescription['type'];

export type FormValues = Record<string, unknown>;

export const getForm = async (name: string): Promise<FormDescription> => {
  const response = await api.get<FormDescription>(`/forms/${name}`);
  return response.data;
};

export const submitForm = async (
  name: string,
  values: FormValues,
  captchaToken?: string | null,
): Promise<FormSubmitResponse> => {
  const response = await api.post<FormSubmitResponse>(`/forms/${name}`, values, {
    headers: captchaHeaders(captchaToken),
  });
  return response.data;
};
