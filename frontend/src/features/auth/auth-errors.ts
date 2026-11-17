import { ApiError } from '@/lib/api-error';
import { ERROR_CODES } from '@/types';

export type AuthPortal = 'CLIENT' | 'ADMIN';

/** Lỗi theo từng trường, khóa = tên trường (`email`, `studentCode`, ...). */
export type FieldErrors = Partial<Record<string, string>>;

export interface PortalLink {
  href: string;
  label: string;
}

/** Cách hiển thị một lỗi auth: thông báo chung của form + lỗi từng trường + liên kết gợi ý. */
export interface AuthErrorView {
  formMessage: string | null;
  fieldErrors: FieldErrors;
  portalLink: PortalLink | null;
  /** `true` khi lỗi do hệ thống/mạng — nên cho người dùng thử lại. */
  retryable: boolean;
}

const GENERIC_MESSAGE = 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.';

interface IssueLike {
  path: readonly PropertyKey[];
  message: string;
}

/** Gom lỗi zod về dạng `{ tênTrường: thôngBáoĐầuTiên }`. */
export function collectFieldErrors(issues: readonly IssueLike[]): FieldErrors {
  const result: FieldErrors = {};
  for (const issue of issues) {
    const first = issue.path[0];
    if (first === undefined) continue;
    const key = String(first);
    if (result[key] === undefined) result[key] = issue.message;
  }
  return result;
}

/** Bản sao `errors` đã bỏ lỗi của trường `field` (xóa lỗi khi người dùng sửa lại trường đó). */
export function omitFieldError(errors: FieldErrors, field: string): FieldErrors {
  const next: FieldErrors = { ...errors };
  delete next[field];
  return next;
}

function formView(formMessage: string, retryable = false): AuthErrorView {
  return { formMessage, fieldErrors: {}, portalLink: null, retryable };
}

function fieldView(field: string, message: string): AuthErrorView {
  return { formMessage: null, fieldErrors: { [field]: message }, portalLink: null, retryable: false };
}

function wrongPortalView(portal: AuthPortal): AuthErrorView {
  if (portal === 'CLIENT') {
    return {
      formMessage: 'Tài khoản giảng viên hoặc quản trị viên không đăng nhập ở trang này.',
      fieldErrors: {},
      portalLink: { href: '/admin/login', label: 'Đến cổng quản trị' },
      retryable: false,
    };
  }
  return {
    formMessage: 'Tài khoản sinh viên không được vào cổng quản trị.',
    fieldErrors: {},
    portalLink: { href: '/login', label: 'Đến trang đăng nhập của người học' },
    retryable: false,
  };
}

function validationView(error: ApiError): AuthErrorView {
  const fieldErrors = collectFieldErrors(
    error.details.map((detail) => ({ path: detail.path.split('.'), message: detail.message })),
  );
  const hasFields = Object.keys(fieldErrors).length > 0;
  return {
    formMessage: hasFields ? null : 'Dữ liệu không hợp lệ.',
    fieldErrors,
    portalLink: null,
    retryable: false,
  };
}

/**
 * Chuyển lỗi từ service auth (thật hoặc mock) thành nội dung hiển thị, theo mã lỗi ở
 * `api-auth` / `error-handling-conventions`. Không tiết lộ email có tồn tại hay không.
 */
export function describeAuthError(error: unknown, portal: AuthPortal): AuthErrorView {
  if (!(error instanceof ApiError)) return formView(GENERIC_MESSAGE, true);

  switch (error.code) {
    case ERROR_CODES.INVALID_CREDENTIALS:
      return formView('Email hoặc mật khẩu không đúng.');
    case ERROR_CODES.ACCOUNT_LOCKED:
      return formView('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.');
    case ERROR_CODES.WRONG_PORTAL:
      return wrongPortalView(portal);
    case ERROR_CODES.EMAIL_TAKEN:
      return fieldView('email', 'Email đã được đăng ký.');
    case ERROR_CODES.STUDENT_CODE_TAKEN:
      return fieldView('studentCode', 'MSSV đã được đăng ký.');
    case ERROR_CODES.RATE_LIMITED:
      return formView('Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.', true);
    case ERROR_CODES.VALIDATION_ERROR:
      return validationView(error);
    default:
      return formView(GENERIC_MESSAGE, error.status >= 500);
  }
}
