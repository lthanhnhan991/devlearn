import Link from 'next/link';
import type { TopicDto } from '@/types';
import { cn } from '@/lib/cn';

export interface TopicTileProps {
  topic: TopicDto;
}

const ICON_MAP: Record<string, string> = {
  code: '{ }',
  database: '⛁',
  globe: '🌐',
  bug: '🐛',
  cpu: '⚡',
  server: '🖥',
  shield: '🛡',
  book: '📖',
};

export function TopicTile({ topic }: TopicTileProps) {
  const iconSymbol = (topic.icon && ICON_MAP[topic.icon]) || '📚';
  const customColor = topic.color ?? '#1D5E8C';

  return (
    <Link
      href={`/courses?topic=${topic.slug}`}
      className="group flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div
        className="flex size-12 shrink-0 items-center justify-center rounded-lg text-xl font-bold transition-transform group-hover:scale-105"
        style={{
          backgroundColor: `${customColor}18`,
          color: customColor,
        }}
      >
        {iconSymbol}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-foreground transition-colors group-hover:text-client-primary truncate">
          {topic.name}
        </h3>
        {topic.description ? (
          <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">{topic.description}</p>
        ) : (
          <span className="text-xs font-medium text-slate-400 group-hover:underline">
            {topic.courseCount} khóa học →
          </span>
        )}
      </div>
    </Link>
  );
}
