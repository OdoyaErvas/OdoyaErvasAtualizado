import { useEffect, useRef, useState } from "react";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { useCart } from "../store/useCart";

export default function CartToast({ onOpenCart }: { onOpenCart: () => void }) {
  const { totalItems } = useCart();
  const [show, setShow] = useState(false);
  const [label, setLabel] = useState("");
  const prevItems = useRef(totalItems);

  useEffect(() => {
    if (totalItems > prevItems.current) {
      setLabel("Adicionado ao carrinho");
      setShow(true);
      const t = setTimeout(() => setShow(false), 2200);
      prevItems.current = totalItems;
      return () => clearTimeout(t);
    }
    prevItems.current = totalItems;
  }, [totalItems]);

  return (
    <div
      className={`fixed bottom-24 left-1/2 z-50 -translate-x-1/2 transition-all duration-500 ${
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
    >
      <button
        onClick={onOpenCart}
        className="flex items-center gap-3 rounded-full border border-plum-100 bg-white py-3 pl-3 pr-5 shadow-2xl shadow-plum-900/20"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-sage-400/20 text-sage-600">
          <CheckCircle2 size={18} />
        </span>
        <div className="text-left">
          <p className="text-xs font-bold text-plum-800">{label}</p>
          <p className="text-[0.65rem] text-plum-900/55">
            {totalItems} {totalItems === 1 ? "item no" : "itens no"} carrinho · ver agora →
          </p>
        </div>
        <span className="ml-1 flex h-6 w-6 items-center justify-center rounded-full bg-plum-700 text-cream-50">
          <ShoppingBag size={12} />
        </span>
      </button>
    </div>
  );
}
