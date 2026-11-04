"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Fades/slides in every element marked `data-reveal` when it scrolls into view (re-armed on navigation). */
export function RevealOnScroll() {
  const pathname = usePathname();
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)");
    if (!("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }),
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [pathname]);
  return null;
}

/** Counts a number up from zero once it becomes visible. */
export function CountUp({ value, duration = 1400 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let done = 0;
    // the real number stays rendered until the count actually starts (no "0" if it never runs)
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      setShown(0);
      const t0 = performance.now();
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / duration);
        setShown(Math.round(value * (1 - Math.pow(1 - k, 3))));
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      // safety net: frames can be throttled (background tab, previews) – end on the real number regardless
      done = window.setTimeout(() => setShown(value), duration + 250);
    });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      clearTimeout(done);
    };
  }, [value, duration]);
  return <span ref={ref}>{shown.toLocaleString("sk-SK").replace(/ /g, " ")}</span>;
}
