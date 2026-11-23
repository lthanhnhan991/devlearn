'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdminLesson } from '@/services';
import type { AdminLessonDto, LessonContentDto } from '@/types';
import { LessonViewer } from '@/components/learn/LessonViewer';
import { buttonStyles } from '@/components/ui/Button';
import { cn } from '@/lib/cn';

interface AdminLessonPreviewViewProps {
  lessonId: string;
  courseId?: string;
}

export function AdminLessonPreviewView({ lessonId, courseId }: AdminLessonPreviewViewProps) {
  const [lesson, setLesson] = useState<AdminLessonDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchLesson() {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminLesson(lessonId);
      setLesson(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải thông tin bài học.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const backUrl = courseId ? `/admin/lessons?courseId=${courseId}` : '/admin/lessons';

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-slate-400">
        <div className="size-8 animate-spin rounded-full border-2 border-slate-300 border-t-admin-primary mb-3" />
        <p className="text-xs">Đang nạp dữ liệu bài học…</p>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-800">
        <p className="font-semibold">{error || 'Không tìm thấy bài học'}</p>
        <div className="mt-4">
          <Link
            href={backUrl}
            className={buttonStyles({
              variant: 'admin-outline',
              size: 'md',
            })}
          >
            ← Quay lại soạn bài
          </Link>
        </div>
      </div>
    );
  }

  const viewerLesson: LessonContentDto = {
    id: lesson.id,
    title: lesson.title,
    contentType: lesson.contentType,
    fileUrl: lesson.fileUrl,
    durationSeconds: lesson.durationSeconds,
    courseId: courseId ?? '',
    moduleId: lesson.moduleId,
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={backUrl}
            className={buttonStyles({
              variant: 'admin-outline',
              size: 'md',
            })}
          >
            ← Quay lại soạn bài
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-sm bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
                XEM TRƯỚC (CLIENT)
              </span>
              <span
                className={cn(
                  'rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase',
                  lesson.isPublished
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-600',
                )}
              >
                {lesson.isPublished ? 'Đã xuất bản' : 'Bản nháp'}
              </span>
            </div>
            <h1 className="mt-1 text-xl font-bold text-admin-navy line-clamp-1">
              {lesson.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Định dạng:</span>
          <span className="font-semibold text-slate-800">
            {lesson.contentType === 'VIDEO' ? 'Video bài giảng' : 'Tài liệu PDF'}
          </span>
        </div>
      </div>

      {/* Notice box */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-xs text-blue-900 flex items-start gap-3">
        <span className="text-base leading-none">💡</span>
        <div>
          <strong>Chế độ xem trước dành cho Giảng viên & Quản trị viên:</strong> Bạn đang xem bài
          học với giao diện hiển thị chính xác như học viên nhìn thấy, nhưng không cần điều kiện ghi
          danh và không tính vào tiến độ học tập của tài khoản.
        </div>
      </div>

      {/* Lesson Content Viewer */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <LessonViewer lesson={viewerLesson} onRetry={fetchLesson} />
      </div>
    </div>
  );
}
