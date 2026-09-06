"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  DEFAULT_THEME,
  THEMES,
  THEME_STORAGE_KEY,
  isThemeId,
} from "@/lib/themes";

const ThemeContext = createContext({
  theme: DEFAULT_THEME,
  setTheme: () => {},
  themes: THEMES,
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getStoredTheme() {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored && isThemeId(stored) ? stored : null;
  } catch {
    return null;
  }
}

function applyTheme(id, animate = true) {
  const root = document.documentElement;
  root.dataset.theme = id;
  if (animate) {
    root.classList.add("theme-switching");
    window.setTimeout(() => root.classList.remove("theme-switching"), 500);
  }
}

export default function ThemeProvider({
  children,
  defaultTheme = DEFAULT_THEME,
}) {
  const [theme, setThemeState] = useState(defaultTheme);

  useEffect(() => {
    const stored = getStoredTheme();
    const initial = stored || defaultTheme;
    setThemeState(initial);
    applyTheme(initial, false);
  }, [defaultTheme]);

  const setTheme = useCallback((id) => {
    if (!isThemeId(id)) return;
    setThemeState(id);
    applyTheme(id, true);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch {
      /* storage unavailable — keep in-memory */
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export { getStoredTheme };