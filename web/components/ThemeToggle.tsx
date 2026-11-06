"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function readStoredTheme(): Theme | null {
  try {
    const value = localStorage.getItem("theme");
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

export default function ThemeToggle() {
  // null until mounted — keeps the server/client first render identical
  // (no theme can be known on the server) and avoids a hydration mismatch.
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const stored = readStoredTheme();
    const system: Theme = window.matchMedia("(prefers-color-scheme: dark)")
      .matches
      ? "dark"
      : "light";
    // One-time read of browser-only state (localStorage/matchMedia) right
    // after mount — there's no server-side value to reconcile against, so
    // this can't be computed during render.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(stored ?? system);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // best-effort only — per-viewer convenience, not durable state
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      }
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border text-base leading-none transition-opacity hover:opacity-70"
      style={{
        borderColor:
          "color-mix(in srgb, var(--brand-primary) 25%, transparent)",
        color: "var(--brand-primary)",
      }}
    >
      <span aria-hidden="true">{theme === "dark" ? "☀️" : "🌙"}</span>
    </button>
  );
}
