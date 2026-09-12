import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle, Loader2 } from "lucide-react";

type ToastKind = "success" | "error" | "info" | "warning" | "loading";

type Toast = {
  id: string;
  kind: ToastKind;
  title: string;
  description?: string;
  duration?: number;
};

type ToastCtx = {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
};

const Ctx = createContext<ToastCtx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((t: Omit<Toast, "id">) => {
    const id = "toast-" + Math.random().toString(36).slice(2, 10);
    setToasts((prev) => [...prev, { ...t, id }]);
    if (t.kind !== "loading") {
      const dur = t.duration ?? 3800;
      setTimeout(() => dismiss(id), dur);
    }
    return id;
  }, [dismiss]);

  const success = useCallback((title: string, description?: string) => push({ kind: "success", title, description }), [push]);
  const error = useCallback((title: string, description?: string) => push({ kind: "error", title, description, duration: 5500 }), [push]);
  const info = useCallback((title: string, description?: string) => push({ kind: "info", title, description }), [push]);
  const warning = useCallback((title: string, description?: string) => push({ kind: "warning", title, description, duration: 5000 }), [push]);

  return (
    <Ctx.Provider value={{ toasts, push, dismiss, success, error, info, warning }}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </Ctx.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  const META: Record<ToastKind, { icon: any; accent: string; bar: string; ring: string }> = {
    success: { icon: CheckCircle2, accent: "text-emerald-700", bar: "bg-emerald-500", ring: "ring-emerald-200" },
    error: { icon: AlertCircle, accent: "text-rose-deep", bar: "bg-rose-deep", ring: "ring-rose-deep/30" },
    info: { icon: Info, accent: "text-plum-700", bar: "bg-plum-700", ring: "ring-plum-200" },
    warning: { icon: AlertTriangle, accent: "text-gold-700", bar: "bg-gold-500", ring: "ring-gold-300/50" },
    loading: { icon: Loader2, accent: "text-plum-700", bar: "bg-plum-500", ring: "ring-plum-200" },
  };

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[120] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2.5">
      {toasts.map((t) => {
        const m = META[t.kind];
        const Icon = m.icon;
        return (
          <div
            key={t.id}
            className={`pointer-events-auto relative overflow-hidden rounded-xl border border-plum-100 bg-white shadow-2xl shadow-plum-900/10 ring-1 ${m.ring} animate-[slidein_0.28s_cubic-bezier(0.22,1,0.36,1)]`}
          >
            <div className="flex items-start gap-3 px-4 py-3">
              <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-plum-50 ${m.accent}`}>
                <Icon size={16} className={t.kind === "loading" ? "animate-spin" : ""} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight text-plum-900">{t.title}</p>
                {t.description && <p className="mt-0.5 text-xs leading-snug text-plum-700/70">{t.description}</p>}
              </div>
              <button
                onClick={() => onDismiss(t.id)}
                className="shrink-0 rounded-md p-1 text-plum-400 transition hover:bg-plum-50 hover:text-plum-700"
                aria-label="Fechar"
              >
                <X size={14} />
              </button>
            </div>
            <div className={`absolute inset-x-0 bottom-0 h-0.5 ${m.bar}`} />
            <style>{`@keyframes slidein{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}`}</style>
          </div>
        );
      })}
    </div>
  );
}

export function useToast() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useToast must be inside ToastProvider");
  return c;
}
