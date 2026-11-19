'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button, buttonStyles } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/auth-context';
import { enrollCourse } from '@/services';
import type { CourseEnrollmentStatusDto } from '@/types';

export interface EnrollPanelProps {
  courseId: string;
  enrollmentCount: number;
  initialEnrollment?: CourseEnrollmentStatusDto | null;
}

export function EnrollPanel({
  courseId,
  enrollmentCount: initialCount,
  initialEnrollment,
}: EnrollPanelProps) {
  const router = useRouter();
  const { status, user } = useAuth();
  const [enrollment, setEnrollment] = useState<CourseEnrollmentStatusDto | null>(
    initialEnrollment ?? null,
  );
  const [enrollmentCount, setEnrollmentCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleEnroll() {
    if (status !== 'authenticated' || !user) {
      router.push(`/login?next=/courses/${courseId}`);
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await enrollCourse(courseId);
      setEnrollment({
        enrolledAt: res.enrolledAt,
        progressPercent: res.progressPercent,
        completedAt: null,
        resumeLessonId: res.resumeLessonId,
      });
      setEnrollmentCount((c) => c + 1);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Đăng ký thất bại. Vui lòng thử lại sau.';
      setErrorMsg(message);
    } finally {
      setLoading(false);
    }
  }

  // C04b: Đã đăng ký
  if (enrollment) {
    const isStarted = enrollment.progressPercent > 0;
    const buttonText = isStarted ? 'Tiếp tục học' : 'Bắt đầu học';
    const learnHref = enrollment.resumeLessonId
      ? `/learn/${courseId}/lessons/${enrollment.resumeLessonId}`
      : `/courses/${courseId}`;

    return (
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            <span>✓</span> Đã đăng ký
          </span>
          <span className="text-xs text-slate-500">{enrollmentCount} học viên</span>
        </div>

        {/* Tiến độ */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-xs font-medium text-slate-600">
            <span>Tiến độ của bạn</span>
            <span className="font-bold text-client-primary">{enrollment.progressPercent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full bg-client-primary transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, enrollment.progressPercent))}%` }}
            />
          </div>
        </div>

        <Link
          href={learnHref}
          className={buttonStyles({ variant: 'client-primary', size: 'lg', fullWidth: true })}
        >
          {buttonText}
        </Link>
      </div>
    );
  }

  // C04a: Chưa đăng ký
  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      {errorMsg && (
        <div className="rounded-lg bg-rose-50 p-3 text-xs font-medium text-rose-700">
          {errorMsg}
        </div>
      )}

      <Button
        type="button"
        variant="client-primary"
        size="lg"
        fullWidth
        loading={loading}
        onClick={handleEnroll}
      >
        Đăng ký học khóa học
      </Button>

      <p className="text-center text-xs text-slate-500">
        {enrollmentCount} sinh viên đã đăng ký · <span className="font-semibold text-client-primary">Miễn phí</span>
      </p>
    </div>
  );
}
