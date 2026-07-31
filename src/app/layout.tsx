import type { Metadata } from "next";

import { BRAND } from "@/constants/brand";
import { AppProviders } from "@/context/app-providers";

import "./globals.css";

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
      <body className="min-h-screen font-sans">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
