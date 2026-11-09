import api from '../../api/axios';
import type { FilePage, FileRead } from '../../api/generated';
import type { TableQuery } from '../../components/DataTable/DataTable';
import { API_BASE_URL } from '../../utils/constants';

export async function getFiles(query: TableQuery): Promise<FilePage> {
  const params: Record<string, string | number> = { page: query.page, size: query.pageSize };
  if (query.search.trim()) params.q = query.search.trim();
  const response = await api.get<FilePage>('/files', { params });
  return response.data;
}

export async function uploadFile(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<FileRead> {
  const body = new FormData();
  body.append('file', file);
  const response = await api.post<FileRead>('/files', body, {
    // Let the browser set multipart/form-data with its boundary
    headers: { 'Content-Type': undefined },
    onUploadProgress: (event) =>
      event.total && onProgress?.(Math.round((event.loaded / event.total) * 100)),
  });
  return response.data;
}

export async function deleteFile(id: string) {
  await api.delete(`/files/${id}`);
}

/** Browser address of a file (the API answers with /api/v1/files/<id>). */
export function fileHref(url: string): string {
  return `${API_BASE_URL.replace(/\/api\/v1\/?$/, '')}${url}`;
}
