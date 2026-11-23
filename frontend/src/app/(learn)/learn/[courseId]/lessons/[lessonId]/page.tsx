import { Suspense } from 'react';
import { LearnLessonView } from '@/components/learn/LearnLessonView';

export const instant = false;

interface PageProps {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
}

export default async function LearnLessonPage({ params }: PageProps) {
  const { courseId, lessonId } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex h-screen flex-col bg-white">
          <header className="h-16 w-full border-b border-slate-200 bg-white" />
          <div className="flex flex-1 items-center justify-center text-slate-400">
            <p>Đang nạp bài học…</p>
          </div>
        </div>
      }
    >
      <LearnLessonView courseId={courseId} lessonId={lessonId} />
    </Suspense>
  );
}
