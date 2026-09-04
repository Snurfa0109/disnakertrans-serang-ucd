import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ConditionalLayout from "@/components/ConditionalLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://disnakertrans.serangkab.go.id'),
  title: {
    default: "Disnakertrans Kabupaten Serang | Layanan Terpadu Ketenagakerjaan",
    template: "%s | Disnakertrans Kab. Serang",
  },
  description: "Portal Resmi Dinas Tenaga Kerja dan Transmigrasi Pemerintah Kabupaten Serang. Layanan pendaftaran Kartu Kuning (AK-1), info lowongan kerja resmi, pelatihan kerja bersertifikat, mediasi hubungan industrial, dan pengaduan online masyarakat.",
  keywords: [
    "disnakertrans", "kabupaten serang", "dinas tenaga kerja serang", "kartu kuning ak1 serang", 
    "lowongan kerja serang", "pelatihan gratis serang", "pengaduan ketenagakerjaan", "transmigrasi serang",
    "banten", "pemkab serang", "hubungan industrial", "loker serang banten"
  ],
  authors: [{ name: "Disnakertrans Kabupaten Serang", url: "https://disnakertrans.serangkab.go.id" }],
  creator: "Disnakertrans Kabupaten Serang",
  publisher: "Pemerintah Kabupaten Serang",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  icons: {
    icon: "/images/logokabserang.ico",
    shortcut: "/images/logokabserang.ico",
    apple: "/images/logokabserang.png",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "Disnakertrans Kabupaten Serang",
    title: "Disnakertrans Kabupaten Serang | Layanan Terpadu Ketenagakerjaan",
    description: "Pusat pelayanan ketenagakerjaan dan transmigrasi Kabupaten Serang yang transparan, modern, dan berorientasi pada kemajuan masyarakat.",
    images: [
      {
        url: "/images/banner-beranda.png",
        width: 1200,
        height: 630,
        alt: "Disnakertrans Kabupaten Serang",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Disnakertrans Kabupaten Serang",
    description: "Portal Resmi Dinas Tenaga Kerja dan Transmigrasi Pemerintah Kabupaten Serang.",
    images: ["/images/banner-beranda.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
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
        {/* Prevent flash of wrong theme (runs before page renders) */}
      </head>
      <body className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-[#0B1120] text-gray-900 dark:text-gray-100 transition-colors duration-300" suppressHydrationWarning>
        <Script id="theme-init" strategy="beforeInteractive">{`
          try {
            var t = localStorage.getItem('theme');
            if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
            }
          } catch(e) {}
        `}</Script>
        <ConditionalLayout>{children}</ConditionalLayout>
      </body>
    </html>
  );
}
