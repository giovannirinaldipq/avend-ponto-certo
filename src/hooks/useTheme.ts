"use client";

import { useEffect, useState, useCallback } from "react";

type Theme = "light" | "dark" | "system";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Get system preference
  const getSystemTheme = useCallback((): "light" | "dark" => {
    if (typeof window === "undefined") return "light";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }, []);

  // Apply theme to document
  const applyTheme = useCallback((newTheme: "light" | "dark") => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(newTheme);
    setResolvedTheme(newTheme);
  }, []);

  // Set theme
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);

    if (newTheme === "system") {
      applyTheme(getSystemTheme());
    } else {
      applyTheme(newTheme);
    }
  }, [applyTheme, getSystemTheme]);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === "light" ? "dark" : "light";
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  // Initialize theme on mount
  useEffect(() => {
    const stored = localStorage.getItem("theme") as Theme | null;
    const initialTheme = stored || "system";
    setThemeState(initialTheme);

    if (initialTheme === "system") {
      applyTheme(getSystemTheme());
    } else {
      applyTheme(initialTheme);
    }
  }, [applyTheme, getSystemTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme(getSystemTheme());

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, applyTheme, getSystemTheme]);

  return {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === "dark",
  };
}
