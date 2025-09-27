/* eslint-disable react-refresh/only-export-components */

import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_JP } from "next/font/google";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const notoSans = Noto_Sans_JP({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kotonoha | 日本語文章校正",
  description: "AI Editor to Refine Your Words with Elegance.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${inter.variable} ${notoSans.variable} antialiased`}
    >
      <body className="bg-slate-950 text-slate-50 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
