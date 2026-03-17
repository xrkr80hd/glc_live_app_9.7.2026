"use client";

import { useEffect, useState } from "react";

function resolveStoredTheme() {
  if (typeof window === "undefined") {
    return "light";
  }
  const storedTheme = window.localStorage.getItem("lc-app-theme");
  return storedTheme === "dark" || storedTheme === "light" ? storedTheme : "light";
}

export function ThemeModeToggleRow() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const resolvedTheme = resolveStoredTheme();
    setIsDarkMode(resolvedTheme === "dark");
    document.documentElement.dataset.appTheme = resolvedTheme;
  }, []);

  function handleToggleTheme() {
    setIsDarkMode((current) => {
      const nextIsDark = !current;
      const nextTheme = nextIsDark ? "dark" : "light";
      document.documentElement.dataset.appTheme = nextTheme;
      window.localStorage.setItem("lc-app-theme", nextTheme);
      return nextIsDark;
    });
  }

  return (
    <div className="lc-toggle-row">
      <div className="lc-toggle-copy">
        <strong>Dark Mode</strong>
        <span className="lc-muted">Switch the app between light and dark theme.</span>
      </div>
      <button
        type="button"
        className={`lc-toggle-switch${isDarkMode ? " is-on" : ""}`}
        role="switch"
        aria-checked={isDarkMode}
        aria-label={isDarkMode ? "Disable dark mode" : "Enable dark mode"}
        onClick={handleToggleTheme}
      />
    </div>
  );
}
