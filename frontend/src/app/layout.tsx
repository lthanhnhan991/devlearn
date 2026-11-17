import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/features/auth/auth-context";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "DevLearn",
  description: "Học phát triển phần mềm cùng trợ lý AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
