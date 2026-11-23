import { ProgressRepository, progressRepository as defaultRepo } from './progress.repository';
import { AppError, ERROR_CODES } from '../../types/errors';
import type {
  LearnStructureDto,
  LessonContentDto,
  CompleteResultDto,
  MyCourseDto,
  LearningSummaryDto,
  LearnModuleDto,
  LearnLessonDto,
  LearnExamDto,
} from '../../types/dto/learning';
import type { ExamStatus } from '../../types/constants';

export class ProgressService {
  constructor(private readonly repo: ProgressRepository = defaultRepo) {}

  /**
   * Tính tiến độ học tập (concept-enrollment-progress) — Một nguồn duy nhất:
   * progressPercent = round( completedPublishedLessons / totalPublishedLessons * 100 )
   */
  async computeProgress(userId: string, courseId: string) {
    const publishedLessons = await this.repo.findPublishedLessons(courseId);
    const completedProgress = await this.repo.findCompletedProgress(userId, courseId);

    const completedSet = new Set(completedProgress.map((p) => p.lessonId));
    const totalCount = publishedLessons.length;
    const completedCount = publishedLessons.filter((l) => completedSet.has(l.id)).length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    let resumeLessonId: string | null = null;
    const firstUncompleted = publishedLessons.find((l) => !completedSet.has(l.id));
    if (firstUncompleted) {
      resumeLessonId = firstUncompleted.id;
    } else if (publishedLessons.length > 0) {
      resumeLessonId = publishedLessons[publishedLessons.length - 1]!.id;
    }

    return {
      totalCount,
      completedCount,
      progressPercent,
      resumeLessonId,
      completedSet,
    };
  }

