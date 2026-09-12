import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Home, Package, Sparkles, ShoppingBag, MessageCircle } from "lucide-react";
import { useCart } from "../store/useCart";
import { whatsappLink } from "../data/site";

export default function MobileBottomNav({ onOpenCart }: { onOpenCart: () => void }) {
  const { totalItems } = useCart();
  const nav = useNavigate();
  const { pathname } = useLocation();

  const handleRitualsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname !== "/") {
      nav("/#oraculo-ritual");
    } else {
      document.getElementById("oraculo-ritual")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <nav
      aria-label="Navegação inferior mobile"
      className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-plum-200/80 bg-white/95 px-2 py-2 shadow-[0_-4px_25px_rgba(42,23,64,0.12)] backdrop-blur-md md:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      {/* Início */}
      <NavLink
        to="/"
        end
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[0.65rem] font-semibold transition ${
            isActive ? "text-plum-900 font-bold" : "text-plum-600/70 hover:text-plum-900"
          }`
        }
      >
        <Home size={20} />
        <span>Início</span>
      </NavLink>

      {/* Produtos */}
      <NavLink
        to="/produtos"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[0.65rem] font-semibold transition ${
            isActive ? "text-plum-900 font-bold" : "text-plum-600/70 hover:text-plum-900"
          }`
        }
      >
        <Package size={20} />
        <span>Produtos</span>
      </NavLink>

      {/* Rituais */}
      <button
        onClick={handleRitualsClick}
        className="flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[0.65rem] font-semibold text-plum-600/70 transition hover:text-plum-900"
      >
        <Sparkles size={20} className="text-gold-600" />
        <span>Rituais</span>
      </button>

      {/* Carrinho */}
      <button
        onClick={onOpenCart}
        className="relative flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[0.65rem] font-semibold text-plum-600/70 transition hover:text-plum-900"
        aria-label="Abrir carrinho"
      >
        <div className="relative">
          <ShoppingBag size={20} />
          {totalItems > 0 && (
            <span className="absolute -right-2 -top-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-gold-600 text-[0.6rem] font-bold text-white shadow">
              {totalItems}
            </span>
          )}
        </div>
        <span>Carrinho</span>
      </button>

      {/* WhatsApp */}
      <a
        href={whatsappLink("Olá! Vim pelo site da Odoyá e gostaria de tirar uma dúvida. 🌿")}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center gap-1 rounded-xl px-3 py-1.5 text-[0.65rem] font-semibold text-emerald-700 transition hover:text-emerald-800"
        aria-label="Falar no WhatsApp"
      >
        <MessageCircle size={20} className="fill-emerald-600 text-white" />
        <span>WhatsApp</span>
      </a>
    </nav>
  );
}
