import type { ReactNode } from 'react';
import { Navbar } from './Navbar';

export interface ClientShellProps {
  children: ReactNode;
}

/**
 * Shell chuẩn cho khu vực CLIENT (C01–C09):
 * Bao gồm Navbar phía trên cùng (Logo, Menu, Ô tìm kiếm, Nút đăng nhập hoặc UserMenu)
 * và phần nội dung chính bên dưới.
 */
export function ClientShell({ children }: ClientShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}
