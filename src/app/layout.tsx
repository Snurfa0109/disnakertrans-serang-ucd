import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Disnakertrans Kabupaten Serang",
  description: "Dinas Tenaga Kerja dan Transmigrasi Pemerintah Kabupaten Serang",
  keywords: "disnakertrans, serang, tenaga kerja, kabupaten serang, banten, pemerintah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable}`}>
      <body className="flex flex-col min-h-screen bg-gray-50/50">
        <Header />
        <main className="flex-1 flex flex-col w-full">
          {children}
        </main>
        <Footer />
        <Chatbot />
      </body>
    </html>
  );
}
