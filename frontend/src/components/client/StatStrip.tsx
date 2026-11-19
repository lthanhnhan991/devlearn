import type { PublicStatsDto } from '@/types';

export interface StatStripProps {
  stats?: PublicStatsDto | null;
}

export function StatStrip({ stats }: StatStripProps) {
  const items = [
    {
      value: stats ? stats.courseCount : '6+',
      label: 'Khóa học chất lượng',
    },
    {
      value: stats ? stats.studentCount.toLocaleString('vi-VN') : '1,200+',
      label: 'Sinh viên đang học',
    },
    {
      value: stats ? stats.teacherCount : '12+',
      label: 'Giảng viên giàu kinh nghiệm',
    },
    {
      value: stats ? `${stats.completionRate}%` : '61.5%',
      label: 'Tỷ lệ hoàn thành khóa học',
    },
  ];

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 sm:divide-x sm:divide-slate-200">
        {items.map((item, idx) => (
          <div
            key={item.label}
            className={`flex flex-col items-center text-center ${idx > 0 ? 'sm:pl-6' : ''}`}
          >
            <span className="text-3xl font-extrabold tracking-tight text-client-primary sm:text-4xl">
              {item.value}
            </span>
            <span className="mt-1 text-sm font-medium text-slate-600">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
