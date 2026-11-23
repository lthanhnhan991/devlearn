import type { AuthService } from './auth.service';
import { authHttp } from './http/auth.http';

export * from './auth.service';
export * from './http/auth.http';
export * from './http/catalog.http';
export * from './http/admin-topic.http';
export * from './http/admin-course.http';
export * from './http/admin-content.http';
export * from './http/learning.http';
export { authHttp };

export const authService: AuthService = authHttp;
