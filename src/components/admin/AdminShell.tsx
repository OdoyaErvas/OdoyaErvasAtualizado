import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard, Wallet, Users, Package, Tag, Truck, CreditCard, Settings, Building2, BadgePercent,
  LogOut, Search, Command, Bell, ChevronRight, Home, Menu, X, Sparkles,
  History,
} from "lucide-react";
import { useToast } from "./Toast";
import { useActivity, activityMeta, timeAgo } from "../../store/useActivityLog";

type Tab = "dash" | "prod" | "cat" | "users" | "fin" | "ship" | "pay" | "cfg" | "b2b" | "offers";

type NavItem = { key: Tab; label: string; icon: any; section: string; badge?: number };

const NAV: NavItem[] = [
  { key: "dash", label: "Dashboard", icon: LayoutDashboard, section: "Visão geral" },
  { key: "fin", label: "Financeiro", icon: Wallet, section: "Visão geral" },
  { key: "prod", label: "Produtos", icon: Package, section: "Catálogo" },
  { key: "cat", label: "Categorias", icon: Tag, section: "Catálogo" },
  { key: "offers", label: "Ofertas", icon: BadgePercent, section: "Catálogo" },
  { key: "users", label: "Clientes", icon: Users, section: "Relacionamento" },
  { key: "b2b", label: "Atacado & B2B", icon: Building2, section: "Relacionamento" },
  { key: "ship", label: "Envios", icon: Truck, section: "Operação" },
  { key: "pay", label: "Pagamentos", icon: CreditCard, section: "Configurações" },
  { key: "cfg", label: "Loja", icon: Settings, section: "Configurações" },
];

type Props = {
  active: Tab;
  onChange: (t: Tab) => void;
  children: ReactNode;
  onLogout: () => void;
  badges?: Partial<Record<Tab, number>>;
  alerts?: number;
};

