
"use client";

import { useEffect } from "react";

const localStorageThemeKey = "docflow-active-theme"; 
type Theme = "light" | "dark" | "system" | "feminine" | "professional" | "playful" | "serif-classic";


export function ThemeManager() {
  useEffect(() => {
    const applyThemePreference = () => {
      const storedTheme = localStorage.getItem(localStorageThemeKey) as Theme | null;
      
      // Remove all potential theme classes first to avoid conflicts
      document.documentElement.classList.remove("dark", "theme-feminine", "theme-professional", "theme-playful", "theme-serif-classic");

      if (storedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (storedTheme === "feminine") {
        document.documentElement.classList.add("theme-feminine");
      } else if (storedTheme === "professional") {
        document.documentElement.classList.add("theme-professional");
      } else if (storedTheme === "playful") {
        document.documentElement.classList.add("theme-playful");
      } else if (storedTheme === "serif-classic") {
        document.documentElement.classList.add("theme-serif-classic");
      } else if (storedTheme === "light") {
        // No class needed for light theme, it uses :root defaults
      } else { // System or no preference (defaults to system behavior)
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          document.documentElement.classList.add("dark");
        }
      }
    };

    applyThemePreference(); // Apply on initial client load

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      const currentThemeSetting = localStorage.getItem(localStorageThemeKey) as Theme | null;
      if (currentThemeSetting === "system" || !currentThemeSetting) {
        applyThemePreference();
      }
    };
    mediaQuery.addEventListener("change", handleSystemThemeChange);

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

    