"use client";

import { useEffect, useRef } from "react";

/**
 * Shows a standalone HTML report in an iframe that grows to the report's full height,
 * so the page scrolls as one document. Same origin, so the theme is passed straight in.
 */
export default function ReportFrame({ src, title }: { src: string; title: string }) {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const frame = ref.current;
    if (!frame) return;
    let observer: ResizeObserver | undefined;

    const applyTheme = () => {
      const doc = frame.contentDocument;
      const theme = document.documentElement.dataset.theme;
      if (doc && theme) doc.documentElement.dataset.theme = theme;
    };
    const fit = () => {
      const doc = frame.contentDocument;
      if (doc?.body) frame.style.height = `${doc.documentElement.scrollHeight}px`;
    };
    const onLoad = () => {
      const doc = frame.contentDocument;
      if (!doc) return;
      applyTheme();
      // the report's own theme button is replaced by the one in the top bar
      doc.getElementById("themeBtn")?.remove();
      // links to ads open in a new tab, not inside the frame
      doc.querySelectorAll("a[href^='http']").forEach((a) => a.setAttribute("target", "_blank"));
      fit();
      observer?.disconnect();
      observer = new ResizeObserver(fit);
      observer.observe(doc.body);
    };

    frame.addEventListener("load", onLoad);
    if (frame.contentDocument?.readyState === "complete") onLoad();
    window.addEventListener("themechange", applyTheme);
    return () => {
      frame.removeEventListener("load", onLoad);
      window.removeEventListener("themechange", applyTheme);
      observer?.disconnect();
    };
  }, []);

  return <iframe ref={ref} src={src} title={title} className="report-frame" />;
}
