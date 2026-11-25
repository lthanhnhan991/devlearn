'use client';

import { useState } from 'react';
import type { LessonContentDto } from '@/types';

export interface LessonViewerProps {
  lesson: LessonContentDto;
  onRetry?: () => void;
}

function extractYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i,
  );
  return match && match[1] ? match[1] : null;
}

export function LessonViewer({ lesson, onRetry }: LessonViewerProps) {
  const [loadError, setLoadError] = useState(false);

  const fileUrl = lesson.fileUrl;

  // Lỗi tải nội dung
  if (loadError) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50/50 p-8 text-center">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="size-10 text-rose-500 mb-3"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <p className="font-semibold text-rose-800">Không thể tải nội dung bài học</p>
        <p className="text-xs text-rose-600 mt-1 max-w-md">
          Có lỗi xảy ra trong quá trình nạp tài nguyên. Vui lòng kiểm tra lại kết nối mạng.
        </p>
        <button
          type="button"
          onClick={() => {
            setLoadError(false);
            if (onRetry) onRetry();
          }}
          className="mt-4 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  // Chưa tải nội dung
  if (!fileUrl) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-100 p-8 text-center text-slate-500">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="size-12 text-slate-400 mb-3"
        >
          {lesson.contentType === 'VIDEO' ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          )}
        </svg>
        <p className="font-semibold text-slate-700">Nội dung đang được chuẩn bị</p>
        <p className="text-xs text-slate-500 mt-1">
          Giảng viên chưa tải nội dung cho bài học này.
        </p>
      </div>
    );
  }

  // Video Content
  if (lesson.contentType === 'VIDEO') {
    const ytId = extractYouTubeId(fileUrl);
    if (ytId) {
      return (
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-md">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${ytId}?rel=0`}
            title={lesson.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onError={() => setLoadError(true)}
          />
        </div>
      );
    }

    return (
      <div className="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-md flex items-center justify-center">
        <video
          key={fileUrl}
          controls
          className="w-full h-full"
          src={fileUrl}
          onError={() => setLoadError(true)}
          controlsList="nodownload"
        >
          Trình duyệt của bạn không hỗ trợ phát video HTML5.
        </video>
      </div>
    );
  }

  // PDF Content (Gap G-16)
  return (
    <div className="w-full space-y-3">
      <div className="h-[640px] w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <object
          data={fileUrl}
          type="application/pdf"
          className="w-full h-full"
          aria-label={lesson.title}
        >
          <iframe
            src={fileUrl}
            title={lesson.title}
            className="w-full h-full border-0"
            onError={() => setLoadError(true)}
          />
        </object>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">Tài liệu học tập định dạng PDF</span>
        <div className="flex items-center gap-4">
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-client-primary hover:underline"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
            Mở trong tab mới
          </a>
          <a
            href={fileUrl}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-slate-900 hover:underline"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Tải tệp về máy
          </a>
        </div>
      </div>
    </div>
  );
}
