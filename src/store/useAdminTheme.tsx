import { createContext, useContext, useEffect, type ReactNode } from "react";

type Theme = "light";

type Ctx = { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void };
const CtxObj = createContext<Ctx | null>(null);

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.remove("admin-ink");
    try { localStorage.removeItem("odoya_admin_theme_v1"); } catch {}
  }, []);

  const noop = () => {};

  return <CtxObj.Provider value={{ theme: "light", toggle: noop, setTheme: noop }}>{children}</CtxObj.Provider>;
}

export function useAdminTheme() {
  const c = useContext(CtxObj);
  if (!c) throw new Error("useAdminTheme must be inside AdminThemeProvider");
  return c;
}
