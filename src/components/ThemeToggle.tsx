"use client";

/** Toggles light/dark on <html> and on the embedded report (same origin), remembered per browser. */
export default function ThemeToggle() {
  const toggle = () => {
    const root = document.documentElement;
    const dark =
      root.dataset.theme === "dark" ||
      (!root.dataset.theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const next = dark ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    window.dispatchEvent(new CustomEvent("themechange", { detail: next }));
  };
  return (
    <button type="button" onClick={toggle}>
      Svetlý / tmavý režim
    </button>
  );
}
