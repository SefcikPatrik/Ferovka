import type { Metadata, Viewport } from "next";
import { Instrument_Sans, JetBrains_Mono, Newsreader } from "next/font/google";
import "./globals.css";

const sans = Instrument_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-sans", display: "swap" });
const serif = Newsreader({ subsets: ["latin", "latin-ext"], variable: "--font-serif", display: "swap", style: ["normal", "italic"] });
const mono = JetBrains_Mono({ subsets: ["latin", "latin-ext"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Férovka – cenník ojazdených áut", template: "%s · Férovka" },
  description:
    "Férovka porovná každý inzerát ojazdeného auta s celým slovenským trhom a ukáže, ktoré ponuky sú pod cenou – a ktoré sú podozrivo lacné.",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f1ea" },
    { media: "(prefers-color-scheme: dark)", color: "#161512" },
  ],
};

// applied before paint so a remembered theme does not flash
const themeScript = `try{var t=localStorage.getItem("theme");if(t)document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk" className={`${sans.variable} ${serif.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
