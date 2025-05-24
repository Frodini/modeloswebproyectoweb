import type { Metadata } from "next";
import { Geist } from "next/font/google"; // Using Geist Sans as specified
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AutoLink - Find Your Next Ride",
  description: "Search, buy, or sell cars with AutoLink.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(geistSans.variable, "light")}>
      <body className="min-h-screen flex flex-col antialiased font-sans">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 md:px-6">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
