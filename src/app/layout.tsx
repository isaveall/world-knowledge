import type { Metadata } from "next";
import "./globals.css";
import Providers from "./Providers";
import LanguageProvider from "./LanguageContext";

export const metadata: Metadata = {
  title: "世界知识管理系统",
  description: "API Documentation Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh" suppressHydrationWarning className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans">
        <Providers>
          <LanguageProvider>{children}</LanguageProvider>
        </Providers>
      </body>
    </html>
  );
}