export default function AdminShell({ active, onChange, children, onLogout, badges = {}, alerts = 0 }: Props) {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notifOpen, setNotifOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { toasts } = useToast();
  const { items: activity } = useActivity();

  // Atalhos de teclado: Cmd+K busca, 1-8 troca de aba, T tema, Esc fecha tudo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotifOpen(false);
        setHistoryOpen(false);
        setOpen(false);
        return;
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;

      const map: Record<string, Tab> = {
        "1": "dash", "2": "fin", "3": "prod", "4": "cat",
        "5": "users", "6": "b2b", "7": "ship", "8": "pay",
      };
      if (map[e.key]) { e.preventDefault(); onChange(map[e.key]); return; }
      if (e.key.toLowerCase() === "h") { e.preventDefault(); setHistoryOpen((v) => !v); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onChange]);

  // Fecha drawer mobile ao trocar de aba
  useEffect(() => { setOpen(false); }, [active]);

  const filteredNav = useMemo(() => {
    if (!query.trim()) return NAV;
    const q = query.toLowerCase();
    return NAV.filter((n) => n.label.toLowerCase().includes(q) || n.section.toLowerCase().includes(q));
  }, [query]);

  const grouped = useMemo(() => {
    const m = new Map<string, NavItem[]>();
    filteredNav.forEach((n) => {
      if (!m.has(n.section)) m.set(n.section, []);
      m.get(n.section)!.push(n);
    });
    return Array.from(m.entries());
  }, [filteredNav]);

  const go = (t: Tab) => {
    onChange(t);
    setOpen(false);
    setSearchOpen(false);
  };

  const activeItem = NAV.find((n) => n.key === active);

  return (
    <div className="min-h-screen bg-[#f5f3f8]">
      {/* ============ SIDEBAR ============ */}
      {/* Overlay mobile */}
      {open && (
        <div className="fixed inset-0 z-40 bg-plum-950/50 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-plum-900/20 bg-[#1a0e2b] text-cream-50 shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 border-b border-cream-100/5 px-5 py-5">
          <Link to="/" className="group flex items-center gap-3">
            <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 shadow-lg">
              <span className="font-display text-xl font-bold text-plum-950">O</span>
              <span className="absolute inset-0 bg-gradient-to-t from-transparent to-white/30" />
            </span>
            <div>
              <p className="font-display text-base font-bold leading-none tracking-tight">Odoyá</p>
              <p className="mt-0.5 text-[0.55rem] font-semibold uppercase tracking-[0.25em] text-gold-300/80">Painel Admin</p>
            </div>
          </Link>
          <button className="ml-auto rounded-lg p-1.5 text-cream-100/60 hover:bg-cream-100/10 hover:text-cream-50 lg:hidden" onClick={() => setOpen(false)} aria-label="Fechar menu">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {grouped.map(([section, items]) => (
            <div key={section} className="mb-5">
              <p className="px-3 pb-2 text-[0.6rem] font-bold uppercase tracking-[0.22em] text-cream-100/40">{section}</p>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = active === item.key;
                  const badge = badges[item.key];
                  return (
                    <li key={item.key}>
                      <button
                        onClick={() => go(item.key)}
                        className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-plum-700 to-plum-800 text-cream-50 shadow-lg shadow-plum-950/40"
                            : "text-cream-100/70 hover:bg-cream-100/5 hover:text-cream-50"
                        }`}
                      >
                        {isActive && <span className="absolute -left-3 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-gold-400" />}
                        <Icon size={16} className={isActive ? "text-gold-300" : ""} />
                        <span className="flex-1 font-medium">{item.label}</span>
                        {badge ? (
                          <span className={`rounded-full px-1.5 py-0.5 text-[0.6rem] font-bold tabular-nums ${isActive ? "bg-gold-400 text-plum-950" : "bg-cream-100/10 text-cream-100/70"}`}>
                            {badge}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-cream-100/5 p-3">
          <div className="flex items-center gap-3 rounded-xl bg-cream-100/5 px-3 py-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 font-display text-sm font-bold text-plum-950">J</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-cream-50">Jéssica O.</p>
              <p className="truncate text-[0.65rem] text-cream-100/50">Administradora</p>
            </div>
            <button onClick={onLogout} className="rounded-lg p-1.5 text-cream-100/50 transition hover:bg-cream-100/10 hover:text-cream-50" title="Sair">
              <LogOut size={15} />
            </button>
          </div>
          <Link to="/" className="mt-2 flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-[0.7rem] font-semibold text-cream-100/50 transition hover:text-gold-300">
            <Home size={11} /> Ver site público
          </Link>
        </div>
      </aside>

      {/* ============ MAIN ============ */}
      <div className="lg:pl-[260px]">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-plum-100 bg-white/90 px-4 py-3 backdrop-blur-xl md:px-8">
          <button className="rounded-lg p-2 text-plum-700 hover:bg-plum-50 lg:hidden" onClick={() => setOpen(true)} aria-label="Abrir menu">
            <Menu size={18} />
          </button>

          {/* Breadcrumb */}
          <div className="flex min-w-0 items-center gap-2 text-sm">
            <Link to="/" className="hidden items-center gap-1 text-plum-400 transition hover:text-plum-700 sm:flex">
              <Home size={12} />
              <span>Site</span>
            </Link>
            <ChevronRight size={12} className="hidden text-plum-300 sm:block" />
            <span className="text-plum-400">Painel</span>
            <ChevronRight size={12} className="text-plum-300" />
            <span className="truncate font-semibold text-plum-950">{activeItem?.label}</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Search button */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden items-center gap-2 rounded-lg border border-plum-200 bg-white px-3 py-1.5 text-xs text-plum-500 shadow-sm transition hover:border-plum-300 hover:bg-plum-50 md:flex"
            >
              <Search size={13} />
              <span className="text-plum-400">Buscar...</span>
              <kbd className="ml-2 flex items-center gap-0.5 rounded border border-plum-200 bg-plum-50 px-1.5 py-0.5 text-[0.6rem] font-bold text-plum-500">
                <Command size={9} />K
              </kbd>
            </button>

            {/* Histórico de atividades */}
            <div className="relative">
              <button
                onClick={() => setHistoryOpen((v) => !v)}
                className="rounded-lg p-2 text-plum-600 transition hover:bg-plum-50"
                aria-label="Histórico de atividades (H)"
                title="Histórico (H)"
              >
                <History size={16} />
              </button>
              {historyOpen && (
                <div className="absolute right-0 mt-2 w-[360px] overflow-hidden rounded-xl border border-plum-100 bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-plum-100 px-4 py-3">
                    <div>
                      <p className="font-display text-sm font-bold text-plum-950">Histórico recente</p>
                      <p className="text-[0.65rem] text-plum-500">Últimas ações no painel</p>
                    </div>
                    <button onClick={() => setHistoryOpen(false)} className="rounded-md p-1 text-plum-400 hover:bg-plum-50"><X size={13} /></button>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {activity.length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-plum-500">Nenhuma ação registrada ainda.</p>
                    ) : (
                      <ul className="divide-y divide-plum-50">
                        {activity.slice(0, 20).map((a) => {
                          const m = activityMeta(a.kind);
                          return (
                            <li key={a.id} className="flex items-start gap-3 px-4 py-2.5">
                              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-plum-50 text-sm">{m.glyph}</span>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-semibold text-plum-900">{a.title}</p>
                                {a.detail && <p className="truncate text-[0.7rem] text-plum-500">{a.detail}</p>}
                                <p className="mt-0.5 text-[0.6rem] text-plum-400">{timeAgo(a.ts)} · {a.actor}</p>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative rounded-lg p-2 text-plum-600 transition hover:bg-plum-50"
                aria-label="Notificações"
              >
                <Bell size={16} />
                {alerts > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-deep px-1 text-[0.55rem] font-bold text-white">
                    {alerts}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-plum-100 bg-white shadow-2xl">
                  <div className="flex items-center justify-between border-b border-plum-100 px-4 py-3">
                    <p className="font-display text-sm font-bold text-plum-950">Central de alertas</p>
                    <button onClick={() => setNotifOpen(false)} className="rounded-md p-1 text-plum-400 hover:bg-plum-50"><X size={13} /></button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {alerts === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-plum-500">Tudo sob controle. 🌿</p>
                    ) : (
                      <div className="divide-y divide-plum-50">
                        {Array.from({ length: alerts }).slice(0, 6).map((_, i) => (
                          <div key={i} className="flex gap-3 px-4 py-3">
                            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-300/25 text-gold-700"><Sparkles size={12} /></span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold text-plum-900">Ação necessária</p>
                              <p className="truncate text-[0.7rem] text-plum-600">Revisar item pendente na operação.</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link to="/" className="hidden rounded-lg border border-plum-200 bg-white px-3 py-1.5 text-xs font-semibold text-plum-700 shadow-sm transition hover:border-plum-300 hover:bg-plum-50 md:block">
              Site público
            </Link>
          </div>
        </header>

        <main className="p-4 md:p-8">
          {children}
        </main>

        {/* Toast count indicator (silencioso) */}
        <span className="sr-only">{toasts.length} notificações ativas</span>
      </div>

      {/* ============ COMMAND PALETTE ============ */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-plum-950/60 p-4 pt-[12vh] backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-plum-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 border-b border-plum-100 px-4 py-3">
              <Search size={16} className="text-plum-400" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busque abas, ações ou atalhos..."
                className="flex-1 bg-transparent text-sm text-plum-900 outline-none placeholder:text-plum-400"
              />
              <kbd className="rounded border border-plum-200 bg-plum-50 px-1.5 py-0.5 text-[0.6rem] font-bold text-plum-500">ESC</kbd>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {grouped.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-plum-500">Nenhum resultado para "{query}"</p>
              ) : (
                grouped.map(([section, items]) => (
                  <div key={section} className="mb-3">
                    <p className="px-3 py-1.5 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-plum-400">{section}</p>
                    {items.map((n) => {
                      const Icon = n.icon;
                      return (
                        <button
                          key={n.key}
                          onClick={() => go(n.key)}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-plum-800 transition hover:bg-plum-50"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-plum-100 text-plum-700">
                            <Icon size={14} />
                          </span>
                          <span className="flex-1 font-medium">Ir para {n.label}</span>
                          <ChevronRight size={14} className="text-plum-300" />
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
