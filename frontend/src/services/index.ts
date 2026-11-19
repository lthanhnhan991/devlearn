import type { AuthService } from './auth.service';
import { authHttp } from './http/auth.http';

export * from './auth.service';
export * from './http/auth.http';
export * from './http/catalog.http';
export { authHttp };

export const authService: AuthService = authHttp;
