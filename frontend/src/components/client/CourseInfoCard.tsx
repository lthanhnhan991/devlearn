import type { CourseDetailDto } from '@/types';
import { LABELS } from '@/types';

export interface CourseInfoCardProps {
  course: CourseDetailDto;
}

export function CourseInfoCard({ course }: CourseInfoCardProps) {
  const durationText =
    course.totalDurationMinutes >= 60
      ? `${Math.round(course.totalDurationMinutes / 60)} giờ`
      : `${course.totalDurationMinutes} phút`;

  const infoItems = [
    { label: 'Học phí', value: 'Miễn phí' },
    { label: 'Thời lượng', value: durationText },
    { label: 'Cấp độ', value: LABELS.level[course.level] ?? course.level },
    {
      label: 'Cấu trúc',
      value: `${course.moduleCount} module · ${course.examCount} bài kiểm tra`,
    },
    { label: 'Giảng viên', value: course.teacher.fullName },
  ];

  return (
    <div className="rounded-xl bg-[#1D5E8C] p-6 text-white shadow-md">
      <h3 className="text-lg font-bold tracking-tight text-white border-b border-white/20 pb-3">
        Thông tin khóa học
      </h3>
      <dl className="mt-4 space-y-3.5 text-sm">
        {infoItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4">
            <dt className="text-white/80">{item.label}</dt>
            <dd className="font-semibold text-white text-right">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
