import Link from 'next/link';
import type { ReactNode } from 'react';
import { Logo } from '@/components/shared/Logo';

/** C01 — bố cục chia đôi: trái nền xanh (thông điệp), phải thẻ form. Xếp dọc trên mobile. */
export function AuthSplitLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid flex-1 lg:grid-cols-[53fr_47fr]">
      <section className="flex flex-col justify-center gap-4 bg-client-primary px-8 py-12 text-white sm:px-16 lg:py-0">
        <Link
          href="/"
          aria-label="DevLearn — về trang chủ"
          className="w-fit focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <Logo tone="onDark" />
        </Link>
        <h1 className="max-w-xl text-4xl font-light leading-tight sm:text-5xl">
          Học phát triển phần mềm cùng trợ lý AI.
        </h1>
        <p className="max-w-xl text-lg">
          Khóa học, bài kiểm tra và hỏi đáp tài liệu cho sinh viên Khoa CNTT.
        </p>
      </section>
      <main className="flex items-center justify-center px-6 py-10">{children}</main>
    </div>
  );
}
