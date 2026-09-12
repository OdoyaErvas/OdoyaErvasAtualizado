import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      aria-label="Voltar ao topo"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-24 right-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-plum-200 bg-white/90 text-plum-700 shadow-lg shadow-plum-900/10 backdrop-blur transition-all duration-300 hover:bg-plum-700 hover:text-cream-50 md:bottom-28 ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <ArrowUp size={18} />
    </button>
  );
}
