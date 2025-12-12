import { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (value: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("theme") as Theme) || "light";
  });

  /** Aplica o tema */
  function applyTheme(current: Theme) {
    const root = document.body;

    if (current === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
      return;
    }

    if (current === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }


  // Aplica o tema quando muda
  useEffect(() => {
    localStorage.setItem("theme", theme);
    applyTheme(theme);
  }, [theme]);

  // Tema do sistema muda ao vivo
  useEffect(() => {
    if (theme !== "system") return;

    const listener = (e: MediaQueryListEvent) => {
      document.body.classList.toggle("dark", e.matches);
    };

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", listener);

    return () => mq.removeEventListener("change", listener);
  }, [theme]);

  function toggleTheme() {
    setTheme(theme === "light" ? "dark" : "light");
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("ThemeContext não encontrado");
  return ctx;
}
