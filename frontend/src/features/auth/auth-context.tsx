'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authService } from '@/services';
import type { LoginRequestDto, RegisterRequestDto, UserDto } from '@/types';

export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthState {
  status: AuthStatus;
  user: UserDto | null;
}

export interface AuthContextValue extends AuthState {
  login: (input: LoginRequestDto) => Promise<UserDto>;
  adminLogin: (input: LoginRequestDto) => Promise<UserDto>;
  register: (input: RegisterRequestDto) => Promise<UserDto>;
  logout: () => Promise<void>;
  /** Xóa phiên phía FE (dùng cho xử lý `401` toàn cục ở giai đoạn Wire). */
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const LOADING: AuthState = { status: 'loading', user: null };
const ANONYMOUS: AuthState = { status: 'anonymous', user: null };

function authenticated(user: UserDto): AuthState {
  return { status: 'authenticated', user };
}

/**
 * Giữ `{ user, status }` cho toàn app; nạp phiên bằng `GET /auth/me` khi khởi động
 * (concept-auth, "Phía FE"). Không lưu token/PII ở `localStorage`.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(LOADING);

  useEffect(() => {
    let cancelled = false;
    authService
      .me()
      .then((user) => {
        if (!cancelled) setState(authenticated(user));
      })
      .catch(() => {
        // 401 hoặc lỗi mạng: coi như khách, guard sẽ điều hướng khi cần.
        if (!cancelled) setState(ANONYMOUS);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (input: LoginRequestDto) => {
    const user = await authService.login(input);
    setState(authenticated(user));
    return user;
  }, []);

  const adminLogin = useCallback(async (input: LoginRequestDto) => {
    const user = await authService.adminLogin(input);
    setState(authenticated(user));
    return user;
  }, []);

  const register = useCallback(async (input: RegisterRequestDto) => {
    const user = await authService.register(input);
    setState(authenticated(user));
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      // Dù gọi API lỗi vẫn thoát phía FE để người dùng không bị kẹt ở trạng thái đã đăng nhập.
      setState(ANONYMOUS);
    }
  }, []);

  const clearSession = useCallback(() => {
    setState(ANONYMOUS);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, adminLogin, register, logout, clearSession }),
    [state, login, adminLogin, register, logout, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth phải được dùng bên trong <AuthProvider>.');
  }
  return context;
}
