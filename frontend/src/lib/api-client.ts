import { ApiError, type ApiErrorDetail } from '@/lib/api-error';
import { ERROR_CODES } from '@/types';

const DEFAULT_BASE_URL = 'http://localhost:4000/api/v1';

function getBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.replace(/\/+$/, '');
  }
  return DEFAULT_BASE_URL;
}

export interface ApiEnvelope<T, M = Record<string, unknown>> {
  data: T;
  meta?: M;
}

export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
  };
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

async function executeFetch(path: string, options: RequestOptions = {}): Promise<Response> {
  const baseUrl = getBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${baseUrl}${cleanPath}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  let body: BodyInit | undefined;
  if (options.body !== undefined) {
    if (options.body instanceof FormData) {
      body = options.body;
    } else {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(options.body);
    }
  }

  const { body: _ignoredBody, ...restOptions } = options;
  const fetchInit: RequestInit = {
    ...restOptions,
    headers,
    credentials: 'include',
  };
  if (body !== undefined) {
    fetchInit.body = body;
  }

  try {
    return await fetch(url, fetchInit);
  } catch (cause) {
    throw new ApiError(
      0,
      ERROR_CODES.INTERNAL_ERROR,
      'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại kết nối mạng.',
    );
  }
}

async function handleResponseError(res: Response): Promise<never> {
  const contentType = res.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');

  if (isJson) {
    try {
      const errorJson = (await res.json()) as ApiErrorEnvelope;
      if (errorJson.error) {
        throw new ApiError(
          res.status,
          errorJson.error.code || ERROR_CODES.INTERNAL_ERROR,
          errorJson.error.message || 'Yêu cầu không hợp lệ.',
          errorJson.error.details ?? [],
        );
      }
    } catch (e) {
      if (e instanceof ApiError) throw e;
    }
  }
  throw new ApiError(
    res.status,
    ERROR_CODES.INTERNAL_ERROR,
    `Yêu cầu thất bại với mã trạng thái ${res.status}.`,
  );
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const res = await executeFetch(path, options);

  if (res.status === 204) {
    return undefined as unknown as T;
  }

  if (!res.ok) {
    await handleResponseError(res);
  }

  const contentType = res.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return undefined as unknown as T;
  }

  const envelope = (await res.json()) as ApiEnvelope<T>;
  return envelope.data;
}

async function requestWithMeta<T, M>(path: string, options: RequestOptions = {}): Promise<{ data: T; meta: M }> {
  const res = await executeFetch(path, options);

  if (!res.ok) {
    await handleResponseError(res);
  }

  const envelope = (await res.json()) as ApiEnvelope<T, M>;
  return {
    data: envelope.data,
    meta: envelope.meta as M,
  };
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  getWithMeta: <T, M>(path: string, options?: RequestOptions) =>
    requestWithMeta<T, M>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
