import { createContext, useContext, useEffect, type ReactNode } from "react";

export type SiteTheme = "day";

type Ctx = { theme: SiteTheme; toggle: () => void; setTheme: (t: SiteTheme) => void };
const CtxObj = createContext<Ctx | null>(null);

/**
 * O site usa exclusivamente o tema claro (identidade original da marca:
 * creme, plum e dourado). O provider permanece por compatibilidade de API,
 * mas não há alternância nem tema escuro no site público.
 */
export function SiteThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.remove("site-ritual");
    try {
      localStorage.removeItem("odoya_site_theme_v1");
    } catch {}
  }, []);

  const noop = () => {};

  return <CtxObj.Provider value={{ theme: "day", toggle: noop, setTheme: noop }}>{children}</CtxObj.Provider>;
}

export function useSiteTheme() {
  const c = useContext(CtxObj);
  if (!c) throw new Error("useSiteTheme must be inside SiteThemeProvider");
  return c;
}
