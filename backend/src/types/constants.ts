export const ROLES = ['STUDENT', 'TEACHER', 'ADMIN'] as const;
export type Role = (typeof ROLES)[number];

export const TOPIC_ICON_KEYS = [
  'code',
  'database',
  'globe',
  'bug',
  'cpu',
  'server',
  'shield',
  'book',
] as const;
export type TopicIconKey = (typeof TOPIC_ICON_KEYS)[number];

export const TOPIC_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

export const COURSE_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
export type CourseLevel = (typeof COURSE_LEVELS)[number];
