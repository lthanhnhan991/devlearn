'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LearnHeader } from '@/components/learn/LearnHeader';
import { LessonSidebar } from '@/components/learn/LessonSidebar';
import { LessonViewer } from '@/components/learn/LessonViewer';
import { Button } from '@/components/ui/Button';
import {
  getLearnStructure,
  getLesson,
  completeLesson,
} from '@/services';
import type { LearnStructureDto, LessonContentDto } from '@/types';

export interface LearnLessonViewProps {
  courseId: string;
  lessonId: string;
}

export function LearnLessonView({ courseId, lessonId }: LearnLessonViewProps) {
  const router = useRouter();

  const [structure, setStructure] = useState<LearnStructureDto | null>(null);
  const [lesson, setLesson] = useState<LessonContentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [courseCompletedBanner, setCourseCompletedBanner] = useState(false);

  // Load structure and lesson
  async function loadData() {
    try {
      setLoading(true);
      const [structData, lessonData] = await Promise.all([
        getLearnStructure(courseId),
        getLesson(lessonId),
      ]);
      setStructure(structData);
      setLesson(lessonData);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('NOT_ENROLLED') || msg.includes('chưa đăng ký')) {
        router.replace(`/courses/${courseId}`);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [courseId, lessonId]);

  // Handle Mark Complete
  async function handleComplete() {
    if (!lesson || completing) return;
    setCompleting(true);
    try {
      const res = await completeLesson(lesson.id);
      setLesson((prev) => (prev ? { ...prev, isCompleted: true, progressPercent: res.progressPercent } : prev));

      // Cập nhật cấu trúc sidebar & header
      setStructure((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          progressPercent: res.progressPercent,
          modules: prev.modules.map((m) => {
            if (m.id !== lesson.moduleId) return m;
            const updatedLessons = m.lessons.map((l) =>
              l.id === lesson.id ? { ...l, isCompleted: true } : l,
            );
            const completedCount = updatedLessons.filter((l) => l.isCompleted).length;
            return {
              ...m,
              completedCount,
              lessons: updatedLessons,
            };
          }),
        };
      });

      if (res.courseCompleted) {
        setCourseCompletedBanner(true);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Không thể lưu tiến độ bài học.');
    } finally {
      setCompleting(false);
    }
  }

  if (loading && !structure) {
    return (
      <div className="flex h-screen flex-col bg-white">
        <header className="h-16 w-full border-b border-slate-200 bg-white" />
        <div className="flex flex-1 items-center justify-center text-slate-400">
          <p>Đang nạp bài học…</p>
        </div>
      </div>
    );
  }

  if (!structure || !lesson) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-white p-6 text-center">
        <p className="font-semibold text-slate-800">Không tìm thấy bài học hoặc nội dung chưa sẵn sàng.</p>
        <Link
          href={`/courses/${courseId}`}
          className="mt-4 rounded-lg bg-client-primary px-4 py-2 text-sm font-semibold text-white hover:bg-client-primary-hover"
        >
          Quay lại khóa học
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50 font-sans overflow-hidden">
      {/* Top Header */}
      <LearnHeader
        courseId={courseId}
        courseTitle={structure.course.title}
        progressPercent={structure.progressPercent}
      />

      {/* Main Two-column Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <LessonSidebar
          courseId={courseId}
          currentLessonId={lesson.id}
          structure={structure}
        />

        {/* Right Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="mx-auto max-w-4xl space-y-6">
            {/* Course Completed Celebration */}
            {courseCompletedBanner && (
              <div className="flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900 shadow-sm animate-fade-in">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <p className="font-bold">Chúc mừng! Bạn đã hoàn thành 100% khóa học!</p>
                    <p className="text-xs text-emerald-700">
                      Toàn bộ các bài học trong khóa học đã được ghi nhận hoàn tất.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCourseCompletedBanner(false)}
                  className="rounded-lg p-1 text-emerald-600 hover:bg-emerald-100"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Lesson Title */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                <span>{lesson.contentType === 'VIDEO' ? '🎥 Video bài giảng' : '📄 Tài liệu đọc'}</span>
                {lesson.isCompleted ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 lowercase">
                    ✓ đã hoàn thành
                  </span>
                ) : null}
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {lesson.title}
              </h2>
            </div>

            {/* Viewer (Video or PDF) */}
            <LessonViewer lesson={lesson} onRetry={loadData} />

            {/* Navigation & Completion Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-slate-200 pt-6">
              {/* Prev Button */}
              {lesson.prevLessonId ? (
                <Link
                  href={`/learn/${courseId}/lessons/${lesson.prevLessonId}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  ← Bài trước
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400 cursor-not-allowed"
                >
                  ← Bài trước
                </button>
              )}

              {/* Complete Action Button */}
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant={lesson.isCompleted ? 'client-outline' : 'client-primary'}
                  size="md"
                  loading={completing}
                  onClick={handleComplete}
                  disabled={lesson.isCompleted}
                >
                  {lesson.isCompleted ? '✓ Đã hoàn thành bài học' : 'Hoàn thành bài học'}
                </Button>
              </div>

              {/* Next Button */}
              {lesson.nextLessonId ? (
                <Link
                  href={`/learn/${courseId}/lessons/${lesson.nextLessonId}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-client-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-client-primary-hover transition-colors"
                >
                  Bài tiếp theo →
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400 cursor-not-allowed"
                >
                  Bài tiếp theo →
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
