import Link from 'next/link';
import { buttonStyles } from '@/components/ui/Button';

/** Trang chủ tạm (C02 sẽ được dựng đầy đủ ở Phase 02). */
export default function HomePage() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-16">
      <h1 className="text-4xl font-light text-foreground sm:text-5xl">
        Xây kỹ năng. Xây tương lai.
      </h1>
      <p className="max-w-xl text-lg text-slate-600">
        Khóa học lập trình, cơ sở dữ liệu và công nghệ phần mềm của Khoa CNTT, học theo tốc độ của
        bạn.
      </p>
      <p className="text-sm text-slate-600">
        Nội dung trang chủ (thống kê, chủ đề, khóa học phổ biến) sẽ được dựng ở Phase 02.
      </p>
      <div>
        <Link href="/login" className={buttonStyles({ variant: 'client-primary', size: 'lg' })}>
          Bắt đầu học
        </Link>
      </div>
    </section>
  );
}
