import { cn } from '@/lib/cn';

export type LogoTone = 'client' | 'onDark' | 'admin' | 'adminOnDark';

export interface LogoProps {
  tone?: LogoTone;
}

/**
 * `client`: chữ xanh (navbar) · `onDark`: chữ trắng (nền xanh) ·
 * `admin`: chữ navy + badge ADMIN (nền trắng) · `adminOnDark`: chữ trắng + badge ADMIN (sidebar navy).
 */
export function Logo({ tone = 'client' }: LogoProps) {
  const isAdmin = tone === 'admin' || tone === 'adminOnDark';
  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={cn(
          'font-bold tracking-tight',
          tone === 'client' && 'text-xl text-client-primary',
          tone === 'onDark' && 'text-2xl font-bold text-white',
          tone === 'admin' && 'text-2xl font-bold text-admin-navy',
          tone === 'adminOnDark' && 'text-xl font-bold text-white',
        )}
      >
        DevLearn
      </span>
      {isAdmin ? (
        <span className="rounded bg-admin-primary px-2 py-0.5 text-xs font-bold text-white">
          ADMIN
        </span>
      ) : null}
    </span>
  );
}
