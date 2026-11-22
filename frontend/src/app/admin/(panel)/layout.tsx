import type { ReactNode } from 'react';
import { AdminShell } from '@/components/admin/AdminShell';
import { StaffGuard } from '@/features/auth/guards';

export const instant = false;

export default function AdminPanelLayout({ children }: { children: ReactNode }) {
  return (
    <StaffGuard>
      <AdminShell>{children}</AdminShell>
    </StaffGuard>
  );
}
