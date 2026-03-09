import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeCtx = createContext({ theme: "light", setTheme: () => {}, toggle: () => {} });

function applyHtmlTheme(theme) {
  const html = document.documentElement;
  html.classList.toggle("dark", theme === "dark");
  html.classList.toggle("light", theme === "light");
  html.style.colorScheme = theme;
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
  const [userSet, setUserSet] = useState(() => localStorage.getItem("theme") != null);

  useEffect(() => {
    applyHtmlTheme(theme);
    if (userSet) localStorage.setItem("theme", theme);
  }, [theme, userSet]);

  // Follow OS until the user explicitly toggles
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e) => { if (!userSet) setTheme(e.matches ? "dark" : "light"); };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [userSet]);

  const value = useMemo(() => ({
    theme,
    setTheme: (t) => { setTheme(t); setUserSet(true); },
    toggle: () => { setTheme((p) => (p === "light" ? "dark" : "light")); setUserSet(true); },
  }), [theme]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export const useTheme = () => useContext(ThemeCtx);