  async getLearnStructure(userId: string, courseId: string): Promise<LearnStructureDto> {
    const enrollment = await this.repo.findEnrollment(userId, courseId);
    if (!enrollment) {
      throw new AppError(ERROR_CODES.NOT_ENROLLED, 403, 'Bạn chưa đăng ký khóa học này.');
    }

    const course = await this.repo.findCourseWithStructure(courseId);
    if (!course) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 404, 'Không tìm thấy khóa học.');
    }
    if (course.status !== 'PUBLISHED') {
      throw new AppError(ERROR_CODES.COURSE_UNPUBLISHED, 403, 'Khóa học chưa được xuất bản.');
    }

    const { progressPercent, completedSet } = await this.computeProgress(userId, courseId);

    const modules: LearnModuleDto[] = course.modules.map((m) => {
      const lessons: LearnLessonDto[] = m.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        contentType: l.contentType,
        durationSeconds: l.durationSeconds,
        position: l.position,
        isCompleted: completedSet.has(l.id),
      }));

      const completedModuleLessons = lessons.filter((l) => l.isCompleted).length;

      let exam: LearnExamDto | null = null;
      if (m.exams.length > 0) {
        const firstExam = m.exams[0]!;
        exam = {
          id: firstExam.id,
          title: firstExam.title,
          status: firstExam.status as ExamStatus,
          durationMinutes: firstExam.durationMinutes,
          passScore: Number(firstExam.passScore),
          questionCount: firstExam._count.questions,
        };
      }

      return {
        id: m.id,
        title: m.title,
        position: m.position,
        completedCount: completedModuleLessons,
        totalCount: lessons.length,
        lessons,
        exam,
      };
    });

    let finalExam: LearnExamDto | null = null;
    if (course.exams.length > 0) {
      const fe = course.exams[0]!;
      finalExam = {
        id: fe.id,
        title: fe.title,
        status: fe.status as ExamStatus,
        durationMinutes: fe.durationMinutes,
        passScore: Number(fe.passScore),
        questionCount: fe._count.questions,
      };
    }

    return {
      course: {
        id: course.id,
        title: course.title,
      },
      progressPercent,
      modules,
      finalExam,
    };
  }

  async getLesson(userId: string, lessonId: string): Promise<LessonContentDto> {
    const lesson = await this.repo.findLessonWithCourse(lessonId);
    if (!lesson || !lesson.isPublished) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 404, 'Không tìm thấy bài học.');
    }

    const courseId = lesson.module.courseId;
    if (lesson.module.course.status !== 'PUBLISHED') {
      throw new AppError(ERROR_CODES.COURSE_UNPUBLISHED, 403, 'Khóa học chưa được xuất bản.');
    }

    const enrollment = await this.repo.findEnrollment(userId, courseId);
    if (!enrollment) {
      throw new AppError(ERROR_CODES.NOT_ENROLLED, 403, 'Bạn chưa đăng ký khóa học này.');
    }

    const allPublished = await this.repo.findPublishedLessons(courseId);
    const currentIndex = allPublished.findIndex((l) => l.id === lessonId);
    const prevLessonId = currentIndex > 0 ? allPublished[currentIndex - 1]!.id : null;
    const nextLessonId = currentIndex < allPublished.length - 1 ? allPublished[currentIndex + 1]!.id : null;

    const progressRecord = await this.repo.findLessonProgress(userId, lessonId);
    const isCompleted = progressRecord !== null;

    const { progressPercent } = await this.computeProgress(userId, courseId);

    return {
      id: lesson.id,
      title: lesson.title,
      contentType: lesson.contentType,
      fileUrl: lesson.fileUrl,
      durationSeconds: lesson.durationSeconds,
      courseId,
      moduleId: lesson.moduleId,
      isCompleted,
      prevLessonId,
      nextLessonId,
      progressPercent,
    };
  }

  async completeLesson(userId: string, lessonId: string): Promise<CompleteResultDto> {
    const lesson = await this.repo.findLessonWithCourse(lessonId);
    if (!lesson || !lesson.isPublished) {
      throw new AppError(ERROR_CODES.NOT_FOUND, 404, 'Không tìm thấy bài học.');
    }

    const courseId = lesson.module.courseId;
    const enrollment = await this.repo.findEnrollment(userId, courseId);
    if (!enrollment) {
      throw new AppError(ERROR_CODES.NOT_ENROLLED, 403, 'Bạn chưa đăng ký khóa học này.');
    }

    const progress = await this.repo.upsertLessonProgress(userId, lessonId);
    const { progressPercent } = await this.computeProgress(userId, courseId);

    let courseCompleted = false;
    if (progressPercent === 100 && !enrollment.completedAt) {
      const now = new Date();
      await this.repo.updateEnrollmentCompleted(userId, courseId, now);
      courseCompleted = true;
    }

    return {
      lessonId,
      completedAt: progress.completedAt.toISOString(),
      progressPercent,
      courseCompleted,
    };
  }

  async getMyCourses(userId: string, status?: 'in-progress' | 'completed'): Promise<MyCourseDto[]> {
    const enrollments = await this.repo.findMyEnrollments(userId, status);

    const result: MyCourseDto[] = [];
    for (const enr of enrollments) {
      const { progressPercent, resumeLessonId } = await this.computeProgress(userId, enr.courseId);
      result.push({
        course: {
          id: enr.course.id,
          title: enr.course.title,
          topic: {
            id: enr.course.topic.id,
            name: enr.course.topic.name,
            slug: enr.course.topic.slug,
            color: enr.course.topic.color,
            icon: enr.course.topic.icon,
          },
          teacher: {
            id: enr.course.teacher.id,
            fullName: enr.course.teacher.fullName,
          },
        },
        progressPercent,
        enrolledAt: enr.enrolledAt.toISOString(),
        completedAt: enr.completedAt ? enr.completedAt.toISOString() : null,
        resumeLessonId,
      });
    }

    return result;
  }

  async getLearningSummary(userId: string): Promise<LearningSummaryDto> {
    const { inProgressCount, completedCount } = await this.repo.countMyEnrollments(userId);
    const attempts = await this.repo.findUserAttempts(userId);

    let averageExamScore: number | null = null;
    if (attempts.length > 0) {
      const bestScoreMap = new Map<string, number>();
      for (const att of attempts) {
        if (att.score !== null) {
          const scoreNum = Number(att.score);
          const currentBest = bestScoreMap.get(att.examId) ?? 0;
          if (scoreNum > currentBest) {
            bestScoreMap.set(att.examId, scoreNum);
          }
        }
      }

      if (bestScoreMap.size > 0) {
        let sum = 0;
        for (const score of bestScoreMap.values()) {
          sum += score;
        }
        averageExamScore = Math.round((sum / bestScoreMap.size) * 100) / 100;
      }
    }

    return {
      inProgressCount,
      completedCount,
      averageExamScore,
    };
  }
}

export const progressService = new ProgressService();
