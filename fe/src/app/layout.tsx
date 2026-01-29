// AI Generated Code by Deloitte + Cursor (BEGIN)
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "DevTools Nexus - AI Productivity Tools for Developers",
  description: "Discover and review the best AI productivity tools for developers, coding automation, and workflow optimization",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
// AI Generated Code by Deloitte + Cursor (END)
