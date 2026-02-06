import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar, MobileHeader } from "@/components/layout";
import { AuthWrapper } from "@/components/auth";
import { ThemeProvider } from "@/components/theme";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ting Thu Chi - Quản Lý Tài Chính Cá Nhân",
  description: "Ứng dụng quản lý thu chi cá nhân thông minh",
  keywords: ["quản lý tài chính", "thu chi", "budget", "personal finance"],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning data-theme="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <AuthWrapper>
            <div className="app-layout">
              <Sidebar />
              <MobileHeader />
              <main className="main-content">
                {children}
              </main>
            </div>
          </AuthWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
