import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "../layout";
import { Providers } from "./providers";
import { GoogleAnalytics } from "@next/third-parties/google";
import "aws-amplify/auth/enable-oauth-listener";
import { Footer } from "@/layout/Footer";

export const metadata: Metadata = {
  title: {
    template: "%s | animeguri",
    default: "animeguri",
  },
  description: "聖地巡礼の記録を投稿することができるプラットフォームです。",
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "c5wPJBmh5aMNJt9X5giLCrAHK9sOU3Yd4lQCALTmCN8",
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Header />
          <main className="py-8 min-h-screen">{children}</main>
          <Footer />
        </Providers>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
      </body>
    </html>
  );
}
