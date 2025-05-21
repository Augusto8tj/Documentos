
"use client";

import { useEffect } from "react";

const localStorageThemeKey = "docflow-active-theme"; // Key for storing theme preference

export function ThemeManager() {
  useEffect(() => {
    const applyThemePreference = () => {
      const storedTheme = localStorage.getItem(localStorageThemeKey) as "light" | "dark" | "system" | "feminine" | "professional" | null;
      
      // Remove all potential theme classes first to avoid conflicts
      document.documentElement.classList.remove("dark", "theme-feminine", "theme-professional");

      if (storedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (storedTheme === "feminine") {
        document.documentElement.classList.add("theme-feminine");
      } else if (storedTheme === "professional") {
        document.documentElement.classList.add("theme-professional");
      } else if (storedTheme === "light") {
        // No class needed for light theme, it uses :root defaults
      } else { // System or no preference (defaults to system behavior)
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          document.documentElement.classList.add("dark");
        }
      }
    };

    applyThemePreference(); // Apply on initial client load

    // Listen for system theme changes (if 'system' is the theme)
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      const currentThemeSetting = localStorage.getItem(localStorageThemeKey) as Theme | null;
      if (currentThemeSetting === "system" || !currentThemeSetting) {
        applyThemePreference();
      }
    };
    mediaQuery.addEventListener("change", handleSystemThemeChange);

    // Listen for localStorage changes (e.g., if changed in settings page)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === localStorageThemeKey) {
        applyThemePreference();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return null; // This component does not render any UI
}
