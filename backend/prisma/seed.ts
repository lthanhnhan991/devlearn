import { PrismaClient, Role, UserStatus, CourseStatus, ContentType, ExamStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SEED_IDS } from '../src/types/seed-ids';

const prisma = new PrismaClient();

const PASSWORD = 'Passw0rd!';

async function main() {
  const hash = await bcrypt.hash(PASSWORD, 12);

  // 1. Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@edu.vn' },
    update: {},
    create: {
      id: SEED_IDS.admin,
      email: 'admin@edu.vn',
      fullName: 'Quản trị viên',
      passwordHash: hash,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@edu.vn' },
    update: {},
    create: {
      id: SEED_IDS.teacher,
      email: 'teacher@edu.vn',
      fullName: 'Trần Minh Giảng',
      passwordHash: hash,
      role: Role.TEACHER,
      status: UserStatus.ACTIVE,
    },
  });

  const teacher2 = await prisma.user.upsert({
    where: { email: 'teacher2@edu.vn' },
    update: {},
    create: {
      id: SEED_IDS.teacher2,
      email: 'teacher2@edu.vn',
      fullName: 'Phạm Thu Hà',
      passwordHash: hash,
      role: Role.TEACHER,
      status: UserStatus.ACTIVE,
    },
  });

  const studentNa = await prisma.user.upsert({
    where: { email: 'na@stu.edu.vn' },
    update: {},
    create: {
      id: SEED_IDS.student,
      email: 'na@stu.edu.vn',
      fullName: 'Lê Thanh Nhàn',
      studentCode: 'DH52301350',
      passwordHash: hash,
      role: Role.STUDENT,
      status: UserStatus.ACTIVE,
    },
  });

  await prisma.user.upsert({
    where: { email: 'locked@stu.edu.vn' },
    update: {},
    create: {
      id: SEED_IDS.lockedStudent,
      email: 'locked@stu.edu.vn',
      fullName: 'Sinh viên bị khóa',
      studentCode: 'DH52300000',
      passwordHash: hash,
      role: Role.STUDENT,
      status: UserStatus.LOCKED,
    },
  });

  const sampleStudents = [];
  for (let i = 2; i <= 12; i++) {
    const num = i.toString().padStart(2, '0');
    const sv = await prisma.user.upsert({
      where: { email: `sv${num}@stu.edu.vn` },
      update: {},
      create: {
        email: `sv${num}@stu.edu.vn`,
        fullName: `Sinh viên ${num}`,
        studentCode: `DH523013${num}`,
        passwordHash: hash,
        role: Role.STUDENT,
        status: UserStatus.ACTIVE,
      },
    });
    sampleStudents.push(sv);
  }

  // 2. Courses
  const coursesData = [
    {
      id: SEED_IDS.coursePython,
      title: 'Nhập môn Python',
      description: 'Khóa học cung cấp kiến thức nền tảng về ngôn ngữ lập trình Python, cú pháp cơ bản, xử lý chuỗi, mảng và lập trình hàm. Phù hợp cho người mới bắt đầu.',
      topic: 'PROGRAMMING',
      level: 'BEGINNER',
      status: CourseStatus.PUBLISHED,
      teacherId: teacher.id,
    },
    {
      id: SEED_IDS.courseJava,
      title: 'Java hướng đối tượng',
      description: 'Làm chủ tư duy lập trình hướng đối tượng (OOP) với Java. Bao gồm tính đóng gói, kế thừa, đa hình, trừu tượng và các design pattern căn bản.',
      topic: 'PROGRAMMING',
      level: 'INTERMEDIATE',
      status: CourseStatus.PUBLISHED,
      teacherId: teacher2.id,
    },
    {
      id: SEED_IDS.courseSql,
      title: 'SQL cơ bản',
      description: 'Học cách thiết kế cơ sở dữ liệu quan hệ, viết câu truy vấn SQL từ cơ bản đến nâng cao (SELECT, JOIN, GROUP BY, subquery).',
      topic: 'DATABASE',
      level: 'BEGINNER',
      status: CourseStatus.PUBLISHED,
      teacherId: teacher.id,
    },
    {
      id: SEED_IDS.courseNextjs,
      title: 'Next.js thực chiến',
      description: 'Xây dựng ứng dụng web hiện đại với Next.js App Router, React Server Components, Server Actions và tích hợp cơ sở dữ liệu.',
      topic: 'WEB',
      level: 'INTERMEDIATE',
      status: CourseStatus.PUBLISHED,
      teacherId: teacher.id,
    },
    {
      id: SEED_IDS.coursePostgres,
      title: 'PostgreSQL nâng cao',
      description: 'Tối ưu hóa chỉ mục Indexing, phân vùng Partitioning, Full-Text Search và tối ưu hóa hiệu năng câu truy vấn trong hệ thống lớn.',
      topic: 'DATABASE',
      level: 'INTERMEDIATE',
      status: CourseStatus.PUBLISHED,
      teacherId: teacher2.id,
    },
    {
      id: SEED_IDS.courseTesting,
      title: 'Kiểm thử phần mềm',
      description: 'Phương pháp kiểm thử hộp đen, hộp trắng, viết unit test, integration test và kiểm thử tự động với Vitest / Playwright.',
      topic: 'SOFTWARE_ENGINEERING',
      level: 'BEGINNER',
      status: CourseStatus.PUBLISHED,
      teacherId: teacher2.id,
    },
    {
      id: SEED_IDS.courseGit,
      title: 'Git và GitHub cơ bản',
      description: 'Quản lý phiên bản mã nguồn, quy trình làm việc theo nhánh Git flow, giải quyết xung đột conflict và cộng tác nhóm.',
      topic: 'PROGRAMMING',
      level: 'BEGINNER',
      status: CourseStatus.DRAFT,
      teacherId: teacher.id,
    },
  ];

  for (const c of coursesData) {
    const course = await prisma.course.upsert({
      where: { id: c.id },
      update: {
        title: c.title,
        description: c.description,
        topic: c.topic,
        level: c.level,
        status: c.status,
      },
      create: c,
    });

    // Modules and Lessons
    const existingModules = await prisma.module.count({ where: { courseId: course.id } });
    if (existingModules === 0) {
      for (let mIdx = 0; mIdx < 3; mIdx++) {
        const moduleTitle = mIdx === 0 ? 'Làm quen & Cài đặt môi trường' : mIdx === 1 ? 'Kiến thức cốt lõi' : 'Thực hành nâng cao';
        const mod = await prisma.module.create({
          data: {
            courseId: course.id,
            title: `Module ${mIdx + 1}: ${moduleTitle}`,
            position: mIdx,
          },
        });

        // 4 lessons per module
        for (let lIdx = 0; lIdx < 4; lIdx++) {
          const isPublished = !(mIdx === 2 && lIdx === 3); // bài cuối module 3 là draft
          const contentType = lIdx % 2 === 0 ? ContentType.VIDEO : ContentType.PDF;
          await prisma.lesson.create({
            data: {
              moduleId: mod.id,
              title: `Bài ${lIdx + 1}: Nội dung bài học ${mIdx + 1}.${lIdx + 1}`,
              contentType,
              durationSeconds: (lIdx + 5) * 60, // 5 to 8 minutes
              position: lIdx,
              isPublished,
            },
          });
        }

        // Module 1 exam for Python
        if (c.id === SEED_IDS.coursePython && mIdx === 0) {
          const exam = await prisma.exam.create({
            data: {
              courseId: course.id,
              moduleId: mod.id,
              title: 'Kiểm tra Module 1: Căn bản Python',
              durationMinutes: 15,
              passScore: 5,
              status: ExamStatus.OPEN,
            },
          });

          for (let qIdx = 0; qIdx < 10; qIdx++) {
            const question = await prisma.question.create({
              data: {
                examId: exam.id,
                content: `Câu hỏi ${qIdx + 1}: Trong Python, kiểu dữ liệu nào dùng để lưu trữ danh sách có thể thay đổi?`,
                position: qIdx,
              },
            });

            await prisma.option.createMany({
              data: [
                { questionId: question.id, content: 'list', isCorrect: true, position: 0 },
                { questionId: question.id, content: 'tuple', isCorrect: false, position: 1 },
                { questionId: question.id, content: 'string', isCorrect: false, position: 2 },
                { questionId: question.id, content: 'frozenset', isCorrect: false, position: 3 },
              ],
            });
          }
        }
      }
    }
  }

  // 3. Enrollments for student Na
  const naEnrollments = [SEED_IDS.coursePython, SEED_IDS.courseSql, SEED_IDS.courseNextjs];
  for (const cId of naEnrollments) {
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: studentNa.id,
          courseId: cId,
        },
      },
      update: {},
      create: {
        userId: studentNa.id,
        courseId: cId,
        enrolledAt: new Date(),
      },
    });
  }

  // Sample enrollments from other students
  for (const sv of sampleStudents.slice(0, 8)) {
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: sv.id,
          courseId: SEED_IDS.coursePython,
        },
      },
      update: {},
      create: {
        userId: sv.id,
        courseId: SEED_IDS.coursePython,
        enrolledAt: new Date(),
      },
    });
  }

  for (const sv of sampleStudents.slice(2, 6)) {
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: sv.id,
          courseId: SEED_IDS.courseSql,
        },
      },
      update: {},
      create: {
        userId: sv.id,
        courseId: SEED_IDS.courseSql,
        enrolledAt: new Date(),
      },
    });
  }

  console.log('Seed completed successfully for Phase 02!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
