import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type InterMap = Record<string, { favoritos: string[]; gostou: string[] }>; // clienteId -> productIds

const LS_KEY = "odoya_interactions_v1";

type InterCtx = {
  all: InterMap;
  toggleFavorito: (clienteId: string, productId: string) => void;
  toggleGostou: (clienteId: string, productId: string) => void;
  isFavorito: (clienteId: string | null, productId: string) => boolean;
  isGostou: (clienteId: string | null, productId: string) => boolean;
  countFavoritos: (productId: string) => number;
  countGostou: (productId: string) => number;
  favoritosDe: (clienteId: string | null) => string[];
  gostouDe: (clienteId: string | null) => string[];
};

const Ctx = createContext<InterCtx | null>(null);

function load<T>(k: string, f: T): T {
  try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : f; } catch { return f; }
}

export function InteractionsProvider({ children }: { children: ReactNode }) {
  const [all, setAll] = useState<InterMap>(() => load(LS_KEY, {}));
  useEffect(() => { localStorage.setItem(LS_KEY, JSON.stringify(all)); }, [all]);

  const toggle = (clienteId: string, productId: string, key: "favoritos" | "gostou") =>
    setAll((prev) => {
      const entry = prev[clienteId] ?? { favoritos: [], gostou: [] };
      const list = entry[key];
      const next = list.includes(productId) ? list.filter((x) => x !== productId) : [...list, productId];
      return { ...prev, [clienteId]: { ...entry, [key]: next } };
    });

  const toggleFavorito = (cid: string, pid: string) => toggle(cid, pid, "favoritos");
  const toggleGostou = (cid: string, pid: string) => toggle(cid, pid, "gostou");

  const isFavorito = (cid: string | null, pid: string) => !!cid && (all[cid]?.favoritos ?? []).includes(pid);
  const isGostou = (cid: string | null, pid: string) => !!cid && (all[cid]?.gostou ?? []).includes(pid);
  const countFavoritos = (pid: string) => Object.values(all).filter((e) => e.favoritos.includes(pid)).length;
  const countGostou = (pid: string) => Object.values(all).filter((e) => e.gostou.includes(pid)).length;
  const favoritosDe = (cid: string | null) => (cid ? all[cid]?.favoritos ?? [] : []);
  const gostouDe = (cid: string | null) => (cid ? all[cid]?.gostou ?? [] : []);

  return (
    <Ctx.Provider value={{ all, toggleFavorito, toggleGostou, isFavorito, isGostou, countFavoritos, countGostou, favoritosDe, gostouDe }}>
      {children}
    </Ctx.Provider>
  );
}

export function useInteractions() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useInteractions must be inside provider");
  return c;
}
