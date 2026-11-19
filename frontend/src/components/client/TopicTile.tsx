import Link from 'next/link';
import type { CourseTopic } from '@/types';
import { LABELS } from '@/types';
import { cn } from '@/lib/cn';

export interface TopicTileProps {
  topic: CourseTopic;
  description?: string;
}

const TOPIC_STYLES: Record<CourseTopic, { bg: string; iconBg: string; text: string; icon: string }> = {
  PROGRAMMING: {
    bg: 'hover:border-[#1D5E8C]',
    iconBg: 'bg-[#1D5E8C]/10 text-[#1D5E8C]',
    text: 'text-[#1D5E8C]',
    icon: '{ }',
  },
  DATABASE: {
    bg: 'hover:border-[#37474F]',
    iconBg: 'bg-[#37474F]/10 text-[#37474F]',
    text: 'text-[#37474F]',
    icon: '⛁',
  },
  WEB: {
    bg: 'hover:border-[#00796B]',
    iconBg: 'bg-[#00796B]/10 text-[#00796B]',
    text: 'text-[#00796B]',
    icon: '🌐',
  },
  SOFTWARE_ENGINEERING: {
    bg: 'hover:border-[#4A148C]',
    iconBg: 'bg-[#4A148C]/10 text-[#4A148C]',
    text: 'text-[#4A148C]',
    icon: '⚙',
  },
};

export function TopicTile({ topic, description }: TopicTileProps) {
  const style = TOPIC_STYLES[topic] ?? {
    bg: 'hover:border-client-primary',
    iconBg: 'bg-client-primary/10 text-client-primary',
    text: 'text-client-primary',
    icon: '📚',
  };

  return (
    <Link
      href={`/courses?topic=${topic}`}
      className={cn(
        'group flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md',
        style.bg,
      )}
    >
      <div
        className={cn(
          'flex size-12 shrink-0 items-center justify-center rounded-lg text-xl font-bold',
          style.iconBg,
        )}
      >
        {style.icon}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-foreground transition-colors group-hover:text-client-primary">
          {LABELS.topic[topic] ?? topic}
        </h3>
        {description ? (
          <p className="mt-0.5 text-xs text-slate-500">{description}</p>
        ) : (
          <span className="text-xs font-medium text-slate-400 group-hover:underline">
            Xem khóa học →
          </span>
        )}
      </div>
    </Link>
  );
}
