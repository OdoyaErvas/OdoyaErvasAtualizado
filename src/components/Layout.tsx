import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import WhatsAppFloat from "./WhatsAppFloat";
import CartDrawer from "./CartDrawer";
import MobileBottomNav from "./MobileBottomNav";
import CartToast from "./CartToast";
import TopBanner from "./TopBanner";
import IntroSplash from "./IntroSplash";

const INTRO_KEY = "odoya_intro_viewed_v1";

export default function Layout() {
  const { pathname } = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number; active: boolean } | null>(null);
  const cursorEl = useRef<HTMLDivElement>(null);
  const [pageKey, setPageKey] = useState(0);

  // Mostra intro splash na primeira vez por sessão
  const [showIntro, setShowIntro] = useState(() => {
    try {
      const viewed = sessionStorage.getItem(INTRO_KEY);
      return viewed !== "true";
    } catch {
      return true;
    }
  });

  // Scroll progress refinado (usa a classe CSS .scroll-progress com variável --progress)
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? h.scrollTop / max : 0;
      setProgress(p);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Transição de página
  useEffect(() => {
    setPageKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  // Cursor customizado para áreas de produto
  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (cursorEl.current) {
        cursorEl.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%) scale(${cursorPos?.active ? 1.25 : 0.7})`;
      }
    };
    const over = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest(".product-cursor-area")) setCursorPos({ x: e.clientX, y: e.clientY, active: true });
      else setCursorPos((prev) => (prev ? { ...prev, active: false } : prev));
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", over);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, [cursorPos?.active]);

  const handleEnter = () => {
    try {
      sessionStorage.setItem(INTRO_KEY, "true");
    } catch {}
    setShowIntro(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      {showIntro ? (
        <IntroSplash onEnter={handleEnter} />
      ) : (
        <>
          {/* Scroll progress (visível, dourado, brilhante) */}
          <div className="scroll-progress" style={{ ["--progress" as any]: progress }} />

          <TopBanner />
          <Navbar onOpenCart={() => setIsCartOpen(true)} />

          <main key={pageKey} className="page-enter flex-1">
            <Outlet />
          </main>

          <Footer />

          {/* Cursor personalizado (só aparece em áreas de produto no desktop) */}
          <div
            ref={cursorEl}
            className="product-cursor hidden md:block"
            data-active={cursorPos?.active ? "true" : "false"}
            aria-hidden
          />

          <WhatsAppFloat />
          <MobileBottomNav onOpenCart={() => setIsCartOpen(true)} />
          <CartToast onOpenCart={() => setIsCartOpen(true)} />
          <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </>
      )}
    </div>
  );
}
