import type { Metadata } from "next";
import { Atkinson_Hyperlegible, Lexend } from "next/font/google";

import { BRAND } from "@/constants/brand";
import { AppProviders } from "@/context/app-providers";

import "./globals.css";

const bodyFont = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
});

const headlineFont = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-headline",
});

export const metadata: Metadata = {
  title: BRAND.product,
  description: "Alvest course portal — educational content only.",
  icons: {
    icon: [
      { url: BRAND.mark, type: "image/svg+xml" },
      { url: BRAND.markPng, type: "image/png" },
    ],
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
      <body className={`${bodyFont.variable} ${headlineFont.variable} min-h-screen font-sans`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
