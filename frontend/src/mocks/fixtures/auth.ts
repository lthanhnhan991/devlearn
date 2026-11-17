import { SEED_IDS, type UserDto } from '@/types';

export type MockAccountStatus = 'ACTIVE' | 'LOCKED';

export interface MockAccount {
  user: UserDto;
  password: string;
  status: MockAccountStatus;
}

/** Mật khẩu chung của mọi tài khoản seed (chỉ dev/demo — database-seed-data). */
export const MOCK_PASSWORD = 'Passw0rd!';

/** Tài khoản seed dùng chung cho mock và `prisma db seed` (ID lấy từ SEED_IDS). */
export const MOCK_ACCOUNTS: readonly MockAccount[] = [
  {
    user: {
      id: SEED_IDS.admin,
      fullName: 'Quản trị viên',
      email: 'admin@edu.vn',
      role: 'ADMIN',
      studentCode: null,
    },
    password: MOCK_PASSWORD,
    status: 'ACTIVE',
  },
  {
    user: {
      id: SEED_IDS.teacher,
      fullName: 'Trần Minh Giảng',
      email: 'teacher@edu.vn',
      role: 'TEACHER',
      studentCode: null,
    },
    password: MOCK_PASSWORD,
    status: 'ACTIVE',
  },
  {
    user: {
      id: SEED_IDS.teacher2,
      fullName: 'Phạm Thu Hà',
      email: 'teacher2@edu.vn',
      role: 'TEACHER',
      studentCode: null,
    },
    password: MOCK_PASSWORD,
    status: 'ACTIVE',
  },
  {
    user: {
      id: SEED_IDS.student,
      fullName: 'Lê Thanh Nhàn',
      email: 'na@stu.edu.vn',
      role: 'STUDENT',
      studentCode: 'DH52301350',
    },
    password: MOCK_PASSWORD,
    status: 'ACTIVE',
  },
  {
    user: {
      id: SEED_IDS.lockedStudent,
      fullName: 'Sinh viên bị khóa',
      email: 'locked@stu.edu.vn',
      role: 'STUDENT',
      studentCode: 'DH52300000',
    },
    password: MOCK_PASSWORD,
    status: 'LOCKED',
  },
];
