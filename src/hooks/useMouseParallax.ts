import { useEffect, useRef, useState } from "react";

/**
 * Parallax sutil baseado na posição do cursor sobre o elemento âncora.
 * Retorna valores em [-1, 1] para x e y (normalizados ao centro do elemento).
 */
export function useMouseParallax<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const x = (e.clientX - cx) / (r.width / 2);
      const y = (e.clientY - cy) / (r.height / 2);
      setPos({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
    };
    const onLeave = () => setPos({ x: 0, y: 0 });
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return { ref, pos };
}
