import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "C++ Quant Mastery Tracker",
  description:
    "Interactive C++ mastery tracker and quant portfolio for high-end engineers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-slate-950 text-slate-100 antialiased`}
      >
        <div className="relative min-h-screen overflow-x-hidden bg-slate-950">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.25),_transparent_55%)]" />
          <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_bottom,_rgba(147,51,234,0.2),_transparent_60%)]" />
          <div className="pb-16">
            <Navbar />
            <main className="mx-auto mt-10 w-[min(1200px,95vw)] space-y-12">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
