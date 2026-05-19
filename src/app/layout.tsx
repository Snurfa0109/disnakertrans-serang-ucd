import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/ConditionalLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Disnakertrans Kabupaten Serang",
  description: "Dinas Tenaga Kerja dan Transmigrasi Pemerintah Kabupaten Serang",
  keywords: "disnakertrans, serang, tenaga kerja, kabupaten serang, banten, pemerintah",
  icons: {
    icon: "/images/logokabserang.ico",
    shortcut: "/images/logokabserang.ico",
    apple: "/images/logokabserang.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/logokabserang.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/images/logokabserang.png" />
        {/* Prevent flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            const t = localStorage.getItem('theme');
            if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
            }
          } catch(e) {}
        `}} />
      </head>
      <body className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
