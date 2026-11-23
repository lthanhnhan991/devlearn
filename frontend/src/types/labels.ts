export const LABELS = {
  role: { STUDENT: 'Học viên', TEACHER: 'Giảng viên', ADMIN: 'Quản trị' },
  level: {
    BEGINNER: 'Nhập môn',
    INTERMEDIATE: 'Trung cấp',
    ADVANCED: 'Nâng cao',
  },
  courseStatus: {
    DRAFT: 'Bản nháp',
    PUBLISHED: 'Đã xuất bản',
  },
  examStatus: {
    DRAFT: 'Nháp',
    OPEN: 'Đang mở',
    CLOSED: 'Đã đóng',
  },
} as const;
