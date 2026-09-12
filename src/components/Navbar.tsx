import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, User, LogOut, ShoppingBag, Truck, CreditCard, Building2 } from "lucide-react";
import { SITE, whatsappLink } from "../data/site";
import { useAuth } from "../store/useAuth";
import { useCart } from "../store/useCart";

const LINKS = [
  { to: "/", label: "Início" },
  { to: "/produtos", label: "Produtos" },
  { to: "/sobre", label: "Sobre" },
  { to: "/galeria", label: "Galeria" },
  { to: "/pagamento", label: "Pagamento", icon: CreditCard },
  { to: "/rastreio", label: "Rastreio", icon: Truck },
  { to: "/atacado", label: "Atacado", icon: Building2 },
  { to: "/contato", label: "Contato" },
];

export default function Navbar({ onOpenCart }: { onOpenCart?: () => void }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { cliente, logout } = useAuth();
  const { totalItems } = useCart();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-plum-100 bg-cream-50/95 shadow-sm shadow-plum-900/5 backdrop-blur-md transition">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3">
          <img
            src="/images/logo.png"
            alt="Odoyá Ervas de Aruanda"
            className="h-11 w-11 rounded-full object-cover shadow-md ring-2 ring-gold-500/50 sm:h-12 sm:w-12"
          />
          <span className="leading-tight">
            <span className="block font-serif text-lg font-bold tracking-wide text-plum-800 sm:text-xl">
              ODOYÁ
            </span>
            <span className="hidden text-[0.6rem] font-semibold tracking-[0.22em] text-gold-600 sm:block">
              ERVAS DE ARUANDA
            </span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 xl:flex">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold tracking-wide transition ${
                  isActive ? "bg-plum-100 text-plum-900" : "text-plum-700/85 hover:bg-plum-50 hover:text-plum-900"
                }`
              }
            >
              {l.icon && <l.icon size={14} />}
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCart}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-plum-300 bg-white text-plum-800 shadow-sm transition hover:bg-plum-50"
            title="Ver carrinho"
          >
            <ShoppingBag size={18} />
            {totalItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold-600 text-[0.65rem] font-bold text-white shadow-md">
                {totalItems}
              </span>
            )}
          </button>

          {cliente ? (
            <Link
              to="/conta"
              className="hidden items-center gap-2 rounded-full border border-plum-300 bg-white px-3 py-1.5 text-sm font-semibold text-plum-800 shadow-sm transition hover:bg-plum-50 md:flex"
              title="Minha conta"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-plum-700 text-[0.65rem] font-bold text-cream-50">
                {cliente.nome.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </span>
              <span className="hidden lg:inline">Minha conta</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="hidden items-center gap-2 rounded-full border border-plum-300 bg-white px-3 py-2 text-sm font-semibold text-plum-800 shadow-sm transition hover:bg-plum-50 md:flex"
              title="Entrar"
            >
              <User size={15} />
              <span className="hidden lg:inline">Entrar</span>
            </Link>
          )}

          <a
            href={whatsappLink("Olá! Vim pelo site da Odoyá e gostaria de saber mais. 🌿")}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-900/20 transition hover:bg-emerald-700 sm:flex"
          >
            WhatsApp
          </a>

          <button
            className="rounded-full border border-plum-200 bg-white p-2 text-plum-800 shadow-sm xl:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden border-t border-plum-100 bg-cream-50 transition-all duration-400 xl:hidden ${
          open ? "max-h-[600px]" : "max-h-0 border-t-0"
        }`}
      >
        <div className="flex flex-col gap-1 px-5 py-4">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isActive ? "bg-plum-100 text-plum-900" : "text-plum-800 hover:bg-plum-50"
                }`
              }
            >
              {l.icon && <l.icon size={16} />}
              {l.label}
            </NavLink>
          ))}
          {cliente ? (
            <>
              <Link
                to="/conta"
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-plum-800 hover:bg-plum-50"
              >
                <User size={15} /> Minha conta
              </Link>
              <button
                onClick={logout}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm font-semibold text-rose-deep hover:bg-rose-deep/10"
              >
                <LogOut size={15} /> Sair
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-plum-800 hover:bg-plum-50"
            >
              <User size={15} /> Entrar / Cadastrar
            </Link>
          )}
          <a
            href={whatsappLink("Olá! Vim pelo site da Odoyá. 🌿")}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 rounded-full bg-emerald-600 px-4 py-3 text-center text-sm font-semibold text-white"
          >
            Falar no WhatsApp
          </a>
          <a
            href={SITE.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 rounded-full border border-gold-500/50 bg-white px-4 py-3 text-center text-sm font-semibold text-plum-800"
          >
            Seguir no Instagram
          </a>
        </div>
      </div>
    </header>
  );
}
