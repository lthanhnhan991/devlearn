import { Suspense } from 'react';
import { AdminLessonPreviewView } from './AdminLessonPreviewView';

export const instant = false;

interface PreviewPageProps {
  params: Promise<{
    lessonId: string;
  }>;
  searchParams: Promise<{
    courseId?: string;
  }>;
}

export default async function AdminLessonPreviewPage({
  params,
  searchParams,
}: PreviewPageProps) {
  const { lessonId } = await params;
  const { courseId } = await searchParams;

  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center text-slate-400">
          <p className="text-sm">Đang tải bản xem trước bài học…</p>
        </div>
      }
    >
      <AdminLessonPreviewView lessonId={lessonId} courseId={courseId} />
    </Suspense>
  );
}
