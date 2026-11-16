export const ROLES = ['STUDENT', 'TEACHER', 'ADMIN'] as const;
export type Role = (typeof ROLES)[number];

export const COURSE_TOPICS = ['PROGRAMMING', 'DATABASE', 'WEB', 'SOFTWARE_ENGINEERING'] as const;
export type CourseTopic = (typeof COURSE_TOPICS)[number];

export const COURSE_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
export type CourseLevel = (typeof COURSE_LEVELS)[number];
