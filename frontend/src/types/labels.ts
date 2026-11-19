export const LABELS = {
  role: { STUDENT: 'Học viên', TEACHER: 'Giảng viên', ADMIN: 'Quản trị' },
  level: {
    BEGINNER: 'Nhập môn',
    INTERMEDIATE: 'Trung cấp',
    ADVANCED: 'Nâng cao',
  },
  topic: {
    PROGRAMMING: 'Lập trình',
    DATABASE: 'Cơ sở dữ liệu',
    WEB: 'Web',
    SOFTWARE_ENGINEERING: 'Công nghệ phần mềm',
  },
  courseStatus: {
    DRAFT: 'Bản nháp',
    PUBLISHED: 'Đã xuất bản',
  },
} as const;
