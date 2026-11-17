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
    <span className="inline-flex items-center gap-3">
      <span
        className={cn(
          'font-bold tracking-tight',
          tone === 'client' && 'text-xl text-client-primary',
          tone === 'onDark' && 'text-lg font-semibold text-white',
          tone === 'admin' && 'text-lg text-admin-navy',
          tone === 'adminOnDark' && 'text-lg text-white',
        )}
      >
        DevLearn
      </span>
      {isAdmin ? (
        <span className="rounded-md bg-admin-primary px-2 py-1 text-xs font-bold text-white">
          ADMIN
        </span>
      ) : null}
    </span>
  );
}
