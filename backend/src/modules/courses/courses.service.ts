import { CoursesRepository, coursesRepository as defaultRepo } from './courses.repository';
import { AppError, ERROR_CODES } from '../../types/errors';
import type {
  CourseCardDto,
  CourseDetailDto,
  CourseExamOutlineDto,
  ListCoursesQuery,
} from '../../types/dto/catalog';
import type { CourseLevel } from '../../types/constants';

export class CoursesService {
  constructor(private readonly repo: CoursesRepository = defaultRepo) {}

  async listCourses(query: ListCoursesQuery): Promise<{
    data: CourseCardDto[];
    meta: { page: number; pageSize: number; total: number; totalPages: number };
  }> {
    const page = query.page;
    const pageSize = query.pageSize;
    const skip = (page - 1) * pageSize;

    const topics = Array.isArray(query.topic)
      ? query.topic
      : query.topic
        ? [query.topic]
        : undefined;

    const levels = Array.isArray(query.level)
      ? query.level
      : query.level
        ? [query.level]
        : undefined;

    const params: {
      q?: string | undefined;
      topics?: string[] | undefined;
      levels?: string[] | undefined;
      sort?: ('newest' | 'popular') | undefined;
      skip: number;
      take: number;
    } = {
      skip,
      take: pageSize,
    };

    if (query.q !== undefined) params.q = query.q;
    if (topics !== undefined) params.topics = topics;
    if (levels !== undefined) params.levels = levels;
    if (query.sort !== undefined) params.sort = query.sort;

    const { total, courses } = await this.repo.listCourses(params);

    const data: CourseCardDto[] = courses.map((course) => {
      let lessonCount = 0;
      let totalDurationSeconds = 0;

      for (const m of course.modules) {
        for (const l of m.lessons) {
          lessonCount += 1;
          totalDurationSeconds += l.durationSeconds ?? 0;
        }
      }

      const totalDurationMinutes = Math.ceil(totalDurationSeconds / 60);

      return {
        id: course.id,
        title: course.title,
        topic: course.topic,
        level: course.level as CourseLevel,
        teacher: course.teacher,
        lessonCount,
        totalDurationMinutes,
        enrollmentCount: course._count.enrollments,
      };
    });

    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        totalPages,
      },
    };
  }

  async getCourseDetail(courseId: string, userId?: string | undefined): Promise<CourseDetailDto> {
    const course = await this.repo.findPublishedCourseById(courseId);
    if (!course) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 404, 'Không tìm thấy khóa học.');
    }

    let lessonCount = 0;
    let totalDurationSeconds = 0;
    let moduleExamCount = 0;

    const modules = course.modules.map((m) => {
      const lessons = m.lessons.map((l) => {
        lessonCount += 1;
        totalDurationSeconds += l.durationSeconds ?? 0;
        return {
          id: l.id,
          title: l.title,
          contentType: l.contentType,
          durationSeconds: l.durationSeconds,
          position: l.position,
        };
      });

      let exam: CourseExamOutlineDto | null = null;
      if (m.exams.length > 0) {
        const firstExam = m.exams[0]!;
        moduleExamCount += 1;
        exam = {
          id: firstExam.id,
          title: firstExam.title,
          status: firstExam.status as 'OPEN' | 'CLOSED',
          durationMinutes: firstExam.durationMinutes,
          passScore: Number(firstExam.passScore),
          questionCount: firstExam._count.questions,
        };
      }

      return {
        id: m.id,
        title: m.title,
        position: m.position,
        lessons,
        exam,
      };
    });

    let finalExam: CourseExamOutlineDto | null = null;
    if (course.exams.length > 0) {
      const firstFinal = course.exams[0]!;
      finalExam = {
        id: firstFinal.id,
        title: firstFinal.title,
        status: firstFinal.status as 'OPEN' | 'CLOSED',
        durationMinutes: firstFinal.durationMinutes,
        passScore: Number(firstFinal.passScore),
        questionCount: firstFinal._count.questions,
      };
    }

    const examCount = moduleExamCount + (finalExam ? 1 : 0);
    const totalDurationMinutes = Math.ceil(totalDurationSeconds / 60);

    // Xử lý thông tin ghi danh (nếu user đăng nhập)
    let enrollmentInfo = null;
    if (userId) {
      const enrollment = await this.repo.findEnrollment(userId, courseId);
      if (enrollment) {
        const completedCount = await this.repo.getCompletedLessonsCount(userId, courseId);
        const progressPercent =
          lessonCount > 0 ? Math.round((completedCount / lessonCount) * 100) : 0;

        // Tìm resumeLessonId
        const publishedLessons = await this.repo.getPublishedLessons(courseId);
        const completedIds = await this.repo.getCompletedLessonIds(userId, courseId);

        let resumeLessonId: string | null = null;
        for (const l of publishedLessons) {
          if (!completedIds.has(l.id)) {
            resumeLessonId = l.id;
            break;
          }
        }
        if (!resumeLessonId && publishedLessons.length > 0) {
          resumeLessonId = publishedLessons[publishedLessons.length - 1]!.id;
        }

        enrollmentInfo = {
          enrolledAt: enrollment.enrolledAt.toISOString(),
          progressPercent,
          completedAt: enrollment.completedAt ? enrollment.completedAt.toISOString() : null,
          resumeLessonId,
        };
      }
    }

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      topic: course.topic,
      level: course.level as CourseLevel,
      teacher: course.teacher,
      lessonCount,
      moduleCount: course.modules.length,
      examCount,
      totalDurationMinutes,
      enrollmentCount: course._count.enrollments,
      modules,
      finalExam,
      enrollment: enrollmentInfo,
    };
  }
}

export const coursesService = new CoursesService();
