export interface ApiEnvelope<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  error: { code: string; message: string };
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
}
