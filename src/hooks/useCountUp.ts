import { useEffect, useRef, useState } from "react";

/**
 * Anima um número de 0 até `target` quando o elemento entra na viewport.
 * Retorna o valor atual e uma ref para anexar no elemento âncora.
 */
export function useCountUp(target: number, durationMs = 1400) {
  const ref = useRef<HTMLElement | null>(null);
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      setValue(target);
      return;
    }

    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !startedRef.current) {
          startedRef.current = true;
          const start = performance.now();
          const tick = (now: number) => {
            const t = Math.min(1, (now - start) / durationMs);
            const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
            setValue(target * eased);
            if (t < 1) requestAnimationFrame(tick);
            else setValue(target);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, durationMs]);

  return { value, ref };
}
