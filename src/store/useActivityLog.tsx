import { createContext, useCallback, useContext, type ReactNode } from "react";
import { useRemoteState } from "../data/remoteState";

export type ActivityKind =
  | "login"
  | "logout"
  | "product.created"
  | "product.updated"
  | "product.deleted"
  | "sale.created"
  | "sale.updated"
  | "shipment.updated"
  | "settings.updated"
  | "category.created"
  | "category.deleted"
  | "system";

export type Activity = {
  id: string;
  ts: number;
  kind: ActivityKind;
  actor: string;
  title: string;
  detail?: string;
};

type Ctx = {
  items: Activity[];
  log: (kind: ActivityKind, title: string, detail?: string) => void;
  clear: () => void;
};

const MAX = 40;
const ACTOR = "Jéssica O.";
const CtxObj = createContext<Ctx | null>(null);

export function ActivityProvider({ children }: { children: ReactNode }) {
  const remote = useRemoteState<Activity[]>(
    "activity",
    [],
    { poll: true }
  );

  const items = Array.isArray(remote.value)
    ? remote.value.slice(0, MAX)
    : [];

  const log = useCallback(
    (kind: ActivityKind, title: string, detail?: string) => {
      remote.setValue((previous) => [
        {
          id: "act-" + Math.random().toString(36).slice(2, 10),
          ts: Date.now(),
          kind,
          actor: ACTOR,
          title,
          detail,
        },
        ...(Array.isArray(previous) ? previous : []),
      ].slice(0, MAX));
    },
    [remote]
  );

  const clear = useCallback(() => {
    remote.setValue([]);
  }, [remote]);

  return (
    <CtxObj.Provider value={{ items, log, clear }}>
      {children}
    </CtxObj.Provider>
  );
}

export function useActivity() {
  const c = useContext(CtxObj);

  if (!c) {
    throw new Error("useActivity must be inside ActivityProvider");
  }

  return c;
}

export function activityMeta(
  kind: ActivityKind
): {
  label: string;
  tone: "plum" | "gold" | "sage" | "rose" | "info";
  glyph: string;
} {
  switch (kind) {
    case "login":
      return { label: "Sessão", tone: "sage", glyph: "🔑" };

    case "logout":
      return { label: "Sessão", tone: "info", glyph: "🚪" };

    case "product.created":
      return { label: "Catálogo", tone: "sage", glyph: "✦" };

    case "product.updated":
      return { label: "Catálogo", tone: "plum", glyph: "✎" };

    case "product.deleted":
      return { label: "Catálogo", tone: "rose", glyph: "✕" };

    case "sale.created":
      return { label: "Venda", tone: "sage", glyph: "₽" };

    case "sale.updated":
      return { label: "Venda", tone: "plum", glyph: "↻" };

    case "shipment.updated":
      return { label: "Envio", tone: "info", glyph: "✉" };

    case "settings.updated":
      return { label: "Ajustes", tone: "gold", glyph: "⚙" };

    case "category.created":
      return { label: "Categoria", tone: "sage", glyph: "◈" };

    case "category.deleted":
      return { label: "Categoria", tone: "rose", glyph: "✕" };

    default:
      return { label: "Sistema", tone: "info", glyph: "·" };
  }
}

export function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const s = Math.floor(diff / 1000);

  if (s < 5) return "agora";
  if (s < 60) return `há ${s}s`;

  const m = Math.floor(s / 60);

  if (m < 60) return `há ${m}min`;

  const h = Math.floor(m / 60);

  if (h < 24) return `há ${h}h`;

  const d = Math.floor(h / 24);

  return `há ${d}d`;
}