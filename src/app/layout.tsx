import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans, JetBrains_Mono } from "next/font/google";

import { BRAND } from "@/constants/brand";
import { AppProviders } from "@/context/app-providers";

import "./globals.css";

const headline = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-headline",
  display: "swap",
});

const body = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

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
    if (t !== 'light') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  } catch (e) {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${headline.variable} ${body.variable} ${mono.variable} min-h-screen font-sans`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
