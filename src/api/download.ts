import axios from 'axios';

import api from './axios';

/** The file name from a Content-Disposition header (`filename*=UTF-8''…` or `filename="…"`). */
export function fileNameFrom(header: string | null | undefined): string | null {
  if (!header) return null;
  const encoded = /filename\*=UTF-8''([^;]+)/i.exec(header);
  if (encoded) {
    try {
      return decodeURIComponent(encoded[1].trim());
    } catch {
      // A broken name: fall through to the plain one
    }
  }
  const plain = /filename="?([^";]+)"?/i.exec(header);
  return plain ? plain[1].trim() : null;
}

/**
 * Ask the API for a file and save it. The request goes through the shared client, so it
 * carries the session and the interface language, and a failure is an ordinary API error.
 * `fallbackName` is used when the browser may not read the response header (the API on
 * another origin).
 */
export async function downloadFile(
  url: string,
  params: Record<string, string | number>,
  fallbackName: string,
): Promise<void> {
  let response: Awaited<ReturnType<typeof api.get<Blob>>>;
  try {
    response = await api.get<Blob>(url, { params, responseType: 'blob' });
  } catch (error) {
    // The error body arrived as a blob too: turn it back into the usual JSON
    if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
      try {
        error.response.data = JSON.parse(await error.response.data.text());
      } catch {
        // Not JSON (e.g. a proxy page): the caller shows the generic message
      }
    }
    throw error;
  }

  const link = document.createElement('a');
  link.href = URL.createObjectURL(response.data);
  link.download = fileNameFrom(response.headers['content-disposition']) ?? fallbackName;
  document.body.append(link);
  link.click();
  link.remove();
  // Not at once: some browsers start the download a moment later
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}
