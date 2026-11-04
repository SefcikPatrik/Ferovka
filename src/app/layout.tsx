import type { Metadata, Viewport } from "next";
import { Lexend } from "next/font/google";
import "./globals.css";

// typeface designed for reading fluency (plain figures – Atkinson's slashed zero read oddly in prices)
const sans = Lexend({ subsets: ["latin", "latin-ext"], variable: "--font-sans", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Férovka – férové ceny ojazdených áut", template: "%s · Férovka" },
  description:
    "Férovka porovná každý inzerát ojazdeného auta s celým slovenským trhom a ukáže, ktoré ponuky sú pod cenou – a ktoré sú podozrivo lacné.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#121418" },
  ],
};

// applied before paint so a remembered theme does not flash
const themeScript = `try{var t=localStorage.getItem("theme");if(t)document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk" className={sans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
