import { hashPassword, verifyPassword } from '../../lib/password';
import { signAuthToken } from '../../lib/jwt';
import { AppError, ERROR_CODES } from '../../types/errors';
import type { LoginRequestDto, RegisterRequestDto, UserDto } from '../../types/dto/auth';
import type { Role } from '../../types/constants';
import { AuthRepository, authRepository as defaultRepo } from './auth.repository';
import type { User } from '@prisma/client';

export interface AuthResult {
  user: UserDto;
  token: string;
}

function toUserDto(user: User): UserDto {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role as Role,
    studentCode: user.studentCode,
  };
}

export class AuthService {
  constructor(private readonly repo: AuthRepository = defaultRepo) {}

  /**
   * Đăng ký tài khoản STUDENT (UC01, concept-auth).
   * Tự động đăng nhập sau khi tạo tài khoản thành công.
   */
  async register(input: RegisterRequestDto): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase();
    const studentCode = input.studentCode.trim().toUpperCase();
    const fullName = input.fullName.trim();

    // 1. Kiểm tra email đã đăng ký chưa
    const existingEmail = await this.repo.findByEmail(email);
    if (existingEmail) {
      throw new AppError(ERROR_CODES.EMAIL_TAKEN, 409, 'Email đã được đăng ký.');
    }

    // 2. Kiểm tra MSSV đã đăng ký chưa
    const existingStudentCode = await this.repo.findByStudentCode(studentCode);
    if (existingStudentCode) {
      throw new AppError(ERROR_CODES.STUDENT_CODE_TAKEN, 409, 'MSSV đã được đăng ký.');
    }

    // 3. Băm mật khẩu (cost 12)
    const passwordHash = await hashPassword(input.password);

    // 4. Tạo user STUDENT trong DB
    const user = await this.repo.createUser({
      fullName,
      studentCode,
      email,
      passwordHash,
      role: 'STUDENT',
      status: 'ACTIVE',
    });

    // 5. Ký JWT { sub, role }
    const token = signAuthToken({ sub: user.id, role: user.role as Role });

    return {
      user: toUserDto(user),
      token,
    };
  }

  /**
   * Đăng nhập cổng CLIENT (chỉ chấp nhận STUDENT).
   * Thứ tự kiểm tra lỗi theo concept-auth: Sai mật khẩu -> Khóa -> Sai cổng.
   */
  async login(input: LoginRequestDto): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase();

    // 1. Tìm user theo email
    const user = await this.repo.findByEmail(email);

    // 2. So khớp mật khẩu (không tiết lộ email có tồn tại hay không)
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      throw new AppError(ERROR_CODES.INVALID_CREDENTIALS, 401, 'Email hoặc mật khẩu không đúng.');
    }

    // 3. Kiểm tra trạng thái khóa
    if (user.status === 'LOCKED') {
      throw new AppError(
        ERROR_CODES.ACCOUNT_LOCKED,
        403,
        'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.',
      );
    }

    // 4. Kiểm tra cổng: chỉ STUDENT được vào cổng CLIENT
    if (user.role !== 'STUDENT') {
      throw new AppError(
        ERROR_CODES.WRONG_PORTAL,
        403,
        'Tài khoản giảng viên hoặc quản trị viên không đăng nhập ở trang này.',
      );
    }

    // 5. Ký JWT
    const token = signAuthToken({ sub: user.id, role: user.role as Role });

    return {
      user: toUserDto(user),
      token,
    };
  }

  /**
   * Đăng nhập cổng ADMIN (chỉ chấp nhận TEACHER hoặc ADMIN).
   * Thứ tự kiểm tra lỗi theo concept-auth: Sai mật khẩu -> Khóa -> Sai cổng.
   */
  async adminLogin(input: LoginRequestDto): Promise<AuthResult> {
    const email = input.email.trim().toLowerCase();

    // 1. Tìm user theo email
    const user = await this.repo.findByEmail(email);

    // 2. So khớp mật khẩu
    if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
      throw new AppError(ERROR_CODES.INVALID_CREDENTIALS, 401, 'Email hoặc mật khẩu không đúng.');
    }

    // 3. Kiểm tra trạng thái khóa
    if (user.status === 'LOCKED') {
      throw new AppError(
        ERROR_CODES.ACCOUNT_LOCKED,
        403,
        'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.',
      );
    }

    // 4. Kiểm tra cổng: STUDENT không được vào cổng ADMIN
    if (user.role === 'STUDENT') {
      throw new AppError(
        ERROR_CODES.WRONG_PORTAL,
        403,
        'Tài khoản sinh viên không được vào cổng quản trị.',
      );
    }

    // 5. Ký JWT
    const token = signAuthToken({ sub: user.id, role: user.role as Role });

    return {
      user: toUserDto(user),
      token,
    };
  }

  /**
   * Lấy thông tin user hiện tại từ DB theo userId (GET /auth/me).
   * Khóa tài khoản có hiệu lực ngay dù token còn hạn.
   */
  async getMe(userId: string): Promise<UserDto> {
    const user = await this.repo.findById(userId);
    if (!user || user.status === 'LOCKED') {
      throw new AppError(ERROR_CODES.UNAUTHENTICATED, 401, 'Bạn cần đăng nhập để tiếp tục.');
    }
    return toUserDto(user);
  }
}

export const authService = new AuthService();
