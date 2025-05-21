
"use client";

import { useEffect } from "react";

const localStorageThemeKey = "docflow-theme"; // Key for storing theme preference

export function ThemeManager() {
  useEffect(() => {
    const applyThemePreference = () => {
      const storedTheme = localStorage.getItem(localStorageThemeKey) as "light" | "dark" | "system" | null;
      
      if (storedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (storedTheme === "light") {
        document.documentElement.classList.remove("dark");
      } else { // System or no preference
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    applyThemePreference(); // Apply on initial client load

    // Listen for system theme changes (if 'system' is the theme)
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      const currentThemeSetting = localStorage.getItem(localStorageThemeKey);
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
