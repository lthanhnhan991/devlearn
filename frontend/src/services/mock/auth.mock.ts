import { ApiError, type ApiErrorDetail } from '@/lib/api-error';
import { getMockMode, mockDelay } from '@/lib/mock';
import { MOCK_ACCOUNTS, type MockAccount } from '@/mocks/fixtures/auth';
import {
  ERROR_CODES,
  loginRequestSchema,
  registerRequestSchema,
  type LoginRequestDto,
  type RegisterRequestDto,
  type UserDto,
} from '@/types';
import type { AuthService } from '../auth.service';

type Portal = 'CLIENT' | 'ADMIN';

/**
 * Mock giữ phiên bằng ID người dùng (không phải token, không phải PII) trong sessionStorage
 * để F5 không bị văng khi Review. Backend thật dùng cookie httpOnly (adr-008).
 */
const SESSION_KEY = 'devlearn.mock.session';

const registeredAccounts: MockAccount[] = [];
let sessionUserId: string | null = null;

function readStoredSession(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

function writeStoredSession(userId: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (userId === null) {
      window.sessionStorage.removeItem(SESSION_KEY);
    } else {
      window.sessionStorage.setItem(SESSION_KEY, userId);
    }
  } catch {
    // sessionStorage bị chặn: bỏ qua, phiên chỉ sống trong bộ nhớ.
  }
}

function startSession(userId: string): void {
  sessionUserId = userId;
  writeStoredSession(userId);
}

function clearSession(): void {
  sessionUserId = null;
  writeStoredSession(null);
}

function allAccounts(): MockAccount[] {
  return [...MOCK_ACCOUNTS, ...registeredAccounts];
}

function validationError(
  issues: readonly { path: readonly PropertyKey[]; message: string }[],
): ApiError {
  const details: ApiErrorDetail[] = issues.map((issue) => ({
    path: issue.path.map(String).join('.'),
    message: issue.message,
  }));
  return new ApiError(400, ERROR_CODES.VALIDATION_ERROR, 'Dữ liệu không hợp lệ.', details);
}

function internalError(): ApiError {
  return new ApiError(
    500,
    ERROR_CODES.INTERNAL_ERROR,
    'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.',
  );
}

async function signIn(input: LoginRequestDto, portal: Portal): Promise<UserDto> {
  await mockDelay();
  const mode = getMockMode();
  if (mode === 'error') throw internalError();
  if (mode === 'forbidden') {
    throw new ApiError(403, ERROR_CODES.ACCOUNT_LOCKED, 'Tài khoản của bạn đã bị khóa.');
  }

  const parsed = loginRequestSchema.safeParse(input);
  if (!parsed.success) throw validationError(parsed.error.issues);

  // Thứ tự theo concept-auth: sai thông tin → khóa → sai cổng.
  const account = allAccounts().find((item) => item.user.email === parsed.data.email);
  if (account === undefined || account.password !== parsed.data.password) {
    throw new ApiError(401, ERROR_CODES.INVALID_CREDENTIALS, 'Email hoặc mật khẩu không đúng.');
  }
  if (account.status === 'LOCKED') {
    throw new ApiError(403, ERROR_CODES.ACCOUNT_LOCKED, 'Tài khoản của bạn đã bị khóa.');
  }
  const isStudent = account.user.role === 'STUDENT';
  if ((portal === 'CLIENT' && !isStudent) || (portal === 'ADMIN' && isStudent)) {
    throw new ApiError(403, ERROR_CODES.WRONG_PORTAL, 'Tài khoản không thuộc cổng đăng nhập này.');
  }

  startSession(account.user.id);
  return { ...account.user };
}

async function register(input: RegisterRequestDto): Promise<UserDto> {
  await mockDelay();
  const mode = getMockMode();
  if (mode === 'error') throw internalError();
  if (mode === 'forbidden') {
    throw new ApiError(429, ERROR_CODES.RATE_LIMITED, 'Bạn thao tác quá nhanh, thử lại sau.');
  }

  const parsed = registerRequestSchema.safeParse(input);
  if (!parsed.success) throw validationError(parsed.error.issues);

  const accounts = allAccounts();
  if (accounts.some((item) => item.user.email === parsed.data.email)) {
    throw new ApiError(409, ERROR_CODES.EMAIL_TAKEN, 'Email đã được đăng ký.');
  }
  const code = parsed.data.studentCode.toUpperCase();
  if (accounts.some((item) => item.user.studentCode?.toUpperCase() === code)) {
    throw new ApiError(409, ERROR_CODES.STUDENT_CODE_TAKEN, 'MSSV đã được đăng ký.');
  }

  const suffix = String(100 + registeredAccounts.length).padStart(12, '0');
  const user: UserDto = {
    id: `00000000-0000-4000-8000-${suffix}`,
    fullName: parsed.data.fullName,
    email: parsed.data.email,
    role: 'STUDENT',
    studentCode: parsed.data.studentCode,
  };
  registeredAccounts.push({ user, password: parsed.data.password, status: 'ACTIVE' });

  // Đăng ký xong tự đăng nhập (concept-auth).
  startSession(user.id);
  return { ...user };
}

export const authMock: AuthService = {
  login: (input) => signIn(input, 'CLIENT'),
  adminLogin: (input) => signIn(input, 'ADMIN'),
  register,
  async logout() {
    await mockDelay();
    clearSession();
  },
  async me() {
    await mockDelay();
    const userId = sessionUserId ?? readStoredSession();
    const account =
      userId === null ? undefined : allAccounts().find((item) => item.user.id === userId);
    // Khóa tài khoản có hiệu lực ngay, kể cả khi còn "phiên".
    if (account === undefined || account.status === 'LOCKED') {
      clearSession();
      throw new ApiError(401, ERROR_CODES.UNAUTHENTICATED, 'Bạn cần đăng nhập để tiếp tục.');
    }
    sessionUserId = account.user.id;
    return { ...account.user };
  },
};
