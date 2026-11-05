"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    FerovkaAnalytics?: { pageView: (path?: string) => void };
  }
}

/** Count Next.js navigation; the embedded report never sends a second page view. */
export default function AnalyticsNavigation() {
  const pathname = usePathname();
  useEffect(() => { window.FerovkaAnalytics?.pageView(pathname); }, [pathname]);
  return null;
}
