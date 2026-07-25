import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { BRAND } from "@/constants/brand";
import { AppProviders } from "@/context/app-providers";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: BRAND.product,
  description: "Alvest course portal — educational content only.",
  icons: {
    icon: [{ url: BRAND.markPng, type: "image/png" }, { url: BRAND.mark, type: "image/svg+xml" }],
    apple: BRAND.markPng,
  },
};

const themeInitScript = `
(function() {
  try {
    var t = localStorage.getItem('alvest_learn_theme');
    if (t === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch (e) {
    document.documentElement.classList.remove('dark');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${inter.variable} min-h-screen font-sans`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
