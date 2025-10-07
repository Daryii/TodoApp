"use client";

import { useTheme } from "./theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="fixed top-4 right-4 bg-[var(--surface-1)] border border-[#3a2d2d] text-white rounded-full p-2 sm:p-2.5 hover:brightness-110 transition-all z-50 text-lg"
    >
      {theme === "dark" ? "🌙" : "☀️"}
    </button>
  );
}
