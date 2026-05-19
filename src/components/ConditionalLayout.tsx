"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Chatbot from "@/components/Chatbot";
import VisitorTracker from "@/components/VisitorTracker";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  return (
    <>
      {!isAdmin && <VisitorTracker />}
      {!isAdmin && <Header />}
      <main className="flex-1 flex flex-col w-full">{children}</main>
      {!isAdmin && <Footer />}
      {!isAdmin && <Chatbot />}
    </>
  );
}
