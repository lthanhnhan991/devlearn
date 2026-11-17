import { z } from 'zod';
import { ROLES } from '../constants';

/** MSSV: 4–20 ký tự chữ và số (api-auth, U-02). */
export const STUDENT_CODE_PATTERN = /^[A-Za-z0-9]{4,20}$/;

/** Email: trim + lowercase trước khi kiểm tra (api-auth, "Ghi chú triển khai"). */
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, 'Vui lòng nhập email.')
  .max(150, 'Email tối đa 150 ký tự.')
  .pipe(z.email({ error: 'Email không hợp lệ.' }));

/** Mật khẩu đăng ký: ≥ 8 ký tự, có chữ và số (concept-auth, U-15). */
const passwordSchema = z
  .string()
  .min(8, 'Mật khẩu tối thiểu 8 ký tự.')
  .regex(/[A-Za-z]/, 'Mật khẩu phải có ít nhất một chữ cái.')
  .regex(/\d/, 'Mật khẩu phải có ít nhất một chữ số.');

/** Người dùng trả về từ mọi endpoint auth (không bao giờ có passwordHash). */
export const userDtoSchema = z.object({
  id: z.string().min(1),
  fullName: z.string(),
  email: z.string(),
  role: z.enum(ROLES),
  studentCode: z.string().nullable(),
});
export type UserDto = z.infer<typeof userDtoSchema>;

/** `data` của POST /auth/register, /auth/login, /auth/admin/login và GET /auth/me. */
export const authResponseSchema = z.object({ user: userDtoSchema });
export type AuthResponseDto = z.infer<typeof authResponseSchema>;

/** Body POST /auth/login và POST /auth/admin/login. */
export const loginRequestSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Vui lòng nhập mật khẩu.'),
});
export type LoginRequestDto = z.infer<typeof loginRequestSchema>;

/** Body POST /auth/register. */
export const registerRequestSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Họ tên tối thiểu 2 ký tự.')
    .max(100, 'Họ tên tối đa 100 ký tự.'),
  studentCode: z
    .string()
    .trim()
    .regex(STUDENT_CODE_PATTERN, 'MSSV gồm 4–20 ký tự chữ và số.'),
  email: emailSchema,
  password: passwordSchema,
});
export type RegisterRequestDto = z.infer<typeof registerRequestSchema>;

/** Form đăng ký ở FE: thêm `confirmPassword` (chỉ FE kiểm, không gửi lên API). */
export const registerFormSchema = registerRequestSchema
  .extend({ confirmPassword: z.string().min(1, 'Vui lòng nhập lại mật khẩu.') })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    error: 'Mật khẩu nhập lại không khớp.',
  });
export type RegisterFormValues = z.infer<typeof registerFormSchema>;
