import type { ReactNode } from 'react';
import { StudentGuard } from '@/features/auth/guards';

export const instant = false;

export default function LearnLayout({ children }: { children: ReactNode }) {
  return <StudentGuard>{children}</StudentGuard>;
}
