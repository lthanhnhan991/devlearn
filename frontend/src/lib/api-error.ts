export interface ApiErrorDetail {
  path: string;
  message: string;
}

/** Lỗi chuẩn hóa từ API (và mock): `{ error: { code, message, details? } }` + HTTP status. */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: readonly ApiErrorDetail[];

  constructor(
    status: number,
    code: string,
    message: string,
    details: readonly ApiErrorDetail[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
