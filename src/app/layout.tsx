import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { RevealOnScroll } from "@/components/Motion";
import AnalyticsNavigation from "@/components/AnalyticsNavigation";
import "./globals.css";

const sans = Inter({ subsets: ["latin", "latin-ext"], weight: ["400", "500", "600"], variable: "--font-sans", display: "swap" });
const display = Space_Grotesk({ subsets: ["latin", "latin-ext"], weight: ["500", "700"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://overauto.eu"),
  title: { default: "OverAuto – neprepláť ojazdenca", template: "%s · OverAuto" },
  description:
    "Analýzy trhu ojazdených áut: férová cena, najvýhodnejšie ponuky a podozrivo lacné autá podľa celého slovenského trhu.",
  icons: { icon: "/icon.svg" },
  openGraph: {
    type: "website",
    locale: "sk_SK",
    siteName: "OverAuto",
    url: "https://overauto.eu/",
    title: "OverAuto – neprepláť ojazdenca",
    description: "Férová cena, najvýhodnejšie ponuky a podozrivo lacné autá pre každý model ojazdeného auta.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "OverAuto – férová cena ojazdeného auta" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export const viewport: Viewport = { themeColor: "#F7F6F2" };

// marks that JS runs (scroll-reveal hides elements only then); the site is light only
const jsScript = `document.documentElement.classList.add("js")`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sk" className={`${sans.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: jsScript }} />
        <script defer src="/analytics-config.js" />
        <script defer src="/analytics.js" />
      </head>
      <body>
        {children}
        <RevealOnScroll />
        <AnalyticsNavigation />
      </body>
    </html>
  );
}
